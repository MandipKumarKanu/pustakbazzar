import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import PrimaryBtn from "./PrimaryBtn";
// import { homeSearchBook } from "../hooks/HomeSearchBook";
import SearchBookCard from "./SearchBookCard";
import { homeSearchBook } from "@/hooks/HomeSearchBook";

function HomeSearch() {
  const [searchFields, setSearchFields] = useState({
    title: "",
    author: "",
    year: "",
  });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchFields.title && !searchFields.author && !searchFields.year) {
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setShowResults(true);
    setError(null);

    try {
      const results = await homeSearchBook(searchFields);
      setBooks(results);

      console.log(
        `Found ${results.length} books matching criteria:`,
        searchFields
      );
    } catch (error) {
      console.error("Search error:", error);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setSearchFields({
      title: "",
      author: "",
      year: "",
    });
    setError(null);
  };

  const handleDeepSearch = () => {
    // Pass the current search parameters to the advanced search page
    const params = new URLSearchParams();
    if (searchFields.title) params.append("title", searchFields.title);
    if (searchFields.author) params.append("author", searchFields.author);
    if (searchFields.year) params.append("year", searchFields.year);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-center">
      <form
        onSubmit={handleSearch}
        className="flex flex-col md:flex-row gap-4 m-auto justify-center mt-20 w-full"
      >
        <input
          type="text"
          name="title"
          value={searchFields.title}
          onChange={handleInputChange}
          placeholder="What's the title of the book?"
          className="border-[1px] px-4 h-10 py-2 text-lg rounded-3xl border-primaryColor w-full md:w-1/3 lg:w-1/4 xl:w-1/5"
        />
        <input
          type="text"
          name="author"
          value={searchFields.author}
          onChange={handleInputChange}
          placeholder="Who wrote the book?"
          className="border-[1px] px-4 h-10 py-2 text-lg rounded-3xl border-primaryColor w-full md:w-1/3 lg:w-1/4 xl:w-1/5"
        />
        <input
          type="number"
          name="year"
          min="1900"
          max={new Date().getFullYear()}
          value={searchFields.year}
          onChange={handleInputChange}
          placeholder="When was the book published?"
          className="border-[1px] px-4 h-10 py-2 text-lg rounded-3xl border-primaryColor w-full md:w-1/3 lg:w-1/4 xl:w-1/5"
        />
        <PrimaryBtn
          name={loading ? "Searching..." : "Search"}
          disabled={
            loading ||
            (!searchFields.title && !searchFields.author && !searchFields.year)
          }
        />
      </form>

      {hasSearched && showResults && (
        <div className="mt-8 w-full container relative mb-8 bg-red-50 h-auto px-8 py-10 rounded-3xl">
          <button
            onClick={handleCloseResults}
            className="absolute top-1 right-8 p-2"
          >
            <FaTimes className="text-gray-600 text-xl" />
          </button>
          <div>
            
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor mx-auto"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600">
                <p>{error}</p>
                <button
                  onClick={handleSearch}
                  className="mt-4 text-primaryColor"
                >
                  Try Again
                </button>
              </div>
            ) : books.length > 0 ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Found {books.length} results
                  {books.some((book) => book._fuzzyMatch) &&
                    " (including similar matches)"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {books.map((book) => (
                    <SearchBookCard key={book._id} book={book} />
                  ))}
                </div>
                {books.length > 8 && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={handleDeepSearch}
                      className="px-4 py-2 bg-primaryColor text-white rounded-lg hover:bg-primaryColorDark"
                    >
                      View All Results
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-xl text-gray-600">
                <p>
                  No books found matching your criteria. Try adjusting your
                  search terms or using fewer filters.
                </p>
                <button
                  onClick={handleDeepSearch}
                  className="mt-4 text-primaryColor"
                >
                  Go to Deep Search
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeSearch;
