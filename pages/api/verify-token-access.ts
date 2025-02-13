import type { NextApiRequest, NextApiResponse } from "next";
import { PrivyClient } from "@privy-io/server-auth";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

async function verifyTokenOwnership(walletAddress: string, tokenAddress: string, requiredAmount: string) {
  console.log('Checking token ownership for:', {
    walletAddress,
    tokenAddress,
    requiredAmount
  });

  if (!HELIUS_API_KEY) {
    console.error('Missing Helius API key');
    return false;
  }

  try {
    // Use Helius RPC endpoint
    const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'token-verification',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: walletAddress,
          page: 1,
          limit: 1000,
          displayOptions: {
            showFungible: true
          }
        }
      })
    });

    const data = await response.json();
    console.log('Helius API response:', data);

    if (!data.result?.items) {
      console.error('Unexpected API response format:', data);
      return false;
    }

    // Find the matching token in the results
    const tokenAsset = data.result.items.find((asset: any) => 
      asset.id === tokenAddress || 
      asset.mint === tokenAddress ||
      (asset.content?.metadata?.mint === tokenAddress)
    );

    console.log('Found token asset:', tokenAsset);

    if (!tokenAsset) {
      console.log('No matching token found');
      return false;
    }

    // Get the balance from the token data
    const balance = parseInt(tokenAsset.token_info?.balance || '0');
    
    console.log('Balance check:', {
      balance,
      requiredAmount: parseInt(requiredAmount),
      hasEnough: balance >= parseInt(requiredAmount)
    });

    return balance >= parseInt(requiredAmount);
  } catch (error) {
    console.error("Error verifying token ownership:", error);
    return false;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { tokenAddress, requiredAmount } = req.body;
    const idToken = req.cookies["privy-id-token"];

    console.log('Received verification request:', {
      tokenAddress,
      requiredAmount,
      hasIdToken: !!idToken
    });

    if (!idToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get user's wallet from Privy
    const user = await client.getUser({ idToken });
    console.log('Privy user data:', {
      userId: user.id,
      linkedAccounts: user.linkedAccounts.map(acc => ({
        type: acc.type,
        chainType: acc.type === 'wallet' ? (acc as any).chainType : undefined,
        address: acc.type === 'wallet' ? (acc as any).address : undefined
      }))
    });

    const solanaWallet = user.linkedAccounts.find(
      (account) => account.type === "wallet" && account.chainType === "solana"
    );

    if (!solanaWallet) {
      console.log('No Solana wallet found for user');
      return res.status(401).json({ error: "No Solana wallet connected" });
    }

    const walletAddress = (solanaWallet as any).address;
    console.log('Found Solana wallet:', walletAddress);

    const hasAccess = await verifyTokenOwnership(walletAddress, tokenAddress, requiredAmount);
    console.log('Access verification result:', {
      walletAddress,
      hasAccess
    });

    return res.status(200).json({ hasAccess });
  } catch (error) {
    console.error("Error in verify-token-access:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
} 