import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
import { z } from "zod";

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Validation schema for visit tracking
const VisitTrackingSchema = z.object({
  slug: z.string().min(1),
  visitorId: z.string().min(1),
});

// Helper to get visit analytics keys
const getVisitKeys = (slug: string) => ({
  total: `analytics:${slug}:visits`,
  unique: `analytics:${slug}:unique_visitors`,
  history: `analytics:${slug}:visit_history`,
});

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
    const validationResult = VisitTrackingSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: validationResult.error.issues,
      });
    }

    const { slug, visitorId } = validationResult.data;
    const keys = getVisitKeys(slug);

    // Get current timestamp
    const timestamp = Date.now();

    // Increment total visits counter
    await redis.incr(keys.total);

    // Add visitor to unique visitors set
    const wasAdded = await redis.sadd(keys.unique, visitorId);

    // Add visit to history with timestamp
    await redis.zadd(keys.history, {
      score: timestamp,
      member: JSON.stringify({
        visitorId,
        timestamp,
        isUnique: wasAdded === 1,
      }),
    });

    // Get current counts
    const [totalVisits, uniqueVisitors] = await Promise.all([
      redis.get<number>(keys.total),
      redis.scard(keys.unique),
    ]);

    return res.status(200).json({
      success: true,
      totalVisits,
      uniqueVisitors,
    });
  } catch (error) {
    console.error("Error tracking visit:", error);
    return res.status(500).json({ error: "Failed to track visit" });
  }
} 