const Category = require("../models/Category");
const handleError = require("../utils/errorHandler");

const createCategory = async (req, res) => {
  const { categoryName } = req.body;

  if (!categoryName || categoryName.length < 3) {
    return res.status(400).json({
      error: "Category name must be at least 3 characters long.",
    });
  }

  try {
    const normalizedCategoryName = categoryName.toLowerCase();

    const existingCategory = await Category.findOne({
      categoryName: normalizedCategoryName,
    });
    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const category = await Category.create({
      categoryName: normalizedCategoryName,
    });
    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    handleError(res, error, "Unable to create category");
  }
};

const updateCategory = async (req, res) => {
  const { id, categoryName } = req.body;

  if (!categoryName || categoryName.length < 3) {
    return res.status(400).json({
      error: "Category name must be at least 3 characters long.",
    });
  }

  try {
    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const normalizedCategoryName = categoryName.toLowerCase();

    if (category.categoryName !== normalizedCategoryName) {
      const existingCategory = await Category.findOne({
        categoryName: normalizedCategoryName,
      });
      if (existingCategory) {
        return res.status(400).json({ error: "Category name already exists" });
      }
    }

    category.categoryName = normalizedCategoryName;
    await category.save();

    res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (error) {
    handleError(res, error, "Unable to update category");
  }
};

const getAllCategory = async (req, res) => {
  try {
    const categories = await Category.find().sort({ categoryName: 1 }).lean();

    res.status(200).json({
      categories,
    });
  } catch (error) {
    handleError(res, error, "Unable to fetch categories");
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    handleError(res, error, "Unable to delete category");
  }
};

module.exports = {
  createCategory,
  updateCategory,
  getAllCategory,
  deleteCategory,
};
