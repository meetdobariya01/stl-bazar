const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const asyncHandler = require("../Comfig/authMiddleware/asyncHandler");
const Company = require("../Models/Company");
const Product = require("../Models/Product");
const Vendor = require("../Models/Vendor");
const VendorSetting = require("../Models/VendorSetting"); // ✅ Add this
const StockService = require("../Comfig/stockService");
const SellerDocument = require("../Models/SellerDocument");

// ============================================================
// SEARCH SUGGESTIONS
// ============================================================
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

// ============================================================
// ✅ GET COMPANIES - UPDATED WITH VENDOR SETTINGS LOGO
// ============================================================
// In your routes file - UPDATED /companies endpoint

router.get("/companies", async (req, res) => {
  try {
    // Get all active vendors
    const activeVendors = await Vendor.find({ 
      status: 'active',
      role: 'vendor'
    }).select('_id company name email');

    const companies = [];

    for (const vendor of activeVendors) {
      // ✅ Get Company data first
      const companyData = await Company.findOne({ 
        name: vendor.company || vendor.name 
      });
      
      // ✅ Get Vendor Settings
      const settings = await VendorSetting.findOne({ vendorId: vendor._id });
      
      let logo = null;
      let description = '';
      let companyName = vendor.company || vendor.name || 'N/A';

      // ✅ 1. Get description from Company model FIRST
      if (companyData) {
        description = companyData.description || '';
        // If Company has logo, use it
        if (companyData.logo) {
          logo = companyData.logo;
        }
      }

      // ✅ 2. Get logo from settings (override if Company logo not found)
      if (settings && !logo) {
        logo = settings.logo || null;
        if (settings.companyDescription) {
          description = settings.companyDescription;
        }
      }

      // ✅ 3. If no logo in settings, try SellerDocument
      if (!logo) {
        const doc = await SellerDocument.findOne({ 
          email: vendor.email,
          status: { $in: ['verified', 'submitted', 'pending_review'] }
        });
        
        if (doc && doc.logo && doc.logo.image) {
          logo = doc.logo.image;
          description = doc.brand?.description || description;
          
          // Sync to VendorSettings
          if (settings) {
            settings.logo = logo;
            if (doc.brand?.description) {
              settings.companyDescription = doc.brand.description;
            }
            await settings.save();
          }
        }
      }

      // ✅ Only add if company name exists
      if (companyName && companyName !== 'N/A') {
        companies.push({
          _id: vendor._id,
          name: companyName,
          description: description || `${companyName} - Premium brand on Native91`, // Fallback if no description
          logo: logo,
          email: vendor.email,
          hasLogo: !!logo
        });
      }
    }

    console.log(`✅ Found ${companies.length} active companies`);
    console.log(`📊 Companies with logos: ${companies.filter(c => c.hasLogo).length}`);

    res.json({
      success: true,
      companies: companies,
      stats: {
        total: companies.length,
        withLogo: companies.filter(c => c.hasLogo).length,
        withoutLogo: companies.filter(c => !c.hasLogo).length
      }
    });
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch companies",
      error: err.message
    });
  }
});
// ============================================================
// ✅ GET COMPANY BY ID - UPDATED
// ============================================================
router.get("/company/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    // Get settings
    const settings = await VendorSetting.findOne({ vendorId: vendor._id });
    
    let logo = settings?.logo || null;
    let description = settings?.companyDescription || '';

    // If no logo, try documents
    if (!logo) {
      const doc = await SellerDocument.findOne({ 
        email: vendor.email,
        status: { $in: ['verified', 'submitted', 'pending_review'] }
      });
      if (doc && doc.logo && doc.logo.image) {
        logo = doc.logo.image;
        description = doc.brand?.description || description;
      }
    }

    res.json({
      success: true,
      company: {
        _id: vendor._id,
        name: vendor.company || vendor.name,
        description: description || `${vendor.company} - Premium brand`,
        logo: logo,
        email: vendor.email,
        status: vendor.status
      }
    });
  } catch (err) {
    console.error("Error fetching company:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// ============================================================
// CREATE COMPANY (Admin only)
// ============================================================
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

// ============================================================
// GET PRODUCTS
// ============================================================
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

// ============================================================
// GET PRODUCT BY ID
// ============================================================
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

// ============================================================
// GET BEST SELLERS
// ============================================================
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

// ============================================================
// GET ARRIVAL BEST SELLERS
// ============================================================
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

// ============================================================
// SEARCH PRODUCTS
// ============================================================
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

// ============================================================
// GET PRODUCTS BY COMPANY NAME
// ============================================================
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
// ============================================================
// ✅ GET COMPANY DETAILS BY NAME - NEW ENDPOINT
// ============================================================
router.get("/company/details/:name", async (req, res) => {
  try {
    const { name } = req.params;
    
    console.log(`🔵 Fetching company details for: "${name}"`);
    
    // Try to find company by name (case insensitive)
    let company = await Company.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    console.log("🔵 Company found in Company model:", company);
    
    // If not found in Company, try Vendor
    if (!company) {
      const vendor = await Vendor.findOne({ 
        company: { $regex: new RegExp(`^${name}$`, 'i') },
        status: 'active'
      });
      
      console.log("🔵 Vendor found:", vendor);
      
      if (vendor) {
        // Check if there's a Company document for this vendor
        company = await Company.findOne({ name: vendor.company });
        
        if (!company) {
          // Return vendor data as fallback
          return res.json({
            success: true,
            company: {
              name: vendor.company || vendor.name,
              description: vendor.description || `${vendor.company || vendor.name} - Premium brand on Native91`,
              logo: null,
              email: vendor.email,
              status: vendor.status
            }
          });
        }
      }
    }
    
    // If still not found, try VendorSetting
    if (!company) {
      const vendorSetting = await VendorSetting.findOne({ 
        companyName: { $regex: new RegExp(`^${name}$`, 'i') }
      });
      
      if (vendorSetting) {
        return res.json({
          success: true,
          company: {
            name: vendorSetting.companyName || name,
            description: vendorSetting.companyDescription || `${name} - Premium brand on Native91`,
            logo: vendorSetting.logo || null,
            email: vendorSetting.email || null
          }
        });
      }
      
      // Return 404 if nothing found
      return res.status(404).json({
        success: false,
        message: `Company "${name}" not found`
      });
    }
    
    // Return company data from Company model
    res.json({
      success: true,
      company: {
        _id: company._id,
        name: company.name,
        description: company.description || `${company.name} - Premium brand on Native91`,
        logo: company.logo || null,
        status: company.status || 'Active',
        email: company.email || null
      }
    });
    
  } catch (err) {
    console.error("🔴 Error fetching company details:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
// ============================================================
// GET ACTIVE VENDORS
// ============================================================
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

// ============================================================
// CART STOCK VALIDATION
// ============================================================
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
        .select('name stockQuantity reservedStock stockStatus price vendorId');
      
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

// ============================================================
// GET LOW STOCK ALERTS
// ============================================================
router.get("/low-stock-alerts", async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5;
    
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

// ============================================================
// BULK STOCK CHECK
// ============================================================
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