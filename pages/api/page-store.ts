import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
import { PrivyClient } from "@privy-io/server-auth";
import { z } from "zod";

// Validation schemas
const urlPattern = /^[a-zA-Z0-9-]+$/;
const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const FontsSchema = z
  .object({
    global: z.string().optional(),
    heading: z.string().optional(),
    paragraph: z.string().optional(),
    links: z.string().optional(),
  })
  .optional();

const PageItemSchema = z
  .object({
    id: z.string().min(1),
    presetId: z.string().min(1),
    title: z.string().optional(),
    url: z
      .union([
        z.string().regex(urlRegex, "Invalid URL format"),
        z.string().email("Invalid email format"),
        z.string().regex(/^mailto:.+/, "Invalid mailto format"),
        z.string().regex(/^https:\/\/t\.me\//, "Invalid Telegram URL"),
        z.string().regex(/^https:\/\/discord\.(gg|com)\//, "Invalid Discord URL"),
        z.string().regex(/^https:\/\/(twitter\.com|x\.com)\//, "Invalid Twitter URL"),
        z.string().regex(/^https:\/\/(www\.)?tiktok\.com\/@/, "Invalid TikTok URL"),
        z.string().regex(/^https:\/\/(www\.)?instagram\.com\//, "Invalid Instagram URL"),
        z.string().regex(/^https:\/\/dexscreener\.com\//, "Invalid DexScreener URL"),
        z.string().length(0),
        z.null(),
        z.undefined(),
      ])
      .optional(),
    order: z.number().int().min(0),
    isPlugin: z.boolean().optional(),
    tokenGated: z.boolean().optional(),
    requiredTokens: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // Only validate URL if one is provided and it's not empty
      if (data.url && data.url.length > 0) {
        console.log('Validating URL in schema:', {
          url: data.url,
          presetId: data.presetId,
          isEmail: data.presetId === "email"
        });

        // For email type
        if (data.presetId === "email") {
          const isValid = data.url.includes("@") || 
                         data.url.startsWith("mailto:") || 
                         data.url.length === 0;
          console.log('Email validation result:', { url: data.url, isValid });
          return isValid;
        }

        // For telegram links
        if (data.presetId === "telegram" || data.presetId === "private-chat") {
          return data.url.startsWith("https://t.me/");
        }

        // For discord links
        if (data.presetId === "discord") {
          return data.url.startsWith("https://discord.gg/") || 
                 data.url.startsWith("https://discord.com/");
        }

        // For twitter links
        if (data.presetId === "twitter") {
          return data.url.startsWith("https://twitter.com/") || 
                 data.url.startsWith("https://x.com/");
        }

        // For tiktok links
        if (data.presetId === "tiktok") {
          return data.url.startsWith("https://tiktok.com/@") || 
                 data.url.startsWith("https://www.tiktok.com/@");
        }

        // For instagram links
        if (data.presetId === "instagram") {
          return data.url.startsWith("https://instagram.com/") || 
                 data.url.startsWith("https://www.instagram.com/");
        }

        // For dexscreener links
        if (data.presetId === "dexscreener") {
          return data.url.startsWith("https://dexscreener.com/");
        }

        // For general links (terminal, filesystem, etc)
        if (!data.isPlugin) {
          return data.url.match(urlRegex) !== null;
        }
      }
      return true;
    },
    {
      message: "Invalid URL format for this item type",
      path: ["url"],
    },
  );

const PageDataSchema = z.object({
  walletAddress: z.string().min(1),
  connectedToken: z.string().nullable().optional(),
  tokenSymbol: z.string().nullable().optional(),
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  image: z.string().regex(urlRegex).nullable().optional(),
  items: z.array(PageItemSchema).optional(),
  designStyle: z.enum(["default", "minimal", "modern"]).optional(),
  fonts: z.object({
    global: z.string().optional(),
    heading: z.string().optional(),
    paragraph: z.string().optional(),
    links: z.string().optional(),
  }).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const CreatePageSchema = z.object({
  slug: z
    .string()
    .regex(urlPattern, "Only letters, numbers, and hyphens allowed")
    .min(1)
    .max(50),
  walletAddress: z.string().min(1),
  isSetupWizard: z.boolean().optional(),
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  items: z.array(PageItemSchema).optional(),
  connectedToken: z.string().nullable().optional(),
  tokenSymbol: z.string().nullable().optional(),
  image: z.string().regex(urlRegex).nullable().optional(),
  designStyle: z.enum(["default", "minimal", "modern"]).optional(),
  fonts: FontsSchema,
});

type PageItem = {
  id: string;
  presetId: string;
  title?: string;
  url?: string;
  order: number;
  isPlugin?: boolean;
  tokenGated?: boolean;
  requiredTokens?: string[];
};

type PageData = {
  walletAddress: string;
  connectedToken?: string;
  title?: string;
  description?: string;
  image?: string;
  items?: PageItem[];
  designStyle?: "default" | "minimal" | "modern";
  fonts?: {
    global?: string;
    heading?: string;
    paragraph?: string;
    links?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Helper function to verify wallet ownership
async function verifyWalletOwnership(
  req: NextApiRequest,
  walletAddress: string,
) {
  const idToken = req.cookies["privy-id-token"];

  if (!idToken) {
    console.log("Missing identity token. Available cookies:", req.cookies);
    throw new Error("Missing identity token");
  }

  try {
    const user = await client.getUser({ idToken });

    // More detailed debug logging
    console.log("Full user data:", JSON.stringify(user, null, 2));
    console.log("Wallet verification check:", {
      requestedWallet: walletAddress,
      walletAddressType: typeof walletAddress,
      linkedAccounts: user.linkedAccounts.map((acc) => ({
        type: acc.type,
        ...(acc.type === "wallet" && {
          address: (acc as any).address,
          chainType: (acc as any).chainType,
        }),
      })),
    });

    // Check if the wallet address is in the user's linked accounts
    const hasWallet = user.linkedAccounts.some((account) => {
      if (account.type === "wallet" && account.chainType === "solana") {
        const walletAccount = account as { address?: string };
        const matches =
          walletAccount.address?.toLowerCase() === walletAddress.toLowerCase();
        console.log("Checking wallet match:", {
          accountAddress: walletAccount.address?.toLowerCase(),
          requestedWallet: walletAddress.toLowerCase(),
          matches,
        });
        return matches;
      }
      return false;
    });

    if (!hasWallet) {
      console.log("Wallet ownership verification failed:", {
        requestedWallet: walletAddress,
        availableWallets: user.linkedAccounts
          .filter((acc) => acc.type === "wallet" && acc.chainType === "solana")
          .map((acc) => {
            const walletAcc = acc as { address?: string };
            return walletAcc.address;
          })
          .filter(Boolean),
      });
      throw new Error("Wallet not owned by authenticated user");
    }

    return user;
  } catch (error) {
    console.error("Verification error details:", error);
    throw error;
  }
}

// Helper function to get the Redis key for a slug
const getRedisKey = (slug: string) => `page:${slug}`;

// Helper function to get the Redis key for a wallet's pages
const getWalletPagesKey = (walletAddress: string) => `wallet:${walletAddress.toLowerCase()}:pages`;

// Helper function to add page to wallet's pages
async function addPageToWallet(walletAddress: string, slug: string) {
  try {
    const pagesKey = getWalletPagesKey(walletAddress);
    // Add to sorted set with timestamp as score for ordering
    await redis.zadd(pagesKey, { score: Date.now(), member: slug });
  } catch (error) {
    console.error("Error adding page to wallet:", error);
    throw new Error("Failed to add page to wallet");
  }
}

// Helper function to remove page from wallet's pages
async function removePageFromWallet(walletAddress: string, slug: string) {
  try {
    const pagesKey = getWalletPagesKey(walletAddress);
    await redis.zrem(pagesKey, slug);
  } catch (error) {
    console.error("Error removing page from wallet:", error);
    throw new Error("Failed to remove page from wallet");
  }
}

// Helper function to get all pages for a wallet
async function getPagesForWallet(walletAddress: string, req: NextApiRequest) {
  try {
    // Get authenticated user from request
    const idToken = req.cookies["privy-id-token"];
    if (!idToken) {
      throw new Error("Missing identity token");
    }

    // Verify wallet ownership
    await verifyWalletOwnership(req, walletAddress);

    // Get all slugs for this wallet from Redis
    const pagesKey = getWalletPagesKey(walletAddress);
    const slugs = await redis.zrange<string[]>(pagesKey, 0, -1);

    // Get the full page data for each slug
    const pages = await Promise.all(
      slugs.map(async (slug) => {
        const pageData = await redis.get<PageData>(getRedisKey(slug));
        if (pageData) {
          return {
            slug,
            ...pageData,
          };
        }
        return null;
      })
    );

    return { pages: pages.filter(Boolean) };
  } catch (error) {
    console.error("Error getting pages for wallet:", error);
    return { pages: [] };
  }
}

// Helper function to add page to user's metadata
async function addPageToUserMetadata(
  userId: string,
  walletAddress: string,
  slug: string,
) {
  try {
    const currentMetadata = await client.getUser(userId);
    const pagesStr = (currentMetadata.customMetadata || {})?.pages;
    let currentPages = [];

    // Parse existing pages if they exist
    if (pagesStr) {
      try {
        currentPages = JSON.parse(pagesStr as string);
      } catch (e) {
        console.error("Error parsing pages:", e);
        currentPages = [];
      }
    }

    // Add new page if it doesn't exist
    if (!Array.isArray(currentPages)) {
      currentPages = [];
    }

    if (!currentPages.some((p: any) => p.slug === slug)) {
      const updatedPages = [...currentPages, { walletAddress, slug }];
      // Store as stringified JSON
      await client.setCustomMetadata(userId, {
        pages: JSON.stringify(updatedPages),
      });
    }
  } catch (error) {
    console.error("Error updating user metadata:", error);
    throw new Error("Failed to update user metadata");
  }
}

// Helper function to remove page from user's metadata
async function removePageFromUserMetadata(userId: string, slug: string) {
  try {
    const currentMetadata = await client.getUser(userId);
    const pagesStr = (currentMetadata.customMetadata || {})?.pages;
    let currentPages = [];

    // Parse existing pages if they exist
    if (pagesStr) {
      try {
        currentPages = JSON.parse(pagesStr as string);
      } catch (e) {
        console.error("Error parsing pages:", e);
        currentPages = [];
      }
    }

    if (!Array.isArray(currentPages)) {
      currentPages = [];
    }

    const updatedPages = currentPages.filter((p: any) => p.slug !== slug);
    // Store as stringified JSON
    await client.setCustomMetadata(userId, {
      pages: JSON.stringify(updatedPages),
    });
  } catch (error) {
    console.error("Error updating user metadata:", error);
    throw new Error("Failed to update user metadata");
  }
}

// Helper function to sanitize page data for public access
function sanitizePageData(pageData: PageData | null, isOwner: boolean = false): PageData | null {
  if (!pageData) return pageData;

  // If user is the owner, return full data
  if (isOwner) return pageData;

  // Clone the data to avoid mutating the original
  const sanitized = { ...pageData };

  // For non-owners, we don't need to sanitize URLs here anymore
  // This will be handled in [page].tsx
  return sanitized;
}

// Helper function to check rate limit
async function checkRateLimit(userId: string): Promise<{ allowed: boolean; timeLeft?: number }> {
  const rateKey = `rate:page-create:${userId}`;
  const maxPages = 10; // Maximum pages per window
  const windowSeconds = 24 * 60 * 60; // 24 hours in seconds

  try {
    // Get current count and timestamp
    const currentData = await redis.get<{ count: number; timestamp: number }>(rateKey);

    const now = Math.floor(Date.now() / 1000);

    if (!currentData) {
      // First request, set initial count
      await redis.set(rateKey, { count: 1, timestamp: now }, { ex: windowSeconds });
      return { allowed: true };
    }

    // Check if window has expired
    if (now - currentData.timestamp >= windowSeconds) {
      // Reset counter for new window
      await redis.set(rateKey, { count: 1, timestamp: now }, { ex: windowSeconds });
      return { allowed: true };
    }

    // Check if under limit
    if (currentData.count < maxPages) {
      // Increment counter
      await redis.set(
        rateKey,
        { count: currentData.count + 1, timestamp: currentData.timestamp },
        { ex: windowSeconds }
      );
      return { allowed: true };
    }

    // Rate limit exceeded
    const timeLeft = windowSeconds - (now - currentData.timestamp);
    return { allowed: false, timeLeft };
  } catch (error) {
    console.error("Rate limit check error:", error);
    // In case of error, allow the request but log the error
    return { allowed: true };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Add request logging
  console.log('API Request:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
  });

  // GET: Fetch page data for a specific slug or wallet's pages
  if (req.method === "GET") {
    const { slug, walletAddress } = req.query;

    try {
      // If walletAddress is provided, require authentication
      if (walletAddress) {
        const result = await getPagesForWallet(walletAddress as string, req);
        // These are the user's own pages, so don't sanitize them
        return res.status(200).json({ pages: result.pages });
      }

      // If slug is provided, return specific page data
      if (slug) {
        const pageData = await redis.get<PageData>(getRedisKey(slug as string));

        // If there's data, try to verify ownership
        let isOwner = false;
        if (pageData) {
          try {
            // Only attempt to verify ownership if we have an identity token
            const idToken = req.cookies["privy-id-token"];
            if (idToken) {
              await verifyWalletOwnership(req, pageData.walletAddress);
              isOwner = true;
            }
          } catch (error) {
            // Ignore verification errors - just means user doesn't own the page
            console.log("User does not own page:", error);
          }
        }

        // Sanitize the page data before returning
        const sanitizedData = sanitizePageData(pageData, isOwner);
        return res.status(200).json({ mapping: sanitizedData, isOwner });
      }

      // Return error if neither slug nor walletAddress provided
      return res.status(400).json({ error: "Slug or wallet address is required" });
    } catch (error) {
      console.error("Error fetching page data:", error);
      return res.status(500).json({ error: "Failed to fetch page data" });
    }
  }

  // POST: Create or update a page
  if (req.method === "POST") {
    try {
      // Validate request body against schema
      const validationResult = CreatePageSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request data",
          details: validationResult.error.issues,
        });
      }

      const {
        slug,
        walletAddress,
        isSetupWizard,
        title,
        description,
        items,
        connectedToken,
        tokenSymbol,
        image,
        designStyle,
        fonts,
      } = validationResult.data;

      // Check if slug exists first
      const existingPage = await redis.get<PageData>(getRedisKey(slug));
      if (existingPage) {
        // If page exists but belongs to another user, reject
        if (existingPage.walletAddress !== walletAddress) {
          return res.status(400).json({ error: "This URL is already taken" });
        }
      }

      // Verify ownership of the wallet being used to create/update the page
      let user;
      try {
        user = await verifyWalletOwnership(req, walletAddress);
      } catch (error) {
        return res
          .status(401)
          .json({
            error:
              error instanceof Error ? error.message : "Authentication failed",
          });
      }

      // Only apply rate limiting for new page creation, not updates
      if (!existingPage) {
        const rateLimit = await checkRateLimit(user.id);
        if (!rateLimit.allowed) {
          return res.status(429).json({
            error: "Rate limit exceeded",
            timeLeft: rateLimit.timeLeft,
            message: `You can create more pages in ${Math.ceil(rateLimit.timeLeft! / 3600)} hours`,
          });
        }
      }

      // For initial setup wizard step, only store minimal data
      if (isSetupWizard === true) {
        const initialData = PageDataSchema.parse({
          walletAddress,
          createdAt: new Date().toISOString(),
        });
        await redis.set(getRedisKey(slug), initialData);
        // Add page to wallet's pages in Redis
        await addPageToWallet(walletAddress, slug);
        return res.status(200).json({ success: true });
      }

      // Create/Update page data, preserving existing data
      const pageData = PageDataSchema.parse({
        ...existingPage, // Preserve existing data
        walletAddress,
        ...(title && { title }),
        ...(description && { description }),
        ...(items && { items }),
        ...(connectedToken && { connectedToken }),
        ...(tokenSymbol && { tokenSymbol }),
        ...(image && { image }),
        ...(designStyle && { designStyle }),
        ...(fonts && { fonts }),
        updatedAt: new Date().toISOString(),
      });

      // Save to Redis with unique key
      await redis.set(getRedisKey(slug), pageData);
      // Add page to wallet's pages in Redis if it's a new page
      if (!existingPage) {
        await addPageToWallet(walletAddress, slug);
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error storing page data:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid data format",
          details: error.issues,
        });
      }
      return res.status(500).json({ error: "Failed to store page data" });
    }
  }

  // DELETE: Remove a page
  if (req.method === "DELETE") {
    try {
      const { slug } = req.body;

      if (!slug) {
        return res.status(400).json({ error: "Slug is required" });
      }

      // Get current page data to verify ownership
      const currentPage = await redis.get<PageData>(getRedisKey(slug));
      if (!currentPage) {
        return res.status(404).json({ error: "Page not found" });
      }

      // Verify wallet ownership
      try {
        await verifyWalletOwnership(req, currentPage.walletAddress);
      } catch (error) {
        return res
          .status(401)
          .json({
            error:
              error instanceof Error ? error.message : "Authentication failed",
          });
      }

      // Remove the page from Redis
      await redis.del(getRedisKey(slug));
      // Remove page from wallet's pages
      await removePageFromWallet(currentPage.walletAddress, slug);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting page:", error);
      return res.status(500).json({ error: "Failed to delete page" });
    }
  }

  // PATCH: Update existing page
  if (req.method === "PATCH") {
    try {
      const { slug, connectedToken, title, description, image, items, designStyle, fonts } = req.body;

      if (!slug) {
        return res.status(400).json({ error: "Slug is required" });
      }

      // Get current page data to verify ownership
      const currentPage = await redis.get<PageData>(getRedisKey(slug));
      if (!currentPage) {
        return res.status(404).json({ error: "Page not found" });
      }

      // Verify wallet ownership and page access
      try {
        const idToken = req.cookies["privy-id-token"];
        if (!idToken) {
          return res.status(401).json({ error: "Authentication required" });
        }

        const user = await client.getUser({ idToken });
        
        // Check if the wallet is in user's linked accounts
        let userWallet = null;
        for (const account of user.linkedAccounts) {
          if (account.type === "wallet" && account.chainType === "solana") {
            const walletAccount = account as { address?: string };
            if (walletAccount.address?.toLowerCase() === currentPage.walletAddress.toLowerCase()) {
              userWallet = walletAccount;
              break;
            }
          }
        }

        if (!userWallet) {
          return res.status(403).json({ error: "You don't have permission to edit this page" });
        }

        // Check if the page exists in the user's wallet:id set
        const pagesKey = getWalletPagesKey(userWallet.address!);
        const hasPage = await redis.zscore(pagesKey, slug);
        
        if (hasPage === null) {
          return res.status(403).json({ error: "Page not found in your collection" });
        }

      } catch (error) {
        console.error("Auth verification error:", error);
        return res.status(401).json({ error: "Authentication failed" });
      }

      // Validate the update data
      const updateData = {
        ...currentPage,
        ...(connectedToken !== undefined && { connectedToken }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(items !== undefined && { items }),
        ...(designStyle !== undefined && { designStyle }),
        ...(fonts !== undefined && { fonts }),
        updatedAt: new Date().toISOString(),
      };

      // Validate the complete page data
      const validatedData = PageDataSchema.parse(updateData);

      // Save to Redis
      await redis.set(getRedisKey(slug), validatedData);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error updating page:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid data format",
          details: error.issues,
        });
      }
      return res.status(500).json({ error: "Failed to update page" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
