const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Category = require("../Models/Category");
const Product = require("../Models/Product");

// GET all active categories
router.get("/", async (req, res) => {
  try {
    const db = mongoose.connection.db;

    if (!db) {
      console.error("❌ Database not connected!");
      return res.status(500).json({
        error: "Database not connected"
      });
    }

    const collection = db.collection("categories");
    // Get only active categories
    const categories = await collection.find({ status: "active" }).toArray();
    
    if (categories.length === 0) {
      return res.json([]);
    }

    // Format the response
    const formatted = categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      image: cat.image || "",
      description: cat.description || "",
      status: cat.status,
      productCount: 0
    }));

    console.log("Categories sent:", formatted.map(c => c.name));
    res.json(formatted);

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: error.message
    });
  }
});

// GET single category with products
router.get("/:categoryName", async (req, res) => {
  try {
    // Decode the category name (handles spaces)
    const categoryName = decodeURIComponent(req.params.categoryName);
    console.log("Looking for category:", categoryName);
    
    const category = await Category.findOne({
      name: categoryName
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

// GET products by category - FIXED for spaces
router.get("/:categoryName/products", async (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.categoryName);

    console.log("URL Category:", categoryName);

    const allProducts = await Product.find({});
    console.log(
      "Product Categories:",
      allProducts.map((p) => p.category)
    );

    const products = await Product.find({
      category: categoryName
    });

    console.log("Found:", products.length);

    res.json({
      success: true,
      products
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST - Create category
router.post("/", async (req, res) => {
  try {
    const { name, description, icon, image, order, status } = req.body;
    
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
      order: order || 0,
      status: status || "active"
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
    const { name, description, icon, image, status, order } = req.body;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, image, status, order },
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

// PATCH - Update category status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status (active/inactive) is required"
      });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: "Category not found" 
      });
    }

    res.json({
      success: true,
      message: `Category ${status === "active" ? "activated" : "deactivated"} successfully`,
      category
    });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

module.exports = router;