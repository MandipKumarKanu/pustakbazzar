import { cn } from "@/lib/utils";
import { motion, useScroll } from "framer-motion";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import React from "react";

export const ScrollProgress = React.forwardRef(
  ({ className, ...props }, ref) => {
    const { scrollYProgress } = useScroll();
    const location = useLocation();

    useEffect(() => {
      scrollYProgress.set(0); 
    }, [location.pathname, scrollYProgress]);

    return (
      <motion.div
        ref={ref}
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-px origin-left bg-gradient-to-r from-[#A97CF8] via-[#F38CB8] to-[#FDCC92]",
          className
        )}
        style={{
          scaleX: scrollYProgress,
        }}
        {...props}
      />
    );
  }
);

ScrollProgress.displayName = "ScrollProgress";
