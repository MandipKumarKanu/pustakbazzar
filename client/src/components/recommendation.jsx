import React, { useEffect, useState } from "react";
import BookCard from "./BookCard";
import SkeletonBookCard from "./SkeletonBookCard";
import { getRecommendation } from "@/api/book";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const Recommendation = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name] = useLocalStorage("interest", []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getRecommendation(name);
        setBooks(res.data.data);
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 mt-14">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBookCard key={index} />
            ))
          : books.map((book) => (
              <BookCard
                key={book._id}
                id={book._id}
                img={book.images[0]}
                name={book.title}
                author={book.author}
                publishYear={book.publishYear}
                perWeekPrice={book.perWeekPrice}
                condition={book.condition}
                sellingPrice={book.sellingPrice}
                showAva={false}
              />
            ))}
      </div>
    </div>
  );
};

export default Recommendation;
