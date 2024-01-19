import { GanttChart, LogOut } from "lucide-react";

import { Button } from "./ui/button";
import CameraDrawer from "./camera-drawer";
import CategoryDrawer from "./category-drawer";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";

const TopNav = () => {
	const router = useRouter();
	const { logout } = usePrivy();

	const doLogout = async () => {
		await logout();
		router.push("/");
	};

	return (
		<div className="fixed bottom-0 left-0 bg-black/60 backdrop-blur-lg w-full shadow-inner z-50 py-4 rounded-tr-2xl rounded-tl-2xl px-6">
			<div className="flex justify-between items-center max-w-sm mx-auto relative gap-4">
				<CameraDrawer />
				<CategoryDrawer />
				<Button
					className="bg-neon-radial-gradient border border-1 border-white shadow-2xl rounded-full text-white px-4 py-1" // Reduced padding here
					onClick={doLogout}
				>
					<LogOut />
				</Button>
			</div>
		</div>
	);
};

export default TopNav;
