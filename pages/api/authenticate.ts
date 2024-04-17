import type {NextApiRequest, NextApiResponse} from 'next';

import {PrivyClient} from '@privy-io/server-auth';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const client = new PrivyClient(PRIVY_APP_ID as string, PRIVY_APP_SECRET as string);

export type AuthenticateSuccessResponse = {
  claims: {
    appId: string,
    issuer: string,
    issuedAt: number,
    expiration: number,
    sessionId: string,
    userId: string
  }
};

export type AuthenticationErrorResponse = {
  error: string;
};

export default async function GET(req: NextApiRequest, res: NextApiResponse<AuthenticateSuccessResponse | AuthenticationErrorResponse>) {
  const headerAuthToken = req.headers.authorization?.replace(/^Bearer /, '');
  const cookieAuthToken = req.cookies['privy-token'];
  
  // TODO: properly show examples for cookies and non-cookies
  const authToken = cookieAuthToken || headerAuthToken;

  if (!authToken) {
    return res.status(401).json({error: "Missing auth token"});
  }

  try {
    return res.status(200).json({
      claims: await client.verifyAuthToken(authToken)}
    );
  } catch (e: any) {
    return res.status(401).json({error: e.message});
  }
}
