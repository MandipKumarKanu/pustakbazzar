import React from "react";
import { Link } from "react-router-dom";

function SearchBookCard({ book }) {
  const defaultImage = "https://via.placeholder.com/150x225?text=No+Cover";

  const fuzzyMatch = book._fuzzyMatch;
  const isFuzzyMatch = !!fuzzyMatch;

  return (
    <div className="flex flex-col rounded-lg shadow-md overflow-hidden bg-white h-full">
      <Link to={`/book/${book._id}`}>
        <div className="flex justify-center pt-4">
          {console.log(book.images[0])}
          <img
            src={book.images[0] || defaultImage}
            alt={`Cover of ${book.title}`}
            className="h-40 object-contain"
            onError={(e) => {
              e.target.src = defaultImage;
            }}
          />
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-sm text-gray-700 mt-1">by {book.author}</p>
          <p className="text-xs text-gray-500 mt-1">
            {book.publishYear ? `Published: ${book.publishYear}` : ""}
          </p>

          {book.category && (
            <p className="text-xs text-gray-500 mt-1">
              Category: {book.category.name}
            </p>
          )}

          {isFuzzyMatch && (
            <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-1 rounded">
              <p>Similar match in {fuzzyMatch.field}</p>
            </div>
          )}
          <div className="text-primaryColor hover:text-primaryColorDark text-sm font-medium">
            <div className="mt-auto pt-3">View Details</div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default SearchBookCard;
