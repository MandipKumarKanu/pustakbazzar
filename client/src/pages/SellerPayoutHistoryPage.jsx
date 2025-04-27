import React, { useState, useEffect, useCallback } from "react";
import { formatDate } from "@/hooks/helper";
import { toast } from "sonner";
import {
  History,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  User,
  Calendar,
  CreditCard,
  Wallet,
  X,
  Coins,
  Search,
  ArrowUpDown,
  BadgeIndianRupee,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApprovedSellers, getSellerPayoutHistory } from "@/api/seller";
import { Input } from "@/components/ui/input";

const SellerPayoutHistoryPage = () => {
  const [sellers, setSellers] = useState([]);
  const [sellersLoading, setSellersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const fetchPayoutHistory = useCallback(
    async (sellerId, page) => {
      if (!sellerId) return;

      try {
        setHistoryLoading(true);
        const response = await getSellerPayoutHistory(sellerId, page, limit);

        setPayoutHistory(response.data.payoutHistory || []);

        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
        } else {
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Error fetching payout history:", err);
        toast.error("Failed to load payout history");
        setPayoutHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setSellersLoading(true);
        setError(null);
        const response = await getApprovedSellers(1, 1000);
        setSellers(response.data.sellers || []);
      } catch (err) {
        console.error("Error fetching sellers:", err);
        setError("Failed to load sellers. Please try again.");
        toast.error("Failed to load sellers list");
      } finally {
        setSellersLoading(false);
      }
    };

    fetchSellers();
  }, []);

  useEffect(() => {
    if (historyDialogOpen && selectedSeller?._id) {
      fetchPayoutHistory(selectedSeller._id, currentPage);
    }
  }, [historyDialogOpen, selectedSeller?._id, currentPage, fetchPayoutHistory]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSelectSeller = (seller) => {
    setCurrentPage(1);
    setSelectedSeller(seller);
    if (!historyDialogOpen) {
      setHistoryDialogOpen(true);
    }
  };

  const filteredSellers = sellers.filter((seller) => {
    const term = searchTerm.toLowerCase();
    return (
      (seller.profile?.userName || "").toLowerCase().includes(term) ||
      (seller.profile?.email || "").toLowerCase().includes(term) ||
      (seller.profile?.name || "").toLowerCase().includes(term)
    );
  });

  const sortedSellers = [...filteredSellers].sort((a, b) => {
    let valueA, valueB;

    switch (sortField) {
      case "name":
        valueA = a.profile?.userName || "";
        valueB = b.profile?.userName || "";
        break;
      case "email":
        valueA = a.profile?.email || "";
        valueB = b.profile?.email || "";
        break;
      case "balance":
        valueA = a.balance || 0;
        valueB = b.balance || 0;
        break;
      case "joined":
        valueA = new Date(a.createdAt || 0).getTime();
        valueB = new Date(b.createdAt || 0).getTime();
        break;
      case "earning":
        valueA = a.earning || 0;
        valueB = b.earning || 0;
        break;
      default:
        valueA = a.profile?.userName || "";
        valueB = b.profile?.userName || "";
    }

    if (sortDirection === "asc") {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const refreshData = async () => {
    try {
      setSellersLoading(true);
      const response = await getApprovedSellers(1, 1000);
      setSellers(response.data.sellers || []);
      toast.success("Seller data refreshed");

      if (historyDialogOpen && selectedSeller) {
        fetchPayoutHistory(selectedSeller._id, currentPage);
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
      toast.error("Failed to refresh data");
    } finally {
      setSellersLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "processing":
        return "bg-amber-100 text-amber-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center mt-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center space-x-1">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md transition-colors ${
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
            className="p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  const HistoryDialog = () => {
    if (!historyDialogOpen || !selectedSeller) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white rounded-xl border shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-indigo-600 to-blue-700 text-white">
            <h2 className="text-xl font-bold flex items-center">
              <History size={20} className="mr-2" />
              Payout History:{" "}
              {selectedSeller.profile?.userName || "Unnamed Seller"}
            </h2>

            <button
              onClick={() => setHistoryDialogOpen(false)}
              className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-5 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <User size={20} className="text-indigo-600" />
                  </div>
                  <span className="font-medium text-lg">
                    {selectedSeller.profile?.userName || "Unnamed"}
                  </span>
                </div>
                <p className="text-gray-600 text-sm ml-10">
                  {selectedSeller.profile?.email}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="bg-white px-4 py-2 rounded-lg border shadow-sm">
                  <p className="text-xs text-gray-500 mb-1 flex items-center">
                    <Calendar size={12} className="mr-1" /> Joined
                  </p>
                  <p className="font-medium">
                    {formatDate(selectedSeller.createdAt)}
                  </p>
                </div>

                <div className="bg-white px-4 py-2 rounded-lg border border-indigo-100 shadow-sm">
                  <p className="text-xs text-indigo-600 mb-1 flex items-center">
                    <BadgeIndianRupee size={12} className="mr-1" /> Current
                    Balance
                  </p>
                  <p className="font-bold text-indigo-700">
                    {formatCurrency(selectedSeller.balance)}
                  </p>
                </div>

                <div className="bg-white px-4 py-2 rounded-lg border border-green-100 shadow-sm">
                  <p className="text-xs text-green-600 mb-1 flex items-center">
                    <BadgeIndianRupee size={12} className="mr-1" /> Earning
                  </p>
                  <p className="font-bold text-green-700">
                    {formatCurrency(selectedSeller.earning)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-0 overflow-y-auto max-h-[calc(90vh-220px)]">
            {historyLoading ? (
              <div className="space-y-4 p-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded-md w-1/4 mb-3"></div>
                    <div className="h-12 bg-gray-200 rounded-md w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : payoutHistory && payoutHistory.length > 0 ? (
              <div className="divide-y">
                {payoutHistory.map((payout, index) => (
                  <div
                    key={index}
                    className="p-5 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="text-2xl font-bold text-indigo-700">
                            {formatCurrency(payout.payoutAmount)}
                          </span>
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
                              payout.status
                            )}`}
                          >
                            {payout.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar size={16} className="text-indigo-500" />
                            {formatDate(payout.payoutDate)}
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <CreditCard size={16} className="text-indigo-500" />
                            ID:{" "}
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">
                              {payout.transactionId?.slice(-8) || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {payout.adminNote && (
                        <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-800 border-l-3 border-amber-400 max-w-md">
                          <p className="font-medium mb-1">Admin Note:</p>
                          {payout.adminNote}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="bg-gray-100 p-4 rounded-full inline-block">
                  <Coins className="mx-auto h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mt-4 mb-2">
                  No Payout History
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  This seller doesn't have any payout transactions recorded in
                  the system yet.
                </p>
              </div>
            )}
          </div>

          <div className="border-t p-4 bg-gray-50">
            <Pagination />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-gray-900 bg-gray-50 p-4 sm:p-6">
      <div className="max-w-[1450px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="mr-4 hidden sm:block">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-700 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet size={26} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Seller Payout History
              </h1>
              <p className="text-gray-600 text-sm hidden sm:block mt-1">
                View and manage payment histories for all sellers in the system
              </p>
            </div>
          </div>

          <button
            onClick={refreshData}
            className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
            title="Refresh books"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sellers by name or email..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredSellers.length} seller
              {filteredSellers.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </div>

        {error && !sellersLoading && (
          <div className="bg-white rounded-xl border p-8 shadow-sm text-center mb-6">
            <div className="text-rose-500 mb-4">
              <X size={48} className="mx-auto" />
            </div>
            <p className="text-rose-600 text-lg mb-4">{error}</p>
            <Button
              onClick={refreshData}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
            >
              Try Again
            </Button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-indigo-50 flex items-center">
            <User size={18} className="mr-2 text-indigo-600" />
            <h2 className="text-xl font-semibold">Seller Accounts</h2>
            <span className="ml-auto text-sm text-gray-500">
              {sortedSellers.length} seller
              {sortedSellers.length !== 1 ? "s" : ""}
            </span>
          </div>

          {sellersLoading ? (
            <div className="p-6 space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedSellers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th
                      className="px-6 py-3 text-left font-semibold text-sm cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Username
                        <ArrowUpDown
                          size={14}
                          className={`ml-1 ${
                            sortField === "name"
                              ? "text-indigo-600"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left font-semibold text-sm cursor-pointer"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center">
                        Email
                        <ArrowUpDown
                          size={14}
                          className={`ml-1 ${
                            sortField === "email"
                              ? "text-indigo-600"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left font-semibold text-sm cursor-pointer"
                      onClick={() => handleSort("joined")}
                    >
                      <div className="flex items-center">
                        Joined
                        <ArrowUpDown
                          size={14}
                          className={`ml-1 ${
                            sortField === "joined"
                              ? "text-indigo-600"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left font-semibold text-sm cursor-pointer"
                      onClick={() => handleSort("balance")}
                    >
                      <div className="flex items-center">
                        Current Balance
                        <ArrowUpDown
                          size={14}
                          className={`ml-1 ${
                            sortField === "balance"
                              ? "text-indigo-600"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left font-semibold text-sm cursor-pointer"
                      onClick={() => handleSort("earning")}
                    >
                      <div className="flex items-center">
                        Earning
                        <ArrowUpDown
                          size={14}
                          className={`ml-1 ${
                            sortField === "earning"
                              ? "text-indigo-600"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSellers.map((seller) => (
                    <tr
                      key={seller._id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                            <User size={18} className="text-indigo-600" />
                          </div>
                          <span className="font-medium">
                            {seller.profile?.userName || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {seller.profile?.email || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2 text-gray-400" />
                          {formatDate(seller.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg">
                          {formatCurrency(seller.balance)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-green-700 bg-green-50 px-3 py-1 rounded-lg">
                          {formatCurrency(seller.earning)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => handleSelectSeller(seller)}
                          variant="outline"
                          size="sm"
                          className="px-4 py-2 h-9 bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700 shadow-sm rounded-lg transition-colors"
                        >
                          <History size={16} className="mr-2" /> View History
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="bg-gray-100 p-5 rounded-full inline-block mb-4">
                <User className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No Sellers Found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm
                  ? "No sellers match your search criteria. Try a different search term."
                  : "There are no approved sellers in the system yet."}
              </p>
              {searchTerm && (
                <Button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
        <HistoryDialog />
      </div>
    </div>
  );
};

export default SellerPayoutHistoryPage;
