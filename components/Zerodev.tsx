import {
  createPublicClient,
  createWalletClient,
  custom,
  Hex,
  http,
  zeroAddress,
} from "viem";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import {
  getEntryPoint,
  KERNEL_V3_3_BETA,
  KernelVersionToAddressesMap,
} from "@zerodev/sdk/constants";
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from "@zerodev/sdk";
import { odysseyTestnet } from "viem/chains";
import { useSignAuthorization, useWallets } from "@privy-io/react-auth";
import { useState } from "react";

const bundlerRpc = process.env.NEXT_PUBLIC_BUNDLER_RPC;

const paymasterRpc = process.env.NEXT_PUBLIC_PAYMASTER_RPC;

const chain = odysseyTestnet;
const kernelVersion = KERNEL_V3_3_BETA;
const entryPoint = getEntryPoint("0.7");
const publicClient = createPublicClient({
  chain,
  transport: http(),
});

export const Zerodev = () => {
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  const { signAuthorization } = useSignAuthorization();

  return (
    <>
      <p className="mt-6 font-bold uppercase text-sm text-gray-600">
        Zerodev Delegation + Flow
      </p>
      <div className="mt-2 flex gap-4 flex-wrap">
        <button
          onClick={async () => {
            if (!embeddedWallet) {
              console.log("No account found");
              return;
            }
            setLoading(true);
            try {
              const walletClient = createWalletClient({
                // Use any Viem-compatible EOA account
                account: embeddedWallet.address as Hex,
                // We use the Odyssey testnet here, but you can use any network that
                // supports EIP-7702.
                chain,
                transport: custom(await embeddedWallet.getEthereumProvider()),
              });

              const authorization = await signAuthorization({
                contractAddress:
                  KernelVersionToAddressesMap[kernelVersion]
                    .accountImplementationAddress,
                sponsor: true,
                chainId: chain.id,
              });

              const ecdsaValidator = await signerToEcdsaValidator(
                publicClient,
                {
                  signer: walletClient,
                  entryPoint,
                  kernelVersion,
                }
              );

              const account = await createKernelAccount(publicClient, {
                plugins: {
                  sudo: ecdsaValidator,
                },
                entryPoint,
                kernelVersion,
                // Set the address of the smart account to the EOA address
                address: walletClient.account.address,
                // Set the 7702 authorization
                eip7702Auth: authorization,
              });
              const paymasterClient = createZeroDevPaymasterClient({
                chain,
                transport: http(paymasterRpc),
              });

              const kernelClient = createKernelAccountClient({
                account,
                chain,
                bundlerTransport: http(bundlerRpc),
                paymaster: paymasterClient,
                client: publicClient,
              });

              const userOpHash = await kernelClient.sendUserOperation({
                calls: [{ to: zeroAddress, value: BigInt(0), data: "0x" }],
              });

              const { receipt } =
                await kernelClient.waitForUserOperationReceipt({
                  hash: userOpHash,
                });

              setTxHash(receipt.transactionHash);
            } catch (e) {
              console.log(e);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none"
        >
          Delegate & Send Transaction
        </button>
      </div>
      {!!txHash && (
        <a href={`${chain.blockExplorers.default.url}/tx/${txHash}`}>
          Success! View transaction
        </a>
      )}
    </>
  );
};
