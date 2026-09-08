

const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const asyncHandler = require("../Comfig/authMiddleware/asyncHandler");
const Company = require("../Models/Company");
const Product = require("../Models/Product");
const Vendor = require("../Models/Vendor");
const VendorSetting = require("../Models/VendorSetting");
const StockService = require("../Comfig/stockService");
const SellerDocument = require("../Models/SellerDocument");

router.get("/search-suggestions", async (req, res) => {
  try {
    const { q } = req.query;

    console.log(`🔍 Search suggestions request for: "${q}"`);

    if (!q || q.trim().length < 2) {
      return res.json({ 
        success: true, 
        products: [] 
      });
    }

    const searchTerm = q.trim();

    // Search in multiple fields
    const products = await Product.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { ProductName: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { category: { $regex: searchTerm, $options: "i" } },
        { company: { $regex: searchTerm, $options: "i" } }
      ],
      isActive: true
    })
    .limit(10)
    .select("name ProductName price image company vendorId _id stockQuantity stockStatus category")
    .lean();

    console.log(`📦 Found ${products.length} products matching "${searchTerm}"`);

    // Get vendor IDs to check for suspended vendors
    const vendorIds = products.map(p => p.vendorId).filter(id => id);
    
    let suspendedVendorIds = [];
    if (vendorIds.length > 0) {
      const suspendedVendors = await Vendor.find({
        _id: { $in: vendorIds },
        status: 'suspended'
      }).select('_id');
      suspendedVendorIds = suspendedVendors.map(v => v._id.toString());
    }

    // ✅ REMOVED stock filter - show all products regardless of stock
    const formattedProducts = products
      .filter(p => !suspendedVendorIds.includes(p.vendorId?.toString()))
      // ✅ REMOVED: .filter(p => p.stockQuantity > 0)
      .map(p => {
        // Get the first image or placeholder
        let imageUrl = null;
        if (p.image) {
          if (Array.isArray(p.image) && p.image.length > 0) {
            imageUrl = p.image[0];
          } else if (typeof p.image === 'string') {
            imageUrl = p.image;
          }
        }

        return {
          _id: p._id,
          name: p.name || p.ProductName || "Unnamed Product",
          price: p.price || 0,
          image: imageUrl ? [imageUrl] : [],
          company: p.company || "Native91",
          category: p.category || "",
          stockQuantity: p.stockQuantity || 0,
          stockStatus: p.stockStatus || "out_of_stock",
          inStock: p.stockQuantity > 0,
          slug: p.slug || p._id
        };
      });

    console.log(`✅ Returning ${formattedProducts.length} suggestions`);

    res.json({
      success: true,
      products: formattedProducts
    });

  } catch (error) {
    console.error("❌ Search suggestions error:", error);
    res.status(500).json({
      success: false,
      products: [],
      message: "Failed to fetch suggestions"
    });
  }
});



router.get("/companies", async (req, res) => {
  try {
    const activeVendors = await Vendor.find({ 
      status: 'active',
      role: 'vendor'
    }).select('_id company name email createdAt updatedAt plan categories category logo description');

    const companies = [];
    const categoryMap = {};

    for (const vendor of activeVendors) {
      let categories = [];
      let description = "";

      // ✅ Get description from Vendor first
      if (vendor.description) {
        description = vendor.description;
      }

      // ✅ Get categories from Vendor
      if (vendor.categories && vendor.categories.length > 0) {
        categories = vendor.categories;
      } else if (vendor.category) {
        categories = [vendor.category];
      }

      // ✅ Get logo from Vendor
      let logo = vendor.logo || null;
      
      // ✅ If no categories in Vendor, check SellerDocument
      if (categories.length === 0) {
        const sellerDoc = await SellerDocument.findOne({ email: vendor.email });
        if (sellerDoc) {
          // Get categories from SellerDocument
          if (sellerDoc.categories && sellerDoc.categories.length > 0) {
            categories = sellerDoc.categories;
          } else if (sellerDoc.category) {
            categories = [sellerDoc.category];
          }
          
          // ✅ Get description from SellerDocument brand description
          if (!description && sellerDoc.brand && sellerDoc.brand.description) {
            description = sellerDoc.brand.description;
          }
          
          // ✅ NEW: Get LOGO from SellerDocument
          if (!logo) {
            if (sellerDoc.logo && typeof sellerDoc.logo === 'object') {
              logo = sellerDoc.logo.image || sellerDoc.logo.url || null;
            } else if (Array.isArray(sellerDoc.logo)) {
              logo = sellerDoc.logo[0] || null;
            } else if (typeof sellerDoc.logo === 'string') {
              logo = sellerDoc.logo;
            }
          }
          
          // ✅ Get business name from SellerDocument
          if (sellerDoc.businessName) {
            vendor.company = sellerDoc.businessName;
          }
        }
      }
      
      // ✅ If still no category, check Company
      if (categories.length === 0) {
        const companyData = await Company.findOne({ name: vendor.company || vendor.name });
        if (companyData) {
          if (companyData.categories && companyData.categories.length > 0) {
            categories = companyData.categories;
          } else if (companyData.category) {
            categories = [companyData.category];
          }
          
          // ✅ Get description from Company
          if (!description && companyData.description) {
            description = companyData.description;
          }
        }
      }
      
      // ✅ Get logo from Company (if still not found)
      if (!logo) {
        const companyData = await Company.findOne({ name: vendor.company || vendor.name });
        if (companyData && companyData.logo) {
          logo = companyData.logo;
        }
      }

      // ✅ Count products for this company
      const productCount = await Product.countDocuments({ 
        company: vendor.company,
        stockQuantity: { $gt: 0 }
      });

      const companyDataObj = {
        _id: vendor._id,
        name: vendor.company || vendor.name,
        description: description || `${vendor.company || vendor.name} - Premium brand on Native91`,
        logo: logo,
        email: vendor.email,
        hasLogo: !!logo,
        categories: categories.length > 0 ? categories : ['Uncategorized'],
        category: categories.length > 0 ? categories[0] : 'Uncategorized',
        plan: vendor.plan || 'STARTER',
        status: vendor.status || 'active',
        productCount: productCount,
        createdAt: vendor.createdAt,
        registeredAt: vendor.createdAt
      };
      
      companies.push(companyDataObj);
      
      categories.forEach(cat => {
        if (!categoryMap[cat]) {
          categoryMap[cat] = [];
        }
        categoryMap[cat].push(vendor.company);
      });
    }

    res.json({
      success: true,
      companies: companies,
      categories: Object.keys(categoryMap).filter(k => k !== 'Uncategorized').sort(),
      stats: {
        total: companies.length,
        withCategories: companies.filter(c => c.categories && c.categories[0] !== 'Uncategorized').length,
        categoriesCount: Object.keys(categoryMap).filter(k => k !== 'Uncategorized').length
      }
    });
  } catch (err) {
    console.error("❌ Error fetching companies:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch companies",
      error: err.message
    });
  }
});



router.post("/company", async (req, res) => {
  try {
    const { name, description, logo, category } = req.body;

    if (!name) return res.status(400).json({ message: "Company name is required" });

    const exists = await Company.findOne({ name });
    if (exists) return res.status(400).json({ message: "Company already exists" });

    const company = await Company.create({ 
      name, 
      description, 
      logo,
      category 
    });
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
