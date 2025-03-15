import { getBookByCateId } from "@/api/book";
import HeadingText from "@/components/Heading";
import SkeletonCard from "@/components/SkeletonCard";
import BookCard from "@/components/BookCard";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const ParticularCategory = () => {
  const { cname } = useParams();
  const navigate = useNavigate();
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const categoryValue = location.state?.value;

  useEffect(() => {
    if (!categoryValue) {
      navigate("/");
      return;
    }
  }, [categoryValue]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getBookByCateId(categoryValue);
        setCategoryData(res.data.books);
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cname, categoryValue]);

  return (
    <div>
      {categoryValue && <HeadingText fullName={cname} bgName="Category" />}
      <div className="container mx-auto px-4 mt-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 9 }).map((_, index) => (
              <SkeletonCard key={index} index={index} />
            ))
          ) : categoryValue && categoryData && categoryData.length > 0 ? (
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
      </div>
    </div>
  );
};

export default ParticularCategory;
