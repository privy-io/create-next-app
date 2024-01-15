import FeedComponent from "../components/feed";
import Nav from "../components/navbar";
import React from "react";

const Feed = () => {
  return (
    <div className="relative">
      <div className="max-w-lg mx-auto">
        <FeedComponent />
      </div>
      <Nav />
    </div>
  );
};

export default Feed;
