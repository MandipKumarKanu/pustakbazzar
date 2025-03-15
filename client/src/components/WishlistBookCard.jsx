import React from "react";
import PrimaryBtn from "./PrimaryBtn";
import { useNavigate } from "react-router-dom";
import SpotlightCard from "@/components/SpotlightCard/SpotlightCard";
import { Heart } from "lucide-react";

const WishlistBookCard = ({
  id,
  img,
  name,
  author,
  publishYear,
  sellingPrice,
  condition,
  availability,
  perWeekPrice,
  isAvailable,
  onRemoveFromWishlist,
  onAddToCart,
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
          className="w-full h-full object-cover rounded-lg"
        />
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
          <p className="text-gray-600 text-sm mt-1">{author}</p>
          <p className="text-gray-600 text-sm mt-1">{publishYear}</p>
        </div>

        <div className="flex flex-col mt-4">
          <div className="font-semibold text-slate-700 text-xl mb-2 ml-2">
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

          <div className="flex items-center gap-2">
            {isAvailable ? (
              <>
                <PrimaryBtn
                  name="Add to Cart"
                  style="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(id);
                  }}
                  w
                />
                <button
                  className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromWishlist(id);
                  }}
                >
                  <Heart size={24} color="#ef4444" fill="#ef4444" />
                </button>
              </>
            ) : (
              <>
                <div className="flex-1 text-center py-2 px-4 bg-gray-100 text-gray-500 font-medium rounded-lg">
                  Not Available
                </div>
                <button
                  className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromWishlist(id);
                  }}
                >
                  <Heart size={24} color="#ef4444" fill="#ef4444" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
};

export default WishlistBookCard;
