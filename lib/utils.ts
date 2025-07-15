import { AuthTokenClaims, PrivyClient } from "@privy-io/server-auth";

export type APIError = {
  error: string;
  cause?: string;
};

/**
 * Authorizes a user to call an endpoint, returning either an error result or their verifiedClaims
 * @param authToken - The auth token to verify
 * @param client - A PrivyClient
 */
export const fetchAndVerifyAuthorization = async (
  authToken: string,
  client: PrivyClient,
): Promise<AuthTokenClaims | void> => {
  try {
    return await client.verifyAuthToken(authToken);
  } catch {
    throw new Error("Invalid auth token.");
  }
};

export const createPrivyClient = () => {
  return new PrivyClient(
    process.env.NEXT_PUBLIC_PRIVY_APP_ID as string,
    process.env.PRIVY_APP_SECRET as string,
    {
      walletApi: {
        authorizationPrivateKey: process.env.SESSION_SIGNER_SECRET,
      },
    },
  );
};
