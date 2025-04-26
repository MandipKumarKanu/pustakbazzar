import React, { useEffect, useState, useCallback } from "react";
import {
  changeDonationStatus,
  getAllDonation,
  getPendingDonation,
} from "@/api/donation";
import {
  Package,
  User,
  X,
  Book,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { FiCheck } from "react-icons/fi";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";

// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Dialog component - remains mostly the same
const DonationDetailsDialog = ({ donation, onClose, onAccept, onReject }) => {
  const [activeTab, setActiveTab] = useState("details");
  const donationStatus = donation?.status || "pending";

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 font-medium text-sm rounded-t-lg flex items-center space-x-2 ${
        activeTab === id
          ? "bg-white text-indigo-600 border-b-2 border-indigo-600"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl animate-in fade-in duration-300">
        {/* Dialog header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Donation #{donation._id.slice(-6)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 p-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="border-b">
          <div className="flex px-6">
            <TabButton id="details" label="Donation Details" icon={Package} />
            <TabButton id="book" label="Book Info" icon={Book} />
            <TabButton id="donor" label="Donor Info" icon={User} />
          </div>
        </div>

        {/* Tab content */}
        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          {/* Details tab content */}
          {activeTab === "details" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <Badge
                  className={
                    donationStatus === "approved"
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      : donationStatus === "rejected"
                      ? "bg-rose-100 text-rose-800 hover:bg-rose-200"
                      : donationStatus === "completed"
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  }
                >
                  {donationStatus.charAt(0).toUpperCase() +
                    donationStatus.slice(1)}
                </Badge>
              </div>
              {donation.message && (
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Message:</span>
                  <span className="text-gray-800 capitalize max-w-[70%] text-right">
                    {donation.message || "No message provided"}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Date:</span>
                <span>{formatDate(donation.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Donation ID:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded select-all">
                  {donation._id}
                </span>
              </div>
            </div>
          )}

          {/* Book tab content */}
          {activeTab === "book" && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                <div className="w-24 h-24 rounded-lg overflow-hidden">
                  <img
                    src={donation.book.images[0]}
                    alt={donation.book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-lg">{donation.book.title}</p>
                  <p className="text-sm text-gray-600">
                    by {donation.book.author || "Unknown Author"}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                      Published: {donation.book.publishYear || "N/A"}
                    </span>
                    <span className="text-xs capitalize bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                      Condition: {donation.book.condition || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <div
                  className="bg-gray-50 p-4 rounded-lg text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      donation.book.description ||
                      "<p>No description available</p>",
                  }}
                />
              </div>
            </div>
          )}

          {/* Donor tab content */}
          {activeTab === "donor" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                {donation?.donor?.profile?.profileImg ? (
                  <img
                    src={donation.donor.profile.profileImg}
                    alt="Donor"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                    <User size={32} />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">
                    {donation.donor?.profile?.firstName || "Anonymous"}{" "}
                    {donation.donor?.profile?.lastName || "Donor"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    @{donation.donor?.profile?.userName || "anonymous"}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">
                  {donation.donor?.profile?.email || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Member since:</span>
                <span>{formatDate(donation.donor?.createdAt)}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total donations:</span>
                <span className="font-medium">
                  {donation.donor?.donated?.length || 0}
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg mt-4">
                <h3 className="font-medium mb-2 text-sm text-gray-500 uppercase tracking-wide">
                  Additional Information
                </h3>
                <p className="text-gray-700 flex justify-between">
                  <span>Donor ID:</span>
                  <span className="font-mono text-sm">
                    {donation.donor?._id || "N/A"}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons for pending donations */}
        {donationStatus === "pending" && (
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex space-x-2 justify-end">
              <button
                onClick={() => onReject(donation)}
                className="bg-white border border-rose-500 text-rose-600 py-2 px-4 rounded-lg hover:bg-rose-50 transition-colors"
              >
                Reject Donation
              </button>
              <button
                onClick={() => onAccept(donation)}
                className="bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Accept Donation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main component
const DonationPending = () => {
  // Use search params for filter persistence
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [loading, setLoading] = useState(false);
  const [donations, setDonations] = useState([]);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "pending"
  );
  const [message, setMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("status", statusFilter);
    params.set("page", currentPage.toString());
    setSearchParams(params);
  }, [statusFilter, currentPage, setSearchParams]);

  // Fetch donations based on filters
  const fetchDonations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response;

      // Use the appropriate endpoint based on the status filter
      if (statusFilter === "pending") {
        response = await getPendingDonation(currentPage, limit);
      } else {
        response = await getAllDonation(currentPage, limit, statusFilter);
      }

      setDonations(response.data.donations || []);

      // Set pagination info
      const pagination = response.data.pagination;
      setTotalPages(pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching donations:", error);
      setError("Failed to fetch donations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage, limit]);

  // Fetch donations when dependencies change
  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle status filter change
  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  // Handle view details
  const handleViewDetails = (donation) => {
    setSelectedDonation(donation);
    setIsDialogOpen(true);
  };

  // Accept donation
  const handleAcceptDonation = async () => {
    if (!selectedDonation?._id) {
      toast.error("No donation selected");
      return;
    }

    try {
      setLoading(true);
      await changeDonationStatus(selectedDonation._id, "approved");

      // Update local state for immediate UI feedback
      const updatedDonation = { ...selectedDonation, status: "approved" };
      setDonations((prevDonations) =>
        prevDonations.map((donation) =>
          donation._id === selectedDonation._id ? updatedDonation : donation
        )
      );

      toast.success("Donation accepted successfully!");

      // If we're filtering by "pending", refetch to get new pending items
      if (statusFilter === "pending") {
        fetchDonations();
      }
    } catch (error) {
      console.error("Error accepting donation:", error);
      toast.error("Failed to accept donation. Please try again.");
    } finally {
      setIsAcceptDialogOpen(false);
      setIsDialogOpen(false);
      setLoading(false);
    }
  };

  // Reject donation
  const handleRejectDonation = async () => {
    if (!selectedDonation?._id) {
      toast.error("No donation selected");
      return;
    }

    if (!message.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setLoading(true);
      await changeDonationStatus(selectedDonation._id, "rejected", message);

      // Update local state
      const updatedDonation = {
        ...selectedDonation,
        status: "rejected",
        message,
      };
      setDonations((prevDonations) =>
        prevDonations.map((donation) =>
          donation._id === selectedDonation._id ? updatedDonation : donation
        )
      );

      toast.success("Donation rejected successfully");

      // If we're filtering by "pending", refetch to get new pending items
      if (statusFilter === "pending") {
        fetchDonations();
      }
    } catch (error) {
      console.error("Error rejecting donation:", error);
      toast.error("Failed to reject donation. Please try again.");
    } finally {
      setIsRejectDialogOpen(false);
      setIsDialogOpen(false);
      setMessage("");
      setLoading(false);
    }
  };

  // Mark as completed
  const handleMarkAsCompleted = async (donationId) => {
    try {
      setLoading(true);
      await changeDonationStatus(donationId, "completed");

      // Update local state
      setDonations((prevDonations) =>
        prevDonations.map((donation) =>
          donation._id === donationId
            ? { ...donation, status: "completed" }
            : donation
        )
      );

      toast.success("Donation marked as completed!");

      // If we're filtering by "approved", refetch to get new approved items
      if (statusFilter === "approved") {
        fetchDonations();
      }
    } catch (error) {
      toast.error("Failed to update donation status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render table header
  const renderTableHeader = () => {
    return (
      <thead>
        <tr className="bg-gray-100">
          <th className="px-4 py-3 text-left">Donation ID</th>
          <th className="px-4 py-3 text-left">Date</th>
          <th className="px-4 py-3 text-left">Book</th>
          <th className="px-4 py-3 text-left">Donor</th>
          <th className="px-4 py-3 text-left">Status</th>
          <th className="px-4 py-3 text-left">Actions</th>
        </tr>
      </thead>
    );
  };

  // Render table row
  const renderTableRow = (donation) => {
    return (
      <tr key={donation._id} className="border-b hover:bg-gray-50">
        <td className="px-4 py-3 font-medium">#{donation._id.slice(-6)}</td>
        <td className="px-4 py-3 text-sm">{formatDate(donation.createdAt)}</td>
        <td className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <img
              src={donation.book.images[0]}
              alt={donation.book.title}
              className="w-10 h-10 object-cover rounded-md"
            />
            <div className="hidden md:block">
              <p className="font-medium text-sm line-clamp-1">
                {donation.book.title}
              </p>
              <p className="text-xs text-gray-500">
                by {donation.book.author || "Unknown"}
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm">
          {donation?.donor?.profile?.userName || "Anonymous"}
        </td>
        <td className="px-4 py-3">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              donation.status === "pending"
                ? "bg-amber-100 text-amber-800"
                : donation.status === "approved"
                ? "bg-emerald-100 text-emerald-800"
                : donation.status === "completed"
                ? "bg-blue-100 text-blue-800"
                : "bg-rose-100 text-rose-800"
            }`}
          >
            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewDetails(donation)}
              className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200 transition-colors"
            >
              View
            </button>

            {donation.status === "pending" && (
              <>
                <button
                  onClick={() => {
                    setSelectedDonation(donation);
                    setIsAcceptDialogOpen(true);
                  }}
                  className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded hover:bg-emerald-200 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => {
                    setSelectedDonation(donation);
                    setIsRejectDialogOpen(true);
                  }}
                  className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded hover:bg-rose-200 transition-colors"
                >
                  Reject
                </button>
              </>
            )}

            {donation.status === "approved" && (
              <button
                onClick={() => handleMarkAsCompleted(donation._id)}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                title="Mark as Completed"
              >
                <FiCheck size={14} />
                <span>Complete</span>
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // Pagination component
  const Pagination = () => {
    // Only show if multiple pages
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center mt-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              // Show first page, last page, current page, and pages adjacent to current page
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                (page === currentPage - 2 && currentPage > 3) ||
                (page === currentPage + 2 && currentPage < totalPages - 2)
              ) {
                // Show ellipsis for pages that are not shown
                return (
                  <span key={page} className="px-2">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-gray-900 transition-colors duration-300 bg-gray-50">
      <div className="max-w-[1450px] mx-auto px-4 py-8">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Book Donations</h1>

          <div className="flex items-center space-x-4 self-end">
            {/* Status filter tabs */}
            <Tabs
              defaultValue="pending"
              value={statusFilter}
              onValueChange={handleStatusChange}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Refresh button */}
            <button
              onClick={fetchDonations}
              className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
              title="Refresh donations"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Content section */}
        {loading ? (
          // Loading state
          <div className="w-full bg-white rounded-lg border p-4 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <Skeleton height={30} width={200} />
              <Skeleton height={30} width={120} />
            </div>
            <Skeleton height={50} className="mb-2" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} height={60} className="mb-2" />
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="bg-white rounded-lg border p-8 shadow-sm text-center">
            <div className="text-rose-500 mb-4">
              <X size={48} className="mx-auto" />
            </div>
            <p className="text-rose-600 text-lg mb-4">{error}</p>
            <button
              onClick={fetchDonations}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : donations.length === 0 ? (
          // Empty state
          <div className="h-[60dvh] flex justify-center items-center text-center bg-white rounded-lg border shadow-sm">
            <div>
              <Book className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
              <p className="text-xl font-medium">No donations found</p>
              {statusFilter !== "all" && (
                <p className="text-gray-500 mt-2 mb-4">
                  No {statusFilter} donations available
                </p>
              )}
              <button
                onClick={() => handleStatusChange("all")}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                View All Donations
              </button>
            </div>
          </div>
        ) : (
          // Table view
          <div className="overflow-x-auto rounded-lg border shadow bg-white">
            <table className="w-full">
              {renderTableHeader()}
              <tbody>
                {donations.map((donation) => renderTableRow(donation))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination />
      </div>

      {/* Details dialog */}
      {isDialogOpen && selectedDonation && (
        <DonationDetailsDialog
          donation={selectedDonation}
          onClose={() => setIsDialogOpen(false)}
          onAccept={() => {
            setIsDialogOpen(false);
            setIsAcceptDialogOpen(true);
          }}
          onReject={() => {
            setIsDialogOpen(false);
            setIsRejectDialogOpen(true);
          }}
        />
      )}

      {/* Accept confirmation dialog */}
      {isAcceptDialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white text-gray-900 rounded-lg p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-semibold mb-2">Accept Donation</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to accept this book donation?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAcceptDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:opacity-80 transition-opacity"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptDonation}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Accept"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject confirmation dialog */}
      {isRejectDialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white text-gray-900 rounded-lg p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-semibold mb-2">Reject Donation</h2>
            <p className="mb-4 text-gray-600">
              Please provide a reason for rejection:
            </p>
            <textarea
              className="w-full p-3 border bg-white border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter reason for rejection..."
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsRejectDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:opacity-80 transition-opacity"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectDonation}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!message.trim() || loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Reject"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationPending;
