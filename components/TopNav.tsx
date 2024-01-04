// components/BottomNav.tsx
import React from "react";
import { Navbar, Button } from "konsta/react";
import { useRouter } from "next/router";
import { usePrivy } from "@privy-io/react-auth";

const TopNav = () => {
	const router = useRouter();
	const { logout } = usePrivy();

	const doLogout = async () => {
		await logout();
		router.push("/");
	};

	return (
		<Navbar className="fixed  bg-neonBlue shadow-lg z-10 max-h-[60px]">
			<div className="flex justify-between items-center w-full px-4">
				<Button
					clear
					className="bg-neon-radial-gradient rounded-full text-white px-4 py-1 mx-2" // Reduced padding here
					onClick={() => router.push("/camera")}
				>
					Camera
				</Button>
				<Button
					clear
					className="bg-neon-radial-gradient rounded-full text-white px-4 py-1 mx-2" // Reduced padding here
					onClick={() => router.push("/feed")}
				>
					Feed
				</Button>
				<Button
					clear
					className="bg-neon-radial-gradient rounded-full text-white px-4 py-1 mx-2" // Reduced padding here
					onClick={doLogout}
				>
					Logout
				</Button>
			</div>
		</Navbar>
	);
};

export default TopNav;
