import { useCallback, useState } from "react";
import {
  getAccessToken,
  useSessionSigners,
  WalletWithMetadata,
} from "@privy-io/react-auth";
import axios from "axios";

const SESSION_SIGNER_ID = process.env.NEXT_PUBLIC_SESSION_SIGNER_ID;

interface WalletCardProps {
  wallet: WalletWithMetadata;
}

export default function WalletCard({ wallet }: WalletCardProps) {
  const { addSessionSigners, removeSessionSigners } = useSessionSigners();
  const [isLoading, setIsLoading] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

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
      if (!hasSessionSigners) return;

      setIsLoading(true);
      try {
        await removeSessionSigners({ address: walletAddress });
      } catch (error) {
        console.error("Error removing session signers:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [removeSessionSigners, hasSessionSigners]
  );

  const handleRemoteSign = useCallback(async () => {
    setIsSigning(true);
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
          "Message signed successfully! Signature: " + data.data.signature
        );
      } else {
        throw new Error(data.error || "Failed to sign message");
      }
    } catch (error) {
      console.error("Error signing message:", error);
    } finally {
      setIsSigning(false);
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

      <button
        onClick={handleRemoteSign}
        disabled={isSigning || !hasSessionSigners}
        className={`mt-2 text-sm py-2 px-4 rounded-md text-white ${
          isSigning || !hasSessionSigners
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isSigning ? "Signing..." : "Sign message from server"}
      </button>
    </div>
  );
}
