import type { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';
import { PrivyClient } from "@privy-io/server-auth";

type ItemType = 'twitter' | 'telegram' | 'dexscreener' | 'tiktok' | 'instagram' | 'email' | 'discord' | 'private-chat' | 'terminal' | 'filesystem';

type PageItem = {
  id: string;
  type: ItemType;
  url?: string;  // Optional since plugins don't have URLs
  order: number;
  isPlugin?: boolean;  // To distinguish between socials and plugins
  tokenGated?: boolean;  // Add this
  requiredAmount?: number;  // Add this
}

type PageMapping = {
  [slug: string]: {
    walletAddress: string;
    connectedToken?: string;
    title?: string;
    description?: string;
    image?: string;
    items?: PageItem[];  // Combined socials and plugins
  }
}

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Helper function to verify wallet ownership
async function verifyWalletOwnership(req: NextApiRequest, walletAddress: string) {
  const idToken = req.cookies['privy-id-token'];

  if (!idToken) {
    console.log('Missing identity token. Available cookies:', req.cookies);
    throw new Error("Missing identity token");
  }

  try {
    const user = await client.getUser({ idToken });
    
    // Debug log the user data
    console.log('Checking wallet ownership:', {
      requestedWallet: walletAddress,
      linkedAccounts: user.linkedAccounts
    });
    
    // Check if the wallet address is in the user's linked accounts
    const hasWallet = user.linkedAccounts.some(account => 
      account.type === 'wallet' && 
      account.chainType === 'solana' &&
      'address' in account &&
      account.address === walletAddress
    );

    if (!hasWallet) {
      console.log('Wallet ownership verification failed:', {
        requestedWallet: walletAddress,
        availableWallets: user.linkedAccounts
          .filter(acc => acc.type === 'wallet' && acc.chainType === 'solana')
          .map(acc => acc.address)
      });
      throw new Error("Wallet not owned by authenticated user");
    }

    return user;
  } catch (error) {
    console.error('Verification error:', error);
    throw new Error("Failed to verify wallet ownership");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET: Fetch mapping for a specific slug or all mappings
  if (req.method === 'GET') {
    const { slug, walletAddress } = req.query;
    
    try {
      // Get all mappings from Redis
      const mappings: PageMapping = await redis.get('page-mappings') || {};

      // If walletAddress is provided, return pages for that wallet
      if (walletAddress) {
        const walletPages = Object.entries(mappings)
          .filter(([_, data]) => data.walletAddress === walletAddress)
          .map(([slug, data]) => ({
            slug,
            connectedToken: data.connectedToken
          }));
        return res.status(200).json({ pages: walletPages });
      }

      // If slug is provided, return specific mapping
      if (slug) {
        const mapping = mappings[slug as string];
        return res.status(200).json({ mapping });
      }

      // Return all mappings
      return res.status(200).json({ mappings });
    } catch (error) {
      console.error('Error fetching page mapping:', error);
      return res.status(500).json({ error: 'Failed to fetch page mapping' });
    }
  }

  // POST: Create or update a mapping
  if (req.method === 'POST') {
    try {
      const { 
        slug, 
        walletAddress, 
        isSetupWizard,
        title,
        description,
        socials,
        plugins,
        connectedToken,
        image
      } = req.body;

      if (!slug || !walletAddress) {
        return res.status(400).json({ error: 'Slug and wallet address are required' });
      }

      // Verify wallet ownership
      try {
        await verifyWalletOwnership(req, walletAddress);
      } catch (error) {
        return res.status(401).json({ error: error instanceof Error ? error.message : 'Authentication failed' });
      }

      // Get existing mappings
      const mappings: PageMapping = await redis.get('page-mappings') || {};

      // Check if slug is already taken by a different wallet
      if (mappings[slug] && mappings[slug].walletAddress !== walletAddress) {
        return res.status(400).json({ error: 'This URL is already taken' });
      }

      // Check if wallet already has a page, but skip this check during setup wizard
      if (!isSetupWizard) {
        const existingSlug = Object.entries(mappings).find(
          ([_, data]) => data.walletAddress === walletAddress
        );
        
        if (existingSlug) {
          return res.status(400).json({ 
            error: 'This wallet already has a page. Delete the existing page first.' 
          });
        }
      }

      // Add new mapping with all fields
      mappings[slug] = { 
        walletAddress,
        ...(title && { title }),
        ...(description && { description }),
        ...(socials && { socials }),
        ...(plugins && { plugins }),
        ...(connectedToken && { connectedToken }),
        ...(image && { image })
      };

      // Save to Redis
      await redis.set('page-mappings', mappings);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error storing page mapping:', error);
      return res.status(500).json({ error: 'Failed to store page mapping' });
    }
  }

  // DELETE: Remove a mapping
  if (req.method === 'DELETE') {
    try {
      const { slug } = req.body;

      if (!slug) {
        return res.status(400).json({ error: 'Slug is required' });
      }

      // Get existing mappings
      const mappings: PageMapping = await redis.get('page-mappings') || {};

      // Get current mapping to verify ownership
      const currentMapping = mappings[slug];
      if (!currentMapping) {
        return res.status(404).json({ error: 'Page not found' });
      }

      // Verify wallet ownership
      try {
        await verifyWalletOwnership(req, currentMapping.walletAddress);
      } catch (error) {
        return res.status(401).json({ error: error instanceof Error ? error.message : 'Authentication failed' });
      }

      // Remove the mapping
      delete mappings[slug];

      // Save to Redis
      await redis.set('page-mappings', mappings);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting page mapping:', error);
      return res.status(500).json({ error: 'Failed to delete page mapping' });
    }
  }

  // PATCH: Update existing mapping
  if (req.method === 'PATCH') {
    try {
      const { slug, connectedToken, title, description, image, socials } = req.body;

      if (!slug) {
        return res.status(400).json({ error: 'Slug is required' });
      }

      // Get existing mappings
      const mappings: PageMapping = await redis.get('page-mappings') || {};

      // Get current mapping to verify ownership
      const currentMapping = mappings[slug];
      if (!currentMapping) {
        return res.status(404).json({ error: 'Page not found' });
      }

      // Verify wallet ownership
      try {
        await verifyWalletOwnership(req, currentMapping.walletAddress);
      } catch (error) {
        return res.status(401).json({ error: error instanceof Error ? error.message : 'Authentication failed' });
      }

      // Update the mapping with new fields
      mappings[slug] = {
        ...mappings[slug],
        ...(connectedToken !== undefined && { connectedToken }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(socials !== undefined && { socials }),
      };

      // Save to Redis
      await redis.set('page-mappings', mappings);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating page mapping:', error);
      return res.status(500).json({ error: 'Failed to update page mapping' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 