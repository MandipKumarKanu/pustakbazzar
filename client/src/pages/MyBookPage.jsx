import React, { useEffect, useState } from "react";
import { getMyBook, deleteBook } from "../api/profile";
import getErrorMessage from "../utils/getErrorMsg";
import HeadingText from "../components/Heading";
import MyBookCard from "../components/MyBookCard";
import SkeletonCard from "../components/SkeletonCard";
import SkeletonBookCard from "@/components/SkeletonBookCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MyBookPage = ({ isDonation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, [isDonation]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await getMyBook(isDonation);
      setBooks(res?.data);
    } catch (error) {
      setError(getErrorMessage(error));
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (bookId) => {
    setBookToDelete(bookId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;

    setIsDeleting(true);
    try {
      await deleteBook(bookToDelete);
      setBooks(books.filter((book) => book._id !== bookToDelete));
      toast.success("Book deleted successfully");
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error(getErrorMessage(error) || "Failed to delete book");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setBookToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-14">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonBookCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 mt-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {books &&
            books.length > 0 &&
            books.map((book) => (
              <MyBookCard
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
                status={book.status}
                forDonation={book.forDonation}
                onDelete={(id) => {
                  setBookToDelete(id);
                  setIsDeleteDialogOpen(true);
                }}
              />
            ))}
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this book? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MyBookPage;
