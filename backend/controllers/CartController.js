const Cart = require("../models/Cart");
const Book = require("../models/Book");

const addItemToCart = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { quantity = 1, deliveryPrice = 0 } = req.body;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (book.forDonation) {
      return res
        .status(400)
        .json({ error: "Cannot add donation book to cart" });
    }

    let sellerId = book.addedBy;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        carts: [
          {
            sellerId,
            books: [{ bookId, price: book.sellingPrice, quantity }],
            deliveryPrice,
          },
        ],
        discount: 0,
      });
    } else {
      const sellerOrder = cart.carts.find(
        (order) => order.sellerId.toString() === sellerId.toString()
      );

      if (sellerOrder) {
        const existingBookIndex = sellerOrder.books.findIndex(
          (item) => item.bookId.toString() === bookId.toString()
        );

        if (existingBookIndex !== -1) {
          sellerOrder.books[existingBookIndex].quantity += quantity;
        } else {
          sellerOrder.books.push({
            bookId,
            price: book.sellingPrice,
            quantity,
          });
        }
      } else {
        cart.carts.push({
          sellerId,
          books: [{ bookId, price: book.sellingPrice, quantity }],
          deliveryPrice,
        });
      }
    }

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

    const cart = await Cart.findOne({ userId })
    .populate({
      path: "carts.books.bookId",
      select: "title author sellingPrice images",
    })
    .populate({
      path: "carts.sellerId",
      select: "profile.userName",
    });

    if (!cart) {
      return res.status(404).json({ error: "No cart found for this user" });
    }

    let updatedCart = cart.toObject();
    let totalPrice = 0;

    for (let sellerCart of updatedCart.carts) {
      let sellerTotal = 0;

      for (let book of sellerCart.books) {
        const currentPrice = book.bookId.sellingPrice;

        book.currentPrice = currentPrice;
        book.originalPrice = book.price;

        sellerTotal += currentPrice * book.quantity;
      }

      sellerCart.subtotal = sellerTotal;
      totalPrice += sellerTotal + sellerCart.deliveryPrice;
    }

    totalPrice -= updatedCart.discount || 0;
    updatedCart.calculatedTotal = totalPrice;

    res.json({ cart: updatedCart, totalPrice });
  } catch (error) {
    console.error("Get cart error:", error.message);
    res
      .status(500)
      .json({ error: "Failed to get cart", details: error.message });
  }
};

const removeItemFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    let sellerId = book.addedBy;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "No cart found for this user" });
    }

    const sellerOrder = cart.carts.find(
      (order) => order.sellerId.toString() === sellerId.toString()
    );

    if (!sellerOrder) {
      return res.status(404).json({ error: "No items found for this seller" });
    }

    const bookIndex = sellerOrder.books.findIndex(
      (book) => book.bookId.toString() === bookId.toString()
    );

    if (bookIndex === -1) {
      return res.status(404).json({ error: "Book not found in cart" });
    }

    sellerOrder.books.splice(bookIndex, 1);

    if (sellerOrder.books.length === 0) {
      const sellerIndex = cart.carts.findIndex(
        (order) => order.sellerId.toString() === sellerId.toString()
      );
      cart.carts.splice(sellerIndex, 1);
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ userId }).populate(
      "carts.books.bookId"
    );
    let totalPrice = 0;

    if (updatedCart && updatedCart.carts) {
      totalPrice = updatedCart.carts.reduce((total, order) => {
        const orderTotal = order.books.reduce(
          (sum, book) => sum + book.bookId.sellingPrice * book.quantity,
          0
        );
        return total + orderTotal + order.deliveryPrice;
      }, 0);

      totalPrice -= updatedCart.discount || 0;
    }

    res.json({
      message: "Item removed from cart",
      cart: updatedCart,
      totalPrice,
    });
  } catch (error) {
    console.error("Remove item from cart error:", error.message);
    res.status(500).json({
      error: "Failed to remove item from cart",
      details: error.message,
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "No cart found for this user" });
    }

    cart.carts = [];
    cart.totalPrice = 0;

    await cart.save();

    res.json({ message: "Cart cleared", cart, totalPrice: 0 });
  } catch (error) {
    console.error("Clear cart error:", error.message);
    res
      .status(500)
      .json({ error: "Failed to clear cart", details: error.message });
  }
};

const removeSellerItemsFromCart = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "No cart found for this user" });
    }

    const sellerOrder = cart.carts.find(
      (order) => order.sellerId.toString() === sellerId.toString()
    );

    if (!sellerOrder) {
      return res.status(404).json({ error: "No items found for this seller" });
    }

    const sellerIndex = cart.carts.findIndex(
      (order) => order.sellerId.toString() === sellerId.toString()
    );
    cart.carts.splice(sellerIndex, 1);

    await cart.save();

    const updatedCart = await Cart.findOne({ userId }).populate(
      "carts.books.bookId"
    );
    let totalPrice = 0;

    if (updatedCart && updatedCart.carts) {
      totalPrice = updatedCart.carts.reduce((total, order) => {
        const orderTotal = order.books.reduce(
          (sum, book) => sum + book.bookId.sellingPrice * book.quantity,
          0
        );
        return total + orderTotal + order.deliveryPrice;
      }, 0);

      totalPrice -= updatedCart.discount || 0;
    }

    res.json({
      message: "All items from this seller removed",
      cart: updatedCart,
      totalPrice,
    });
  } catch (error) {
    console.error("Remove seller's items from cart error:", error.message);
    res.status(500).json({
      error: "Failed to remove seller's items from cart",
      details: error.message,
    });
  }
};

const isInCart = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "No cart found for this user" });
    }

    const isBookInCart = cart.carts.some((sellerOrder) =>
      sellerOrder.books.some(
        (book) => book.bookId.toString() === bookId.toString()
      )
    );

    if (isBookInCart) {
      return res.json({ message: "Book is in cart", inCart: true });
    } else {
      return res.json({ message: "Book is not in cart", inCart: false });
    }
  } catch (error) {
    console.error("Check if book is in cart error:", error.message);
    res.status(500).json({
      error: "Failed to check if book is in cart",
      details: error.message,
    });
  }
};

module.exports = {
  addItemToCart,
  getCart,
  removeItemFromCart,
  clearCart,
  removeSellerItemsFromCart,
  isInCart,
};
