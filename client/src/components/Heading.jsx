import React, { useEffect, useRef } from "react";

const HeadingText = ({
  fullName = "Featured Books",
  bgName = "FEATURED",
  fullNameStyle = "",
  bgNameStyle = "",
}) => {
  const containerRef = useRef(null);
  const bgTextRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && bgTextRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const bgTextWidth = bgTextRef.current.offsetWidth;
        const scale = (containerWidth / bgTextWidth) * 0.9;
        bgTextRef.current.style.transform = `scale(${Math.min(scale, 1)})`;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${fullNameStyle} h-[22vw] min-h-[120px] max-h-[220px] mt-6 sm:mt-8 md:mt-10 overflow-hidden`}
    >
      <div
        ref={bgTextRef}
        className={`absolute ${bgNameStyle} text-[12vw] text-gray-300 opacity-40 font-suntage uppercase tracking-wider whitespace-nowrap transition-transform duration-300 ease-in-out origin-center`}
        style={{ willChange: "transform" }}
      >
        {bgName}
      </div>
      <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold relative z-10 text-center font-sfpro uppercase px-4 transition-all duration-300 ease-in-out">
        {fullName}
      </div>
    </div>
  );
};

export default HeadingText;
