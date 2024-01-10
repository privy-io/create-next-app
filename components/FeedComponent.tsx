import React, { useEffect, useState } from "react";
import { Page, Card, Block } from "konsta/react";
import Query from "@irys/query";

interface Item {
	id: string;
	address: string;
	timestamp: number;
}

const FeedComponent = () => {
	const [items, setItems] = useState<Item[]>([]);

	useEffect(() => {
		const fetchImages = async () => {
			const myQuery = new Query({ url: "https://node2.irys.xyz/graphql" });
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
				//@ts-ignore
				setItems(results);
			} catch (error) {
				console.error("Failed to fetch images:", error);
			}
		};

		fetchImages();
	}, []);

	const formatDate = (unixTimestamp: number) => {
		const date = new Date(unixTimestamp);
		const day = date.getDate();
		const month = date.toLocaleString("default", { month: "short" });
		const year = date.getFullYear();
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");
		const seconds = date.getSeconds().toString().padStart(2, "0");
		return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
	};

	return (
		<Page>
			<div className="mt-20">
				{items.map((item) => (
					<Card key={item.id} className="bg-black rounded-xl shadow-4lg my-1 mx-1">
						<img
							src={`https://gateway.irys.xyz/${item.id}`}
							alt="Image feed"
							className="rounded-lg w-full"
						/>
						<Block className="text-start pl-5 mt-1 bg-white rounded-xl shadow-2xl">
							<p className="text-sm text-black">By{item.address}</p>
							<p className="text-sm text-black">At: {formatDate(item.timestamp)}</p>
						</Block>
					</Card>
				))}
			</div>
		</Page>
	);
};

export default FeedComponent;
