import React from "react";
import { useNavigate } from "react-router-dom";

const ArrivalCard = ({ id, img, title, author, sellingPrice }) => {
  const navigate = useNavigate();
  return (
    <div
      className="max-w-[200px] w-full group hover:-translate-y-6 duration-300 transition-transform transform cursor-pointer"
      onClick={() => navigate(`/book/${id}`)}
    >
      <div className="relative">
        <img
          src={img}
          alt={title}
          loading="lazy"
          className="object-contain rounded-lg h-52 w-full shadow-[8px_10px_8px_rgba(0,0,0,0.15)]"
        />
        <div
          className={`absolute bottom-0 right-0 p-2 px-3 text-sm text-white font-bold rounded-tl-xl opacity-90 bg-gradient-to-r from-primaryColor to-secondaryColor uppercase`}
        >
          &#8377; {sellingPrice}
        </div>
      </div>
      <div className="flex flex-col mt-3">
        <strong className="text-lg font-semibold text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap">
          {title}
        </strong>
        <span className="text-sm text-gray-600">{author}</span>
      </div>
    </div>
  );
};

export default ArrivalCard;
