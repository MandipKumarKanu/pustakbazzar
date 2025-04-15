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
  FaArrowUp,
  FaArrowDown,
  FaArrowsAltV,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const DataTable = ({
  columns,
  data,
  customCss,
  extraHtml,
  getRowClassName, 
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
    state: { sorting, globalFilter: filtering },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltering,
  });

  return (
    <div className="p-4">
      <div
        className={`flex ${
          extraHtml ? "justify-between" : "justify-end"
        } items-center mb-4`}
      >
        {extraHtml}
        <div className="relative">
          <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
          <Input
            value={filtering}
            onChange={(e) => setFiltering(e.target.value)}
            placeholder="Search..."
            className="pl-8 w-[200px] focus:w-[250px] transition-all duration-200 text-sm"
          />
        </div>
      </div>

      <div
        className={`overflow-x-auto bg-card rounded-md border border-border ${customCss}`}
      >
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border bg-muted "
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      minWidth:
                        header.column.columnDef.meta?.minWidth || "auto",
                      maxWidth:
                        header.column.columnDef.meta?.maxWidth || "auto",
                    }}
                    className={`px-3 py-2 ${
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    } hover:bg-muted/60 `}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1 text-center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() &&
                        renderSortingIcon(header.column)}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`border-t border-border hover:bg-muted ${
                  getRowClassName ? getRowClassName(row) : ""
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      minWidth: cell.column.columnDef.meta?.minWidth || "auto",
                      maxWidth: cell.column.columnDef.meta?.maxWidth || "auto",
                    }}
                    className="px-3 py-2 capitalize"
                  >
                    <div
                      className={
                        cell.column.columnDef.meta?.noTruncate ? "" : "truncate"
                      }
                      title={
                        typeof cell.getValue() === "string"
                          ? cell.getValue()
                          : JSON.stringify(cell.getValue())
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
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 text-xs"
          >
            <FaChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 text-xs"
          >
            <FaChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const renderSortingIcon = (column) => {
  const sortingIcons = {
    asc: <FaArrowUp className="h-3 w-3 text-primary" />,
    desc: <FaArrowDown className="h-3 w-3 text-primary" />,
    default: <FaArrowsAltV className="h-3 w-3 text-gray-400" />,
  };

  return sortingIcons[column.getIsSorted() || "default"];
};

export default DataTable;
