import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "./ui/card";
import SpotlightCard from "./SpotlightCard/SpotlightCard";

const SkeletonBookCard = () => {
  return (
    <SpotlightCard className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-5 w-full bg-white rounded-xl shadow-none hover:shadow-md transition-shadow duration-300"
    spotlightColor="rgba(108, 39, 199, 0.5)"
    >

      <div className="relative w-full sm:w-48 h-48 sm:h-64 flex-shrink-0">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>

      <div className="flex flex-col justify-between flex-grow">
        <div>
          <Skeleton className="w-24 h-4 mb-2" />
          <Skeleton className="w-full h-6 mb-2" />
          <Skeleton className="w-40 h-4 mb-1" />
          <Skeleton className="w-32 h-4" />
        </div>

        <div className="flex flex-col mt-4">
          <Skeleton className="w-20 h-6 mb-2 ml-2" />
          <Skeleton className="w-32 h-10 rounded-md" />
        </div>
      </div>
    </SpotlightCard>
  );
};

export default SkeletonBookCard;
