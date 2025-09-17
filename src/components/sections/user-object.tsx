"use client";

import { usePrivy } from "@privy-io/react-auth";

const UserObject = () => {
  const { user } = usePrivy();
  return (
    <div className="w-full md:w-[400px] bg-white flex flex-col gap-2 border-l border-[#E2E3F0] p-4 h-[calc(100vh-60px)]">
      <h3 className="text-md font-semibold">User object</h3>
      <pre className="bg-[#F1F2F9] p-2 overflow-y-auto rounded-lg flex-1 text-xs font-light whitespace-pre-wrap">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
};

export default UserObject;
