import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

const AutocompleteInput = ({
  suggestions = [],
  authors = [],
  value,
  onChange,
  error,
  register,
  name = "autocomplete",
  placeholder = "Type or select an option",
  label = "Select from suggestions or continue typing",
  icon = null,
  hintText = "Continue with",
  optionsOnly = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [customError, setCustomError] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const isInternalUpdate = useRef(false);
  const allSuggestions = authors.length > 0 ? authors : suggestions;

  useEffect(() => {
    if (inputValue.trim() !== "") {
      const filtered = allSuggestions
        .filter((item) => item.toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 6);
      setFilteredSuggestions(filtered);

      if (optionsOnly && filtered.length === 0 && inputValue.trim() !== "") {
        setCustomError("Please select a valid option from the list");
      } else {
        setCustomError(null);
      }
    } else {
      setFilteredSuggestions(allSuggestions.slice(0, 6));
      setCustomError(null);
    }
  }, [inputValue, allSuggestions, optionsOnly]);

  useEffect(() => {
    if (value !== inputValue && !isInternalUpdate.current) {
      setInputValue(value || "");
    }
    isInternalUpdate.current = false;
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !dropdownRef.current?.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setIsOpen(false);

        if (optionsOnly && inputValue.trim() !== "") {
          validateOptionOnlyInput();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [optionsOnly, inputValue, allSuggestions]);

  const validateOptionOnlyInput = () => {
    if (optionsOnly && inputValue.trim() !== "") {
      const isValid = allSuggestions.some(
        (item) => item.toLowerCase() === inputValue.toLowerCase()
      );

      if (!isValid) {
        setCustomError("Please select a valid option from the list");
      } else {
        setCustomError(null);
      }
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    isInternalUpdate.current = true;

    if (
      !optionsOnly ||
      newValue.trim() === "" ||
      allSuggestions.some((item) =>
        item.toLowerCase().includes(newValue.toLowerCase())
      )
    ) {
      onChange(newValue);
    }
  };

  const handleSelect = (suggestion) => {
    isInternalUpdate.current = true;

    setInputValue(suggestion);
    onChange(suggestion);
    setIsOpen(false);
    setCustomError(null);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);

      if (optionsOnly && e.key === "Enter") {
        validateOptionOnlyInput();
      }
    }
  };

  const registerProps = register ? register(name) : {};

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={(el) => {
            inputRef.current = el;
            if (registerProps.ref) {
              registerProps.ref(el);
            }
          }}
          {...registerProps}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() =>
            setTimeout(() => {
              setIsOpen(false);
              if (optionsOnly) validateOptionOnlyInput();
            }, 200)
          }
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10 ${
            error || customError
              ? "border-red-500 ring-1 ring-red-500"
              : "border-gray-300"
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

      {customError && (
        <p className="text-red-500 text-xs mt-1">{customError}</p>
      )}

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-99999 w-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95"
        >
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 font-medium">
              {optionsOnly ? "Select an option from the list" : label}
            </p>
          </div>

          {filteredSuggestions.length > 0 ? (
            <ul className="py-1">
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSelect(suggestion)}
                  className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm flex items-center gap-2"
                >
                  {icon || <Search className="h-4 w-4 text-blue-500" />}
                  <span className="text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 justify-center p-3 text-sm text-blue-600 bg-blue-50 border-t border-blue-100">
              <span className="font-medium">
                {optionsOnly
                  ? "No matching options"
                  : `${hintText} "${inputValue}"`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
