import { createContext, Dispatch, SetStateAction, useContext } from "react";

interface SearchContextProps {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

export const SearchContext = createContext<SearchContextProps | undefined>(
  undefined
);

// eslint-disable-next-line react-refresh/only-export-components
export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error(
      "useSearchContext must be used within a SearchContextProvider"
    );
  }
  return context;
}
