import { headers } from "next/headers";
import {
  createPrivyClient,
  fetchAndVerifyAuthorization,
} from "../../../../lib/utils";

export async function POST(req: Request) {
  const authToken = (await headers())
    .get("authorization")
    ?.replace(/^Bearer /, "");
  const body = await req.json();

  if (!authToken) {
    return new Response(JSON.stringify({ error: "Missing auth token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = createPrivyClient();

  try {
    const errorOrVerifiedClaims = await fetchAndVerifyAuthorization(
      authToken,
      client,
    );
    const authorized =
      errorOrVerifiedClaims && "appId" in errorOrVerifiedClaims;

    const message = body.message;
    const walletId = body.wallet_id;

    if (!authorized || !message || !walletId) {
      return new Response(
        JSON.stringify({ error: "Invalid request parameters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { signature } = await client.walletApi.ethereum.signMessage({
      walletId,
      message,
    });
    return new Response(
      JSON.stringify({
        method: "personal_sign",
        data: {
          signature: signature,
          encoding: "hex",
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({
        error: (e as Error).message,
        cause: (e as Error).stack,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
