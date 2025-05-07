import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import InfiniteScroll from "react-infinite-scroll-component";
import HeadingText from "../components/Heading";
import SearchBookCard from "@/components/SearchBookCard";
import { homeSearchBook } from "@/hooks/HomeSearchBook";
import SkeletonBookCard from "@/components/SkeletonBookCard";


const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    hasNextPage: false,
    totalBooks: 0,
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const searchFields = {
        query: searchTerm,
        year: /^\d{4}$/.test(searchTerm) ? searchTerm : "",
        page: 1,
        limit: 12,
      };

      const response = await homeSearchBook(searchFields);

      setBooks(response.books || []);
      setPagination({
        currentPage: response.pagination?.currentPage || 1,
        totalPages: response.pagination?.totalPages || 0,
        hasNextPage: response.pagination?.hasNextPage || false,
        totalBooks: response.pagination?.totalBooks || 0,
      });
    } catch (error) {
      console.error("Error searching books:", error);
      setBooks([]);
      setPagination({
        currentPage: 0,
        totalPages: 0,
        hasNextPage: false,
        totalBooks: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreBooks = async () => {
    if (!pagination.hasNextPage) return;

    try {
      const nextPage = pagination.currentPage + 1;
      const searchFields = {
        query: searchTerm,
        year: /^\d{4}$/.test(searchTerm) ? searchTerm : "",
        page: nextPage,
        limit: 12,
      };

      const response = await homeSearchBook(searchFields);

      setBooks((prevBooks) => [...prevBooks, ...(response.books || [])]);
      setPagination({
        currentPage: response.pagination?.currentPage || nextPage,
        totalPages: response.pagination?.totalPages || pagination.totalPages,
        hasNextPage: response.pagination?.hasNextPage || false,
        totalBooks: response.pagination?.totalBooks || pagination.totalBooks,
      });
    } catch (error) {
      console.error("Error loading more books:", error);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (newValue === "") {
      setHasSearched(false);
      setBooks([]);
      setPagination({
        currentPage: 0,
        totalPages: 0,
        hasNextPage: false,
        totalBooks: 0,
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto p-4">
        <HeadingText
          fullName="Discover Your Next Read"
          bgName="Search Book"
          color="secondary"
        />
      </div>

      <div className="sticky top-20 bg-white z-10 py-4 shadow-sm">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder="Search by title, author, language, or publish year (e.g., 2000)"
                className="w-full p-4 py-4 rounded-full border-2 border-gray-300 focus:border-primaryColor focus:outline-none transition-colors duration-300 pr-12"
              />
              <button
                type="submit"
                disabled={loading || !searchTerm.trim()}
                className="absolute h-12 w-12 right-2 top-1/2 transform -translate-y-1/2 bg-secondaryColor text-white rounded-full p-2 hover:bg-primaryColor transition-colors duration-300 disabled:opacity-70 flex items-center justify-center"
              >
                <FaSearch size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto p-4 flex-grow">
        {loading ? (
           <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
           {books.map((book) => (
             <SearchBookCard key={book._id} book={book} />
           ))}
         </div>
        ) : (
          <>
            {books && books.length > 0 ? (
              <InfiniteScroll
                dataLength={books.length}
                next={loadMoreBooks}
                hasMore={pagination.hasNextPage}
                loader={
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {books.map((book) => (
                    <SearchBookCard key={book._id} book={book} />
                  ))}
                </div>
                }
                endMessage={
                  <p className="text-center text-gray-500 mt-8 mb-4">
                    You've reached the end of the results (
                    {pagination.totalBooks} books found)
                  </p>
                }
              >
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {books.map((book) => (
                    <SearchBookCard key={book.id || book._id} book={book} />
                  ))}
                </div>
              </InfiniteScroll>
            ) : (
              <p className="text-center col-span-full text-xl text-gray-600 py-12">
                {hasSearched
                  ? `No books found. ${
                      /^\d{4}$/.test(searchTerm)
                        ? "Try a different year or search by title/author."
                        : "Try a different search term!"
                    }`
                  : "Start your search to discover amazing books!"}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
