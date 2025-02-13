import type { NextApiRequest, NextApiResponse } from "next";

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { walletAddress } = req.query;

  if (!walletAddress || typeof walletAddress !== 'string') {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  if (!HELIUS_API_KEY) {
    console.error('Missing Helius API key');
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    // Use Helius RPC endpoint to get all assets
    const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'token-holdings',
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

    if (!data.result?.items) {
      console.error('Unexpected API response format:', data);
      return res.status(500).json({ error: "Invalid API response" });
    }

    // Transform the data into a simpler format
    const tokens = data.result.items.map((asset: any) => ({
      tokenAddress: asset.id || asset.mint || asset.content?.metadata?.mint,
      balance: asset.token_info?.balance || '0'
    })).filter((token: any) => token.tokenAddress && token.balance !== '0');

    return res.status(200).json({ tokens });
  } catch (error) {
    console.error("Error fetching token holdings:", error);
    return res.status(500).json({ error: "Failed to fetch token holdings" });
  }
} 