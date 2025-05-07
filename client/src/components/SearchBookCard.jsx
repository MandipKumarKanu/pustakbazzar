import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBookOpen, FaCalendarAlt } from "react-icons/fa";
import SpotlightCard from "@/components/SpotlightCard/SpotlightCard";
import PrimaryBtn from "./PrimaryBtn";

function SearchBookCard({ book }) {
  const navigate = useNavigate();
  const defaultImage = "https://via.placeholder.com/150x225?text=No+Cover";

  return (
    <SpotlightCard
      className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-5 w-full bg-white rounded-xl shadow-none hover:shadow-md transition-shadow duration-300"
      spotlightColor="rgba(108, 39, 199, 0.5)"
      onClick={() => navigate(`/book/${book._id}`)}
    >
      <div className="relative w-full sm:w-48 h-48 sm:h-64 flex-shrink-0">
        <img
          src={book.images?.[0] || defaultImage}
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        {book.availability && (
          <div
            className={`absolute top-0 right-0 py-1.5 px-2 text-sm text-white font-bold rounded-bl-xl opacity-90 bg-gradient-to-r from-primaryColor to-secondaryColor uppercase`}
          >
            {book.availability === "in_stock" ? "Available" : "Out of Stock"}
          </div>
        )}

        {book.sellingPrice && (
          <div className="absolute bottom-2 left-2 bg-white text-primaryColor font-bold py-1 px-3 rounded-full shadow-md">
            ₹ {Number(book.sellingPrice).toFixed(2)}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between flex-grow">
        <div>
          {book.condition && (
            <span className="inline-block uppercase text-sm font-bold text-green-500 mb-1">
              {book.condition}
            </span>
          )}

          <div className="text-xl sm:text-2xl text-gray-800 leading-tight">
            <div className="overflow-hidden overflow-ellipsis line-clamp-2 font-bold">
              {book.title}
            </div>
          </div>

          <p className="text-gray-600 text-sm mt-1">
            {book.author || "Unknown author"}
          </p>

          {book.publishYear && (
            <div className="flex items-center mt-2 text-gray-600 text-sm">
              <FaCalendarAlt className="mr-2 text-gray-500" size={12} />
              <span>Published: {book.publishYear}</span>
            </div>
          )}

          {book._fuzzyMatch && (
            <div className="mt-3 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full self-start inline-block">
              <p>
                Similar match in {""}
                <span className="capitalize">
                  {book._fuzzyMatch.field === "query"
                    ? "Publish Year"
                    : book._fuzzyMatch.field}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col mt-4">
          {book.price && (
            <div className="font-semibold text-slate-700 text-xl mb-2 ml-2">
              ₹ {Number(book.price).toFixed(2)}
            </div>
          )}

          <PrimaryBtn
            name="View Book"
            style="w-full"
            onClick={() => navigate(`/book/${book._id}`)}
          />
        </div>
      </div>
    </SpotlightCard>
  );
}

export default SearchBookCard;
