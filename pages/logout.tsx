import Portal from '../components/graphics/portal';
import {usePrivy} from '@privy-io/react-auth';
import Head from 'next/head';
import {useEffect} from 'react';
import {useRouter} from 'next/router';

export default function LoginPage() {
  const {logout} = usePrivy();
  const router = useRouter();

  useEffect(() => {
    logout().then(() => {
      router.push('/');
    });
  }, [logout, router]);

  return (
    <>
      <Head>
        <title>Logout · Privy</title>
      </Head>

      <main className="flex min-h-screen min-w-full">
        <div className="flex bg-privy-light-blue flex-1 p-6 justify-center items-center">
          <div>
            <div className="flex justify-center flex-col text-center">
              <Portal style={{maxWidth: '100%', height: 'auto'}} />
              <p>Logging out...</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
