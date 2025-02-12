import Portal from "../components/graphics/portal";
import { useLogin, usePrivy, WalletWithMetadata } from "@privy-io/react-auth";
import { PrivyClient } from "@privy-io/server-auth";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/toaster";
import AppMenu from "@/components/AppMenu";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import CreatePageModal from "@/components/CreatePageModal";
import { useState, useEffect } from "react";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const cookieAuthToken = req.cookies["privy-token"];

  // If no cookie is found, skip any further checks
  if (!cookieAuthToken) return { props: {} };

  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
  const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

  try {
    const claims = await client.verifyAuthToken(cookieAuthToken);
    // Since we're not redirecting to dashboard anymore, just return the claims
    return { props: {} };
  } catch (error) {
    return { props: {} };
  }
};

interface SolanaWallet extends WalletWithMetadata {
  type: "wallet";
  chainType: "solana";
  address: string;
}

const isSolanaWallet = (account: any): account is SolanaWallet => {
  return account.type === "wallet" && account.chainType === "solana";
};

export default function HomePage() {
  const router = useRouter();
  const { login } = useLogin({
    onComplete: () => {
      // Instead of redirecting, we'll let the page re-render with authenticated state
      router.replace(router.asPath);
    },
  });
  const { ready, authenticated, user } = usePrivy();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hasPages, setHasPages] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get the first Solana wallet if one exists
  const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);

  // Check if user has any pages
  useEffect(() => {
    const checkUserPages = async () => {
      if (!solanaWallet) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/page-store?walletAddress=${solanaWallet.address}`,
        );
        const data = await response.json();
        setHasPages(data.pages?.pages?.length > 0);
      } catch (error) {
        console.error("Error checking user pages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserPages();
  }, [solanaWallet]);

  const handleDashboardClick = () => {
    window.dispatchEvent(new CustomEvent("openAppMenu"));
  };

  return (
    <>
      <Head>
        <title>Page.fun - Linktree alternative for tokens and memes.</title>
      </Head>

      <div className="fixed top-2 left-2 z-50">
        <AppMenu />
      </div>

      <main className="flex min-h-screen  bg-muted min-w-full grid sm:grid-cols-2">
        <div className="flex flex-1 items-center max-w-[400px] px-4 w-full mx-auto">
          <div>
            <h1 className="text-xl  mb-4 flex items-center gap-2">
              <Logo />
              page.fun
            </h1>
            <h1 className="text-2xl font-semibold mb-4">
              A Linktree alternative for tokens and memes.
            </h1>
            <p className=" text-lg opacity-75 mb-4">
              Give tokens utility with gated links, alpha access and more.
            </p>
            {authenticated ? (
              <Button
                onClick={
                  hasPages
                    ? handleDashboardClick
                    : () => setShowCreateModal(true)
                }
                disabled={isLoading}
              >
                {isLoading
                  ? "Loading..."
                  : hasPages
                    ? "Dashboard"
                    : "Create Page"}
              </Button>
            ) : (
              <Button onClick={login}>Login</Button>
            )}
          </div>
        </div>
        <div className="bg-primary relative">
          <div className="absolute text-white text-xs pb-2 bottom-0 left-[50%] -translate-x-1/2">
            © Page.fun - $page.
          </div>
        </div>
      </main>

      {showCreateModal && solanaWallet && (
        <CreatePageModal
          walletAddress={solanaWallet.address}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      <Toaster />
    </>
  );
}
