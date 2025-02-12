import type { NextApiRequest, NextApiResponse } from "next";
import { PrivyClient } from "@privy-io/server-auth";
import { PageItem } from "@/types";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

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

    // Fetch page data to check ownership and token requirements
    const pageResponse = await fetch(
      `${process.env.NODE_ENV === "development" ? "http://localhost:3000" : ""}/api/page-store?slug=${slug}`,
    );
    const { mapping } = await pageResponse.json();

    if (!mapping) {
      return res.status(404).json({ error: "Page not found" });
    }

    // Check page ownership
    const isOwner =
      mapping.walletAddress.toLowerCase() === walletAddress.toLowerCase();

    // Check token access if the page has token gating
    let hasTokenAccess = false;
    if (mapping.connectedToken) {
      // TODO: Add token balance check logic here
      // This would involve checking if the wallet has the required token
      // For now, we'll just return false
      hasTokenAccess = false;
    }

    return res.status(200).json({
      isOwner,
      hasTokenAccess,
      tokenRequired: !!mapping.connectedToken,
      gatedLinks: mapping.items?.filter((item: PageItem) => item.tokenGated) || [],
    });
  } catch (error) {
    console.error("Error verifying page access:", error);
    return res.status(500).json({ error: "Failed to verify page access" });
  }
}
