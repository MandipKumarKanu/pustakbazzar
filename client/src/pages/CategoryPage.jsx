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

const CategoryPage = () => {
  const { category: categories } = useCategoryStore();
  const [selected, setSelected] = useState(categories?.[0].value);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch();
  }, [selected]);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getBookByCateId(selected);
      setCategoryData(res.data.books);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <HeadingText fullName="Category" bgName="CATEGORY" />
      <div className="container mx-auto px-4 mt-14">
        <Carousel>
          <CarouselContent>
            {categories.map((category, index) => (
              <CarouselItem
                key={index}
                className="basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <Card
                  className={`flex flex-col items-center justify-center p-6 shadow-lg rounded-lg ${
                    category.value === selected && "bg-primaryColor/40"
                  }`}
                  onClick={() => setSelected(category.value)}
                >
                  <CardContent className="flex flex-col items-center space-y-3">
                    {/* <div className="text-primary">{category.icon}</div> */}
                    <p className="text-lg font-semibold capitalize">
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
            Array.from({ length: 9 }).map((_, index) => (
              <SkeletonCard key={index} index={index} />
            ))
          ) : categoryData && categoryData.length > 0 ? (
            categoryData.map((book, index) => (
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
      </div>
    </div>
  );
};

export default CategoryPage;
