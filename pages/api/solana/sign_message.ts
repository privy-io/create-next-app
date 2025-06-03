import { NextApiRequest, NextApiResponse } from "next";
import {
  APIError,
  createPrivyClient,
  fetchAndVerifyAuthorization,
} from "../../../lib/utils";
import { WalletApiRpcResponseType } from "@privy-io/public-api";
const client = createPrivyClient();

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse<WalletApiRpcResponseType | APIError>
) {
  const errorOrVerifiedClaims = await fetchAndVerifyAuthorization(
    req,
    res,
    client
  );
  const authorized = errorOrVerifiedClaims && "appId" in errorOrVerifiedClaims;
  if (!authorized) return errorOrVerifiedClaims;

  const message = req.body.message;
  const walletId = req.body.wallet_id;

  if (!message || !walletId) {
    return res
      .status(400)
      .json({ error: "Message and wallet_id are required" });
  }

  try {
    // Sign the message using Privy's wallet API
    const { signature } = await client.walletApi.solana.signMessage({
      walletId,
      message,
    });

    return res.status(200).json({
      method: "signMessage",
      data: {
        signature: Buffer.from(signature).toString("base64"),
        encoding: "base64",
      },
    });
  } catch (error) {
    console.error("Error signing message:", error);
    return res.status(500).json({
      error: (error as Error).message,
      cause: (error as Error).stack,
    });
  }
}
