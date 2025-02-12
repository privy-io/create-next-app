import type { NextApiRequest, NextApiResponse } from "next";
import { PrivyClient } from "@privy-io/server-auth";
import { Redis } from "@upstash/redis";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

// Initialize Redis client
const redis = Redis.fromEnv();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { slug, walletAddress } = req.body;

    if (!slug || !walletAddress) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Verify user authentication
    const idToken = req.cookies["privy-id-token"];
    if (!idToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get user from Privy
    const user = await client.getUser({ idToken });

    // Check if the wallet is in user's linked accounts
    const hasWallet = user.linkedAccounts.some((account) => {
      if (account.type === "wallet" && account.chainType === "solana") {
        const walletAccount = account as { address?: string };
        return (
          walletAccount.address?.toLowerCase() === walletAddress.toLowerCase()
        );
      }
      return false;
    });

    if (!hasWallet) {
      return res.status(401).json({ error: "Wallet not owned by user" });
    }

    // Fetch page data to check token requirements
    const pageData = await redis.get(`page:${slug}`);

    if (!pageData) {
      return res.status(404).json({ error: "Page not found" });
    }

    const mapping = JSON.parse(pageData as string);

    // Get Telegram plugin configuration
    const telegramPlugin = mapping.items?.find(
      (item: any) => item.type === "telegram" && item.tokenGated,
    );

    if (!telegramPlugin) {
      return res
        .status(400)
        .json({ error: "Telegram channel not configured or not token gated" });
    }

    // Check token balance
    const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

    if (!HELIUS_API_KEY) {
      throw new Error("Helius API key is not configured");
    }

    const response = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "tokens-fetch",
          method: "getAssetsByOwner",
          params: {
            ownerAddress: walletAddress,
            page: 1,
            limit: 1000,
            displayOptions: {
              showFungible: true,
              showZeroBalance: false,
            },
          },
        }),
      },
    );

    const data = await response.json();

    // Find the required token in user's balance
    const requiredToken = mapping.connectedToken;
    const userToken = data.result.items.find(
      (item: any) => item.id === requiredToken,
    );

    if (!userToken) {
      return res.status(403).json({
        error: "Required token not found in wallet",
        requiredToken,
        requiredAmount: telegramPlugin.requiredAmount,
      });
    }

    const userBalance =
      userToken.token_info?.balance || userToken.ownership?.amount || 0;

    if (userBalance < telegramPlugin.requiredAmount) {
      return res.status(403).json({
        error: "Insufficient token balance",
        currentBalance: userBalance,
        requiredAmount: telegramPlugin.requiredAmount,
      });
    }

    // If all checks pass, return success with the Telegram invite link
    return res.status(200).json({
      success: true,
      inviteLink: telegramPlugin.url,
    });
  } catch (error) {
    console.error("Error verifying Telegram access:", error);
    return res.status(500).json({ error: "Failed to verify Telegram access" });
  }
}
