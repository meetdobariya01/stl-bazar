const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Category = require("../Models/Category");
const Product = require("../Models/Product");

console.log("✅ categoryRoutes.js loaded successfully!");

// TEST ROUTE - સૌથી પહેલા આ ચેક કરો
router.get("/test", (req, res) => {
  console.log("🔵 TEST ROUTE HIT!");
  res.json({ message: "Test route is working!", time: new Date() });
});

// GET all categories - SIMPLIFIED VERSION
// GET all categories
router.get("/", async (req, res) => {
  console.log("🔵 MAIN CATEGORIES ROUTE HIT!");

  try {
    const db = mongoose.connection.db;

    if (!db) {
      console.error("❌ Database not connected!");
      return res.status(500).json({
        error: "Database not connected"
      });
    }

    const collection = db.collection("categories");
    const categories = await collection.find({}).toArray();

    console.log(`✅ Found ${categories.length} categories`);

    if (categories.length === 0) {
      return res.json([]);
    }

    // FIXED
    const formatted = categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      image: cat.image || "",
      description: cat.description || "",
      productCount: 0
    }));

    res.json(formatted);

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: error.message
    });
  }
});

// GET single category
// GET single category
router.get("/:categoryName", async (req, res) => {
  try {
    const category = await Category.findOne({
      name: req.params.categoryName
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    const products = await Product.find({
      category: category.name
    });

    res.json({
      _id: category._id,
      name: category.name,
      description: category.description,
      image: category.image,
      icon: category.icon,
      products,
      productCount: products.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
});
// GET products by category
router.get("/:categoryName/products", async (req, res) => {
  try {
    const products = await Product.find({ 
      category: req.params.categoryName 
    }).sort({ createdAt: -1 });
    
    res.json({
      category: req.params.categoryName,
      products: products,
      total: products.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST - Create category
router.post("/", async (req, res) => {
  try {
    const { name, description, icon, image, order } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Name required" });
    }
    
    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }
    
    const category = new Category({
      name,
      description: description || "",
      icon: icon || "FaBoxOpen",
      image: image || null,
      order: order || 0
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT - Update category
router.put("/:id", async (req, res) => {
  try {
    const { name, description, icon, image, isActive, order } = req.body;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, image, isActive, order },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE - Remove category
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;