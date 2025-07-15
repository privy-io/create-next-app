import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Portal from "../components/graphics/portal";
import LoginButton from "../components/login-button";
import { createPrivyClient } from "../lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privy Login",
};

export default async function Page() {
  const cookieAuthToken = (await cookies()).get("privy-token");

  if (cookieAuthToken) {
    const client = createPrivyClient();

    try {
      const claims = await client.verifyAuthToken(cookieAuthToken.value);
      console.log("Claims:", claims);

      redirect("/dashboard");
    } catch (error) {
      console.error("Error verifying auth token:", error);
      return <div>Error verifying authentication token.</div>;
    }
  }

  return (
    <main className="flex min-h-screen min-w-full">
      <div className="flex bg-privy-light-blue flex-1 p-6 justify-center items-center">
        <div>
          <div>
            <Portal style={{ maxWidth: "100%", height: "auto" }} />
          </div>
          <div className="mt-6 flex justify-center text-center">
            <LoginButton />
          </div>
        </div>
      </div>
    </main>
  );
}
