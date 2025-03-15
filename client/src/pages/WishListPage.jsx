import { getSaveForLaterApi, removeSaveForLaterApi } from "@/api/saveForLater";
// import { addToCartApi } from "@/api/cart";
import HeadingText from "@/components/Heading";
import WishlistBookCard from "@/components/WishlistBookCard";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const WishListPage = () => {
  const [wishList, setWishList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const res = await getSaveForLaterApi();
        setWishList(res.data.savedBooks);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (id) => {
    try {
      await removeSaveForLaterApi(id);
      setWishList(wishList.filter((book) => book._id !== id));
      toast.success("Book removed from wishlist");
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const handleAddToCart = async (id) => {
    try {
      // await addToCartApi(id);
      await removeSaveForLaterApi(id);
      setWishList(wishList.filter((book) => book._id !== id));

      toast.success("Book added to cart");
    } catch (error) {
      console.log(error);
      toast.error("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <HeadingText fullName="Wishlist" bgName="wishlist" />
      <div className="container mx-auto px-4 mt-14">
        {wishList.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-700">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mt-2">
              Save items you want to revisit later
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {wishList.map((book) => (
              <WishlistBookCard
                key={book._id}
                id={book._id}
                img={book.images[0]}
                name={book.title}
                author={book.author}
                publishYear={book.publishYear}
                sellingPrice={book.sellingPrice}
                condition={book.condition}
                availability={book.availability}
                perWeekPrice={book.perWeekPrice}
                isAvailable={book.status === "available"}
                onRemoveFromWishlist={handleRemoveFromWishlist}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishListPage;
