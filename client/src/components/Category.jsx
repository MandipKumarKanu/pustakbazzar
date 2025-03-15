import React from "react";
import book6 from "../assets/image/book6.webp";
import book5 from "../assets/image/book5.webp";
import book4 from "../assets/image/book4.webp";
import book3 from "../assets/image/book3.jpg";
import book2 from "../assets/image/book2.png";
import book1 from "../assets/image/book1.jpg";
import CateCards from "./CateCards";

function Category() {
  const handleCardClick = () => {
    console.log("More information clicked!");
  };

  const cateArray = [
    { name: "Recent Books", img: book1, onClick: handleCardClick },
    { name: "Best Seller", img: book6, onClick: handleCardClick },
    { name: "Trending Books", img: book3, onClick: handleCardClick },
    { name: "Featured Books", img: book4, onClick: handleCardClick },
    { name: "Top Picks", img: book5, onClick: handleCardClick },
    { name: "Books for Rent", img: book1, onClick: handleCardClick },
  ];

  return (
    <div className="container mx-auto max-w-[1500px] mt-14 p-4">
      <div className="grid grid-cols-2 sm:md:lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {cateArray.map((cat, index) => (
          <CateCards
            key={index}
            name={cat.name}
            img={cat.img}
            onClick={cat.onClick}
          />
        ))}
      </div>
    </div>
  );
}

export default Category;
