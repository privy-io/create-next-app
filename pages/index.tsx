import Portal from "../components/graphics/portal";
import { useLogin, useLoginWithEmail, usePrivy } from "@privy-io/react-auth";
import { PrivyClient } from "@privy-io/server-auth";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const cookieAuthToken = req.cookies["privy-token"];

  // If no cookie is found, skip any further checks
  if (!cookieAuthToken) return { props: {} };

  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
  const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

  try {
    const claims = await client.verifyAuthToken(cookieAuthToken);
    // Use this result to pass props to a page for server rendering or to drive redirects!
    // ref https://nextjs.org/docs/pages/api-reference/functions/get-server-side-props
    console.log({ claims });

    return {
      props: {},
      redirect: { destination: "/dashboard", permanent: false },
    };
  } catch (error) {
    return { props: {} };
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [emailCodeInput, setEmailCodeInput] = useState("");
  const [email, setEmail] = useState("");
  const { ready, authenticated } = usePrivy();
  
  const { login } = useLogin({
    onComplete: () => router.push("/dashboard"),
  });
  const { sendCode, loginWithCode, state } = useLoginWithEmail({
    onComplete(user, isNewUser, wasAlreadyAuthenticated, loginMethod, loginAccount) {
      console.log("Here is the onComplete callback")
      console.log({ user, isNewUser, wasAlreadyAuthenticated, loginMethod, loginAccount });
    }
  })
  
  console.log({ ready, authenticated, state });
  return (
    <>
      <Head>
        <title>Login · Privy</title>
      </Head>

      <main className="flex min-h-screen min-w-full">
        <div className="flex bg-privy-light-blue flex-1 p-6 justify-center items-center">
          <div>
            <div>
              <Portal style={{ maxWidth: "100%", height: "auto" }} />
            </div>
            <div className="mt-6 flex justify-center text-center">
              <button
                className="bg-violet-600 hover:bg-violet-700 py-3 px-6 text-white rounded-lg"
                onClick={login}
              >
                Log in with Privy UI
              </button>
            </div>
            <div className="flex items-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="border rounded-lg px-4 py-2"
              />
              <button
                className="bg-green-500 text-white py-3 px-6 text-white rounded-lg ml-2"
                onClick={() => sendCode({ email })}
              >
                Send email code
              </button>
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                value={emailCodeInput}
                onChange={(e) => setEmailCodeInput(e.target.value)}
                placeholder="Enter verification code"
                className="border rounded-lg px-4 py-2 ml-2"
              />
              <button
                className="bg-blue-500 text-white py-3 px-6 text-white rounded-lg"
                onClick={() => loginWithCode({ code: emailCodeInput })}
              >
                Login with email code
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
