import Portal from "../components/graphics/portal";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { PrivyClient } from "@privy-io/server-auth";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { Toaster } from '@/components/ui/toaster';

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
        <title>{authenticated ? 'Page.fun' : 'Login · Page.fun'}</title>
      </Head>

      <main className="flex min-h-screen min-w-full">
        <div className="flex bg-privy-light-blue flex-1 p-6 justify-center items-center">
          <div>
            <div>
              <Portal style={{ maxWidth: "100%", height: "auto" }} />
            </div>
            <div className="mt-6 flex flex-col items-center text-center">
              <h1 className="text-2xl font-semibold mb-4">Welcome to Page.fun!</h1>
              {authenticated ? (
                <p className="text-gray-600 mb-4">
                  Create and manage your pages using the menu in the top right corner.
                </p>
              ) : (
                <>
                  <p className="text-gray-600 mb-6">
                    Connect your wallet to get started with your personalized page.
                  </p>
                  <button
                    className="bg-violet-600 hover:bg-violet-700 py-3 px-6 text-white rounded-lg"
                    onClick={login}
                  >
                    Log in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Toaster />
    </>
  );
}
