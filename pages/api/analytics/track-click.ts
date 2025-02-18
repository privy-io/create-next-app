import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
import { z } from "zod";

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Validation schema for click tracking
const ClickTrackingSchema = z.object({
  slug: z.string().min(1),
  itemId: z.string().min(1),
  isGated: z.boolean(),
});

// Helper to get analytics key for a page
const getAnalyticsKey = (slug: string) => `analytics:${slug}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate request body
    const validationResult = ClickTrackingSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: validationResult.error.issues,
      });
    }

    const { slug, itemId, isGated } = validationResult.data;
    const analyticsKey = getAnalyticsKey(slug);

    // Get current timestamp
    const timestamp = Date.now();

    // Structure for storing click data
    const clickData = {
      itemId,
      isGated,
      timestamp,
    };

    // Add click to the analytics list
    // We use a sorted set with timestamp as score for time-based queries
    await redis.zadd(analyticsKey, {
      score: timestamp,
      member: JSON.stringify(clickData),
    });

    // Also increment a counter for this specific item
    const itemCounterKey = `${analyticsKey}:item:${itemId}`;
    await redis.incr(itemCounterKey);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error tracking click:", error);
    return res.status(500).json({ error: "Failed to track click" });
  }
} 