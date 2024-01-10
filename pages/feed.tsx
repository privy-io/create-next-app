import React from "react";
import FeedComponent from "../components/FeedComponent";
import TopNav from "../components/TopNav";
import { Page } from "konsta/react";

const Feed = () => {
	return (
		<div className="z-0">
			<Page>
				<TopNav />
				<FeedComponent />
			</Page>
		</div>
	);
};

export default Feed;
