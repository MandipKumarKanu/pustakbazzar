import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, User } from "lucide-react";

const AuthorAutocomplete = ({ authors, value, onChange, error, register }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (inputValue.trim() !== "") {
      const filtered = authors
        .filter((author) =>
          author.toLowerCase().includes(inputValue.toLowerCase())
        )
        .slice(0, 6);
      setFilteredAuthors(filtered);
    } else {
      setFilteredAuthors(authors.slice(0, 6));
    }
  }, [inputValue, authors]);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !dropdownRef.current?.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleSelect = (author) => {
    setInputValue(author);
    onChange(author);
    setIsOpen(false);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          {...register("author")}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Enter author name"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10 ${
            error ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
          }`}
          autoComplete="off"
        />
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95"
        >
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 font-medium">
              Type any author name or select from suggestions
            </p>
          </div>

          {filteredAuthors.length > 0 ? (
            <ul className="py-1">
              {filteredAuthors.map((author, index) => (
                <li
                  key={index}
                  onClick={() => handleSelect(author)}
                  className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm flex items-center gap-2"
                >
                  <User className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-700">{author}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 justify-center p-3 text-sm text-blue-600 bg-blue-50 border-t border-blue-100">
              <span className="font-medium">Continue with "{inputValue}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthorAutocomplete;
