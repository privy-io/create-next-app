import { EventInfo } from "../schemas";

export const getEventData = async (eventId: string): Promise<EventInfo> => {
  const response = await fetch(`/api/event?event_id=${eventId}`);

  if (!response.ok) {
    console.log(response);
  }
  let data = await response.json();
  let eventData = data as EventInfo;
  return eventData;
};
