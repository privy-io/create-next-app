import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getInput = z.object({
  event_id: z.string(),
});

const postInput = z.object({
  event_id: z.string(),
  chain: z.string(),
  contract_addr: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { event_id: eventId } = getInput.parse(req.query);
      const response = await prisma.event.findUnique({
        where: {
          eventId: eventId,
        },
      });

      if (!response) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "POST") {
    try {
      const {
        event_id: eventId,
        chain: chain,
        contract_addr: contractAddr,
      } = postInput.parse(req.body);

      const newEvent = await prisma.event.create({
        data: {
          eventId: eventId,
          chain: chain,
          contractAddr: contractAddr,
        },
      });

      res.status(201).json(newEvent);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
