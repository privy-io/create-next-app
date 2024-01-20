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
};

const CategoryContext = createContext<CategoryContextValue | undefined>(undefined);

type CategoryProviderProps = {
	children: ReactNode;
};

export const CategoryProvider = ({ children }: CategoryProviderProps) => {
	const [category, setCategory] = useState<CATEGORIES | null>(null);

	return <CategoryContext.Provider value={{ category, setCategory }}>{children}</CategoryContext.Provider>;
};

// 5. Create a custom hook for consuming the context
export const useCategory = () => {
	const context = useContext(CategoryContext);
	if (!context) {
		throw new Error("useCategory must be used within a CategoryProvider");
	}
	return context;
};
