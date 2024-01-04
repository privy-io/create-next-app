import React from "react";
import FeedComponent from "../components/FeedComponent";
import TopNav from "../components/TopNav";
import { Page } from "konsta/react";

const Feed = () => {
	// Implement state and navigation logic
	return (
		<div className="">
			<Page className="bg-neon-gradient">
				<TopNav />
				<FeedComponent />
			</Page>
		</div>
	);
};

export default Feed;
//
