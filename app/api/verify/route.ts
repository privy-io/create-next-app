import { cookies, headers } from "next/headers";
import { createPrivyClient } from "../../../lib/utils";

export async function GET() {
  const headerAuthToken = (await headers())
    .get("authorization")
    .replace(/^Bearer/, "");
  const cookieAuthToken = (await cookies()).get("privy-token");

  const authToken = cookieAuthToken?.value || headerAuthToken;

  if (!authToken) {
    return new Response(JSON.stringify({ error: "Missing auth token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const client = createPrivyClient();
    const claims = await client.verifyAuthToken(authToken);
    return new Response(JSON.stringify({ claims }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
