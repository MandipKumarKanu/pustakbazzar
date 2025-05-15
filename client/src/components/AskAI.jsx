import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Send,
  BookOpen,
  X,
  Bot,
  Sparkles,
  MessageCircle,
  ChevronDown,
  Zap,
  Search,
} from "lucide-react";
import { baseURL } from "../config/axios.js";

const AskAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "ai",
      content:
        "Hi there! I'm PustakAI, your personal book assistant. Ask me about book recommendations, genres, or any book-related questions!",
    },
  ]);
  const suggestionArr = [
    "I'm looking for books under 500 rupees",
    "Like new textbooks",
    "Books by J.K. Rowling",
    "Mystery books",
    "Self-help books",
    "Computer science books",
  ];
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatDialogRef = useRef(null);
  const messageStartRef = useRef(null);

  const scrollToBottom = (delay = 0) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, delay);
  };

  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      scrollToBottom();
    }

    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        chatDialogRef.current &&
        !chatDialogRef.current.contains(event.target) &&
        !event.target.closest('[data-chat-toggle="true"]')
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue("");
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);
    setIsLoading(true);

    setTimeout(() => {
      setIsTyping(true);
      scrollToBottom(100);
    }, 300);

    try {
      const response = await axios.post(`${baseURL}book/ai-book-search`, {
  query: userMessage,
        });

      setIsTyping(false);

      const aiResponse = response.data.results.message;
      const books = response.data.results.books || [];

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: "ai",
            content: aiResponse,
            books: books.length > 0 ? books : null,
          },
        ]);

        setTimeout(() => {
          if (messageStartRef.current) {
            messageStartRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }, 100);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content:
            "Sorry, I encountered an error while processing your request. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const formatCondition = (condition) => {
    if (!condition) return "";
    return condition.charAt(0).toUpperCase() + condition.slice(1);
  };

  const renderBookCard = (book) => (
    <motion.div
      key={book._id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex gap-3 my-2 hover:shadow-md transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-500 group"
    >
      <div className="flex-shrink-0 w-16 h-24 overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300">
        {book.images && book.images.length > 0 ? (
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={book.images[0]}
              alt={book.title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 flex items-center justify-center">
            <BookOpen size={24} className="text-purple-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors duration-300">
          {book.title}
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          by{" "}
          <span className="text-gray-700 dark:text-gray-300">
            {book.author}
          </span>
        </p>

        {book.category && book.category.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {book.category.slice(0, 2).map((cat) => (
              <span
                key={cat._id}
                className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
              >
                {cat.categoryName}
              </span>
            ))}
            {book.category.length > 2 && (
              <span className="text-[10px] px-1 text-purple-500">
                +{book.category.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
              ₹{book.sellingPrice.toLocaleString("en-IN")}
            </span>
            {book.mrp && book.mrp > book.sellingPrice && (
              <span className="text-xs text-gray-500 line-through">
                ₹{book.mrp.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/40 text-purple-800 dark:text-purple-200 font-medium">
            {formatCondition(book.condition)}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-2 text-xs py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <Search size={12} />
          View Details
        </motion.button>
      </div>
    </motion.div>
  );

  const chatContainerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  return (
    <>
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-10 right-6 z-50 bg-gradient-to-tr from-purple-700 to-violet-500 text-white p-4 rounded-full shadow-lg hover:shadow-purple-500/40 transition-all duration-300"
        aria-label="Chat with PustakAI"
        data-chat-toggle="true"
        whileHover={{
          scale: 1.05,
          boxShadow: "0 10px 25px rgba(139, 48, 255, 0.3)",
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="absolute inset-0 rounded-full bg-violet-500 animate-ping opacity-20" />
        <div className="relative">
          <MessageCircle size={24} className="text-white" />
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatDialogRef}
            variants={chatContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-10 right-6 z-50 w-80 md:w-96 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-purple-100 dark:border-purple-900/50"
            style={{ maxHeight: "calc(100dvh - 160px)" }}
          >
            <div className="p-4 border-b border-purple-100 dark:border-purple-900/50 bg-gradient-to-r from-purple-700 via-violet-600 to-purple-700 text-white flex justify-between items-center relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                }}
              ></div>

              <div className="flex items-center gap-3 z-10">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">PustakAI</h3>
                  <p className="text-xs text-purple-200">Your book assistant</p>
                </div>
              </div>
              <motion.button
                onClick={toggleChat}
                className="p-2 rounded-full hover:bg-white/20 transition-colors z-10"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-900 scroll-smooth"
              style={{ 
                maxHeight: "350px",
                scrollBehavior: "smooth" 
              }}
            >
              {messages.map((message, index) => {
                const isLatestAIMessage = 
                  message.type === "ai" && 
                  index === messages.length - 1;
                
                return (
                  <motion.div
                    key={index}
                    ref={isLatestAIMessage ? messageStartRef : null}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    } ${index > 0 ? "mt-1" : ""}`}
                  >
                    {message.type === "ai" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mr-2 self-end mb-2 shadow-sm">
                        <Sparkles size={14} className="text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                        message.type === "user"
                          ? "bg-gradient-to-br from-purple-600 to-violet-700 text-white rounded-br-none"
                          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-purple-100 dark:border-purple-900/30"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>

                      {message.books && message.books.length > 0 && (
                        <motion.div
                          className="mt-5 space-y-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-purple-200 dark:via-purple-800/30 to-transparent"></div>
                            <p className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                              Book Recommendations
                            </p>
                            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-purple-200 dark:via-purple-800/30 to-transparent"></div>
                          </div>
                          <div className="space-y-3 max-h-72 overflow-y-auto pr-2 pt-1 pb-1 custom-scrollbar">
                            {message.books.map((book) => renderBookCard(book))}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {message.type === "user" && (
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center ml-2 self-end mb-2">
                        <div className="w-6 h-6 rounded-full bg-purple-600 dark:bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          U
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {isTyping && (
                <motion.div 
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mr-2 self-end mb-2 shadow-sm">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-bl-none shadow-sm border border-purple-100 dark:border-purple-900/30">
                    <div className="flex space-x-2 items-end h-5">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.4,
                          delay: 0,
                        }}
                        className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-purple-500 to-violet-600"
                      ></motion.div>
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.4,
                          delay: 0.2,
                        }}
                        className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-purple-500 to-violet-600"
                      ></motion.div>
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.4,
                          delay: 0.4,
                        }}
                        className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-purple-500 to-violet-600"
                      ></motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-4 border-t border-purple-100 dark:border-purple-900/30 bg-white dark:bg-gray-800"
            >
              <div className="flex gap-2 items-center relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about books..."
                  className="flex-1 py-3 px-4 border border-purple-200 dark:border-gray-700 rounded-xl bg-purple-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-400"
                  disabled={isLoading}
                />
                <motion.button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="p-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:shadow-md hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={18} className="text-white" />
                </motion.button>
              </div>

              <div className="flex gap-2 mt-2 overflow-x-auto custom-horizontal-scrollbar pb-2 pt-1 px-0.5">
                {suggestionArr.map((suggestion, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => setInputValue(suggestion)}
                    className="flex-shrink-0 px-2.5 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs whitespace-nowrap border border-purple-200 dark:border-purple-800/40"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </form>

            <div className="py-2 px-4 text-center text-xs text-gray-500 dark:text-gray-400 bg-purple-50/50 dark:bg-gray-900/50 border-t border-purple-100 dark:border-purple-900/30">
              <div className="flex items-center justify-center gap-1">
                <Zap size={12} className="text-purple-500" />
                <span>
                  Powered by{" "}
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    PustakAI
                  </span>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AskAI;
