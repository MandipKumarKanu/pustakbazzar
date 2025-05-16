import React from "react";
import PrimaryBtn from "./PrimaryBtn";
import { useNavigate } from "react-router-dom";
import SpotlightCard from "@/components/SpotlightCard/SpotlightCard";

const BookCard = ({
  id,
  img,
  name,
  author,
  publishYear,
  sellingPrice,
  condition,
  availability,
  perWeekPrice,
  showAva,
}) => {
  const navigate = useNavigate();
  return (
    <SpotlightCard
      className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-5 w-full bg-white rounded-xl shadow-none hover:shadow-md transition-shadow cursor-pointer duration-300"
      spotlightColor="rgba(108, 39, 199, 0.5)"
      onClick={() => navigate(`/book/${id}`)}
    >
      <div className="relative w-full sm:w-48 h-48 sm:h-64 flex-shrink-0">
        <img
          src={img}
          alt={name}
          loading="lazy"
          className="w-full h-full object-contain rounded-lg"
          style={{ mixBlendMode: "multiply" }}
        />
        {showAva && (
          <div
            className={`absolute top-0 right-0 py-1.5 px-2 text-sm text-white font-bold rounded-bl-xl opacity-90 bg-gradient-to-r from-primaryColor to-secondaryColor uppercase`}
          >
            {availability}
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between flex-grow">
        <div>
          <span className="inline-block uppercase text-sm font-bold text-green-500 mb-1">
            {condition}
          </span>
          <div className="text-xl sm:text-2xl text-gray-800 leading-tight">
            <div className="overflow-hidden overflow-ellipsis line-clamp-2 font-bold ">
              {name}
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{author}</p>
          <p className="text-gray-600 text-sm mt-1">{publishYear}</p>
        </div>

        <div className="flex flex-col mt-4">
          <div className="font-semibold  text-slate-700 text-xl mb-2 ml-2">
            {availability !== "donation" ? (
              availability === "rent" ? (
                <>₹ {Number(perWeekPrice).toFixed(2)} / week</>
              ) : (
                <>₹ {Number(sellingPrice).toFixed(2)}</>
              )
            ) : (
              <>₹ 0.00</>
            )}
          </div>
          <PrimaryBtn
            name={availability !== "donation" ? "Buy Now" : "View Book"}
            style=" w-full"
            w
          />
        </div>
      </div>
    </SpotlightCard>
  );
};

export default BookCard;
