import { WalletApiRpcResponseType } from "@privy-io/public-api";
import { WalletWithMetadata } from "@privy-io/server-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  APIError,
  fetchAndVerifyAuthorization,
  createPrivyClient,
} from "../../lib/utils";

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
  const payload = {
    address: req.body.address,
    chainType: req.body.chain_type,
    method: "personal_sign" as const,
    params: {
      message,
    },
  };
  // Testing server-auth functionality for fetching actively delegated wallets
  const user = await client.getUser(errorOrVerifiedClaims.userId);
  if (!user) {
    return res.status(500).json({ error: "Unable to fetch current user" });
  }
  const delegatedWallet = user.linkedAccounts.find(
    (account: any): account is WalletWithMetadata =>
      account.type === "wallet" &&
      account.walletClientType === "privy" &&
      account.address === payload.address &&
      account.delegated
  );
  if (!delegatedWallet?.delegated || !delegatedWallet.id) {
    return res
      .status(401)
      .json({ error: "Wallet is not delegated for the current user" });
  }

  try {
    const { signature } = await client.walletApi.ethereum.signMessage({
      walletId: delegatedWallet.id,
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
