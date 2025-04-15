import React, { useEffect, useState } from "react";
// import { getBooks } from "@/api/book";
import BookCard from "@/components/BookCard";
import HeadingText from "@/components/Heading";
import Loader from "@/components/Loader";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowDownAZ,
  ArrowUpZA,
  Clock,
  CalendarClock,
} from "lucide-react";
import { getBooks } from "@/api/book";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="mt-8 flex justify-center">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="min-w-8"
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const AllBookPage = () => {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const FETCH_SIZE = 30;

  const sortOptions = {
    newest: {
      label: "Newest First",
      sortType: "date",
      dateOrder: "desc",
    },
    oldest: {
      label: "Oldest First",
      sortType: "date",
      dateOrder: "asc",
    },
    "price-desc": {
      label: "Price: High to Low",
      sortType: "price",
      priceOrder: "desc",
    },
    "price-asc": {
      label: "Price: Low to High",
      sortType: "price",
      priceOrder: "asc",
    },
  };

  useEffect(() => {
    fetchBooks();
  }, [page, sortOption, activeFilters]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const selectedSort = sortOptions[sortOption];
      let order = null;

      if (selectedSort.sortType === "price") {
        order = { order: selectedSort.priceOrder, type: "price" };
      } else if (selectedSort.sortType === "date") {
        order = { order: selectedSort.dateOrder, type: "date" };
      }

      const res = await getBooks(page, FETCH_SIZE, order, minPrice, maxPrice);
      setBooks(res.data.books);

      setTotalPages(Number(res.data.totalPages));
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    setPage(1);
  };


  const handleApplyFilters = () => {
    const filters = [];
    if (minPrice) filters.push(`Min: $${minPrice}`);
    if (maxPrice) filters.push(`Max: $${maxPrice}`);
    fetchBooks();
    setActiveFilters(filters);
    setPage(1);
    setIsFilterOpen(false);
  };


  const handleClearFilter = (filter) => {
    if (filter.startsWith("Min:")) {
      setMinPrice("");
    }
    if (filter.startsWith("Max:")) {
      setMaxPrice("");
    }
    setActiveFilters((prev) => prev.filter((f) => f !== filter));
    fetchBooks();
    setPage(1);
  };


  const handleClearAllFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setActiveFilters([]);
    fetchBooks();
    setPage(1);
    setIsFilterOpen(false);
  };


  const handlePageChange = (newPage) => {
    window.scrollTo(0, 0);
    setPage(newPage);
  };

  return (
    <>
      <HeadingText fullName="All Books" bgName="ALL BOOKS" />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">

          <div className="flex flex-wrap items-center gap-4">
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Newest First
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center">
                    <CalendarClock className="mr-2 h-4 w-4" />
                    Oldest First
                  </div>
                </SelectItem>
                <SelectItem value="price-desc">
                  <div className="flex items-center">
                    <ArrowDownAZ className="mr-2 h-4 w-4" />
                    Price: High to Low
                  </div>
                </SelectItem>
                <SelectItem value="price-asc">
                  <div className="flex items-center">
                    <ArrowUpZA className="mr-2 h-4 w-4" />
                    Price: Low to High
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </DialogTrigger>
              <DialogContent className="w-96 p-4">
                <DialogHeader>
                  <DialogTitle>Price Range</DialogTitle>
                </DialogHeader>
                <div className="flex items-center space-x-2 mb-4">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleClearAllFilters}>
                    Reset
                  </Button>
                  <Button onClick={handleApplyFilters}>Apply</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>


          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {filter}
                  <button
                    onClick={() => handleClearFilter(filter)}
                    className="ml-1 rounded-full h-4 w-4 flex items-center justify-center hover:bg-muted"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllFilters}
                className="text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>


        {loading && books.length === 0 ? (
          <div className="min-h-screen flex items-center justify-center">
            <Loader />
          </div>
        ) : books.length > 0 ? (
          <div
            className={`grid gap-6 ${
              loading ? "opacity-60" : ""
            } grid-cols-1 lg:grid-cols-2 xl:grid-cols-3`}
          >
            {books.map((book) => (
              <BookCard
                key={book._id}
                id={book._id}
                img={book.images[0]}
                name={book.title}
                author={book.author}
                publishYear={book.publishYear}
                sellingPrice={book.sellingPrice}
                perWeekPrice={book.perWeekPrice}
                condition={book.condition}
                availability={book.availability}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              No books found matching your criteria.
            </p>
            <Button
              variant="link"
              onClick={handleClearAllFilters}
              className="mt-2"
            >
              Clear filters and try again
            </Button>
          </div>
        )}


        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </>
  );
};

export default AllBookPage;
