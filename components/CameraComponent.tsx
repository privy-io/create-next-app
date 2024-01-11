// components/CameraComponent.tsx
import React, { useEffect, useRef, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { WebIrys } from "@irys/sdk";
import { useRouter } from "next/router";
import Spinner from "./Spinner"; // Import the Spinner component
import { usePrivy } from "@privy-io/react-auth";
import { uploadImage } from "../utils/irysFunctions";

const CameraComponent: React.FC = () => {
	const router = useRouter();
	const [isUploading, setIsUploading] = useState(false);
	const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
	const [isMobileDevice, setIsMobileDevice] = useState(false);

	const videoRef = useRef<HTMLVideoElement>(null);
	const [streamActive, setStreamActive] = useState(false);
	const [imageBlob, setImageBlob] = useState<Blob | null>(null);
	const { wallets } = useWallets();

	// The 0th position wallet is the most recently connected one
	const w = wallets.at(0);

	useEffect(() => {
		// Mobile detection
		const isTouchDevice =
			"ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
		setIsMobileDevice(isTouchDevice);
	}, []);

	useEffect(() => {
		async function enableStream(deviceId = currentDeviceId) {
			try {
				const constraints = { video: deviceId ? { deviceId: { exact: deviceId } } : true };
				const stream = await navigator.mediaDevices.getUserMedia(constraints);
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					setStreamActive(true);
				}
			} catch (err) {
				console.error(err);
			}
		}

		if (!streamActive) {
			enableStream();
		}

		return () => {
			if (streamActive && videoRef.current && videoRef.current.srcObject) {
				const mediaStream = videoRef.current.srcObject as MediaStream;
				const tracks = mediaStream.getTracks();
				tracks.forEach((track: MediaStreamTrack) => track.stop());
			}
		};
	}, [streamActive, currentDeviceId]);

	const switchCamera = async () => {
		const devices = await navigator.mediaDevices.enumerateDevices();
		const videoDevices = devices.filter((device) => device.kind === "videoinput");

		if (videoDevices.length > 1) {
			const currentDeviceIndex = videoDevices.findIndex((device) => device.deviceId === currentDeviceId);
			const nextDeviceIndex = (currentDeviceIndex + 1) % videoDevices.length;
			setCurrentDeviceId(videoDevices[nextDeviceIndex].deviceId);
		}
	};

	const handleCapture = () => {
		if (videoRef.current) {
			const video = videoRef.current;
			const canvas = document.createElement("canvas");
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			const context = canvas.getContext("2d");
			if (context) {
				context.drawImage(video, 0, 0, canvas.width, canvas.height);
				canvas.toBlob((blob) => {
					if (blob) {
						setImageBlob(blob);
					}
				});
			}
		}
	};

	const handleRetake = async () => {
		setImageBlob(null);
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true });
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				setStreamActive(true);
			}
		} catch (err) {
			console.error(err);
		}
	};

	const onUpload = async (originalBlob: Blob): Promise<void> => {
		setIsUploading(true);

		await uploadImage(originalBlob, w);
		// Back to the feed
		router.push("/feed");
		setIsUploading(false);
	};

	return (
		<div className="p-4 flex flex-col items-center justify-center pt-40">
			{!imageBlob ? (
				<>
					<video
						ref={videoRef}
						className="rounded-xl bg-black"
						autoPlay
						playsInline
						muted
						style={{ padding: "10px" }} // Add padding around the video element
					/>
					<div className="flex space-x-2 mt-4">
						<button
							className="mt-4 bg-neon-radial-gradient text-white py-2 px-4 rounded-full border border-1 hover:border-white focus:outline-none focus:border-white"
							onClick={handleCapture}
						>
							Take a Picture
						</button>
						{isMobileDevice && (
							<button
								className="mt-4 bg-neon-radial-gradient text-white py-2 px-4 rounded-full border border-1 hover:border-white focus:outline-none focus:border-white"
								onClick={switchCamera}
							>
								Switch Camera
							</button>
						)}
					</div>
				</>
			) : (
				<>
					<div className="bg-black rounded rounded-2xl">
						<img src={URL.createObjectURL(imageBlob)} alt="Preview" className="px-2 py-2 rounded-xl" />
					</div>
					<div className="flex space-x-2 mt-4">
						<button
							className="bg-neon-radial-gradient border border-1 text-white py-2 px-4 rounded-full  hover:border-white focus:outline-none focus:border-white"
							onClick={handleRetake}
						>
							Retake
						</button>

						<button
							className="bg-neon-radial-gradient border border-1 text-white py-2 px-4 rounded-full hover:border-white focus:outline-none focus:border-white"
							onClick={() => imageBlob && onUpload(imageBlob)}
							disabled={isUploading}
						>
							{isUploading ? <Spinner /> : "Upload"}
						</button>
					</div>
				</>
			)}
		</div>
	);
};

export default CameraComponent;
