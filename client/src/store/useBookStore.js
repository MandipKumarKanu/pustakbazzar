import { getBooks } from "@/api/book";
import { create } from "zustand";

export const useBookStore = create((set) => ({
  books: [],
  loading: true,
  error: null,

  fetchBooks: async () => {
    try {
      set({ books: [], loading: true, error: null });
      const response = await getBooks();
      const books = response.data.books;
      set({ books, loading: false, error: null });
    } catch (error) {
      console.error("Error fetching books:", error);
      set({ books: [], loading: false, error: error.message });
    }
  },
}));
