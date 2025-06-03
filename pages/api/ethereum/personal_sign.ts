import { WalletApiRpcResponseType } from "@privy-io/public-api";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  APIError,
  fetchAndVerifyAuthorization,
  createPrivyClient,
} from "../../../lib/utils";

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
    const { signature } = await client.walletApi.ethereum.signMessage({
      walletId,
      message,
    });
    return res.status(200).json({
      method: "personal_sign",
      data: {
        signature: signature,
        encoding: "hex",
      },
    });
  } catch (error) {
    console.error(error);
    let statusCode = 500;

    return res.status(statusCode).json({
      error: (error as Error).message,
      cause: (error as Error).stack,
    });
  }
}
