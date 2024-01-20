import { CategoryProvider } from "@/components/category-context";
import FeedComponent from "../components/feed";
import Nav from "../components/navbar";
import React from "react";

const Feed = () => {
	return (
		<CategoryProvider>
			<div className="relative">
				<div className="max-w-lg mx-auto">
					<FeedComponent />
				</div>
				<Nav />
			</div>
		</CategoryProvider>
	);
};

export default Feed;
