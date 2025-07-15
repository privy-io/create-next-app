"use client";

import { useLogin } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

export default function LoginButton() {
  const router = useRouter();
  const { login } = useLogin({
    onComplete: () => router.push("/dashboard"),
  });

  return (
    <button
      className="bg-violet-600 hover:bg-violet-700 py-3 px-6 text-white rounded-lg"
      onClick={login}
    >
      Log in
    </button>
  );
}
