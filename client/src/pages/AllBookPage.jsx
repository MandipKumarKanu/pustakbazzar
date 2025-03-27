import { getBooks } from "@/api/book";
import BookCard from "@/components/BookCard";
import HeadingText from "@/components/Heading";
import Loader from "@/components/Loader";
import SkeletonCard from "@/components/SkeletonCard";
import React, { useEffect, useState } from "react";

const AllBookPage = () => {
  const [loading, setLoading] = useState(true);
  //   const [error, setError] = useState(null);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    try {
      const res = await getBooks();
      //   console.log(res);
      setBooks(res.data.books);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <><Loader/></>;
  }
  return (
    <>
      {/* <title>All Book | PustakBazzar</title> */}
      <HeadingText fullName="All Books" bgName="ALL BOOKS" />

      <div className="container mx-auto px-4 mt-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 9 }).map((_, index) => (
                <SkeletonCard index={index} />
              ))
            : books &&
              books.length > 0 &&
              books.map((book) => (
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
                />
              ))}
        </div>
      </div>
    </>
  );
};

export default AllBookPage;
