"use client";

import { usePrivy } from "@privy-io/react-auth";
import { ToastContainer } from "react-toastify";

import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { Header } from "@/components/ui/header";
import CreateAWallet from "@/components/sections/create-a-wallet";
import UserObject from "@/components/sections/user-object";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import FundWallet from "@/components/sections/fund-wallet";
import LinkAccounts from "@/components/sections/link-accounts";
import UnlinkAccounts from "@/components/sections/unlink-accounts";
import WalletActions from "@/components/sections/wallet-actions";
import SessionSigners from "@/components/sections/session-signers";
import WalletManagement from "@/components/sections/wallet-management";
import MFA from "@/components/sections/mfa";

function Home() {
  const { ready, authenticated, logout, login } = usePrivy();
  if (!ready) {
    return <FullScreenLoader />;
  }

  return (
    <div className="bg-[#E0E7FF66] max-h-[100vh] overflow-hidden">
      <Header />
      {authenticated ? (
        <section className="w-full flex flex-row h-[calc(100vh-60px)]">
          <div className="flex-grow overflow-y-auto h-full p-4 pl-8">
            <button className="button" onClick={logout}>
              <ArrowLeftIcon className="h-4 w-4" strokeWidth={2} /> Logout
            </button>

            <div className="">
              <CreateAWallet />
              <FundWallet />
              <LinkAccounts />
              <UnlinkAccounts />
              <WalletActions />
              <SessionSigners />
              <WalletManagement />
              <MFA />
            </div>
          </div>
          <UserObject />
        </section>
      ) : (
        <section className="w-full flex flex-reow justify-center items-center h-[calc(100vh-60px)]">
          <button className="button " onClick={login}>
            Login
          </button>
        </section>
      )}

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        limit={1}
        aria-label="Toast notifications"
      />
    </div>
  );
}

export default Home;
