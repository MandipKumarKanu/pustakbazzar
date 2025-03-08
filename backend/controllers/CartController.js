const Cart = require("../models/Cart");
const Book = require("../models/Book");

// Add item to cart with multiple sellers
const addItemToCart = async (req, res) => {
  try {
    const { bookId, quantity, sellerId, deliveryPrice } = req.body;
    const userId = req.user.id;

    // Find the book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Check if the user already has a cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = new Cart({
        userId,
        carts: [
          {
            sellerId,
            books: [{ bookId, price: book.price }],
            deliveryPrice,
          },
        ],
        discount: 0,
      });
    } else {
      // Update the cart with the new item
      const sellerOrder = cart.carts.find(
        (order) => order.sellerId.toString() === sellerId.toString()
      );

      if (sellerOrder) {
        // Seller already exists in cart, update the books array
        const existingBookIndex = sellerOrder.books.findIndex(
          (item) => item.bookId.toString() === bookId.toString()
        );

        if (existingBookIndex !== -1) {
          // Update the quantity of the existing book (if needed)
          sellerOrder.books[existingBookIndex].quantity += quantity;
        } else {
          // Add the new book to the seller's order
          sellerOrder.books.push({ bookId, price: book.price });
        }
      } else {
        // Create a new order for this seller
        cart.carts.push({
          sellerId,
          books: [{ bookId, price: book.price }],
          deliveryPrice,
        });
      }
    }

    // Recalculate the total price of the cart
    let totalPrice = cart.carts.reduce((total, order) => {
      const orderTotal = order.books.reduce((sum, book) => sum + book.price, 0);
      return total + orderTotal + order.deliveryPrice;
    }, 0);
    totalPrice -= cart.discount;

    cart.totalPrice = totalPrice;

    await cart.save();

    res.json({ message: "Item added to cart", cart });
  } catch (error) {
    console.error("Add item to cart error:", error.message);
    res
      .status(500)
      .json({ error: "Failed to add item to cart", details: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId }).populate("orders.books.bookId");

    if (!cart) {
      return res.status(404).json({ error: "No cart found for this user" });
    }

    res.json({ cart });
  } catch (error) {
    console.error("Get cart error:", error.message);
    res
      .status(500)
      .json({ error: "Failed to get cart", details: error.message });
  }
};

module.exports = { addItemToCart, getCart };
