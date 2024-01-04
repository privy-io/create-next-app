// pages/camera.tsx
import React, { useState } from "react";
import { Page, Button } from "konsta/react";
import CameraComponent from "../components/CameraComponent";
import TopNav from "../components/TopNav";

const CameraPage = () => {
	const [imageBlob, setImageBlob] = useState(null);

	return (
		<Page>
			<TopNav />
			<CameraComponent />
		</Page>
	);
};

export default CameraPage;
