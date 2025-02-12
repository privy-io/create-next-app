import type { NextApiRequest, NextApiResponse } from "next";

type TokenMetadata = {
  name: string;
  description?: string;
  symbol?: string;
  image?: string;
};

type MetadataResponse = {
  metadata?: TokenMetadata;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MetadataResponse>
) {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Token address is required" });
  }

  try {
    const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
    
    if (!HELIUS_API_KEY) {
      throw new Error('Helius API key is not configured');
    }

    const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'metadata-fetch',
        method: 'getAsset',
        params: {
          id: address,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.result.content || {};
    console.log(content.metadata);
    const metadata = content.metadata || {};
    const files = content.files || [];

    // Get image URL from metadata or files
    const imageUrl = metadata.image || 
      (files.length > 0 && typeof files[0] === 'object' ? files[0].uri : null) ||
      (files.length > 0 && typeof files[0] === 'string' ? files[0] : null);

    return res.status(200).json({
      metadata: {
        name: metadata.name || 'Unknown Token',
        description: metadata.description,
        symbol: metadata.symbol,
        image: imageUrl,
      }
    });
    
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to fetch token metadata" 
    });
  }
} 