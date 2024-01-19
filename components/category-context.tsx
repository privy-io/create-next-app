// 1. Import necessary React components and hooks
import React, { ReactNode, createContext, useContext, useState } from "react";

export enum CATEGORIES {
  PEOPLE = "People",
  NATURE = "Nature",
  ANIMALS = "Animals",
  FOOD = "Food",
}

type CategoryContextValue = {
  category: CATEGORIES | null;
  setCategory: (category: CATEGORIES) => void;
  setShouldUpdate: (p: number) => void;
  shouldUpdate: number;
};

const CategoryContext = createContext<CategoryContextValue | undefined>(
  undefined
);

type CategoryProviderProps = {
  children: ReactNode;
};

export const CategoryProvider = ({ children }: CategoryProviderProps) => {
  const [category, setCategory] = useState<CATEGORIES | null>(null);
  const [shouldUpdate, setShouldUpdate] = useState<number>(0);

  return (
    <CategoryContext.Provider
      value={{ category, setCategory, setShouldUpdate, shouldUpdate }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

// 5. Create a custom hook for consuming the context
export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategory must be used within a CategoryProvider");
  }
  return context;
};
