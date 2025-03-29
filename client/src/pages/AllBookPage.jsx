import { getBooks } from "@/api/book";
import BookCard from "@/components/BookCard";
import HeadingText from "@/components/Heading";
import Loader from "@/components/Loader";
import React, { useEffect, useState, useRef } from "react";

const AllBookPage = () => {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]); 
  const [firstId, setFirstId] = useState(null); 
  const [lastId, setLastId] = useState(null);
  const [fetchingMore, setFetchingMore] = useState(false);
  const loadMoreRef = useRef(null);
  const loadPreviousRef = useRef(null); 
  const bottomObserver = useRef(null);
  const topObserver = useRef(null);

  const WINDOW_SIZE = 30;
  const FETCH_SIZE = 10;

  useEffect(() => {
    fetchBooks("down"); 
  }, []);

  const fetchBooks = async (direction = "down") => {
    try {
      setFetchingMore(true);
      const res = await getBooks(
        direction === "down" ? lastId : firstId,
        FETCH_SIZE,
        direction
      );
      const newBooks = res.data.books;

      if (newBooks.length === 0) {
        if (direction === "down") setLastId(null);
        else setFirstId(null);
        return;
      }

      if (direction === "down") {
        setBooks((prev) => {
          const updatedBooks = [...prev, ...newBooks];
          if (updatedBooks.length > WINDOW_SIZE) {
            return updatedBooks.slice(-WINDOW_SIZE);
          }
          return updatedBooks;
        });
        setLastId(res.data.lastId);
        if (!firstId && newBooks.length > 0) setFirstId(res.data.firstId);
      } else {
        setBooks((prev) => {
          const updatedBooks = [...newBooks, ...prev];
          if (updatedBooks.length > WINDOW_SIZE) {
            return updatedBooks.slice(0, WINDOW_SIZE)
          }
          return updatedBooks;
        });
        setFirstId(res.data.firstId);
        if (!lastId && newBooks.length > 0) setLastId(res.data.lastId); 
      }
    } catch (error) {
      console.error(`Error fetching books (${direction}):`, error);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    bottomObserver.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && lastId && !fetchingMore) {
          fetchBooks("down");
        }
      },
      { rootMargin: "300px", threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      bottomObserver.current.observe(loadMoreRef.current);
    }

    return () => bottomObserver.current?.disconnect();
  }, [lastId, fetchingMore]);

  useEffect(() => {
    topObserver.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && firstId && !fetchingMore) {
          fetchBooks("up");
        }
      },
      { rootMargin: "300px", threshold: 0.1 }
    );

    if (loadPreviousRef.current) {
      topObserver.current.observe(loadPreviousRef.current);
    }

    return () => topObserver.current?.disconnect();
  }, [firstId, fetchingMore]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <HeadingText fullName="All Books" bgName="ALL BOOKS" />

      <div className="container mx-auto px-4">
        <div ref={loadPreviousRef} className="py-8 text-center">
          {fetchingMore && firstId ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
              <div className="w-4 h-4 rounded-full bg-primary animate-pulse delay-75"></div>
              <div className="w-4 h-4 rounded-full bg-primary animate-pulse delay-150"></div>
              <span className="ml-2 text-gray-600">
                Loading previous books...
              </span>
            </div>
          ) : firstId ? (
            <div className="h-8" /> 
          ) : (
            <p className="text-gray-500 italic"></p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {books.map((book) => (
            <BookCard
              key={book._id}
              id={book._id}
              img={book.images[0]}
              name={book.title}
              author={book.author}
              publishYear={book.publishYear}
              sellingPrice={book.sellingPrice}
              perWeekPrice={book.perWeekPrice}
              condition={book.condition}
              availability={book.availability}
              className="transition-opacity duration-500 ease-out"
            />
          ))}
        </div>

        <div ref={loadMoreRef} className="py-8 text-center">
          {fetchingMore && !firstId ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
              <div className="w-4 h-4 rounded-full bg-primary animate-pulse delay-75"></div>
              <div className="w-4 h-4 rounded-full bg-primary animate-pulse delay-150"></div>
              <span className="ml-2 text-gray-600">Loading more books...</span>
            </div>
          ) : lastId ? (
            <div className="h-8" /> 
          ) : (
            <p className="text-gray-500 italic">All books loaded 🎉</p>
          )}
        </div>

        {!books.length && !loading && (
          <div className="text-center py-20 text-gray-500">No books found</div>
        )}
      </div>
    </>
  );
};

export default AllBookPage;