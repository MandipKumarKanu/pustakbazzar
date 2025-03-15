import React from "react";
import { Skeleton } from "./ui/skeleton";
// import Skeleton from "react-loading-skeleton";

const SkeletonCard = ({index}) => {
  return (
    <>
      <div
        key={index}
        className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-5 w-full bg-white rounded-xl"
      >
        <Skeleton width={200} height={250} />
        <div className="flex flex-col justify-between flex-grow">
          <div>
            <Skeleton width={60} height={25} />
            <Skeleton count={3} />
            <Skeleton width={120} />
          </div>

          <div>
            <Skeleton width={120} height={20} />
            <Skeleton width="100%" height={40} className="rounded-3xl mt-4" />
          </div>
        </div>
      </div>
    </>
  );
};

export default SkeletonCard;
