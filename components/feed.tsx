import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "./ui/card";
import { useEffect, useRef, useState } from "react";

import { dayjs } from "../lib/dayjs";
import { fetchImages } from "../utils/irysFunctions";
import { useCategory } from "./category-context";

interface Item {
  id: string;
  address: string;
  timestamp: number;
}

const FeedComponent = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [displayedItems, setDisplayedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef(null);

  const { category } = useCategory();

  const loadItems = async () => {
    setLoading(true);
    const newItems = await fetchImages({ category });
    setItems(newItems);
    setDisplayedItems(newItems.slice(0, 5));
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    loadItems();
  }, [category]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return; // Do nothing if it's not a browser environment
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setDisplayedItems((prev) => [
            ...prev,
            ...items.slice(prev.length, prev.length + 5),
          ]);
        }
      },
      { threshold: 1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMoreRef, items, displayedItems]);

  const shortenString = (str: string) => {
    return `${str.slice(0, 10)}...${str.slice(-10)}`;
  };

  return (
    <div className="p-3 flex flex-col gap-10">
      {category}
      <AnimatePresence>
        {displayedItems.map((item) => (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            key={item.id}
          >
            <Card className="rounded-2xl">
              <CardContent>
                <img
                  src={`https://gateway.irys.xyz/${item.id}`}
                  alt="Image feed"
                  className="rounded-2xl w-full shadow-xl scale-105"
                />
              </CardContent>
              <CardFooter className="pt-1">
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-between w-full">
                    <p className="">Category</p>
                    <p className="font-bold">{shortenString(item.address)}</p>
                  </div>
                  <p className="text-neutral-400 italic text-sm">
                    {dayjs(item.timestamp).fromNow()}
                  </p>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={loadMoreRef} />
    </div>
  );
};

export default FeedComponent;
