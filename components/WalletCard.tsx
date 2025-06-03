import { useCallback, useState } from "react";
import {
  getAccessToken,
  useSessionSigners,
  useSignMessage,
  useSignMessage as useSignMessageSolana,
  WalletWithMetadata,
} from "@privy-io/react-auth";
import axios from "axios";

const SESSION_SIGNER_ID = process.env.NEXT_PUBLIC_SESSION_SIGNER_ID;

interface WalletCardProps {
  wallet: WalletWithMetadata;
}

export default function WalletCard({ wallet }: WalletCardProps) {
  const { addSessionSigners, removeSessionSigners } = useSessionSigners();
  const { signMessage: signMessageEthereum } = useSignMessage();
  const { signMessage: signMessageSolana } = useSignMessageSolana();
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoteSigning, setIsRemoteSigning] = useState(false);
  const [isClientSigning, setIsClientSigning] = useState(false);

  // Check if this specific wallet has session signers
  const hasSessionSigners = wallet.delegated === true;

  const addSessionSigner = useCallback(
    async (walletAddress: string) => {
      if (!SESSION_SIGNER_ID) {
        console.error("SESSION_SIGNER_ID must be defined to addSessionSigner");
        return;
      }

      setIsLoading(true);
      try {
        await addSessionSigners({
          address: walletAddress,
          signers: [
            {
              signerId: SESSION_SIGNER_ID,
              // This is a placeholder - in a real app, you would use a policy ID from your Privy dashboard
              policyIds: [],
            },
          ],
        });
      } catch (error) {
        console.error("Error adding session signer:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [addSessionSigners]
  );

  const removeSessionSigner = useCallback(
    async (walletAddress: string) => {
      setIsLoading(true);
      try {
        await removeSessionSigners({ address: walletAddress });
      } catch (error) {
        console.error("Error removing session signer:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [removeSessionSigners]
  );

  const handleClientSign = useCallback(async () => {
    setIsClientSigning(true);
    try {
      const message = `Signing this message to verify ownership of ${wallet.address}`;
      let signature;
      if (wallet.chainType === "ethereum") {
        const result = await signMessageEthereum({ message });
        signature = result.signature;
      } else if (wallet.chainType === "solana") {
        const result = await signMessageSolana({
          message,
        });
        signature = result.signature;
      }
      console.log("Message signed on client! Signature: ", signature);
    } catch (error) {
      console.error("Error signing message:", error);
    } finally {
      setIsClientSigning(false);
    }
  }, [wallet]);

  const handleRemoteSign = useCallback(async () => {
    setIsRemoteSigning(true);
    try {
      const authToken = await getAccessToken();
      const path =
        wallet.chainType === "ethereum"
          ? "/api/ethereum/personal_sign"
          : "/api/solana/sign_message";
      const message = `Signing this message to verify ownership of ${wallet.address}`;
      const response = await axios.post(
        path,
        {
          wallet_id: wallet.id,
          message: message,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = response.data;

      if (response.status === 200) {
        console.log(
          "Message signed on server! Signature: " + data.data.signature
        );
      } else {
        throw new Error(data.error || "Failed to sign message");
      }
    } catch (error) {
      console.error("Error signing message:", error);
    } finally {
      setIsRemoteSigning(false);
    }
  }, [wallet.id]);

  return (
    <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-lg">
      <div className="text-sm text-violet-700">
        {wallet.walletClientType === "privy" ? "Embedded " : ""}Wallet:{" "}
        {wallet.address.slice(0, 6)}...
        {wallet.address.slice(-4)}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => addSessionSigner(wallet.address)}
          disabled={isLoading || hasSessionSigners}
          className={`text-sm py-2 px-4 rounded-md text-white ${
            isLoading || hasSessionSigners
              ? "bg-violet-400 cursor-not-allowed"
              : "bg-violet-600 hover:bg-violet-700"
          }`}
        >
          {isLoading ? "Processing..." : "Add Session Signer"}
        </button>

        <button
          onClick={() => removeSessionSigner(wallet.address)}
          disabled={isLoading || !hasSessionSigners}
          className={`text-sm py-2 px-4 rounded-md text-white ${
            isLoading || !hasSessionSigners
              ? "bg-red-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isLoading ? "Processing..." : "Remove Session Signer"}
        </button>
      </div>

      {hasSessionSigners && (
        <div className="mt-2 text-sm text-gray-600">
          This wallet has active session signers
        </div>
      )}

      <div className="flex flex-row gap-2">
        <button
          onClick={handleRemoteSign}
          disabled={isRemoteSigning || !hasSessionSigners}
          className={`text-sm py-2 px-4 rounded-md text-white ${
            isRemoteSigning || !hasSessionSigners
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isRemoteSigning ? "Signing..." : "Sign message from server"}
        </button>

        <button
          onClick={handleClientSign}
          disabled={isClientSigning}
          className={`text-sm py-2 px-4 rounded-md text-white ${
            isClientSigning
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isClientSigning ? "Signing..." : "Sign message from client"}
        </button>
      </div>
    </div>
  );
}
