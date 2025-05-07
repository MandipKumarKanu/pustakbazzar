import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FaChevronDown } from "react-icons/fa";
import parse from "html-react-parser";

const ShrinkDescription = ({ desc, maxHeight = 400 }) => {
  const [expanded, setExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      setNeedsTruncation(contentHeight > maxHeight);
    }
  }, []);

  return (
    <div className="relative mb-8">
      <div
        ref={contentRef}
        style={{
          maxHeight: !expanded && needsTruncation ? `${maxHeight}px` : "none",
          overflow: !expanded && needsTruncation ? "hidden" : "visible",
          position: "relative",
        }}
        className="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert"
      >
        {parse(desc)}
      </div>

      {needsTruncation && !expanded && (
        <div
          className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          // style={{
          //   position: "absolute",
          //   bottom: 0,
          //   left: 0,
          //   right: 0,
          //   height: "80px",
          //   background:
          //     "linear-gradient(to top, var(--background), transparent)",
          //   pointerEvents: "none",
          // }}
        />
      )}

      {needsTruncation && (
        <div className="flex justify-center mt-4">
          <Button
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="group hover:bg-accent/50 transition-colors duration-300"
          >
            <span className="flex items-center gap-2 text-lg">
              {expanded ? "Show Less" : "Read Full Blog"}
              <FaChevronDown
                className={`w-4 h-4 transition-transform duration-300 group-hover:translate-y-1 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShrinkDescription;
