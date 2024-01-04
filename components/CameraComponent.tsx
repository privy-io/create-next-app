// components/CameraComponent.tsx
import React, { useEffect, useRef, useState } from "react";
import { Button } from "konsta/react";
import { useWallets } from "@privy-io/react-auth";
import { WebIrys } from "@irys/sdk";
import { useRouter } from "next/router";
import Spinner from "./Spinner"; // Import the Spinner component

const CameraComponent: React.FC = () => {
	const router = useRouter();
	const [isUploading, setIsUploading] = useState(false);

	const videoRef = useRef<HTMLVideoElement>(null);
	const [streamActive, setStreamActive] = useState(false);
	const [imageBlob, setImageBlob] = useState<Blob | null>(null);
	const { wallets } = useWallets();
	const w = wallets.at(0);

	useEffect(() => {
		async function enableStream() {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
	}, [streamActive]);

	const getWebIrys = async () => {
		const url = "https://node2.irys.xyz";
		const token = "matic";

		const provider = await w?.getEthersProvider();
		console.log("wallets=", wallets);
		console.log("w=", w);
		console.log("provider=", provider);
		if (!provider) throw new Error(`Cannot find privy wallet`);

		const webIrys = new WebIrys({ url, token, wallet: { name: "privy", provider } });
		await webIrys.ready();
		return webIrys;
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

	const resizeImage = async (originalBlob: Blob): Promise<Blob> => {
		// Create an image to read the dimensions of the original blob
		const image = new Image();
		const originalUrl = URL.createObjectURL(originalBlob);
		image.src = originalUrl;

		// Load the image and create a canvas that draws it at a new size
		await new Promise((resolve) => {
			image.onload = () => {
				URL.revokeObjectURL(originalUrl);
				resolve(null);
			};
		});

		let quality = 1; // Start with the highest quality
		let resizedBlob: Blob | null = null;

		do {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			if (!ctx) throw new Error("Unable to get canvas context");

			// Calculate new size while maintaining aspect ratio
			const scaleFactor = Math.sqrt((100 * 1024) / originalBlob.size); // Scale factor for < 100 KiB target
			canvas.width = image.width * scaleFactor;
			canvas.height = image.height * scaleFactor;

			// Draw the original image at the new size
			ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

			// Convert the canvas to a blob
			resizedBlob = await new Promise((resolve) => {
				canvas.toBlob(resolve, "image/jpeg", quality);
			});

			// If the resized blob is still larger than 100 KiB, reduce the quality
			if (resizedBlob && resizedBlob.size > 100 * 1024) {
				quality -= 0.1; // Reduce quality by 10%
			}
		} while (resizedBlob && resizedBlob.size > 100 * 1024 && quality > 0);

		if (!resizedBlob) throw new Error("Unable to resize image");
		return resizedBlob;
	};

	const onUpload = async (originalBlob: Blob): Promise<void> => {
		setIsUploading(true);
		try {
			const resizedBlob = await resizeImage(originalBlob);

			// Rest of the upload logic as before...
			// Convert Blob to File
			const imageFile = new File([resizedBlob], "photo.jpg", { type: "image/jpeg" });

			// Initialize WebIrys and upload
			const webIrys = await getWebIrys();
			const tags = [
				{ name: "Content-Type", value: "image/jpeg" },
				{ name: "application-id", value: "my-image-feed" },
			];
			const receipt = await webIrys.uploadFile(imageFile, { tags });
			console.log(`Data uploaded ==> https://gateway.irys.xyz/${receipt.id}`);

			// Back to the feed
			router.push("/feed");
		} catch (e) {
			console.error("Error uploading data", e);
		}
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
					<Button
						className="mt-4 bg-neon-radial-gradient text-white py-2 rounded-full"
						onClick={handleCapture}
					>
						Take a Picture
					</Button>
				</>
			) : (
				<>
					<img src={URL.createObjectURL(imageBlob)} alt="Preview" className="rounded-xl mt-4" />
					<div className="flex space-x-2 mt-4">
						<Button className="bg-neon-radial-gradient text-white py-2 rounded-full" onClick={handleRetake}>
							Retake
						</Button>
						<Button
							className="bg-neon-radial-gradient text-white py-2 rounded-full"
							onClick={() => imageBlob && onUpload(imageBlob)}
							disabled={isUploading}
						>
							{isUploading ? <Spinner /> : "Upload"}
						</Button>
					</div>
				</>
			)}
		</div>
	);
};

export default CameraComponent;
