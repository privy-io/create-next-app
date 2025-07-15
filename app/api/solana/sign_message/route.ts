import { createPrivyClient } from "../../../../lib/utils";
import { fetchAndVerifyAuthorization } from "../../../../lib/utils";

export async function POST(req: Request) {
  const authToken = req.headers.get("authorization")?.replace(/^Bearer /, "");
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

    const { signature } = await client.walletApi.solana.signMessage({
      walletId,
      message,
    });
    return new Response(
      JSON.stringify({
        method: "signMessage",
        data: {
          signature: Buffer.from(signature).toString("base64"),
          encoding: "base64",
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
