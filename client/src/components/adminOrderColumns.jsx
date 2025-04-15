import { formatDate } from "@/hooks/helper";

export const adminOrderColumns = (onView, onStatusChange) => [
  {
    header: "Order ID",
    accessorKey: "_id",
    cell: ({ row }) => `#${row.original._id.slice(-6)}`,
  },
  {
    header: "Date",
    accessorKey: "date",
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    header: "Book",
    accessorKey: "orders",
    cell: ({ row }) => {
      const book = row.original.orders[0]?.books[0]?.bookId;
      return book ? (
        <div className="flex items-center space-x-3">
          <img
            src={book.images[0]}
            alt={book.title}
            className="w-10 h-10 object-cover rounded-md"
          />
          <div className="hidden md:block">
            <p className="font-medium text-sm line-clamp-1">{book.title}</p>
            <p className="text-xs text-gray-500">by {book.author}</p>
          </div>
        </div>
      ) : null;
    },
  },
  {
    header: "Customer",
    accessorKey: "userId",
    cell: ({ row }) => {
      const user = row.original.userId?.profile;
      return (
        <div>
          <p className="font-medium text-sm">{user?.userName || "N/A"}</p>
          <p className="text-xs text-gray-500">{user?.email || "N/A"}</p>
        </div>
      );
    },
  },
  {
    header: "Items",
    accessorKey: "orders",
    cell: ({ row }) =>
      row.original.orders[0]?.books.reduce((acc, b) => acc + b.quantity, 0) ||
      0,
  },
  {
    header: "Amount",
    accessorKey: "amount",
    cell: ({ row }) => {
      const books = row.original.orders[0]?.books || [];
      const bookAmount = books.reduce(
        (sum, b) => sum + b.price * b.quantity,
        0
      );
      return `₹${bookAmount + row.original.shippingFee}`;
    },
  },
  {
    header: "Status",
    accessorKey: "orderStatus",
    cell: ({ row }) => {
      const status = row.original.orderStatus;
      const colorClass =
        status === "pending"
          ? "bg-amber-100 text-amber-800"
          : status === "shipped"
          ? "bg-blue-100 text-blue-800"
          : status === "delivered"
          ? "bg-emerald-100 text-emerald-800"
          : "bg-gray-100 text-gray-800";

      return (
        <span
          className={`px-2 py-1 text-xs capitalize rounded-full ${colorClass}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    header: "Actions",
    accessorKey: "actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <button
          onClick={() => onView(row.original)}
          className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200"
        >
          View
        </button>
        <button
          onClick={() => onStatusChange(row.original)}
          className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded hover:bg-emerald-200"
        >
          Update
        </button>
      </div>
    ),
  },
];
