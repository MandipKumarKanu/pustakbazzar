import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaCheck,
  FaReply,
  FaFilter,
  FaSearch,
  FaPaperPlane,
  FaChevronLeft,
  FaExclamationCircle,
} from "react-icons/fa";
import { customAxios } from "@/config/axios";
import Pagination from "@/components/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const MessagePage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState({ isClosed: "false" });
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [responseText, setResponseText] = useState("");
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [showMessageList, setShowMessageList] = useState(true);

  useEffect(() => {
    fetchMessages();

    // Handle responsive view
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [filter, pagination.page, pagination.limit]);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filter,
      });

      const response = await customAxios.get(`/contact?${params}`);

      if (response.status === 200) {
        setMessages(response.data.contacts || []);
        setPagination(response.data.pagination);
      } else {
        throw new Error("Failed to fetch messages");
      }

      setError(null);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages. Please try again later.");
      toast.error("Could not load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowResponseForm(false);
    setResponseText("");

    if (mobileView) {
      setShowMessageList(false);
    }
  };

  const handleBackToList = () => {
    setShowMessageList(true);
  };

  const handlePageChange = (page) => {
    setPagination({
      ...pagination,
      page: page,
    });
  };

  const handleFilterChange = (e) => {
    const newFilter = {
      ...filter,
      isClosed: e.target.value,
    };
    setFilter(newFilter);
    setPagination({
      ...pagination,
      page: 1, // Reset to first page when changing filters
    });
  };

  const handleCloseContact = async () => {
    if (!selectedMessage) return;

    try {
      const response = await customAxios.patch(
        `/contact/${selectedMessage._id}/close`,
        {
          responseMessage: responseText || undefined,
        }
      );

      if (response.status === 200) {
        toast.success("Message marked as closed");

        // Update the messages list
        setMessages(
          messages.map((msg) =>
            msg._id === selectedMessage._id
              ? {
                  ...msg,
                  isClosed: true,
                  responseMessage: responseText || msg.responseMessage,
                }
              : msg
          )
        );

        // Update selected message
        setSelectedMessage({
          ...selectedMessage,
          isClosed: true,
          responseMessage: responseText || selectedMessage.responseMessage,
        });

        setShowResponseForm(false);
        setResponseText("");
      }
    } catch (error) {
      console.error("Error closing contact:", error);
      toast.error("Failed to close message");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getFilteredMessages = () => {
    if (!searchTerm) return messages;

    return messages.filter(
      (msg) =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.subject &&
          msg.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderMessageStatus = (message) => {
    if (message.isClosed) {
      return (
        <Badge
          variant="success"
          className="flex items-center gap-1 capitalize bg-green-100 text-green-800"
        >
          <FaCheck size={10} />
          Closed
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        Open
      </Badge>
    );
  };

  if (loading && messages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Contact Messages
          </h1>
          <div className="bg-white shadow-lg rounded-xl p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-3 text-lg text-gray-700">
              Loading messages...
            </span>
          </div>
        </div>
      </div>
    );
  }

  const filteredMessages = getFilteredMessages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            Contact Messages
            <Badge className="ml-2 bg-primary text-white px-3 py-1 rounded-full">
              {pagination.total}
            </Badge>
          </h1>

          <div className="flex space-x-3">
            <div className="relative">
              <FaFilter className="absolute left-3 top-3 text-gray-400" />
              <select
                value={filter.isClosed}
                onChange={handleFilterChange}
                className="pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer text-sm"
              >
                <option value="false">Open Messages</option>
                <option value="true">Closed Messages</option>
                <option value="">All Messages</option>
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <FaExclamationCircle className="text-red-500 mr-3" size={24} />
              <p className="font-medium">{error}</p>
            </div>
            <Button
              onClick={fetchMessages}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white"
            >
              Try Again
            </Button>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="bg-white shadow-lg rounded-xl p-12 text-center">
            <FaEnvelope className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-xl text-gray-500 font-medium">
              {searchTerm
                ? "No messages match your search"
                : filter.isClosed === "false"
                ? "No open messages found"
                : filter.isClosed === "true"
                ? "No closed messages found"
                : "No messages found"}
            </p>
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm("")}
                variant="ghost"
                className="mt-4 text-primary hover:text-primary-foreground hover:bg-primary/20"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="flex flex-col md:flex-row h-[calc(100vh-250px)]">
              {/* Messages List */}
              {(!mobileView || showMessageList) && (
                <div className="w-full md:w-2/5 border-r border-gray-200 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-3 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  <ScrollArea className="flex-grow">
                    <AnimatePresence>
                      {filteredMessages.map((message) => (
                        <motion.div
                          key={message._id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => handleViewMessage(message)}
                          className={`border-b border-gray-200 cursor-pointer transition-all duration-200 hover:bg-primary/5 ${
                            selectedMessage?._id === message._id
                              ? "bg-primary/10 border-l-4 border-l-primary"
                              : ""
                          }`}
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-primary flex items-center justify-center text-white font-medium shadow-md">
                                  {message.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-3">
                                  <h3 className="font-medium text-gray-900">
                                    {message.name}
                                  </h3>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(message.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <div>{renderMessageStatus(message)}</div>
                            </div>
                            <div className="mt-2">
                              <p className="font-medium text-gray-800">
                                {message.subject || "No subject"}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {message.message}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </ScrollArea>

                  {pagination.pages > 1 && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.pages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Message Content */}
              {(!mobileView || !showMessageList) && (
                <div className="w-full md:w-3/5 bg-gray-50 flex flex-col">
                  {selectedMessage ? (
                    <ScrollArea className="flex-grow">
                      {mobileView && (
                        <Button
                          onClick={handleBackToList}
                          variant="ghost"
                          className="m-4 flex items-center text-primary hover:text-primary-foreground hover:bg-primary/20"
                        >
                          <FaChevronLeft className="mr-1" />
                          Back to Messages
                        </Button>
                      )}

                      <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                          <h2 className="text-xl font-bold text-gray-900">
                            {selectedMessage.subject || "No Subject"}
                          </h2>
                          <div className="flex space-x-2">
                            {!selectedMessage.isClosed && (
                              <Button
                                onClick={() =>
                                  setShowResponseForm(!showResponseForm)
                                }
                                size="icon"
                                className="p-2 rounded-full bg-primary hover:bg-primary/90 text-white transition-colors duration-200"
                                title="Reply and close"
                              >
                                <FaReply />
                              </Button>
                            )}
                            {!selectedMessage.isClosed && !showResponseForm && (
                              <Button
                                onClick={handleCloseContact}
                                size="icon"
                                className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors duration-200"
                                title="Mark as closed"
                              >
                                <FaCheck />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-primary flex items-center justify-center text-white font-medium shadow-md">
                                {selectedMessage.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <span className="font-medium text-gray-900">
                                  {selectedMessage.name}
                                </span>
                                <a
                                  href={`mailto:${selectedMessage.email}`}
                                  className="block text-sm text-primary hover:underline"
                                >
                                  {selectedMessage.email}
                                </a>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <FaCalendarAlt className="text-gray-500 mr-2" />
                              <span className="text-gray-600 text-sm">
                                {formatDate(selectedMessage.createdAt)}
                              </span>
                            </div>

                            {selectedMessage.isClosed && (
                              <div className="flex items-center">
                                <Badge
                                  variant="success"
                                  className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800"
                                >
                                  <FaCheck className="mr-1" />
                                  Closed on{" "}
                                  {formatDate(selectedMessage.closedAt)}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mb-6">
                          <h3 className="text-lg font-medium mb-3 text-gray-900">
                            Message
                          </h3>
                          <div className="bg-white p-6 rounded-xl shadow-sm whitespace-pre-wrap border-l-4 border-primary">
                            {selectedMessage.message}
                          </div>
                        </div>

                        {selectedMessage.responseMessage && (
                          <div className="mb-6">
                            <h3 className="text-lg font-medium mb-3 text-gray-900">
                              Response
                            </h3>
                            <div className="bg-green-50 p-6 rounded-xl shadow-sm whitespace-pre-wrap border-l-4 border-green-500">
                              {selectedMessage.responseMessage}
                            </div>
                          </div>
                        )}

                        {showResponseForm && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                          >
                            <h3 className="text-lg font-medium mb-3 text-gray-900">
                              Your Response
                            </h3>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                              <Textarea
                                value={responseText}
                                onChange={(e) =>
                                  setResponseText(e.target.value)
                                }
                                placeholder="Enter your response..."
                                className="w-full min-h-[150px] focus:ring-primary focus:border-primary"
                              />
                              <div className="mt-4 flex justify-end space-x-3">
                                <Button
                                  onClick={() => setShowResponseForm(false)}
                                  variant="outline"
                                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleCloseContact}
                                  disabled={!responseText.trim()}
                                  className={`flex items-center ${
                                    !responseText.trim() &&
                                    "opacity-50 cursor-not-allowed"
                                  }`}
                                >
                                  <FaPaperPlane className="mr-2" size={14} />
                                  Send & Close
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="h-full flex items-center justify-center p-10 text-center">
                      <div>
                        <div className="mx-auto h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <FaEnvelope size={40} />
                        </div>
                        <h3 className="mt-4 text-xl font-medium text-gray-900">
                          Select a message to view
                        </h3>
                        <p className="mt-2 text-gray-500 max-w-md mx-auto">
                          Click on a message from the list to view its details
                          and respond to inquiries.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagePage;
