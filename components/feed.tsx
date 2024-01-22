import { Card, CardContent, CardFooter } from "./ui/card";
import { useEffect, useState } from "react";

import { AnimatePresence } from "framer-motion";
import { dayjs } from "../lib/dayjs";
import { fetchImages } from "../utils/irysFunctions";
import { useCategory } from "./category-context";

interface Item {
  id: string;
  address: string;
  timestamp: number;
  tags: Tag[];
}

interface Tag {
  name: string;
  value: string;
}

function titleCase(string: string) {
  if (!string) return string;
  return string[0].toUpperCase() + string.slice(1).toLowerCase();
}

const FeedComponent = () => {
  const [items, setItems] = useState<Item[]>([]);
  console.log("🚀 ~ FeedComponent ~ items:", items);

  const { category, shouldUpdate } = useCategory();
  console.log("🚀 ~ FeedComponent ~ category:", category);

  const loadItems = async () => {
    const fetchedItems = (await fetchImages({ category })) as Item[];
    setItems(fetchedItems);
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    loadItems();
  }, [shouldUpdate]);

  const shortenString = (str: string) => {
    return `${str.slice(0, 10)}...${str.slice(-10)}`;
  };

  return (
    <div className="p-3 flex flex-col gap-10">
      {category}
      <AnimatePresence>
        {items
          .filter((obj) =>
            category === "All" || category === null
              ? true
              : obj?.tags?.find((obj) => obj.name === "category")?.value ===
                category.toLowerCase()
          )
          .map((item) => (
            <Card className="rounded-2xl" key={item.id}>
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
                    <p className="">
                      {titleCase(
                        // @ts-ignore
                        item?.tags?.find((obj) => obj.name === "category")
                          ?.value
                      ) ?? "No category"}
                    </p>
                    <p className="font-bold">{shortenString(item.address)}</p>
                  </div>
                  <p className="text-neutral-400 italic text-sm">
                    {dayjs(item.timestamp).fromNow()}
                  </p>
                </div>
              </CardFooter>
            </Card>
          ))}
      </AnimatePresence>
    </div>
  );
};

export default FeedComponent;
