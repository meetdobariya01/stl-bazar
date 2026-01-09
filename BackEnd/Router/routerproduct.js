const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

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
    const { company, category, search } = req.query; // company is NAME string
    let filter = {};

    if (company) filter.company = company; // exact match
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("PRODUCT FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
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

module.exports = router;
