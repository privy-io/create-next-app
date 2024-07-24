import { useState } from "react";
import {getEventData} from "/Users/madeleinecharity/Downloads/create-next-app/lib/eventData"
import { EventInfo } from "../schemas"

export default function EventPage() {
    const [eventData, setEventData] = useState<EventInfo>({})

    async function handleSubmit(e: any) {
        // Prevent the browser from reloading the page
        e.preventDefault();
    
        // Read the form data
        const form = e.target;
        const formData = new FormData(form);
        const formJson = Object.fromEntries(formData.entries());
        console.log(formJson);
        let eventId = String(formJson.eventId)

        // update event data
        let data: EventInfo = await getEventData(eventId)

        setEventData(data)
    }
    
    
    return(
        <div className="grid grid-cols-1 grid-rows-3">  
            <div className="flex justify-center items-center grid-row: 1">  
                <h1 className= "text-6xl">
                        See your event
                </h1>
            </div>
            <div className="flex justify-center items-center grid-row: 2">
                <div className="mr-10">
                    <label htmlFor={"eventIdInput"} className='text-2xl'>
                        Enter your event name
                    </label>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="eventId"
                            id="eventIdInput"
                            autoComplete="off"
                            className="mt-2 block w-1/2 rounded-sm border-gray-300 text-xs"
                            onSubmit={(e) => handleSubmit(e)}
                        />
                        <button className="h-20 w-40 mr-8 mt-8 px-6 py-3 bg-fuchsia-600	 text-white text-xl rounded-lg hover:bg-fuchsia-700	 transition-colors" type="submit">
                            Get Event
                        </button>
                    </form>
                </div>
                <div className="mr-10">
                    <p className="mb-4 text-xl">
                        Event Name: {eventData.eventId}
                    </p>
                    <p className="mb-4 text-xl">
                        Chain: {eventData.chain}
                    </p>
                    <p className="mb-4 text-xl">
                        Contract Address: {eventData.contractAddr}
                    </p>
                </div>
            </div>
        </div>
    )
    }