import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Spinner from './Spinner';
import { Checkbox } from "@/components/ui/checkbox";

type TokenBalance = {
  mint: string;
  amount: number;
  decimals: number;
  tokenName?: string;
  symbol?: string;
  image?: string;
};

type TokenMetadata = {
  name: string;
  description?: string;
  symbol?: string;
  image?: string;
};

interface TokenSelectorProps {
  walletAddress: string;
  selectedToken: string | null;
  onTokenSelect: (tokenAddress: string | null) => void;
  onMetadataLoad?: (metadata: TokenMetadata | null) => void;
}

export default function TokenSelector({ 
  walletAddress, 
  selectedToken, 
  onTokenSelect,
  onMetadataLoad
}: TokenSelectorProps) {
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false);

  // Load saved token on mount if there's a connected token
  useEffect(() => {
    if (selectedToken) {
      const storageKey = `selected_token_${walletAddress}`;
      localStorage.setItem(storageKey, selectedToken);
    }
  }, [selectedToken, walletAddress]);

  // Load token metadata if we have a saved token
  useEffect(() => {
    if (selectedToken) {
      handleTokenSelect(selectedToken);
    }
  }, []);

  const fetchTokens = async () => {
    setIsLoadingTokens(true);
    try {
      const response = await fetch(`/api/tokens?address=${walletAddress}`);
      const data = await response.json();
      setTokens(data.tokens);
      setHasInitiallyFetched(true);

      // If we have a connected token but no tokens loaded, fetch them automatically
      if (selectedToken && !hasInitiallyFetched) {
        fetchTokens();
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  const handleTokenSelect = async (tokenAddress: string) => {
    // Save to localStorage
    const storageKey = `selected_token_${walletAddress}`;
    localStorage.setItem(storageKey, tokenAddress);
    
    onTokenSelect(tokenAddress);
    try {
      const response = await fetch(`/api/tokens/metadata?address=${tokenAddress}`);
      const data = await response.json();
      if (data.metadata) {
        onMetadataLoad?.(data.metadata);
      }
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      onMetadataLoad?.(null);
    }
  };

  return (
    <div className="space-y-4">
      <Select 
        value={selectedToken || ''} 
        onValueChange={handleTokenSelect}
        onOpenChange={(open) => {
          if (open && !hasInitiallyFetched) {
            fetchTokens();
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a token" />
        </SelectTrigger>
        <SelectContent>
          {isLoadingTokens ? (
            <div className="flex items-center justify-center py-2">
              <Spinner className="h-4 w-4" />
            </div>
          ) : tokens.length > 0 ? (
            tokens.map((token) => (
              <SelectItem key={token.mint} value={token.mint}>
                {token.tokenName || 'Unknown Token'} 
                {token.symbol && ` (${token.symbol})`}
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-2 text-sm text-gray-500">
              No tokens found
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
} 