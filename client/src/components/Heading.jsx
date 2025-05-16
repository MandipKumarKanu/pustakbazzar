import React, { useEffect, useRef } from "react";

const HeadingText = ({
  fullName = "Featured Books",
  bgName = "FEATURED",
  fullNameStyle = "",
  bgNameStyle = "",
  color = "gray-300",
  highlight = false,
}) => {
  const containerRef = useRef(null);
  const bgTextRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && bgTextRef.current) {
        bgTextRef.current.style.transform = "none";

        const containerWidth = containerRef.current.offsetWidth;
        const bgTextWidth = bgTextRef.current.offsetWidth;

        const scale = (containerWidth / bgTextWidth) * 0.85;

        bgTextRef.current.style.transform = `scale(${Math.min(scale, 1)})`;

        if (scale < 1 && bgTextWidth * scale > containerWidth) {
          const overflow = (bgTextWidth * scale - containerWidth) / 2;
          bgTextRef.current.style.transform = `scale(${scale}) translateX(-${overflow}px)`;
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const timeoutId = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${fullNameStyle} h-[22vw] min-h-[120px] max-h-[220px] mt-6 sm:mt-8 md:mt-10 overflow-hidden`}
    >
      <div
        ref={bgTextRef}
        className={`absolute ${bgNameStyle} text-[12vw] text-${color} opacity-40 font-suntage uppercase tracking-wider whitespace-nowrap transition-transform duration-500 ease-in-out origin-center`}
        style={{ willChange: "transform" }}
      >
        {bgName}
      </div>
      <div
        className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold relative z-10 text-center font-sfpro uppercase px-4 ${
          highlight
            ? "bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600"
            : ""
        }`}
      >
        {fullName}
      </div>
    </div>
  );
};

export default HeadingText;
