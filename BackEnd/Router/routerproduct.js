const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const asyncHandler = require("../Comfig/authMiddleware/asyncHandler");
const Company = require("../Models/Company");
const Product = require("../Models/Product");
const Vendor = require("../Models/Vendor");
const StockService = require("../Comfig/stockService");

router.get("/search-suggestions", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ 
        success: true, 
        products: [] 
      });
    }

    
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { ProductName: { $regex: q, $options: "i" } }
      ]
    })
    .limit(8)
    .select("name ProductName price image company vendorId _id stockQuantity stockStatus");

    
    const vendorIds = products.map(p => p.vendorId).filter(id => id);
    
  
    let suspendedVendorIds = [];
    if (vendorIds.length > 0) {
      const suspendedVendors = await Vendor.find({
        _id: { $in: vendorIds },
        status: 'suspended'
      }).select('_id');
      suspendedVendorIds = suspendedVendors.map(v => v._id.toString());
    }

 
    const formattedProducts = products
      .filter(p => !suspendedVendorIds.includes(p.vendorId?.toString()))
      .filter(p => p.stockQuantity > 0) 
      .map(p => {
        const productObj = p.toObject ? p.toObject() : p;
        return {
          _id: productObj._id,
          name: productObj.name || productObj.ProductName || "Unnamed Product",
          price: productObj.price,
          image: productObj.image || [],
          company: productObj.company || "Native91",
          stockQuantity: productObj.stockQuantity || 0,
          stockStatus: productObj.stockStatus || "out_of_stock",
          inStock: productObj.stockQuantity > 0
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


router.get("/companies", async (req, res) => {
  try {
    // ✅ Get all active companies from Vendor model
    const activeVendors = await Vendor.find({ 
      status: 'active',
      role: 'vendor'
    }).select('company');
    
    const activeCompanyNames = activeVendors.map(v => v.company);

    const companies = await Company.find({
      name: { $in: activeCompanyNames }
    }).sort({ createdAt: -1 });
    
    res.json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch companies" });
  }
});


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


router.get("/products", async (req, res) => {
  try {
    const { company, category, search, inStock, minPrice, maxPrice } = req.query;

    let filter = {};

    if (company) filter.company = company;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { ProductName: { $regex: search, $options: "i" } }
      ];
    }
    

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    let products = await Product.find(filter).sort({ createdAt: -1 });
   
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
    

    if (inStock === 'true') {
      products = products.filter(p => p.stockQuantity > 0);
    }

    const formattedProducts = products.map(p => {
      const productObj = p.toObject ? p.toObject() : p;
      return {
        ...productObj,
        inStock: productObj.stockQuantity > 0,
        availableStock: Math.max(0, productObj.stockQuantity - (productObj.reservedStock || 0)),
        stockStatus: productObj.stockStatus || "out_of_stock"
      };
    });

    res.json(formattedProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

router.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    

    if (product.vendorId) {
      const vendor = await Vendor.findById(product.vendorId);
      if (vendor && vendor.status === 'suspended') {
        return res.status(403).json({ 
          message: "This product is currently unavailable",
          status: 'suspended'
        });
      }
    }
    
   
    const productObj = product.toObject ? product.toObject() : product;
    const response = {
      ...productObj,
      inStock: productObj.stockQuantity > 0,
      availableStock: Math.max(0, productObj.stockQuantity - (productObj.reservedStock || 0)),
      stockStatus: productObj.stockStatus || "out_of_stock",
      
    };
    
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

router.get("/best-sellers", async (req, res) => {
  try {
  
    const activeVendors = await Vendor.find({ 
      status: 'active',
      role: 'vendor'
    }).select('company');
    const activeCompanyNames = activeVendors.map(v => v.company);

    const companies = await Company.find({
      name: { $in: activeCompanyNames }
    }).sort({ createdAt: 1 }).limit(6);
    
    const result = [];

    for (const company of companies) {
      const product = await Product.findOne({ 
        company: company.name,
        vendorId: { $ne: null },
        stockQuantity: { $gt: 0 }
      }).sort({ createdAt: 1 });
      
      if (product) {
       
        const vendor = await Vendor.findById(product.vendorId);
        if (vendor && vendor.status === 'active') {
          const productObj = product.toObject ? product.toObject() : product;
          result.push({
            ...productObj,
            inStock: productObj.stockQuantity > 0,
            availableStock: Math.max(0, productObj.stockQuantity - (productObj.reservedStock || 0))
          });
        }
      }
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch best sellers" });
  }
});


router.get("/arrival-best-sellers", async (req, res) => {
  try {

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

        const vendor = await Vendor.findById(product.vendorId);
        if (vendor && vendor.status === 'active') {
          const productObj = product.toObject ? product.toObject() : product;
          products.push({
            _id: productObj._id,
            name: productObj.name || productObj.ProductName,
            price: productObj.price,
            image: productObj.image,
            company: productObj.company,
            category: productObj.category,
            averageRating: productObj.averageRating,
            stockQuantity: productObj.stockQuantity || 0,
            stockStatus: productObj.stockStatus || "out_of_stock",
            inStock: productObj.stockQuantity > 0,
            availableStock: Math.max(0, productObj.stockQuantity - (productObj.reservedStock || 0))
          });
        }
      }
    }

    const inStockProducts = products.filter(p => p.stockQuantity > 0);

    const slides = [];
    for (let i = 0; i < inStockProducts.length; i += 4) {
      slides.push({
        slideNumber: Math.floor(i / 4) + 1,
        products: inStockProducts.slice(i, i + 4)
      });
    }

    res.json({
      success: true,
      totalProducts: products.length,
      inStockCount: inStockProducts.length,
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
    let products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { ProductName: { $regex: keyword, $options: "i" } }
      ]
    }).limit(8);


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


    const formattedProducts = products.map(p => {
      const productObj = p.toObject ? p.toObject() : p;
      return {
        ...productObj,
        inStock: productObj.stockQuantity > 0,
        availableStock: Math.max(0, productObj.stockQuantity - (productObj.reservedStock || 0))
      };
    });

    res.status(200).json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
});


router.get("/products/company/:companyName", async (req, res) => {
  try {
    const { companyName } = req.params;
    

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
    
    // ✅ Format with stock info
    const formattedProducts = products.map(p => {
      const productObj = p.toObject ? p.toObject() : p;
      return {
        ...productObj,
        inStock: productObj.stockQuantity > 0,
        availableStock: Math.max(0, productObj.stockQuantity - (productObj.reservedStock || 0))
      };
    });
    
    res.json(formattedProducts);
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

// ✅ NEW: Get product stock for cart validation (user-side)
router.post("/cart/validate-stock", async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide cart items"
      });
    }
    
    const stockValidation = [];
    let allInStock = true;
    
    for (const item of items) {
      const product = await Product.findById(item.productId)
        .select('name stockQuantity reservedStock stockStatus price');
      
      if (!product) {
        stockValidation.push({
          productId: item.productId,
          name: item.name || "Unknown Product",
          requested: item.quantity,
          available: 0,
          inStock: false,
          issue: "Product not found"
        });
        allInStock = false;
        continue;
      }
      
      // Check vendor status
      if (product.vendorId) {
        const vendor = await Vendor.findById(product.vendorId);
        if (vendor && vendor.status === 'suspended') {
          stockValidation.push({
            productId: item.productId,
            name: product.name || item.name,
            requested: item.quantity,
            available: 0,
            inStock: false,
            issue: "Vendor suspended"
          });
          allInStock = false;
          continue;
        }
      }
      
      const availableStock = Math.max(0, product.stockQuantity - (product.reservedStock || 0));
      const requested = item.quantity || 1;
      const inStock = availableStock >= requested;
      
      stockValidation.push({
        productId: item.productId,
        name: product.name || item.name,
        requested: requested,
        available: availableStock,
        stockQuantity: product.stockQuantity,
        inStock: inStock,
        price: product.price,
        issue: inStock ? null : "Insufficient stock"
      });
      
      if (!inStock) allInStock = false;
    }
    
    res.json({
      success: true,
      allInStock: allInStock,
      validation: stockValidation,
      summary: {
        total: stockValidation.length,
        inStock: stockValidation.filter(s => s.inStock).length,
        outOfStock: stockValidation.filter(s => !s.inStock).length
      }
    });
  } catch (err) {
    console.error("Cart stock validation error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to validate stock",
      error: err.message
    });
  }
});

// ✅ NEW: Get low stock alerts (for frontend notifications)
router.get("/low-stock-alerts", async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5;
    
    // Get active vendors
    const activeVendors = await Vendor.find({ 
      status: 'active',
      role: 'vendor'
    }).select('_id');
    const activeVendorIds = activeVendors.map(v => v._id);
    
    const products = await Product.find({
      vendorId: { $in: activeVendorIds },
      stockQuantity: { $lte: threshold, $gt: 0 }
    }).select('name stockQuantity lowStockThreshold company image');
    
    res.json({
      success: true,
      count: products.length,
      threshold: threshold,
      products: products
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch low stock alerts" });
  }
});

// ✅ NEW: Get available stock for multiple products (bulk check)
router.post("/products/stock/bulk", async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide product IDs"
      });
    }
    
    const products = await Product.find({
      _id: { $in: productIds }
    }).select('_id name stockQuantity reservedStock stockStatus price');
    
    const stockData = products.map(p => ({
      productId: p._id,
      name: p.name,
      stockQuantity: p.stockQuantity,
      reservedStock: p.reservedStock || 0,
      availableStock: Math.max(0, p.stockQuantity - (p.reservedStock || 0)),
      stockStatus: p.stockStatus || "out_of_stock",
      inStock: p.stockQuantity > 0,
      price: p.price
    }));
    
    res.json({
      success: true,
      products: stockData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stock data"
    });
  }
});

module.exports = router;