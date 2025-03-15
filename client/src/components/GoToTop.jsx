import React, { useState, useEffect } from "react";
import { useSpring, animated, config } from "react-spring";

const GotoTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const buttonAnimation = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible
      ? "translate3d(0,0px,0) rotate(0deg)"
      : "translate3d(0,50px,0) rotate(180deg)",
    config: config.wobbly,
  });

  const gotoTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const listenToScroll = () => {
    const heightToHidden = 250;
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    setIsVisible(winScroll > heightToHidden);
  };

  useEffect(() => {
    window.addEventListener("scroll", listenToScroll);
    return () => window.removeEventListener("scroll", listenToScroll);
  }, []);

  return (
    <animated.button
      style={buttonAnimation}
      className="goto-top-btn fixed bottom-8 right-8 z-50 flex items-center justify-center focus:outline-none"
      onClick={gotoTop}
    >
      <div className="rocket w-6 h-6">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4.5 16.5C3 15.5 3 14.5 3 12C3 8 12 3 12 3C12 3 21 8 21 12C21 14.5 21 15.5 19.5 16.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 3V15"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.5 16.5L12 21L4.5 16.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="tooltip">Back to Top</span>
    </animated.button>
  );
};

export default GotoTop;
