const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const asyncHandler = require("../Comfig/authMiddleware/asyncHandler");
const Company = require("../Models/Company");
const Product = require("../Models/Product");

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
   CATEGORY ROUTES (LIKE COLLECTIONS)
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
// GET first product of each company (company creation order)
// In routerproduct.js - Update the best-sellers endpoint
router.get("/best-sellers", async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: 1 }).limit(6);

    const result = [];

    for (const company of companies) {
      const product = await Product.findOne({ company: company.name })
        .sort({ createdAt: 1 });

      if (product) result.push(product);
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch best sellers" });
  }
});
// NEW API: Get best sellers for arrival section (8 products - 2 slides of 4 each)
router.get("/arrival-best-sellers", async (req, res) => {
  try {
    // Get 8 companies (for 8 products)
    const companies = await Company.find().sort({ createdAt: 1 }).limit(8);

    const products = [];

    for (const company of companies) {
      const product = await Product.findOne({ company: company.name })
        .sort({ createdAt: 1 });

      if (product) {
        // Format the product data
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

    // Split into slides (4 products per slide)
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
router.get("/", asyncHandler(async (req, res) => {
  const { category, company } = req.query;

  let filter = {};

  if (category) filter.category = category;
  if (company) filter.company = company;

  const products = await Product.find(filter);

  res.json(products);
}));
// In routerproduct.js - UPDATE this endpoint
router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          companies: { $addToSet: "$company" },
          productCount: { $sum: 1 },
          // Get the FIRST image from the array of the first product
          sampleImage: { $first: "$image" }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          companies: 1,
          productCount: 1,
          // Handle both string and array cases
          image: {
            $cond: {
              if: { $isArray: "$sampleImage" },
              then: { $arrayElemAt: ["$sampleImage", 0] },  // Get first element if array
              else: "$sampleImage"  // Use as is if string
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

module.exports = router;
