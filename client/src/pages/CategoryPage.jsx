// src/pages/CategoryPage.jsx
import React, { useEffect, useState } from "react";
import HeadingText from "@/components/Heading";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useCategoryStore } from "@/store/useCategoryStore";
import { getBookByCateId } from "@/api/book";
import BookCard from "@/components/BookCard";
import SkeletonCard from "@/components/SkeletonCard";
import { FaSearch } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const LIMIT = 30;

export default function CategoryPage() {
  const { category: categories } = useCategoryStore();
  const [selected, setSelected] = useState("all");
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchMode, setSearchMode] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const extendedCategories = [{ value: "all", label: "All" }, ...categories];
  const filteredCategories = searchText
    ? extendedCategories.filter((cat) =>
        cat.label.toLowerCase().includes(searchText.toLowerCase())
      )
    : extendedCategories;

  useEffect(() => {
    setPage(1);
  }, [selected]);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const res = await getBookByCateId(selected, { page, limit: LIMIT });
        setCategoryData(res.data.books);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [selected, page]);

  function Pagination() {
    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <button
          className="px-3 py-1 rounded border disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 rounded border ${
              page === idx + 1 ? "bg-primary text-white" : ""
            }`}
            onClick={() => setPage(idx + 1)}
          >
            {idx + 1}
          </button>
        ))}
        <button
          className="px-3 py-1 rounded border disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    );
  }

  return (
    <div>
      <HeadingText fullName="Category" bgName="CATEGORY" />
      <div className="container mx-auto px-4 mt-14">
        <Carousel>
          <CarouselContent>
            <CarouselItem className="basis-1/3 md:basis-1/4 lg:basis-1/5">
              <Card
                className="flex flex-col items-center justify-center p-6 shadow-lg rounded-lg cursor-pointer"
                onClick={() => setSearchMode(true)}
              >
                <CardContent className="flex flex-col items-center space-y-3">
                  {searchMode ? (
                    <div className="relative w-full">
                      <input
                        autoFocus
                        type="text"
                        className="border border-primary rounded-full px-4 py-2 w-full pl-8 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Search category"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onBlur={() => {
                          if (!searchText) setSearchMode(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setSearchMode(false);
                        }}
                      />
                      <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-primary/60" />
                      {searchText && (
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setSearchText("")}
                          tabIndex={-1}
                        >
                          <IoMdClose />
                        </button>
                      )}
                    </div>
                  ) : (
                    <FaSearch className="text-2xl text-primary" />
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
            {filteredCategories.map((category, idx) => (
              <CarouselItem
                key={category.value || idx}
                className="basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <Card
                  className={`flex flex-col items-center justify-center p-6 shadow-lg rounded-lg ${
                    category.value === selected ? "bg-primaryColor/40" : ""
                  }`}
                  onClick={() => {
                    setSelected(category.value);
                    setSearchMode(false);
                    setSearchText("");
                  }}
                >
                  <CardContent className="flex flex-col items-center space-y-3 cursor-pointer" title={category.label}>
                    <p className="text-lg font-semibold capitalize line-clamp-1">
                      {category.label}
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-14">
          {loading ? (
            Array.from({ length: LIMIT }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))
          ) : categoryData.length > 0 ? (
            categoryData.map((book) => (
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
            ))
          ) : (
            <p className="col-span-full text-center py-10">
              No books found in this category.
            </p>
          )}
        </div>

        <Pagination />
      </div>
    </div>
  );
}
