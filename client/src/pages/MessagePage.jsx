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
  FaClock,
  FaCheckCircle,
  FaTimes,
  FaUserCircle,
  FaEnvelopeOpen,
} from "react-icons/fa";
import { customAxios } from "@/config/axios";
import Pagination from "@/components/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMessages();

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
    setSelectedMessage(null);
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
      page: 1,
    });
  };

  const handleCloseContact = async () => {
    if (!selectedMessage) return;

    setSubmitting(true);
    try {
      const response = await customAxios.patch(
        `/contact/${selectedMessage._id}/close`,
        {
          responseMessage: responseText.trim() || undefined,
        }
      );

      if (response.status === 200) {
        toast.success(
          responseText.trim()
            ? "Response sent and message closed successfully!"
            : "Message marked as closed"
        );

        setMessages(
          messages.map((msg) =>
            msg._id === selectedMessage._id
              ? {
                  ...msg,
                  isClosed: true,
                  closedAt: new Date().toISOString(),
                  responseMessage: responseText.trim() || msg.responseMessage,
                }
              : msg
          )
        );

        setSelectedMessage({
          ...selectedMessage,
          isClosed: true,
          closedAt: new Date().toISOString(),
          responseMessage: responseText.trim() || selectedMessage.responseMessage,
        });

        setShowResponseForm(false);
        setResponseText("");
      }
    } catch (error) {
      console.error("Error closing contact:", error);
      toast.error("Failed to process request. Please try again.");
    } finally {
      setSubmitting(false);
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
        msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderMessageStatus = (message) => {
    if (message.isClosed) {
      return (
        <Badge className="flex items-center gap-1 bg-emerald-100 text-emerald-700 border-emerald-200">
          <FaCheckCircle size={10} />
          Closed
        </Badge>
      );
    }
    return (
      <Badge className="flex items-center gap-1 bg-amber-100 text-amber-700 border-amber-200">
        <FaClock size={10} />
        Open
      </Badge>
    );
  };

  const getMessagePreview = (message) => {
    return message.length > 80 ? message.substring(0, 80) + "..." : message;
  };

  if (loading && messages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Messages</h2>
            <p className="text-gray-500">Please wait while we fetch your messages...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredMessages = getFilteredMessages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                  <FaEnvelope className="text-white" size={24} />
                </div>
                Contact Messages
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-3 py-1 text-sm font-medium">
                  {pagination.total}
                </Badge>
              </h1>
              <p className="text-gray-600 mt-1">Manage and respond to customer inquiries</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <select
                  value={filter.isClosed}
                  onChange={handleFilterChange}
                  className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer text-sm font-medium min-w-[160px]"
                >
                  <option value="false">🟡 Open Messages</option>
                  <option value="true">✅ Closed Messages</option>
                  <option value="">📋 All Messages</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm mb-6"
          >
            <div className="flex items-center">
              <FaExclamationCircle className="text-red-500 mr-3" size={24} />
              <div>
                <p className="font-medium">Oops! Something went wrong</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
            <Button
              onClick={fetchMessages}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white"
            >
              Try Again
            </Button>
          </motion.div>
        ) : filteredMessages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white shadow-lg rounded-2xl p-16 text-center"
          >
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
              <FaEnvelopeOpen className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm
                ? "No matching messages found"
                : filter.isClosed === "false"
                ? "No open messages"
                : filter.isClosed === "true"
                ? "No closed messages"
                : "No messages yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? "Try adjusting your search terms"
                : "When customers contact you, their messages will appear here"}
            </p>
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm("")}
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                Clear Search
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="flex flex-col lg:flex-row h-[calc(100vh-280px)]">
              {/* Messages List */}
              {(!mobileView || showMessageList) && (
                <div className="w-full lg:w-2/5 border-r border-gray-200 overflow-hidden flex flex-col">
                  {/* Search Header */}
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="relative">
                      <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        type="text"
                        placeholder="Search messages by name, email, or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Messages List */}
                  <ScrollArea className="flex-grow">
                    <AnimatePresence>
                      {filteredMessages.map((message, index) => (
                        <motion.div
                          key={message._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          onClick={() => handleViewMessage(message)}
                          className={`border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 ${
                            selectedMessage?._id === message._id
                              ? "bg-gradient-to-r from-purple-100 to-blue-100 border-l-4 border-l-purple-500"
                              : ""
                          }`}
                        >
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-lg">
                                  {message.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 text-sm">
                                    {message.name}
                                  </h3>
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <FaCalendarAlt size={10} />
                                    {formatDate(message.createdAt)}
                                  </p>
                                </div>
                              </div>
                              {renderMessageStatus(message)}
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <FaEnvelope className="text-gray-400" size={12} />
                                <p className="text-xs text-gray-600 truncate">
                                  {message.email}
                                </p>
                              </div>
                              
                              <p className="font-medium text-gray-800 text-sm line-clamp-1">
                                {message.subject || "No subject"}
                              </p>
                              
                              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                {getMessagePreview(message.message)}
                              </p>
                            </div>

                            {message.responseMessage && (
                              <div className="mt-3 p-2 bg-emerald-50 rounded-lg border-l-2 border-emerald-300">
                                <p className="text-xs text-emerald-700 font-medium">✓ Responded</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </ScrollArea>

                  {/* Pagination */}
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

              {/* Message Detail View */}
              {(!mobileView || !showMessageList) && (
                <div className="w-full lg:w-3/5 bg-gray-50 flex flex-col">
                  {selectedMessage ? (
                    <ScrollArea className="flex-grow">
                      {/* Mobile Back Button */}
                      {mobileView && (
                        <div className="p-4 bg-white border-b border-gray-200">
                          <Button
                            onClick={handleBackToList}
                            variant="ghost"
                            className="flex items-center text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            <FaChevronLeft className="mr-2" size={14} />
                            Back to Messages
                          </Button>
                        </div>
                      )}

                      <div className="p-8">
                        {/* Message Header */}
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                              {selectedMessage.subject || "No Subject"}
                            </h2>
                            <div className="flex items-center gap-2">
                              {renderMessageStatus(selectedMessage)}
                              {selectedMessage.isClosed && selectedMessage.closedAt && (
                                <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                                  Closed {formatDate(selectedMessage.closedAt)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {!selectedMessage.isClosed && (
                            <div className="flex gap-3">
                              <Button
                                onClick={() => setShowResponseForm(!showResponseForm)}
                                size="sm"
                                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg"
                              >
                                <FaReply className="mr-2" size={14} />
                                {showResponseForm ? "Cancel Reply" : "Reply & Close"}
                              </Button>
                              
                              {!showResponseForm && (
                                <Button
                                  onClick={handleCloseContact}
                                  size="sm"
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
                                  disabled={submitting}
                                >
                                  <FaCheck className="mr-2" size={14} />
                                  {submitting ? "Closing..." : "Mark Closed"}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Sender Information */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                              {selectedMessage.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {selectedMessage.name}
                              </h3>
                              <a
                                href={`mailto:${selectedMessage.email}`}
                                className="text-purple-600 hover:text-purple-700 hover:underline flex items-center gap-2"
                              >
                                <FaEnvelope size={14} />
                                {selectedMessage.email}
                              </a>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-gray-600 text-sm">
                            <FaCalendarAlt className="mr-2" size={14} />
                            Sent on {formatDate(selectedMessage.createdAt)}
                          </div>
                        </div>

                        {/* Original Message */}
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                            <FaUserCircle className="text-purple-500" />
                            Customer Message
                          </h3>
                          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 whitespace-pre-wrap leading-relaxed">
                            {selectedMessage.message}
                          </div>
                        </div>

                        {/* Existing Response */}
                        {selectedMessage.responseMessage && (
                          <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                              <FaCheckCircle className="text-emerald-500" />
                              Your Response
                            </h3>
                            <div className="bg-emerald-50 p-6 rounded-xl shadow-sm border-l-4 border-emerald-500 whitespace-pre-wrap leading-relaxed">
                              {selectedMessage.responseMessage}
                            </div>
                          </div>
                        )}

                        {/* Response Form */}
                        {showResponseForm && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                          >
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                              <FaPaperPlane className="text-blue-500" />
                              Write Your Response
                            </h3>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                              <Textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="Type your response here... This will be sent to the customer via email and the message will be marked as closed."
                                className="w-full min-h-[200px] focus:ring-purple-500 focus:border-purple-500 border-gray-200 resize-none"
                              />
                              <div className="mt-6 flex justify-end gap-3">
                                <Button
                                  onClick={() => setShowResponseForm(false)}
                                  variant="outline"
                                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                  disabled={submitting}
                                >
                                  <FaTimes className="mr-2" size={14} />
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleCloseContact}
                                  disabled={!responseText.trim() || submitting}
                                  className={`bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg ${
                                    (!responseText.trim() || submitting) && "opacity-50 cursor-not-allowed"
                                  }`}
                                >
                                  {submitting ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      <FaPaperPlane className="mr-2" size={14} />
                                      Send & Close
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="h-full flex items-center justify-center p-12 text-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mx-auto h-32 w-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center text-purple-500 mb-6">
                          <FaEnvelopeOpen size={48} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          Select a Message
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                          Choose a message from the list to view details, respond to inquiries, and manage customer communications.
                        </p>
                      </motion.div>
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
