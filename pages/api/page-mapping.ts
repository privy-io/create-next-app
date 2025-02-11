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

type PrivyUserPages = {
  pages: Array<{
    walletAddress: string;
    slug: string;
  }>;
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
    
    // More detailed debug logging
    console.log('Full user data:', JSON.stringify(user, null, 2));
    console.log('Wallet verification check:', {
      requestedWallet: walletAddress,
      walletAddressType: typeof walletAddress,
      linkedAccounts: user.linkedAccounts.map(acc => ({
        type: acc.type,
        chainType: acc.chainType,
        ...(acc.type === 'wallet' && { address: (acc as any).verifiedAddress })
      }))
    });
    
    // Check if the wallet address is in the user's linked accounts
    const hasWallet = user.linkedAccounts.some(account => {
      if (account.type === 'wallet' && account.chainType === 'solana') {
        const walletAccount = account as { verifiedAddress?: string };
        const matches = walletAccount.verifiedAddress?.toLowerCase() === walletAddress.toLowerCase();
        console.log('Checking wallet match:', {
          accountAddress: walletAccount.verifiedAddress?.toLowerCase(),
          requestedWallet: walletAddress.toLowerCase(),
          matches
        });
        return matches;
      }
      return false;
    });

    if (!hasWallet) {
      console.log('Wallet ownership verification failed:', {
        requestedWallet: walletAddress,
        availableWallets: user.linkedAccounts
          .filter(acc => acc.type === 'wallet' && acc.chainType === 'solana')
          .map(acc => {
            const walletAcc = acc as { verifiedAddress?: string };
            return walletAcc.verifiedAddress;
          })
          .filter(Boolean)
      });
      throw new Error("Wallet not owned by authenticated user");
    }

    return user;
  } catch (error) {
    console.error('Verification error details:', error);
    throw error;
  }
}

// Helper function to get the Redis key for a slug
const getRedisKey = (slug: string) => `page:${slug}`;

// Helper function to get all pages for a wallet
async function getPagesForWallet(walletAddress: string) {
  try {
    // Get user by wallet address
    const user = await client.getUser(walletAddress);
    
    // Get user's pages from metadata
    const metadata = (user.customMetadata || {}) as unknown as PrivyUserPages;
    const userPages = metadata?.pages || [];
    
    // Get the full page data from Redis for each slug
    const pages = await Promise.all(
      userPages
        .filter(page => page.walletAddress === walletAddress)
        .map(async (page) => {
          const pageData = await redis.get<PageMapping[string]>(getRedisKey(page.slug));
          if (pageData) {
            return {
              slug: page.slug,
              connectedToken: pageData.connectedToken
            };
          }
          return null;
        })
    );

    return pages.filter(Boolean);
  } catch (error) {
    console.error('Error getting pages for wallet:', error);
    return [];
  }
}

// Helper function to add page to user's metadata
async function addPageToUserMetadata(userId: string, walletAddress: string, slug: string) {
  try {
    const currentMetadata = await client.getUser(userId);
    const pages = ((currentMetadata.customMetadata || {}) as unknown as PrivyUserPages)?.pages || [];
    
    // Add new page if it doesn't exist
    if (!pages.some(p => p.slug === slug)) {
      const updatedPages = [...pages, { walletAddress, slug }];
      // Need to cast to any due to Privy's type limitations
      await client.setCustomMetadata(userId, {
        pages: updatedPages as any
      });
    }
  } catch (error) {
    console.error('Error updating user metadata:', error);
    throw new Error('Failed to update user metadata');
  }
}

// Helper function to remove page from user's metadata
async function removePageFromUserMetadata(userId: string, slug: string) {
  try {
    const currentMetadata = await client.getUser(userId);
    const pages = ((currentMetadata.customMetadata || {}) as unknown as PrivyUserPages)?.pages || [];
    
    const updatedPages = pages.filter(p => p.slug !== slug);
    // Need to cast to any due to Privy's type limitations
    await client.setCustomMetadata(userId, {
      pages: updatedPages as any
    });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    throw new Error('Failed to update user metadata');
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET: Fetch mapping for a specific slug or wallet's pages
  if (req.method === 'GET') {
    const { slug, walletAddress } = req.query;
    
    try {
      // If walletAddress is provided, return pages for that wallet
      if (walletAddress) {
        const pages = await getPagesForWallet(walletAddress as string);
        return res.status(200).json({ pages });
      }

      // If slug is provided, return specific mapping
      if (slug) {
        const mapping = await redis.get<PageMapping[string]>(getRedisKey(slug as string));
        
        // If there's a mapping, try to verify ownership
        let isOwner = false;
        if (mapping) {
          try {
            await verifyWalletOwnership(req, mapping.walletAddress);
            isOwner = true;
          } catch (error) {
            // Ignore verification errors - just means user doesn't own the page
            console.log('User does not own page:', error);
          }
        }
        
        return res.status(200).json({ mapping, isOwner });
      }

      // Return error if neither slug nor walletAddress provided
      return res.status(400).json({ error: 'Slug or wallet address is required' });
    } catch (error) {
      console.error('Error fetching page mapping:', error);
      return res.status(500).json({ error: 'Failed to fetch page mapping' });
    }
  }

  // POST: Create a new mapping
  if (req.method === 'POST') {
    try {
      const { 
        slug, 
        walletAddress, 
        isSetupWizard,
        title,
        description,
        items,
        connectedToken,
        image
      } = req.body;

      if (!slug || !walletAddress) {
        return res.status(400).json({ error: 'Slug and wallet address are required' });
      }

      // Check if slug exists first
      const existingPage = await redis.get<PageMapping[string]>(getRedisKey(slug));
      if (existingPage) {
        // If page exists but belongs to another user, reject
        if (existingPage.walletAddress !== walletAddress) {
          return res.status(400).json({ error: 'This URL is already taken' });
        }
      }

      // Verify ownership of the wallet being used to create/update the page
      let user;
      try {
        user = await verifyWalletOwnership(req, walletAddress);
      } catch (error) {
        return res.status(401).json({ error: error instanceof Error ? error.message : 'Authentication failed' });
      }

      // For initial setup wizard step, only store minimal data
      if (isSetupWizard === true) {
        const initialData = {
          walletAddress,
          createdAt: new Date().toISOString()
        };
        await redis.set(getRedisKey(slug), initialData);
        // Add page to user's metadata
        await addPageToUserMetadata(user.id, walletAddress, slug);
        return res.status(200).json({ success: true });
      }

      // Create/Update page data, preserving existing data
      const pageData = {
        ...existingPage,  // Preserve existing data
        walletAddress,
        ...(title && { title }),
        ...(description && { description }),
        ...(items && { items }),
        ...(connectedToken && { connectedToken }),
        ...(image && { image }),
        updatedAt: new Date().toISOString()
      };

      // Save to Redis with unique key
      await redis.set(getRedisKey(slug), pageData);
      // Add page to user's metadata if it's a new page
      if (!existingPage) {
        await addPageToUserMetadata(user.id, walletAddress, slug);
      }
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

      // Get current mapping to verify ownership
      const currentMapping = await redis.get<PageMapping[string]>(getRedisKey(slug));
      if (!currentMapping) {
        return res.status(404).json({ error: 'Page not found' });
      }

      // Verify wallet ownership and get user
      let user;
      try {
        user = await verifyWalletOwnership(req, currentMapping.walletAddress);
      } catch (error) {
        return res.status(401).json({ error: error instanceof Error ? error.message : 'Authentication failed' });
      }

      // Remove the mapping from Redis
      await redis.del(getRedisKey(slug));
      // Remove page from user's metadata
      await removePageFromUserMetadata(user.id, slug);
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

      // Get current mapping to verify ownership
      const currentMapping = await redis.get<PageMapping[string]>(getRedisKey(slug));
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
      const updatedMapping = {
        ...currentMapping,
        ...(connectedToken !== undefined && { connectedToken }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(socials !== undefined && { socials }),
      };

      // Save to Redis
      await redis.set(getRedisKey(slug), updatedMapping);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating page mapping:', error);
      return res.status(500).json({ error: 'Failed to update page mapping' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 