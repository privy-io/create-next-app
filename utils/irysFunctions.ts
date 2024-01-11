import { WebIrys } from "@irys/sdk";
import Query from "@irys/query";
import pica from "pica";

const nodeUrl = "https://node2.irys.xyz";
// const nodeUrl = "https://devnet.irys.xyz";

export const getWebIrys = async (w) => {
	const rpcURL = "https://polygon-mumbai.g.alchemy.com/v2/demo";
	const token = "matic";

	const provider = await w?.getEthersProvider();
	if (!provider) throw new Error(`Cannot find privy wallet`);

	const webIrys = new WebIrys({ url: nodeUrl, token, wallet: { rpcUrl: rpcURL, name: "privy", provider } });
	webIrys.tokenConfig.sendTx = async (data) =>
		//@ts-ignore
		sendTransaction({
			...data,
			gasLimit: data.gasLimit.toHexString(),
			maxFeePerGas: data.maxFeePerGas.toHexString(),
			maxPriorityFeePerGas: data.maxPriorityFeePerGas.toHexString(),
		}).then((r) => r.transactionHash);

	await webIrys.ready();

	return webIrys;
};

const resizeImage = async (originalBlob: Blob, targetSizeKb = 100): Promise<Blob> => {
	const MAX_SIZE = targetSizeKb * 1024; // Convert KiB to bytes

	// Create an image to read the dimensions of the original blob
	const image = new Image();
	const originalUrl = URL.createObjectURL(originalBlob);
	image.src = originalUrl;
	await new Promise((resolve) => {
		image.onload = () => {
			URL.revokeObjectURL(originalUrl);
			resolve(null);
		};
	});

	// Calculate new size while maintaining aspect ratio
	const scaleFactor = Math.sqrt(MAX_SIZE / originalBlob.size);
	const newWidth = image.width * scaleFactor;
	const newHeight = image.height * scaleFactor;

	// Create a canvas and use pica to resize the image
	const canvas = document.createElement("canvas");
	canvas.width = newWidth;
	canvas.height = newHeight;

	await pica().resize(image, canvas);

	// Convert the resized image on the canvas to a blob
	let resizedBlob = await pica().toBlob(canvas, "image/jpeg", 0.9); // Start with high quality

	// Adjust quality if necessary
	let quality = 0.9;
	while (resizedBlob.size > MAX_SIZE && quality > 0.1) {
		quality -= 0.05; // Decrease quality incrementally
		resizedBlob = await pica().toBlob(canvas, "image/jpeg", quality);
	}

	return resizedBlob;
};

export const uploadImage = async (originalBlob: Blob, w) => {
	try {
		// Initialize WebIrys
		console.log("w=", w);
		const webIrys = await getWebIrys(w);
		console.log("webIrys=", webIrys);
		const resizedBlob = await resizeImage(originalBlob);

		// Convert Blob to File
		const imageFile = new File([resizedBlob], "photo.jpg", { type: "image/jpeg" });
		console.log("Image file size: ", imageFile.size);

		// Fund
		const loadedBalance = webIrys.utils.fromAtomic(await webIrys.getLoadedBalance());
		const costToUpload = await webIrys.getPrice(imageFile.size);
		console.log("Loaded balance=", loadedBalance.toString());
		if (costToUpload.isGreaterThanOrEqualTo(loadedBalance)) {
			try {
				console.log("Funding node costToUpload=", costToUpload);
				const fundTx = await webIrys.fund(costToUpload);
				console.log("Funding successful ", fundTx);
			} catch (e) {
				console.log("Error funding e=", e);
			}
		} else {
			console.log("Balance sufficient !(Funding node)");
		}
		const tags = [
			{ name: "Content-Type", value: "image/jpeg" },
			{ name: "application-id", value: "my-image-feed" },
		];
		const receipt = await webIrys.uploadFile(imageFile, { tags });
		console.log(`Data uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
	} catch (e) {
		console.error("Error uploading data", e);
	}
};

interface Item {
	id: string;
	address: string;
	timestamp: number;
}

export const fetchImages = async (): Promise<Item[] | undefined> => {
	const myQuery = new Query({ url: `${nodeUrl}/graphql` });
	try {
		const results = await myQuery
			.search("irys:transactions")
			.fields({
				id: true,
				address: true,
				timestamp: true,
			})
			.tags([
				{ name: "application-id", values: ["my-image-feed"] },
				{ name: "Content-Type", values: ["image/jpeg"] },
			])
			.sort("DESC");
		return results as Item[]; // Cast results to an array of Item objects
	} catch (error) {
		console.error("Failed to fetch images:", error);
	}
};
