"use client";

import { Camera, LogIn } from "lucide-react";

import { Button } from "../components/ui/button";
import Head from "next/head";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";

export default function LoginPage() {
	const { login, logout, ready, authenticated, user } = usePrivy();
	const TITLE = "Photoland Travelogue (Irys + Privy)";

	useEffect(() => {
		// Mobile detection
		const doLogout = async () => {
			console.log("Logging out");
			await logout();
		};

		// If we land on login page, but users is already logged in, then logout first
		if (ready && authenticated) {
			doLogout();
		}
	}, []);

	return (
		<>
			<Head>
				<title>{TITLE}</title>
			</Head>

			<main className="flex min-h-screen min-w-full">
				<div className="flex flex-1">
					<div className="flex flex-1 justify-center items-center z-10 pb-20">
						<div className="flex flex-col text-center p-20 rounded-2xl items-center justify-center">
							<Camera className="w-10 h-10 text-black p-2 my-6 bg-white rounded-full hover:-rotate-6 transition-all" />
							<h1 className="text-4xl font-bold text-white mb-4">Welcome back</h1>
							<h2 className="-mt-2 mb-10 text-white/80">Click below to sign in to your account</h2>
							<Button onClick={login} variant={"outline"}>
								Sign in with Privy
							</Button>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
