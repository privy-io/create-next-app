import Head from "next/head";
import { usePrivy } from "@privy-io/react-auth";

export default function LoginPage() {
	const { login } = usePrivy();

	return (
		<>
			<Head>
				<title>Photoland Travelogue (Irys + Privy)</title>
			</Head>

			<main className="flex min-h-screen min-w-full">
				<div className="flex flex-1">
					<div
						className="fixed inset-0 bg-cover bg-center"
						style={{ backgroundImage: `url(./images/splashScreen.png)` }}
					/>
					<div className="flex flex-1 justify-center items-end z-10 pb-20">
						<div
							className="text-center px-3 py-3 rounded-2xl"
							style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
						>
							<h1 className="text-4xl font-bold text-black mb-4">Photoland Travelogue</h1>
							<button
								className="bg-black hover:bg-violet-700 py-3 px-6 text-white rounded-lg"
								onClick={login}
							>
								Log in
							</button>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
