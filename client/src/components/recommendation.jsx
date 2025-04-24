import React, { useEffect, useState } from 'react'
import BookCard from './BookCard'
import SkeletonBookCard from './SkeletonBookCard'
import { getRecommendation } from '@/api/book';

const Recommendation = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
          setLoading(true);
          try {
            //fetching static data for testing
            const categories = ['63f8b0e2a4c1d3f7b8e5c9a0','67fb7b36d9c5492012a0c40b','67fb7b3cd9c5492012a0c410','67fb7ae6d9c5492012a0c3e5'];
            const res = await getRecommendation(categories);
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
  )
}

export default Recommendation