import React from "react";
import { Button } from "./ui/button";

function PrimaryBtn({ onClick, name, style, w, type, disabled }) {
  return (
    <Button
      onClick={onClick}
      type={type}
      disabled={false}
      className={`px-6 h-10 py-6 cursor-pointer flex items-center justify-center w-full bg-gradient-to-t from-primaryColor to-secondaryColor rounded-3xl text-white text-xl 
        font-bold shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 ${style} ${
        !w && "max-w-[250px]"
      }`}
    >
      {name}
    </Button>
  );
}

export default PrimaryBtn;
