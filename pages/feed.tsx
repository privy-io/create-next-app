import React, { useEffect } from "react";

import { CategoryProvider } from "@/components/category-context";
import FeedComponent from "../components/feed";
import FixedTopBar from "@/components/fixed-top-bar";
import Nav from "../components/navbar";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";

const Feed = () => {
  //   const router = useRouter();
  //   const { ready, authenticated } = usePrivy();

  //   useEffect(() => {
  //     if (ready && !authenticated) {
  //       router.push("/");
  //     }
  //   }, [ready, authenticated, router]);

  return (
    <CategoryProvider>
      <div className="relative">
        <FixedTopBar />
        <div className="max-w-lg mx-auto">
          <FeedComponent />
        </div>
        <Nav />
      </div>
    </CategoryProvider>
  );
};

export default Feed;
