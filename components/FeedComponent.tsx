import React, { useEffect, useState } from "react";
import { Page, Card, Block } from "konsta/react";
import { fetchImages } from "../utils/irysFunctions";

interface Item {
	id: string;
	address: string;
	timestamp: number;
}

const FeedComponent = () => {
	const [items, setItems] = useState<Item[]>([]);

	useEffect(() => {
		const doFetchImages = async () => {
			const curItems = await fetchImages();
			setItems(curItems);
		};
		doFetchImages();
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
