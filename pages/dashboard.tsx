import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import Head from "next/head";

async function verifyToken() {
  const url = "/api/verify";
  const accessToken = await getAccessToken();
  const result = await fetch(url, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined),
    },
  });

  return await result.json();
}

export default function DashboardPage() {
  const [verifyResult, setVerifyResult] = useState();
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  return (
    <>
      <Head>
        <title>Privy Auth Demo</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        {ready && authenticated ? (
          <>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">Privy Auth Demo</h1>
              <button
                onClick={logout}
                className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
              >
                Logout
              </button>
            </div>
            <div className="mt-12 flex gap-4 flex-wrap">
              <button
                onClick={() => verifyToken().then(setVerifyResult)}
                className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none"
              >
                Verify token on server
              </button>

              {Boolean(verifyResult) && (
                <details className="w-full">
                  <summary className="mt-6 font-bold uppercase text-sm text-gray-600">
                    Server verify result
                  </summary>
                  <pre className="max-w-4xl bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md mt-2">
                    {JSON.stringify(verifyResult, null, 2)}
                  </pre>
                </details>
              )}
            </div>

            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              User object
            </p>
            <pre className="max-w-4xl bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md mt-2">
              {JSON.stringify(user, null, 2)}
            </pre>
          </>
        ) : null}
      </main>
    </>
  );
}
