// pages/camera.tsx
import React from "react";
import { Page } from "konsta/react";
import CameraComponent from "../components/CameraComponent";
import TopNav from "../components/TopNav";

const CameraPage = () => {
	return (
		<Page>
			<TopNav />
			<CameraComponent />
		</Page>
	);
};

export default CameraPage;
