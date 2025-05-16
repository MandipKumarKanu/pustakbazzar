import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const DataTable = ({
  columns,
  data,
  customCss,
  extraHtml,
  getRowClassName,
  isLoading = false,
}) => {
  const [sorting, setSorting] = useState([]);
  const [filtering, setFiltering] = useState("");

  const table = useReactTable({
    data: useMemo(() => data, [data]),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: { sorting, globalFilter: filtering },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltering,
  });

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const renderPageButtons = () => {
    const pageNumbers = [];

    if (totalPages > 0) {
      pageNumbers.push(1);
    }

    if (currentPage > 3) {
      pageNumbers.push("ellipsis1");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i !== 1 && i !== totalPages) {
        pageNumbers.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pageNumbers.push("ellipsis2");
    }

    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers.map((page, index) => {
      if (page === "ellipsis1" || page === "ellipsis2") {
        return (
          <span key={`ellipsis-${index}`} className="px-2 text-gray-500 ">
            ...
          </span>
        );
      }

      return (
        <button
          key={page}
          onClick={() => table.setPageIndex(page - 1)}
          className={`px-3 py-1 rounded-md cursor-hover ${
            currentPage === page
              ? "bg-indigo-600 text-white"
              : "bg-white border border-gray-300 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded animate-pulse mb-4"></div>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="h-14 bg-gray-200 rounded animate-pulse mb-3"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div
        className={`flex ${
          extraHtml ? "justify-between" : "justify-end"
        } items-center mb-4`}
      >
        {extraHtml}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={filtering}
            onChange={(e) => setFiltering(e.target.value)}
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-[250px] text-sm border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border shadow bg-white">
        <table className="w-full text-sm text-left">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-100">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      minWidth:
                        header.column.columnDef.meta?.minWidth || "auto",
                      maxWidth:
                        header.column.columnDef.meta?.maxWidth || "auto",
                    }}
                    className={`px-4 py-3 font-medium text-gray-700 ${
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    }`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <span className="ml-1">
                          {renderSortingIcon(header.column)}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b hover:bg-gray-50 ${
                    getRowClassName ? getRowClassName(row) : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        minWidth:
                          cell.column.columnDef.meta?.minWidth || "auto",
                        maxWidth:
                          cell.column.columnDef.meta?.maxWidth || "auto",
                      }}
                      className="px-4 py-3 capitalize"
                    >
                      <div
                        className={
                          cell.column.columnDef.meta?.noTruncate
                            ? ""
                            : "truncate"
                        }
                        title={
                          typeof cell.getValue() === "string"
                            ? cell.getValue()
                            : ""
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {table.getRowModel().rows.length > 0 && (
        <div className="flex justify-center items-center mt-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50 cursor-hover"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center space-x-1">
              {renderPageButtons()}
            </div>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50 cursor-hover"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const renderSortingIcon = (column) => {
  if (column.getIsSorted() === "asc") {
    return <ArrowUp size={14} className="text-indigo-600 cursor-hover" />;
  } else if (column.getIsSorted() === "desc") {
    return <ArrowDown size={14} className="text-indigo-600 cursor-hover" />;
  }
  return <ArrowUpDown size={14} className="text-gray-400 cursor-hover" />;
};

export default DataTable;
