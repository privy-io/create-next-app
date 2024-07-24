import { z } from "zod";
export const EventInfo = z.object({
  eventId: z.string(),
  chain: z.string(),
  contractAddr: z.string(),
  // hasArrived: z.set(z.string()),
});

export type EventInfo = z.infer<typeof EventInfo>;
export function eventView(
  eventId: string,
  contractAddr: string,
  chain: string
): EventInfo {
  return {
    eventId: eventId,
    contractAddr: contractAddr,
    chain: chain,
  };
}
