import { usePrivy  } from "@privy-io/react-auth";
import { useRouter } from 'next/router';
import axios from "axios";
import { EventInfo, eventView } from "../schemas";

export default function Create() {
  const {ready, authenticated} = usePrivy();
  const router = useRouter();

  async function postEvent(eventData: EventInfo) {
    let eventSendable = {
      event_id: eventData.eventId,
      chain: eventData.chain,
      contract_addr: eventData.contractAddr,
    }
    console.log(eventSendable)
    try {
      const response = await axios.post<EventInfo>('/api/event', eventSendable);
      return response.data;
    } catch (error) {
      console.error("There was a problem creating the event:", error);
      throw error;
    }
  }


  async function handleSubmit(e: { preventDefault: () => void; target: any; }) {
    // Prevent the browser from reloading the page
    e.preventDefault();

    // Read the form data
    const form = e.target;
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData.entries());
    console.log(formJson);
    
    const newEvent = eventView(String(formJson.eventId), String(formJson.contractAddr), String(formJson.chain))

    postEvent(newEvent).then(createdEvent => {
      console.log('Created event:', createdEvent);
    }).catch(error => {
      console.error(error);
    });
    router.push("/event_page")
  }


  if (ready && authenticated) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center">
        <h1 className="mb-4 text-6xl">
          Create an event
        </h1>
        <p className="text-xl">       
          Enter info about the NFT collection you would like to use as tickets for your event
        </p>
        <br></br>
        <form method="post" onSubmit={handleSubmit}>
          <label htmlFor="eventIdInput" className='text-2xl mr-8 mt-8 '>
            Event Name</label>
          <input id="eventIdInput" name="eventId" type="text" required={true}/>
          <div> </div>

          <label htmlFor="contractAddrInput" className='text-2xl mr-8 mt-8 '>
            Contract address for the NFTs
            </label>
          <input id="contractAddrInput" name="contractAddr" type="text" required={true}/>
          <div></div>

          <label htmlFor="chainInput" className='text-2xl mr-8 mt-8 '>
            Chain for the NFTs</label>
          <input id="chainInput" name="chain" type="text" required={true}/>
          <div></div>

          <button className="h-20 w-40 mr-8 mt-8 px-6 py-3 bg-fuchsia-600	 text-white text-xl rounded-lg hover:bg-fuchsia-700	 transition-colors"
          type="submit">
            Create Event
          </button>
        </form>
      </div>
    )
  }
}