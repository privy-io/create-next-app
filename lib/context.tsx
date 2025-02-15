import { createContext, useContext, useState, useEffect } from 'react';
import { usePrivy, WalletWithMetadata } from '@privy-io/react-auth';
import { PageData } from '@/types';

interface TokenHolding {
  tokenAddress: string;
  balance: string;
}

interface SolanaWallet extends WalletWithMetadata {
  type: "wallet";
  chainType: "solana";
  address: string;
}

const isSolanaWallet = (account: any): account is SolanaWallet => {
  return account.type === "wallet" && account.chainType === "solana";
};

interface GlobalContextType {
  userPages: PageData[];
  tokenHoldings: TokenHolding[];
  isLoadingPages: boolean;
  isLoadingTokens: boolean;
  refreshPages: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  walletAddress?: string;
  isAuthenticated: boolean;
}

const GlobalContext = createContext<GlobalContextType>({
  userPages: [],
  tokenHoldings: [],
  isLoadingPages: false,
  isLoadingTokens: false,
  refreshPages: async () => {},
  refreshTokens: async () => {},
  walletAddress: undefined,
  isAuthenticated: false,
});

export const useGlobalContext = () => useContext(GlobalContext);

export function GlobalProvider({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  const { authenticated, user } = usePrivy();
  const [userPages, setUserPages] = useState<PageData[]>([]);
  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  // Get the first Solana wallet if one exists
  const walletAddress = user?.linkedAccounts?.find(isSolanaWallet)?.address;

  const fetchPages = async () => {
    if (!walletAddress) {
      setUserPages([]);
      return;
    }

    setIsLoadingPages(true);
    try {
      const response = await fetch(`/api/page-store?walletAddress=${walletAddress}`);
      const { pages } = await response.json();
      setUserPages(pages || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      setUserPages([]);
    } finally {
      setIsLoadingPages(false);
    }
  };

  const fetchTokens = async () => {
    if (!walletAddress) {
      setTokenHoldings([]);
      return;
    }

    setIsLoadingTokens(true);
    try {
      const response = await fetch(`/api/token-holdings?walletAddress=${walletAddress}`);
      const { tokens } = await response.json();
      setTokenHoldings(tokens || []);
    } catch (error) {
      console.error('Error fetching token holdings:', error);
      setTokenHoldings([]);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  useEffect(() => {
    fetchPages();
    fetchTokens();
  }, [walletAddress]);

  return (
    <GlobalContext.Provider 
      value={{
        userPages,
        tokenHoldings,
        isLoadingPages,
        isLoadingTokens,
        refreshPages: fetchPages,
        refreshTokens: fetchTokens,
        walletAddress,
        isAuthenticated: authenticated,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
} 