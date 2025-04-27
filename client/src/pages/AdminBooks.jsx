import React, { useEffect, useState, useCallback } from "react";
import { Book, RefreshCw, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/hooks/helper";
// import { customAxios } from "@/api/customAxios";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { customAxios } from "@/config/axios";

const AdminBooks = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "available"
  );

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("status", statusFilter);
    params.set("page", currentPage.toString());
    setSearchParams(params);
  }, [statusFilter, currentPage, setSearchParams]);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await customAxios.get(
        `/book/admin?status=${statusFilter}&page=${currentPage}&limit=${limit}`
      );
      setBooks(response.data.books);

      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch books:", err);
      setError("Failed to fetch books. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage, limit]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const handleViewDetails = (book) => {
    setSelectedBook(book);
    setIsDialogOpen(true);
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "available":
        return "bg-emerald-100 text-emerald-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "sold":
        return "bg-blue-100 text-blue-800";
      case "donated":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderTableHeader = () => {
    return (
      <thead>
        <tr className="bg-gray-100">
          <th className="px-4 py-3 text-left">Book</th>
          <th className="px-4 py-3 text-left">Author</th>
          <th className="px-4 py-3 text-left">Category</th>
          <th className="px-4 py-3 text-left">Added By</th>
          <th className="px-4 py-3 text-left">Price</th>
          <th className="px-4 py-3 text-left">Added Date</th>
          <th className="px-4 py-3 text-left">Status</th>
          <th className="px-4 py-3 text-left">Actions</th>
        </tr>
      </thead>
    );
  };

  const renderTableRow = (book) => {
    const categoryNames = book.category
      .map((cat) => cat.categoryName)
      .join(", ");

    return (
      <tr
        key={book._id}
        className={`border-b hover:bg-gray-50 ${
          book.status === "pending"
            ? "bg-yellow-50"
            : book.status === "sold"
            ? "bg-blue-50"
            : book.status === "donated"
            ? "bg-purple-50"
            : "bg-green-50"
        }`}
      >
        <td className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <img
              src={book.images?.[0] || "/placeholder-book.png"}
              alt={book.title}
              className="w-10 h-10 object-cover rounded-md"
            />
            <div>
              <p className="font-medium text-sm line-clamp-1">{book.title}</p>
              <p className="text-xs text-gray-500">ID: #{book._id.slice(-6)}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm">{book.author || "Unknown"}</td>
        <td className="px-4 py-3 text-sm">
          {categoryNames || "Uncategorized"}
        </td>
        <td className="px-4 py-3 text-sm">
          <p className="font-medium">
            {book.addedBy?.profile?.userName || "N/A"}
          </p>
          <p className="text-xs text-gray-500">
            {book.addedBy?.profile?.email || "N/A"}
          </p>
        </td>
        <td className="px-4 py-3 font-medium">
          {book.sellingPrice
            ? `₹${book.sellingPrice}`
            : book.forDonation
            ? "Donation"
            : "N/A"}
        </td>
        <td className="px-4 py-3 text-sm">{formatDate(book.createdAt)}</td>
        <td className="px-4 py-3">
          <span
            className={`px-2 py-1 text-xs capitalize rounded-full ${getStatusBadgeClasses(
              book.status
            )}`}
          >
            {book.status}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex space-x-2">
            <Link
              to={`/book/${book._id}`}
              className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200 transition-colors"
            >
              View
            </Link>
            <Link
              to={`/admin/books/edit/${book._id}`}
              className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded hover:bg-emerald-200 transition-colors"
            >
              Edit
            </Link>
          </div>
        </td>
      </tr>
    );
  };

  const Pagination = () => {
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Manage Books</h1>

          <div className="flex items-center space-x-4 self-end">
            <Tabs
              defaultValue="available"
              value={statusFilter}
              onValueChange={handleStatusChange}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="available">Available</TabsTrigger>
                <TabsTrigger value="sold">Sold</TabsTrigger>
                <TabsTrigger value="donated">Donated</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
            </Tabs>

            <button
              onClick={fetchBooks}
              className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
              title="Refresh books"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
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
          <div className="bg-white rounded-lg border p-8 shadow-sm text-center">
            <div className="text-rose-500 mb-4">
              <X size={48} className="mx-auto" />
            </div>
            <p className="text-rose-600 text-lg mb-4">{error}</p>
            <button
              onClick={fetchBooks}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="h-[60dvh] flex justify-center items-center text-center bg-white rounded-lg border shadow-sm">
            <div>
              <Book className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
              <p className="text-xl font-medium">No books found</p>
              {statusFilter !== "all" && (
                <p className="text-gray-500 mt-2 mb-4">
                  No {statusFilter} books available
                </p>
              )}
              <button
                onClick={() => handleStatusChange("all")}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                View All Books
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border shadow bg-white">
            <table className="w-full">
              {renderTableHeader()}
              <tbody>{books.map((book) => renderTableRow(book))}</tbody>
            </table>
          </div>
        )}

        <Pagination />
      </div>
    </div>
  );
};

export default AdminBooks;
