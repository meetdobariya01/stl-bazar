// Routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const Category = require("../Models/Category");
const Product = require("../Models/Product");

// GET all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 });
    
    // Get product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          category: category.name 
        });
        
        const sampleProduct = await Product.findOne({ 
          category: category.name 
        }).select("image price name");
        
        return {
          _id: category._id,
          name: category.name,
          description: category.description,
          icon: category.icon,
          image: category.image,
          productCount,
          sampleImage: sampleProduct?.image || category.image
        };
      })
    );
    
    res.json(categoriesWithCount);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// GET products by category
router.get("/categories/:categoryName/products", async (req, res) => {
  try {
    const { categoryName } = req.params;
    
    const products = await Product.find({ 
      category: categoryName 
    }).sort({ createdAt: -1 });
    
    res.json({
      category: categoryName,
      products: products,
      total: products.length
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// GET single category details
router.get("/categories/:categoryName", async (req, res) => {
  try {
    const { categoryName } = req.params;
    
    const category = await Category.findOne({ 
      name: categoryName,
      isActive: true 
    });
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    const products = await Product.find({ category: categoryName });
    
    res.json({
      ...category.toObject(),
      products,
      productCount: products.length
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Failed to fetch category" });
  }
});

module.exports = router;