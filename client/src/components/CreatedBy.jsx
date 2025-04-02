import React from "react";
import { AnimatedTooltip } from "./animated-tooltip";
import Mandy from "@assets/image/mandy.png";
import Aadi from "@assets/image/aadi.jpeg";

const people = [
  {
    id: 1,
    name: "Mandip Kumar Kanu",
    designation: "Backend & Frontend",
    image: Mandy,
    link: "https://github.com/mandipkumarkanu",
  },
  {
    id: 2,
    name: "Aadarsh Kumar",
    designation: "Backend & Documentaion",
    image: Aadi,
    link: "https://github.com/aadik6",
  },
];

export function CreatedBy() {
  return (
    <div className="flex flex-row items-center justify-start mt-4 w-full">
      <AnimatedTooltip items={people} />
    </div>
  );
}
