const User = require("../models/User");
const Book = require("../models/User");


const getCategoriesFromBoughtBooks = async (userId) => {
  const user = await User.findById(userId).populate("bought");

//   extract category from each book
  const categories = user.bought.map((book) => book.category); 
  return [...new Set(categories)];
};

const getRecommendations = async (userId) => {
  // Fetch user's interest categories
  const user = await User.findById(userId)
    .populate("interest")
    .populate("bought");
  const interestCategories = user.interest.map((category) => category._id);


  const purchasedCategories = await getCategoriesFromBoughtBooks(userId);

  // Combine unique categories from both sources
  const combinedCategories = [
    ...new Set([...interestCategories, ...purchasedCategories]),
  ];

//   get bought book id to exclude from recommendatiion
  const boughtBookIds = user.bought.map((book) => book._id);

  const recommendedBooks = await Book.find({
    category: { $in: combinedCategories },
    _id: { $nin: boughtBookIds },
  }).limit(10);

  return recommendedBooks;
};



module.exports={
    getRecommendations
}