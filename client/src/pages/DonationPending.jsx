import { changeDonationStatus, getPendingonation } from "@/api/donation";
import React, { useEffect, useState } from "react";
import { Package, User, X, Book, Grid, List } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { FiCheck } from "react-icons/fi";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const DonationDetailsDialog = ({ donation, onClose, onAccept, onReject }) => {
  const [activeTab, setActiveTab] = useState("details");
  const donationStatus = donation.status;

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
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Donation #{donation._id.slice(-6)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="border-b">
          <div className="flex px-6">
            <TabButton id="details" label="Donation Details" icon={Package} />
            <TabButton id="book" label="Book Info" icon={Book} />
            <TabButton id="donor" label="Donor Info" icon={User} />
          </div>
        </div>
        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          {activeTab === "details" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    donationStatus === "approved"
                      ? "bg-emerald-100 text-emerald-800"
                      : donationStatus === "rejected"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {donationStatus &&
                    donationStatus.charAt(0).toUpperCase() +
                      donationStatus.slice(1)}
                </span>
              </div>
              {donation.message && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Message:</span>
                  <span className="text-gray-800 capitalize line-clamp-2">
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
                <span className="font-mono text-sm">{donation._id}</span>
              </div>
            </div>
          )}
          {activeTab === "book" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                <img
                  src={donation.book.images[0]}
                  alt={donation.book.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-grow">
                  <p className="font-medium text-lg">{donation.book.title}</p>
                  <p className="text-sm text-gray-600">
                    by {donation.book.author}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Published: {donation.book.publishYear}
                  </p>
                  <p className="text-sm text-gray-600">
                    Condition:{" "}
                    <span className="capitalize">
                      {donation.book.condition}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <div
                  className="bg-gray-50 p-4 rounded-lg text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: donation.book.description,
                  }}
                />
              </div>
            </div>
          )}
          {activeTab === "donor" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Username:</span>
                <span>{donation.donor.profile.userName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email:</span>
                <span>{donation.donor.profile.email}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg mt-4">
                <h3 className="font-medium mb-2">Additional Information</h3>
                <p className="text-gray-700">Donor ID: {donation.donor._id}</p>
              </div>
            </div>
          )}
        </div>
        {donationStatus === "pending" && (
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex space-x-2 justify-end">
              <button
                onClick={() => onAccept(donation)}
                className="bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Accept Donation
              </button>
              <button
                onClick={() => onReject(donation)}
                className="bg-rose-500 text-white py-2 px-4 rounded-lg hover:bg-rose-600 transition-colors"
              >
                Reject Donation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DonationPending = () => {
  const [loading, setLoading] = useState(false);
  const [donations, setDonations] = useState([]);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [message, setmessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  useEffect(() => {
    fetchPendingDonations();
  }, []);

  const fetchPendingDonations = async () => {
    setLoading(true);
    try {
      const response = await getPendingonation();
      setDonations(response.data.donations);
    } catch (error) {
      setError("Failed to fetch donations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter((donation) => {
    if (statusFilter === "all") return true;
    return donation.status === statusFilter;
  });

  const handleViewDetails = (donation) => {
    setSelectedDonation(donation);
    setIsDialogOpen(true);
  };

  const handleAcceptDonation = async () => {
    // console.log("Accepting donation:", selectedDonation._id);
    await changeDonationStatus(selectedDonation._id, "approved");
    fetchPendingDonations();
    setIsAcceptDialogOpen(false);
    toast.success("Donation accepted successfully!");
  };

  const handleRejectDonation = async () => {
    // console.log("Rejecting donation:", selectedDonation._id);
    await changeDonationStatus(selectedDonation._id, "rejected");

    setIsRejectDialogOpen(false);
    fetchPendingDonations();
    toast.success("Donation rejected successfully!");
  };

  const handleMarkAsCompleted = async (donationId) => {
    try {
      await changeDonationStatus(donationId, "completed");
      setDonations((prevDonations) =>
        prevDonations.map((donation) =>
          donation._id === donationId
            ? { ...donation, status: "completed" }
            : donation
        )
      );
      toast.success("Donation marked as completed!");
    } catch (error) {
      toast.error("Failed to update donation status. Please try again.");
    }
  };

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
              <p className="text-xs text-gray-500">by {donation.book.author}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm">{donation?.donor?.profile?.userName}</td>
        <td className="px-4 py-3">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              donation.status === "pending"
                ? "bg-amber-100 text-amber-800"
                : donation.status === "approved"
                ? "bg-emerald-100 text-emerald-800"
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

            {/* <div className="flex space-x-2"> */}
            {donation.status === "approved" ? (
              <button
                onClick={() => handleMarkAsCompleted(donation._id)}
                className="text-green-500 hover:text-green-700 transition duration-300"
                title="Mark as Completed"
              >
                <FiCheck size={20} />
              </button>
            ) : null}
            {/* </div> */}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen text-gray-900 transition-colors duration-300">
      <div className="max-w-[1450px] mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Pending Donations</h1>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Donations</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </div>

            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-white text-gray-500"
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 ${
                  viewMode === "table"
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-white text-gray-500"
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="w-full">
            <Skeleton height={50} className="mb-2" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} height={60} className="mb-2" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-rose-600 text-lg">{error}</p>
            <button
              onClick={() => fetchPendingDonations()}
              className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="h-[60dvh] flex justify-center items-center text-center">
            <div>
              <Book className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
              <p className="text-xl font-medium">No donations found.</p>
              {statusFilter !== "all" && (
                <p className="text-gray-500 mt-2">
                  Try changing your filter settings
                </p>
              )}
            </div>
          </div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto rounded-lg border shadow">
            <table className="w-full">
              {renderTableHeader()}
              <tbody>
                {filteredDonations.map((donation) => renderTableRow(donation))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDonations.map((donation) => (
              <div
                key={donation._id}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900">
                      Donation #{donation._id.slice(-6)}
                    </h3>
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
                      {donation.status.charAt(0).toUpperCase() +
                        donation.status.slice(1)}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-500">
                      Date: {formatDate(donation.createdAt)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Donor: {donation.donor.profile.userName}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={donation.book.images[0]}
                      alt={donation.book.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div>
                      <p className="font-medium text-sm line-clamp-1">
                        {donation.book.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {donation.book.author}
                      </p>
                    </div>
                  </div>

                  {donation.status === "pending" && (
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => {
                          setSelectedDonation(donation);
                          setIsRejectDialogOpen(true);
                        }}
                        className="px-3 py-1.5 bg-rose-500 text-white text-sm rounded-lg hover:bg-rose-600 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDonation(donation);
                          setIsAcceptDialogOpen(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleViewDetails(donation)}
                        className="px-3 py-1.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  )}

                  {donation.status !== "pending" && (
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => handleViewDetails(donation)}
                        className="px-3 py-1.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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



      {isAcceptDialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white text-gray-900 rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Confirm Acceptance</h2>
            <p className="mb-6">Are you sure you want to accept this order?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAcceptDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:opacity-80 transition-opacity"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptDonation}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {isRejectDialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white text-gray-900 rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Cancel Order</h2>
            <p className="mb-4">Please provide a reason for cancellation:</p>
            <textarea
              className="w-full p-2 border bg-white border-gray-300 rounded-md mb-4"
              rows="3"
              value={message}
              onChange={(e) => setmessage(e.target.value)}
              placeholder="Enter cancellation reason"
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsRejectDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:opacity-80 transition-opacity"
              >
                Back
              </button>
              <button
                onClick={handleRejectDonation}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                disabled={!message.trim()}
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationPending;
