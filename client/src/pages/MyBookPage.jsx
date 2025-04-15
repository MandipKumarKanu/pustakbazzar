import React, { useEffect, useState } from "react";
import { getMyBook } from "../api/profile";
import getErrorMessage from "../utils/getErrorMsg";
import HeadingText from "../components/Heading";
import MyBookCard from "../components/MyBookCard";
import SkeletonCard from "../components/SkeletonCard";

const MyBookPage = ({isDonation}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch();
  }, [isDonation]);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getMyBook(isDonation);
      setBooks(res?.data);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <>Loading....</>;
  }

  return (
    <>
      {/* <HeadingText fullName={"My Book"} bgName={"Mybook"} /> */}

      <div className="container mx-auto px-4 mt-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 9 }).map((_, index) => (
                <SkeletonCard index={index} />
              ))
            : books &&
              books.length > 0 &&
              books.map((book) => (
                <MyBookCard
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
                  status={book.status}
                  forDonation={book.forDonation}
                />
              ))}
        </div>
      </div>
    </>
  );
};

export default MyBookPage;
