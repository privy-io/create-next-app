// components/CameraComponent.tsx
import React, { useEffect, useRef, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { WebIrys } from "@irys/sdk";
import { useRouter } from "next/router";
import Spinner from "./Spinner"; // Import the Spinner component
import { usePrivy } from "@privy-io/react-auth";

const CameraComponent: React.FC = () => {
	const { user, signMessage, sendTransaction } = usePrivy();

	const router = useRouter();
	const [isUploading, setIsUploading] = useState(false);

	const videoRef = useRef<HTMLVideoElement>(null);
	const [streamActive, setStreamActive] = useState(false);
	const [imageBlob, setImageBlob] = useState<Blob | null>(null);
	const { wallets } = useWallets();
	// const w = wallets.at(0);
	const w = wallets.find((wallet) => wallet.walletClientType === "privy");

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
		// const url = "https://devnet.irys.xyz";
		const rpcURL = "https://polygon-mumbai.g.alchemy.com/v2/demo";
		const token = "matic";

		const provider = await w?.getEthersProvider();
		if (!provider) throw new Error(`Cannot find privy wallet`);

		const webIrys = new WebIrys({ url, token, wallet: { rpcUrl: rpcURL, name: "privy", provider } });
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
			// Initialize WebIrys
			console.log("w=", w);
			const webIrys = await getWebIrys();
			console.log("webIrys=", webIrys);
			const resizedBlob = await resizeImage(originalBlob);

			// Fund
			// const loadedBalance = webIrys.utils.fromAtomic(await webIrys.getLoadedBalance());
			// console.log("Loaded balance=", loadedBalance.toString());
			// try {
			// 	console.log("Funding node");

			// 	const fundTx = await webIrys.fund(webIrys.utils.toAtomic(0.01));
			// 	console.log("Funding successful ", fundTx);
			// } catch (e) {
			// 	console.log("Error funding e=", e);
			// }

			// Convert Blob to File
			const imageFile = new File([resizedBlob], "photo.jpg", { type: "image/jpeg" });
			console.log("Image file size: ", imageFile.size);

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

	const onSignMessage = async () => {
		console.log(wallets);
		const message = "Hello world";
		// Replace this with the text you'd like on your signature modal,
		// if you do not have `noPromptsOnSignature` enabled
		const uiConfig = {
			title: "Sample title text",
			description: "Sample description text",
			buttonText: "Sample button text",
		};
		console.log("user=", user);
		console.log("signMessage=", signMessage);

		const signature = await signMessage(message, uiConfig);
		console.log("signature=", signature);
	};

	const onSendTransaction = async () => {
		const unsignedTx = {
			to: "0x853758425e953739F5438fd6fd0Efe04A477b039",
			chainId: 80001,
			value: "0x3B9ACA00",
		};

		// Replace this with the text you'd like on your transaction modal
		const uiConfig = {
			header: "Test of funding direction",
			description: "Can we fund this way?",
			buttonText: "Fund",
		};

		const txReceipt = await sendTransaction(unsignedTx, uiConfig);
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
					<button
						className="mt-4 bg-neon-radial-gradient text-white py-2 px-4 rounded-full border border-1 hover:border-white focus:outline-none focus:border-white"
						onClick={handleCapture}
					>
						Take a Picture
					</button>
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
