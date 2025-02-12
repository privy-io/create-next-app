import type { NextApiRequest, NextApiResponse } from "next";

type TokenBalance = {
  mint: string;
  amount: number;
  decimals: number;
  tokenName?: string;
  symbol?: string;
  isPumpToken?: boolean;
  image?: string;
};

type TokenResponse = {
  tokens: TokenBalance[];
  error?: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenResponse>,
) {
  const { address } = req.query;

  if (!address) {
    return res
      .status(400)
      .json({ tokens: [], error: "Wallet address is required" });
  }

  try {
    const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

    if (!HELIUS_API_KEY) {
      throw new Error("Helius API key is not configured");
    }

    // Using DAS getAssetsByOwner with retry logic
    let retries = 3;
    let response;

    while (retries > 0) {
      try {
        response = await fetch(
          `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: "tokens-fetch",
              method: "getAssetsByOwner",
              params: {
                ownerAddress: address,
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

        if (response.ok) break;

        // Handle rate limits (429) with retry
        if (response.status === 429) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (4 - retries)),
          ); // Exponential backoff
          retries--;
          continue;
        }

        throw new Error(
          `Helius API error: ${response.status} ${response.statusText}`,
        );
      } catch (error) {
        if (retries === 0) throw error;
        retries--;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const data = await response!.json();

    // Process both fungible and non-fungible tokens
    const fungibleTokens = data.result.items.filter(
      (item: any) =>
        item.interface === "FungibleToken" ||
        item.interface === "FungibleAsset",
    );

    const tokens = fungibleTokens.map((token: any) => {
      // Extract token info from DAS response
      const tokenInfo = token.token_info || {};
      const metadata = token.content?.metadata || {};

      return {
        mint: token.id,
        amount:
          tokenInfo.balance !== undefined
            ? tokenInfo.balance
            : token.ownership.amount,
        decimals: tokenInfo.decimals || 0,
        tokenName: metadata.name || "Unknown Token",
        symbol: metadata.symbol || "",
        isPumpToken: false,
        image: metadata.image || null,
      };
    });

    return res.status(200).json({ tokens });
  } catch (error) {
    console.error("Error in tokens API:", error);
    return res.status(500).json({
      tokens: [],
      error: error instanceof Error ? error.message : "Failed to fetch tokens",
    });
  }
}

export default handler;
