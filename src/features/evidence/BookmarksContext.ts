import { createContext, useContext } from "react";

interface BookmarksContextValue {
  bookmarks: readonly string[];
  onToggleBookmark: (id: string) => void;
}

export const BookmarksContext = createContext<BookmarksContextValue | null>(
  null,
);

export function useBookmarks() {
  const value = useContext(BookmarksContext);
  if (value === null) {
    throw new Error(
      "useBookmarks must be used within a BookmarksContext provider.",
    );
  }
  return value;
}
