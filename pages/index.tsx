import Head from 'next/head';
import { useCrossAppAccounts, usePrivy } from "@privy-io/react-auth";
import { useRouter } from 'next/router';


export default function Landing() {
  const { login, logout } = usePrivy();
  const {ready, authenticated, user} = usePrivy();
  const {linkCrossAppAccount} = useCrossAppAccounts();
  const router = useRouter();
  const crossAppAccount = user?.linkedAccounts.find((account) => account.type === 'cross_app');

  if (ready && !authenticated) {
    return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <Head>
        <title>Mobet - Decentralized Ticket Exchange</title>
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 text-center">
        <h1 className="text-6xl font-bold mb-4">
          Welcome to <span className="text-fuchsia-600">Mobet</span>
        </h1>

        <p className="text-xl mb-8">
          A better way to get tickets for your favorite concerts 
        </p>

        <p>Leverage OpenSea for ticket exchange, then use Mobet to handle entry at your event.   </p>
        <p>When someone arrives at the event, Mobet will check that they own the ticket asset.   </p>
        <p>Get all the benefits of decentralized exchange for your tickets, then let us handle the logistics on entry.   </p>
      
        <button className="mt-8 px-6 py-3 bg-fuchsia-600	 text-white rounded-md hover:bg-fuchsia-700	 transition-colors"
        onClick={login}>
          Get Started
        </button>
      </main>
    </div>
    )
  }
  
  if (ready && authenticated) {
    if(!crossAppAccount){
      return (
        <>
          <div className='mt-10 ml-10 justify-start items-start'>
              <button disabled={!ready || (ready && !authenticated)} onClick={logout}
              className="h-30 w-60 px-6 py-3 bg-fuchsia-600	 text-white text-xl rounded-lg hover:bg-fuchsia-700	 transition-colors">
                Log out
              </button>
            </div>
          <div className="flex flex-col min-h-screen justify-center items-center">
            <h1 className="text-xl mb-4">
              First, link your OpenSea account. Make sure this is the account that owns the ticket asset!
            </h1>
          <button className="h-48 w-96 mr-16 mt-8 px-6 py-3 bg-fuchsia-600	 text-white text-3xl rounded-lg hover:bg-fuchsia-700	 transition-colors"
            onClick={() => linkCrossAppAccount({appId: 'clmttiprn095fms0f1gjj9vd9'})}
            disabled={!ready || !authenticated}
            >
              Link your OpenSea account
            </button>
            </div>
          </>
        )
    } else {
      return (
        <>
        <div className='mt-10 ml-10 justify-start items-start'>
            <button disabled={!ready || (ready && !authenticated)} onClick={logout}
            className="h-30 w-60 px-6 py-3 bg-fuchsia-600	 text-white text-xl rounded-lg hover:bg-fuchsia-700	 transition-colors">
              Log out
            </button>
          </div>
        <div className='flex flex-col min-h-screen justify-center items-center'>
          <div>
            <h1 className="text-xl mb-12">
              Now that you have linked your OpenSea account at {crossAppAccount.embeddedWallets[0]?.address}, what would you like to do? 
            </h1>
          </div>
          <div>
            <button className="h-48 w-96 mr-16 px-6 py-3 bg-fuchsia-600	 text-white text-xl rounded-lg hover:bg-fuchsia-700	 transition-colors"
              onClick={() => router.push('/create')}>
                Create an Event
            </button>
            <button className="h-48 w-96 mr-16 px-6 py-3 bg-fuchsia-600	 text-white text-xl rounded-lg hover:bg-fuchsia-700	 transition-colors"
              onClick={() => router.push('/arrive')}>
                Arrive at an Event
            </button>
          </div>
        </div>
        </>
      )
    }
  }
}