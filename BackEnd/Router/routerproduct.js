const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const asyncHandler = require("../Comfig/authMiddleware/asyncHandler");
const Company = require("../Models/Company");
const Product = require("../Models/Product");
// Category import remove karo (કારણકે category routes categoryRoutes.js માં છે)

/* =====================================================
   COMPANY ROUTES
===================================================== */

// Search suggestions API
router.get("/search-suggestions", async (req, res) => {
  try {
    const { q } = req.query;
    
    console.log("Search query received:", q);
    
    if (!q || q.trim().length === 0) {
      return res.json({ products: [] });
    }
    
    const products = await Product.find({
      name: { $regex: q, $options: "i" }
    })
    .limit(8)
    .select("name price image company _id");
    
    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    res.status(500).json({ 
      success: false, 
      products: [],
      message: "Failed to fetch suggestions" 
    });
  }
});

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
   PRODUCT ROUTES
===================================================== */

// GET products with filters
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

// GET best sellers
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

// GET arrival best sellers
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

module.exports = router;