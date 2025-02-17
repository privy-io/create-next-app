import type { NextApiRequest, NextApiResponse } from "next";
import { PrivyClient } from "@privy-io/server-auth";
import { Redis } from "@upstash/redis";
import { PageData } from "@/types";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const getRedisKey = (slug: string) => `page:${slug}`;
const getWalletPagesKey = (walletAddress: string) => `wallet:${walletAddress.toLowerCase()}:pages`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { slug } = req.body;

    if (!slug) {
      return res.status(400).json({ error: "Slug is required" });
    }

    // Get page data from Redis
    const pageData = await redis.get<PageData>(getRedisKey(slug));

    if (!pageData) {
      return res.status(404).json({ error: "Page not found" });
    }

    // Check authentication
    const idToken = req.cookies["privy-id-token"];
    if (!idToken) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const user = await client.getUser({ idToken });
      
      // Check if the wallet is in user's linked accounts
      let userWallet = null;
      for (const account of user.linkedAccounts) {
        if (account.type === "wallet" && account.chainType === "solana") {
          const walletAccount = account as { address?: string };
          if (walletAccount.address?.toLowerCase() === pageData.walletAddress.toLowerCase()) {
            userWallet = walletAccount;
            break;
          }
        }
      }

      if (!userWallet) {
        return res.status(403).json({ error: "You don't have permission to edit this page" });
      }

      // Check if the page exists in the user's wallet:id set
      const pagesKey = getWalletPagesKey(userWallet.address!);
      const hasPage = await redis.zscore(pagesKey, slug);
      
      if (hasPage === null) {
        return res.status(403).json({ error: "Page not found in your collection" });
      }

      return res.status(200).json({ 
        canEdit: true,
        pageData
      });

    } catch (error) {
      console.error("Auth verification error:", error);
      return res.status(401).json({ error: "Authentication failed" });
    }

  } catch (error) {
    console.error("Error verifying page edit access:", error);
    return res.status(500).json({ error: "Failed to verify page edit access" });
  }
} 