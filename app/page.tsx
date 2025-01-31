import { redirect } from "next/navigation";
import Login from "../components/login";

import { PrivyClient } from "@privy-io/server-auth";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies()
  const cookieAuthToken = cookieStore.get("privy-token")?.value;

  if (cookieAuthToken){
    const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
    const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

    try {
      const claims = await client.verifyAuthToken(cookieAuthToken);
      console.log({ claims });

      redirect("/dashboard");
    } catch (error) {
      console.error(error);
    }
  }

  return <Login />
}