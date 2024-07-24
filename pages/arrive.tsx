import { usePrivy } from '@privy-io/react-auth';
import {getEventData} from "/Users/madeleinecharity/Downloads/create-next-app/lib/eventData"
import { useState } from 'react';

// This should live in a DB and not locally but involved setting up postgres 
let arrived = new Set() 

export default function Arrive() {
    const {user} = usePrivy();
    const[eventData, setEventData] = useState({})
    const [allowed, setAllowed] = useState(false)
    const crossAppAccount = user?.linkedAccounts.find((account) => account.type === 'cross_app');
    let guestAddr = crossAppAccount?.embeddedWallets[0]?.address.toLowerCase()
    const [errorMsg, setErrorMsg] = useState('')

    // gets the nft ticket 
    async function getNFTOwner(chain: string, contractAddr:string, identifier:string){
        
        const options = {
            method: 'GET',
            headers: {accept: 'application/json', 'x-api-key': '8ac95157e12f44b5aca38738e12a3750'}
        };
        let response = await fetch(`https://api.opensea.io/api/v2/chain/${chain}/contract/${contractAddr}/nfts/${identifier}`, options)
        .then(response => response.json())
        .catch(err => console.error(err))
        if(!response?.nft){
            throw new Error("Could not find that nft") 
        } 
        return response.nft.owners[0].address 
    }
    // verifies the user owns the nft and it hasn't been used before
    async function verifyArrival(eventId: string, identifier: string){
        // get the data for the inputed event id
        let data = await getEventData(eventId)
        setEventData(data)
        // this ticket has already been used 
        if(arrived.has(identifier)){
            throw new Error("Someone has already entered with this ticket!") 
        }

        if(!eventData){
            throw new Error("Invalid Event ID") 
        }
        // wrong owner
        let nftOwner = await getNFTOwner(data.chain, data.contractAddr, identifier)

        if( nftOwner.toLowerCase() !== guestAddr){
            console.log(guestAddr)
            console.log(nftOwner)
            throw new Error("You do not own that nft")
        }

        // mark as here 
        arrived.add(identifier)

        // return true, guest may enter
        return true
    }

    async function handleSubmit(e: any){
        // Prevent the browser from reloading the page
        e.preventDefault();

        // Read the form data
        const form = e.target;
        const formData = new FormData(form);
        const formJson = Object.fromEntries(formData.entries());
        let eventId = String(formJson.eventId)
        let identifier = String(formJson.identifier)

        try{
            let tmpAllowed = await verifyArrival(eventId, identifier)
            setAllowed(tmpAllowed)
        } catch (error){
            console.log(error)
            let err = error as Error
            setErrorMsg(err.message)
        }
    }
    if(!allowed){
        return (
            <div className="grid grid-cols-1 grid-rows-3">  
                <div className="flex flex-col justify-center items-center grid-row: 1">  
                    <h1 className="text-6xl mb-4">
                        Arrive at an event
                    </h1>
                    <br></br>
                    <p className="text-xl">       
                        Enter info about the event and the identifier for the NFT you would like to redeem as your ticket
                    </p>
                </div>
                <div className="flex justify-center items-center grid-row: 2"> 
                    <form onSubmit={(e) => handleSubmit(e)}>
                        <label htmlFor="eventIdInput" className='text-2xl mr-8 mt-8 '>
                        Event name</label>
                        <input
                            type="text"
                            name="eventId"
                            id="eventId"
                            autoComplete="off"
                            className="mt-2 block w-1/2 rounded-sm border-gray-300 text-xs"
                        />
                        <label htmlFor="eventIdInput" className='text-2xl mr-8 mt-8 '>
                        Token ID</label>
                        <input
                            type="text"
                            name="identifier"
                            id="identifierInput"
                            autoComplete="off"
                            className="mt-2 block w-1/2 rounded-sm border-gray-300 text-xs"
                        />
                        <button className="h-30 w-60 mr-16 mt-8 px-6 py-3 bg-fuchsia-600	 text-white text-3xl rounded-lg hover:bg-fuchsia-700	 transition-colors" type="submit">
                            Arrive
                        </button>
                        <p className='text-1xl mr-8 mt-8 '>
                            {errorMsg}
                        </p>
                    </form>
                </div>
            </div>
        )
    }
    if(allowed){
        return(
            <div className="flex flex-col min-h-screen justify-center items-center">
                <h1 className="text-6xl mb-4">
                    YOU ARE IN 
                </h1>
                <p className="text-xl">
                [enter some sort of one time permission QR code here]
                </p>
            </div>
        )
    }

}