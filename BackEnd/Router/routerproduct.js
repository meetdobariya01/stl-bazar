const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const asyncHandler = require("../Comfig/authMiddleware/asyncHandler");
const Company = require("../Models/Company");
const Product = require("../Models/Product");
const Vendor = require("../Models/Vendor"); // ✅ Import Vendor model

/* =====================================================
   COMPANY ROUTES
===================================================== */

// Search suggestions API - FILTER SUSPENDED VENDORS
router.get("/search-suggestions", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ 
        success: true, 
        products: [] 
      });
    }

    // Find products matching search
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { ProductName: { $regex: q, $options: "i" } }
      ]
    })
    .limit(8)
    .select("name ProductName price image company vendorId _id");

    // ✅ Get all vendor IDs from products
    const vendorIds = products.map(p => p.vendorId).filter(id => id);
    
    // ✅ Find suspended vendors
    let suspendedVendorIds = [];
    if (vendorIds.length > 0) {
      const suspendedVendors = await Vendor.find({
        _id: { $in: vendorIds },
        status: 'suspended'
      }).select('_id');
      suspendedVendorIds = suspendedVendors.map(v => v._id.toString());
    }

    // ✅ Filter out products from suspended vendors
    const formattedProducts = products
      .filter(p => !suspendedVendorIds.includes(p.vendorId?.toString()))
      .map(p => {
        const productObj = p.toObject ? p.toObject() : p;
        return {
          _id: productObj._id,
          name: productObj.name || productObj.ProductName || "Unnamed Product",
          price: productObj.price,
          image: productObj.image || [],
          company: productObj.company || "Native91"
        };
      });

    res.json({
      success: true,
      products: formattedProducts
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

// GET all companies - FILTER SUSPENDED
router.get("/companies", async (req, res) => {
  try {
    // ✅ Get all active companies from Vendor model
    const activeVendors = await Vendor.find({ 
      status: 'active',
      role: 'vendor'
    }).select('company');
    
    const activeCompanyNames = activeVendors.map(v => v.company);
    
    // ✅ Only fetch companies that have active vendors
    const companies = await Company.find({
      name: { $in: activeCompanyNames }
    }).sort({ createdAt: -1 });
    
    res.json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch companies" });
  }
});

// CREATE company (no change needed)
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

// GET products with filters - FILTER SUSPENDED VENDORS
router.get("/products", async (req, res) => {
  try {
    const { company, category, search } = req.query;

    let filter = {};

    if (company) filter.company = company;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { ProductName: { $regex: search, $options: "i" } }
      ];
    }

    let products = await Product.find(filter).sort({ createdAt: -1 });
    
    // Filter out suspended vendors
    const vendorIds = products.map(p => p.vendorId).filter(id => id);
    let suspendedVendorIds = [];
    if (vendorIds.length > 0) {
      const suspendedVendors = await Vendor.find({
        _id: { $in: vendorIds },
        status: 'suspended'
      }).select('_id');
      suspendedVendorIds = suspendedVendors.map(v => v._id.toString());
    }
    
    products = products.filter(p => 
      !suspendedVendorIds.includes(p.vendorId?.toString())
    );
    
    // ✅ Add stock to response
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});
// GET single product - CHECK SUSPENDED
router.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    
    // ✅ Check if vendor is suspended
    if (product.vendorId) {
      const vendor = await Vendor.findById(product.vendorId);
      if (vendor && vendor.status === 'suspended') {
        return res.status(403).json({ 
          message: "This product is currently unavailable",
          status: 'suspended'
        });
      }
    }
    
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// GET best sellers - FILTER SUSPENDED VENDORS
router.get("/best-sellers", async (req, res) => {
  try {
    // ✅ Get active companies first
    const activeVendors = await Vendor.find({ 
      status: 'active',
      role: 'vendor'
    }).select('company');
    const activeCompanyNames = activeVendors.map(v => v.company);
    
    // ✅ Only get products from active companies
    const companies = await Company.find({
      name: { $in: activeCompanyNames }
    }).sort({ createdAt: 1 }).limit(6);
    
    const result = [];

    for (const company of companies) {
      const product = await Product.findOne({ 
        company: company.name,
        vendorId: { $ne: null } // Ensure product has vendorId
      }).sort({ createdAt: 1 });
      if (product) {
        // Double check vendor status
        const vendor = await Vendor.findById(product.vendorId);
        if (vendor && vendor.status === 'active') {
          result.push(product);
        }
      }
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch best sellers" });
  }
});

// GET arrival best sellers - FILTER SUSPENDED VENDORS
router.get("/arrival-best-sellers", async (req, res) => {
  try {
    // ✅ Get active companies
    const activeVendors = await Vendor.find({ 
      status: 'active',
      role: 'vendor'
    }).select('company');
    const activeCompanyNames = activeVendors.map(v => v.company);
    
    const companies = await Company.find({
      name: { $in: activeCompanyNames }
    }).sort({ createdAt: 1 }).limit(8);
    
    const products = [];

    for (const company of companies) {
      const product = await Product.findOne({ 
        company: company.name,
        vendorId: { $ne: null }
      }).sort({ createdAt: 1 });
      
      if (product) {
        // Double check vendor status
        const vendor = await Vendor.findById(product.vendorId);
        if (vendor && vendor.status === 'active') {
          products.push({
            _id: product._id,
            name: product.name || product.ProductName,
            price: product.price,
            image: product.image,
            company: product.company,
            category: product.category,
            averageRating: product.averageRating
          });
        }
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

// Search products - FILTER SUSPENDED VENDORS
router.get("/search", async (req, res) => {
  try {
    const keyword = req.query.keyword;
    let products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { ProductName: { $regex: keyword, $options: "i" } }
      ]
    }).limit(8);

    // ✅ Filter out suspended vendors
    const vendorIds = products.map(p => p.vendorId).filter(id => id);
    let suspendedVendorIds = [];
    if (vendorIds.length > 0) {
      const suspendedVendors = await Vendor.find({
        _id: { $in: vendorIds },
        status: 'suspended'
      }).select('_id');
      suspendedVendorIds = suspendedVendors.map(v => v._id.toString());
    }
    
    products = products.filter(p => 
      !suspendedVendorIds.includes(p.vendorId?.toString())
    );

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

// ✅ NEW: Get products by vendor/company - FILTER SUSPENDED
router.get("/products/company/:companyName", async (req, res) => {
  try {
    const { companyName } = req.params;
    
    // ✅ Check if vendor is suspended
    const vendor = await Vendor.findOne({ 
      company: companyName,
      status: 'suspended'
    });
    
    if (vendor) {
      return res.status(403).json({ 
        message: "This company is currently unavailable",
        status: 'suspended'
      });
    }
    
    const products = await Product.find({ company: companyName });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch company products" });
  }
});

// ✅ NEW: Get active vendors list for user side
router.get("/active-vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find({ 
      status: 'active',
      role: 'vendor'
    }).select('name company plan status createdAt');
    
    res.json({
      success: true,
      vendors
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
});

module.exports = router;