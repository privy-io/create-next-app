import { WalletWithMetadata } from "@privy-io/react-auth";

export interface SolanaWallet extends WalletWithMetadata {
  chainType: 'solana';
}

export function isSolanaWallet(account: WalletWithMetadata | any): account is SolanaWallet {
  return (
    account?.type === 'wallet' &&
    account?.chainType === 'solana' &&
    typeof account?.address === 'string'
  );
} 