import Portal from "../components/graphics/portal";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { PrivyClient } from "@privy-io/server-auth";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/toaster";
import AppMenu from "@/components/AppMenu";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

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

export default function HomePage() {
  const router = useRouter();
  const { login } = useLogin({
    onComplete: () => {
      // Instead of redirecting, we'll let the page re-render with authenticated state
      router.replace(router.asPath);
    },
  });
  const { ready, authenticated } = usePrivy();

  return (
    <>
      <Head>
        <title>{authenticated ? "Page.fun" : "Login · Page.fun"}</title>
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
              Linktree for memes & tokens.
            </h1>
            {authenticated ? (
              <Button onClick={() => window.dispatchEvent(new CustomEvent('openAppMenu'))}>
                Dashboard
              </Button>
            ) : (
              <Button onClick={login}>Login</Button>
            )}
          </div>
        </div>
        <div className="bg-primary">asdf</div>
      </main>

      <Toaster />
    </>
  );
}
