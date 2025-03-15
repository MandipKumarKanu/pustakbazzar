import React from "react";
import HeroImg from "../assets/image/heroImg.png";
import Spline from "@splinetool/react-spline";

function Hero() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="flex flex-col items-center lg:flex-row lg:justify-between gap-8 lg:gap-12">
        <div className="text-center lg:text-left max-w-2xl lg:max-w-[670px]">
          <h1 className="font-meditative text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading">
            Empower Minds, Ignite Change
          </h1>
          <p className="font-sfpro text-threeColor text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mt-4 sm:mt-6">
            Unleashing the Power of Books Through Generosity
          </p>
        </div>

        <div className=" max-w-md lg:max-w-lg xl:max-w-xl w-full">
          <img
            src={HeroImg}
            alt="reading book"
            className="w-full h-auto object-contain"
          />
          {/* <Spline scene="https://prod.spline.design/Bnn-2ynRYV32jrgk/scene.splinecode" /> */}
        </div>
      </div>
    </div>
  );
}

export default Hero;
