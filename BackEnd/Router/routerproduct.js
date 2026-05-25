const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const asyncHandler = require("../Comfig/authMiddleware/asyncHandler");
const Company = require("../Models/Company");
const Product = require("../Models/Product");
const Category = require("../Models/Category"); // Add this

/* =====================================================
   COMPANY ROUTES
===================================================== */

// GET all companies
router.get("/companies", async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch companies" });
  }
});

// CREATE company
router.post("/company", async (req, res) => {
  try {
    const { name, description, logo } = req.body;

    if (!name) return res.status(400).json({ message: "Company name is required" });

    const exists = await Company.findOne({ name });
    if (exists) return res.status(400).json({ message: "Company already exists" });

    const company = await Company.create({ name, description, logo });
    res.status(201).json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create company" });
  }
});

/* =====================================================
   CATEGORY ROUTES (NEW - Separate Model)
===================================================== */

// GET all categories from Category model
router.get("/all-categories", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 });
    
    // Get product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          category: category.name 
        });
        
        return {
          ...category.toObject(),
          productCount
        };
      })
    );
    
    res.json(categoriesWithCount);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// CREATE new category
router.post("/category", async (req, res) => {
  try {
    const { name, description, icon, image, order } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }
    
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }
    
    const category = new Category({
      name,
      description,
      icon: icon || "FaBoxOpen",
      image: image || "",
      order: order || 0
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create category" });
  }
});

// UPDATE category
router.put("/category/:id", async (req, res) => {
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
    res.status(500).json({ message: "Failed to update category" });
  }
});

// DELETE category
router.delete("/category/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete category" });
  }
});

// GET products by category name
router.get("/category-products/:categoryName", async (req, res) => {
  try {
    const { categoryName } = req.params;
    
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    const products = await Product.find({ 
      category: categoryName 
    }).sort({ createdAt: -1 });
    
    res.json({
      category: category,
      products: products,
      totalProducts: products.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products by category" });
  }
});

/* =====================================================
   EXISTING CATEGORY ROUTES (From Products - Keep for backward compatibility)
===================================================== */

// GET categories by company name
router.get("/companies/:companyName/categories", async (req, res) => {
  try {
    const { companyName } = req.params;
    const categories = await Product.distinct("category", { company: companyName });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// GET categories from products (existing - keep for compatibility)
router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          companies: { $addToSet: "$company" },
          productCount: { $sum: 1 },
          sampleImage: { $first: "$image" }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          companies: 1,
          productCount: 1,
          image: {
            $cond: {
              if: { $isArray: "$sampleImage" },
              then: { $arrayElemAt: ["$sampleImage", 0] },
              else: "$sampleImage"
            }
          }
        }
      },
      { $sort: { name: 1 } }
    ]);
    
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

/* =====================================================
   PRODUCT ROUTES
===================================================== */

// GET products by company + category + search
router.get("/products", async (req, res) => {
  try {
    const { company, category, search } = req.query;

    let filter = {};

    if (company) filter.company = company;
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// GET category-wise products for a company
router.get("/companies/:companyName/products-by-category", async (req, res) => {
  try {
    const { companyName } = req.params;

    const data = await Product.aggregate([
      { $match: { company: companyName } },
      {
        $group: {
          _id: "$category",
          products: {
            $push: {
              _id: "$_id",
              name: "$name",
              price: "$price",
              image: "$image",
              averageRating: "$averageRating",
            },
          },
        },
      },
      { $project: { _id: 0, category: "$_id", products: 1 } },
      { $sort: { category: 1 } },
    ]);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch company products" });
  }
});

// GET single product
router.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// GET first product of each company (best sellers)
router.get("/best-sellers", async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: 1 }).limit(6);
    const result = [];

    for (const company of companies) {
      const product = await Product.findOne({ company: company.name }).sort({ createdAt: 1 });
      if (product) result.push(product);
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch best sellers" });
  }
});

// NEW API: Get best sellers for arrival section
router.get("/arrival-best-sellers", async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: 1 }).limit(8);
    const products = [];

    for (const company of companies) {
      const product = await Product.findOne({ company: company.name }).sort({ createdAt: 1 });
      if (product) {
        products.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          company: product.company,
          category: product.category,
          averageRating: product.averageRating
        });
      }
    }

    const slides = [];
    for (let i = 0; i < products.length; i += 4) {
      slides.push({
        slideNumber: Math.floor(i / 4) + 1,
        products: products.slice(i, i + 4)
      });
    }

    res.json({
      success: true,
      totalProducts: products.length,
      totalSlides: slides.length,
      slides: slides,
      products: products
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch arrival best sellers" 
    });
  }
});

// Search products
router.get("/search", async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const products = await Product.find({
      name: {
        $regex: keyword,
        $options: "i",
      },
    }).limit(8);

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
});

// GET products with filters
router.get("/", asyncHandler(async (req, res) => {
  const { category, company } = req.query;
  let filter = {};
  if (category) filter.category = category;
  if (company) filter.company = company;
  const products = await Product.find(filter);
  res.json(products);
}));

module.exports = router;