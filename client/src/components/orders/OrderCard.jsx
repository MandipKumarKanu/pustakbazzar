import React from "react";
import { FiPackage, FiChevronRight, FiCreditCard } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SpotlightCard from "@/components/SpotlightCard/SpotlightCard";
import StatusBadge from "./StatusBadge";
import PrimaryBtn from "../PrimaryBtn";

const OrderCard = React.memo(({ order, onClick }) => {
  const navigate = useNavigate();

  const getProductImages = (order) => {
    return order.orders
      .flatMap((sellerOrder) =>
        sellerOrder.books.map((book) => ({
          src: book.bookId.images[0],
          alt: book.bookId.title,
        }))
      )
      .filter(
        (img, index, self) => index === self.findIndex((t) => t.src === img.src)
      )
      .slice(0, 4);
  };

  const productImages = getProductImages(order);
  const totalItems = order.orders.reduce(
    (total, sellerOrder) =>
      total +
      sellerOrder.books.reduce(
        (bookTotal, book) => bookTotal + book.quantity,
        0
      ),
    0
  );

  const renderImages = () => {
    const imageCount = productImages.length;

    if (imageCount === 0) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <FiPackage className="mx-auto text-gray-400 mb-2" size={40} />
            <p className="text-sm text-gray-500 font-medium">No images</p>
          </div>
        </div>
      );
    }

    if (imageCount === 1) {
      return (
        <div className="w-full h-full relative">
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${productImages[0].src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(15px) opacity(0.4)",
              }}
            />
          </div>

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-4/5 h-4/5 rounded-lg bg-white p-3 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <img
                src={productImages[0].src}
                alt={productImages[0].alt}
                loading="lazy"
                className="w-full h-full object-contain rounded-md"
              />
            </div>
          </div>

          <div className="absolute bottom-2 left-2 bg-gray-800 text-white text-xs py-1 px-2 rounded-full font-semibold flex items-center">
            <FiPackage className="mr-1" size={10} />
            <span>
              {totalItems} {totalItems === 1 ? "Book" : "Books"}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <pattern
              id="grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
            <rect width="80" height="80" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative w-full h-full">
          {productImages.map((img, index) => {
            const rotationDeg =
              index % 2 === 0 ? -3 + index * 1 : 3 - index * 1;
            const top = 10 + index * 5;
            const left = index % 2 === 0 ? 10 : 15;
            const zIndex = index;

            return (
              <div
                key={index}
                className="absolute shadow-md rounded-md bg-white p-2 transition-all duration-300 hover:z-10 hover:shadow-lg"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  zIndex,
                  width: "70%",
                  height: "70%",
                  transform: `rotate(${rotationDeg}deg)`,
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-contain rounded-sm"
                />
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-2 left-2 bg-gray-800 text-white text-xs py-1 px-2 rounded-full font-semibold flex items-center">
          <FiPackage className="mr-1" size={10} />
          <span>
            {totalItems} {totalItems === 1 ? "Book" : "Books"}
          </span>
        </div>
      </div>
    );
  };

  const formattedDate = new Date(order.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleClick = () => {
    onClick ? onClick(order) : navigate(`/order/${order._id}`);
  };

  return (
    <SpotlightCard
      className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-5 w-full bg-white rounded-xl shadow-none hover:shadow-md transition-shadow cursor-pointer duration-300"
      spotlightColor="rgba(108, 39, 199, 0.5)"
      onClick={handleClick}
    >
      <div className="relative w-full sm:w-48 h-48 sm:h-64 flex-shrink-0">
        {renderImages()}
      </div>

      <div className="flex flex-col justify-between flex-grow">
        <div>
          <span className="inline-block uppercase text-sm font-bold text-green-500 mb-1">
            <StatusBadge status={order.orderStatus} />
          </span>
          <div className="text-xl sm:text-2xl text-gray-800 leading-tight">
            <div className="overflow-hidden overflow-ellipsis line-clamp-2 font-bold">
              Order #{order._id.slice(-6)}
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-1">{formattedDate}</p>
          <p className="text-gray-600 text-sm mt-1 capitalize">
            {order.payment}
          </p>
        </div>

        <div className="flex flex-col mt-4">
          <div className="font-semibold text-slate-700 text-xl mb-2 ml-2">
            ₹{parseFloat(order.netTotal).toFixed(2)}
          </div>
          <PrimaryBtn
            name={
              order.paymentStatus === "pending" ? "Pay Now" : "View Details"
            }
            style={
              order.paymentStatus === "pending" &&
              "bg-gradient-to-t from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800"
            }
          />
        </div>
      </div>
    </SpotlightCard>
  );
});

export default OrderCard;
