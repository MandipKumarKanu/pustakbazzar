import React, { useEffect, useState } from "react";
// import { Skeleton } from "@shadcn/ui";
import ArrivalCard from "./ArrivalCard";
import { Skeleton } from "./ui/skeleton";
import { useBookStore } from "@/store/useBookStore";

const ArrivalBooks = () => {
  const { books, fetchBooks, loading } = useBookStore();

  useEffect(() => {
    if (books.length === 0) {
      fetchBooks();
    }
  }, []);

  return (
    <div className="m-auto max-w-[1500px] mt-14 p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="max-w-[200px] w-full">
                <Skeleton className="h-52 w-full rounded-lg shadow-[8px_10px_8px_rgba(0,0,0,0.15)]" />
                <div className="mt-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </div>
              </div>
            ))
          : books
              .slice(0, 6)
              .map((arr) => (
                <ArrivalCard
                  key={arr._id}
                  id={arr._id}
                  img={arr.images[0]}
                  title={arr.title}
                  author={arr.author}
                  sellingPrice={arr.sellingPrice}
                />
              ))}
      </div>
    </div>
  );
};

export default ArrivalBooks;
