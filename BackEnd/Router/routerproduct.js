// // routes/user.routes.js — User-facing API routes

// const express = require("express");
// const mongoose = require("mongoose");
// const router = express.Router();
// const asyncHandler = require("../Comfig/authMiddleware/asyncHandler");
// const Company = require("../Models/Company");
// const Product = require("../Models/Product");
// const Vendor = require("../Models/Vendor");
// const VendorSetting = require("../Models/VendorSetting");
// const StockService = require("../Comfig/stockService");
// const SellerDocument = require("../Models/SellerDocument");
// const Category = require("../Models/Category");

// // ============================================================
// // HELPERS
// // ============================================================
// const cleanSubString = (s) => {
//   if (!s) return "";
//   return String(s).replace(/[\[\]"']/g, "").trim();
// };

// const collectSubcategories = (productObj) => {
//   const allSubs = [];

//   if (productObj.subCategory) allSubs.push(cleanSubString(productObj.subCategory));
//   if (productObj.subcategory) allSubs.push(cleanSubString(productObj.subcategory));

//   if (Array.isArray(productObj.subCategories)) {
//     productObj.subCategories.forEach(s => allSubs.push(cleanSubString(s)));
//   }
//   if (Array.isArray(productObj.subcategories)) {
//     productObj.subcategories.forEach(s => allSubs.push(cleanSubString(s)));
//   }

//   if (productObj.categorySubcategoryMap && typeof productObj.categorySubcategoryMap === "object") {
//     Object.values(productObj.categorySubcategoryMap).forEach(arr => {
//       if (Array.isArray(arr)) arr.forEach(s => allSubs.push(cleanSubString(s)));
//     });
//   }

//   return [...new Set(allSubs.filter(Boolean))];
// };

// const formatProduct = (p) => {
//   const productObj = p.toObject ? p.toObject() : p;
//   const cleanSubs = collectSubcategories(productObj);

//   // ✅ Custom Field — only enabled + label
//   const cf = productObj.customField || {};
//   const cfEnabled =
//     cf.enabled === true ||
//     cf.enabled === "true" ||
//     cf.enabled === 1 ||
//     cf.enabled === "1";

//   const stockValue =
//     typeof productObj.stockQuantity === "number"
//       ? productObj.stockQuantity
//       : (typeof productObj.stock === "number" ? productObj.stock : 0);

//   const reserved = productObj.reservedStock || 0;

//   return {
//     ...productObj,
//     subCategory: cleanSubs[0] || "",
//     subcategory: cleanSubs[0] || "",
//     subCategories: cleanSubs,
//     subcategories: cleanSubs,
//     variants: productObj.variants || [],

//     inStock: stockValue > 0,
//     availableStock: Math.max(0, stockValue - reserved),
//     stockStatus: productObj.stockStatus || (stockValue > 0 ? "in_stock" : "out_of_stock"),

//     // 🆕 CUSTOM FIELD — only enabled + label (customer types the value)
//     customField: {
//       enabled: cfEnabled,
//       label:   cf.label || ""
//     },

//     shippingTime: productObj.shippingTime || "3-5 days",
//     customShippingTime: productObj.customShippingTime || "",
//     estimatedDeliveryDays: productObj.estimatedDeliveryDays || { min: 3, max: 5 }
//   };
// };

// // ============================================================
// // SEARCH SUGGESTIONS
// // ============================================================
// router.get("/search-suggestions", async (req, res) => {
//   try {
//     const { q } = req.query;

//     console.log(`🔍 Search suggestions request for: "${q}"`);

//     if (!q || q.trim().length < 2) {
//       return res.json({ success: true, products: [] });
//     }

//     const searchTerm = q.trim();

//     const products = await Product.find({
//       $or: [
//         { name: { $regex: searchTerm, $options: "i" } },
//         { ProductName: { $regex: searchTerm, $options: "i" } },
//         { description: { $regex: searchTerm, $options: "i" } },
//         { category: { $regex: searchTerm, $options: "i" } },
//         { company: { $regex: searchTerm, $options: "i" } }
//       ],
//       isActive: true
//     })
//       .limit(10)
//       .select("name ProductName price image company vendorId _id stockQuantity stockStatus category subcategory subcategories variants shippingTime customShippingTime")
//       .lean();

//     const vendorIds = products.map(p => p.vendorId).filter(id => id);

//     let suspendedVendorIds = [];
//     if (vendorIds.length > 0) {
//       const suspendedVendors = await Vendor.find({
//         _id: { $in: vendorIds },
//         status: 'suspended'
//       }).select('_id');
//       suspendedVendorIds = suspendedVendors.map(v => v._id.toString());
//     }

//     const formattedProducts = products
//       .filter(p => !suspendedVendorIds.includes(p.vendorId?.toString()))
//       .map(p => {
//         let imageUrl = null;
//         if (p.image) {
//           if (Array.isArray(p.image) && p.image.length > 0) {
//             imageUrl = p.image[0];
//           } else if (typeof p.image === 'string') {
//             imageUrl = p.image;
//           }
//         }

//         return {
//           _id: p._id,
//           name: p.name || p.ProductName || "Unnamed Product",
//           price: p.price || 0,
//           image: imageUrl ? [imageUrl] : [],
//           company: p.company || "Native91",
//           category: p.category || "",
//           subcategory: p.subcategory || p.subCategory || "",
//           subcategories: p.subcategories || p.subCategories || [],
//           variants: p.variants || [],
//           stockQuantity: p.stockQuantity || 0,
//           stockStatus: p.stockStatus || "out_of_stock",
//           inStock: p.stockQuantity > 0,
//           shippingTime: p.shippingTime || "3-5 days",
//           customShippingTime: p.customShippingTime || "",
//           slug: p.slug || p._id
//         };
//       });

//     res.json({ success: true, products: formattedProducts });
//   } catch (error) {
//     console.error("❌ Search suggestions error:", error);
//     res.status(500).json({
//       success: false,
//       products: [],
//       message: "Failed to fetch suggestions"
//     });
//   }
// });

// // ============================================================
// // GET COMPANIES
// // ============================================================
// router.get("/companies", async (req, res) => {
//   try {
//     const activeVendors = await Vendor.find({
//       status: 'active',
//       role: 'vendor'
//     }).select('_id company name email createdAt updatedAt plan categories category logo description');

//     const companies = [];
//     const categoryMap = {};

//     for (const vendor of activeVendors) {
//       let categories = [];
//       let description = "";
//       let logo = vendor.logo || null;

//       if (vendor.description) description = vendor.description;

//       if (vendor.categories && vendor.categories.length > 0) {
//         categories = vendor.categories;
//       } else if (vendor.category && typeof vendor.category === 'string') {
//         categories = vendor.category.split(",").map(c => c.trim()).filter(Boolean);
//       }

//       if (categories.length === 0 || !logo) {
//         const sellerDoc = await SellerDocument.findOne({ email: vendor.email });
//         if (sellerDoc) {
//           if (sellerDoc.categories && Array.isArray(sellerDoc.categories) && sellerDoc.categories.length > 0) {
//             categories = sellerDoc.categories;
//           } else if (sellerDoc.category && typeof sellerDoc.category === 'string') {
//             categories = sellerDoc.category.split(",").map(c => c.trim()).filter(Boolean);
//           } else if (sellerDoc.brand && Array.isArray(sellerDoc.brand.categories) && sellerDoc.brand.categories.length > 0) {
//             categories = sellerDoc.brand.categories;
//           } else if (sellerDoc.brand && sellerDoc.brand.category && typeof sellerDoc.brand.category === 'string') {
//             categories = sellerDoc.brand.category.split(",").map(c => c.trim()).filter(Boolean);
//           }

//           if (!logo) {
//             if (sellerDoc.logo && typeof sellerDoc.logo === 'object') {
//               logo = sellerDoc.logo.image || sellerDoc.logo.url || null;
//             } else if (typeof sellerDoc.logo === 'string') {
//               logo = sellerDoc.logo;
//             }
//           }

//           if (!description && sellerDoc.brand && sellerDoc.brand.description) {
//             description = sellerDoc.brand.description;
//           }

//           if (sellerDoc.businessName) vendor.company = sellerDoc.businessName;
//         }
//       }

//       if (categories.length === 0 || !logo) {
//         const companyData = await Company.findOne({ name: vendor.company || vendor.name });
//         if (companyData) {
//           if (companyData.categories && companyData.categories.length > 0) {
//             categories = companyData.categories;
//           } else if (companyData.category && typeof companyData.category === 'string') {
//             categories = companyData.category.split(",").map(c => c.trim()).filter(Boolean);
//           }

//           if (!description && companyData.description) description = companyData.description;
//           if (!logo && companyData.logo) logo = companyData.logo;
//         }
//       }

//       if (categories.length === 0) {
//         const products = await Product.find({
//           company: vendor.company,
//           stockQuantity: { $gt: 0 }
//         }).select('category').limit(10);

//         const productCategories = new Set();
//         products.forEach(p => {
//           if (p.category) {
//             if (Array.isArray(p.category)) {
//               p.category.forEach(c => { if (c && c.trim()) productCategories.add(c.trim()); });
//             } else if (typeof p.category === 'string') {
//               p.category.split(',').forEach(c => { if (c && c.trim()) productCategories.add(c.trim()); });
//             }
//           }
//         });

//         categories = Array.from(productCategories);
//       }

//       if (categories.length === 0) categories = ['Uncategorized'];

//       const productCount = await Product.countDocuments({
//         company: vendor.company,
//         stockQuantity: { $gt: 0 }
//       });

//       companies.push({
//         _id: vendor._id,
//         name: vendor.company || vendor.name,
//         description: description || `${vendor.company || vendor.name} - Premium brand on Native91`,
//         logo: logo,
//         email: vendor.email,
//         hasLogo: !!logo,
//         categories: categories,
//         category: categories.length > 0 ? categories[0] : 'Uncategorized',
//         plan: vendor.plan || 'STARTER',
//         status: vendor.status || 'active',
//         productCount: productCount,
//         createdAt: vendor.createdAt,
//         registeredAt: vendor.createdAt
//       });

//       categories.forEach(cat => {
//         if (!categoryMap[cat]) categoryMap[cat] = [];
//         categoryMap[cat].push(vendor.company);
//       });
//     }

//     res.json({
//       success: true,
//       companies: companies,
//       categories: Object.keys(categoryMap).filter(k => k !== 'Uncategorized').sort(),
//       stats: {
//         total: companies.length,
//         withLogos: companies.filter(c => c.hasLogo).length,
//         withCategories: companies.filter(c => c.categories && c.categories[0] !== 'Uncategorized').length,
//         categoriesCount: Object.keys(categoryMap).filter(k => k !== 'Uncategorized').length
//       }
//     });
//   } catch (err) {
//     console.error("❌ Error fetching companies:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch companies",
//       error: err.message
//     });
//   }
// });

// // ============================================================
// // GET SUB-CATEGORIES FOR A CATEGORY
// // ============================================================
// router.get("/categories/:category/subcategories", async (req, res) => {
//   try {
//     const { category } = req.params;
//     const decodedCategory = decodeURIComponent(category);
//     const s1 = await Product.distinct("subcategory", { category: decodedCategory });
//     const s2 = await Product.distinct("subCategory", { category: decodedCategory });
//     const s3 = await Product.distinct("subcategories", { category: decodedCategory });
//     const s4 = await Product.distinct("subCategories", { category: decodedCategory });
//     let fromProducts = [...s1, ...s2, ...s3, ...s4];

//     fromProducts = fromProducts
//       .filter(Boolean)
//       .map(s => String(s).replace(/[\[\]"']/g, "").trim())
//       .filter(Boolean);

//     let fromAdmin = [];
//     try {
//       const adminCategory = await Category.findOne({
//         name: { $regex: new RegExp(`^${decodedCategory}$`, "i") },
//         status: "active"
//       }).select("subcategories");

//       if (adminCategory && Array.isArray(adminCategory.subcategories)) {
//         fromAdmin = adminCategory.subcategories
//           .filter(sc => sc.status === "active")
//           .map(sc => sc.name);
//       }
//     } catch (adminErr) {
//       console.warn("⚠️ Admin category lookup failed:", adminErr.message);
//     }

//     const allSubCategories = [...fromProducts, ...fromAdmin];
//     const uniqueSubCategories = [...new Set(allSubCategories)]
//       .filter(s => s && typeof s === "string" && s.trim() !== "")
//       .map(s => s.trim());

//     res.json({
//       success: true,
//       category: decodedCategory,
//       subCategories: uniqueSubCategories
//     });
//   } catch (error) {
//     console.error("❌ Error fetching sub-categories:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============================================================
// // GET PRODUCTS BY CATEGORY
// // ============================================================
// router.get("/products/by-category/:category", async (req, res) => {
//   try {
//     const { category } = req.params;

//     const products = await Product.find({
//       category: decodeURIComponent(category),
//       isActive: true
//     }).select('subcategory subcategories subCategory subCategories name price');

//     res.json({ success: true, products });
//   } catch (error) {
//     console.error("Error fetching products by category:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============================================================
// // CREATE COMPANY
// // ============================================================
// router.post("/company", async (req, res) => {
//   try {
//     const { name, description, logo, category } = req.body;

//     if (!name) return res.status(400).json({ message: "Company name is required" });

//     const exists = await Company.findOne({ name });
//     if (exists) return res.status(400).json({ message: "Company already exists" });

//     const company = await Company.create({ name, description, logo, category });
//     res.status(201).json(company);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to create company" });
//   }
// });

// // ============================================================
// // GET PRODUCTS
// // ============================================================
// router.get("/products", async (req, res) => {
//   try {
//     const { company, category, subcategory, search, inStock, minPrice, maxPrice } = req.query;

//     let filter = {};

//     if (company) filter.company = company;
//     if (category) filter.category = category;

//     if (subcategory) {
//       filter.$or = [
//         { subcategory: subcategory },
//         { subCategory: subcategory },
//         { subcategories: subcategory },
//         { subCategories: subcategory },
//       ];
//     }
//     if (search) {
//       filter.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { ProductName: { $regex: search, $options: "i" } }
//       ];
//     }

//     if (minPrice || maxPrice) {
//       filter.price = {};
//       if (minPrice) filter.price.$gte = parseFloat(minPrice);
//       if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
//     }

//     let products = await Product.find(filter).sort({ createdAt: -1 });

//     const vendorIds = products.map(p => p.vendorId).filter(id => id);
//     let suspendedVendorIds = [];
//     if (vendorIds.length > 0) {
//       const suspendedVendors = await Vendor.find({
//         _id: { $in: vendorIds },
//         status: 'suspended'
//       }).select('_id');
//       suspendedVendorIds = suspendedVendors.map(v => v._id.toString());
//     }

//     products = products.filter(p =>
//       !suspendedVendorIds.includes(p.vendorId?.toString())
//     );

//     if (inStock === 'true') {
//       products = products.filter(p => p.stockQuantity > 0);
//     }

//     const formattedProducts = products.map(formatProduct);

//     res.json(formattedProducts);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch products" });
//   }
// });

// // ============================================================
// // GET PRODUCT BY ID (variant-aware stock)
// // ============================================================
// router.get("/product/:id", async (req, res) => {
//   try {
//     const { variantId } = req.query;

//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     if (product.vendorId) {
//       const vendor = await Vendor.findById(product.vendorId);
//       if (vendor && vendor.status === "suspended") {
//         return res.status(403).json({
//           message: "This product is currently unavailable",
//           status: "suspended",
//         });
//       }
//     }

//     const response = formatProduct(product);

//     if (variantId && product.variants && product.variants.length > 0) {
//       const targetId = String(variantId).trim();

//       console.log("🔍 Variant lookup:", {
//         targetId,
//         availableIds: product.variants.map((v) =>
//           v._id ? v._id.toString() : null
//         ),
//       });

//       const variant = product.variants.find((v) => {
//         if (!v._id) return false;
//         return v._id.toString() === targetId;
//       });

//       if (variant) {
//         const variantStock = Math.max(
//           0,
//           (variant.stock || 0) - (variant.reservedStock || 0)
//         );

//         response.stock = variantStock;
//         response.stockQuantity = variantStock;
//         response.variantStock = variantStock;
//         response.variantId = variant._id;
//         response.inStock = variantStock > 0;
//         response.availableStock = variantStock;
//         response.stockStatus =
//           variantStock > 0 ? "in_stock" : "out_of_stock";

//         if (variant.price) response.price = variant.price;
//         if (variant.image) response.image = [variant.image];

//         console.log(`✅ Found variant, stock = ${variantStock}`);
//       } else {
//         console.log(`❌ Variant NOT found for ID: ${targetId}`);
//       }
//     }

//     res.json(response);
//   } catch (err) {
//     console.error("❌ Get product error:", err);
//     res.status(500).json({ message: "Failed to fetch product" });
//   }
// });

// // ============================================================
// // GET BEST SELLERS
// // ============================================================
// router.get("/best-sellers", async (req, res) => {
//   try {
//     const activeVendors = await Vendor.find({
//       status: 'active',
//       role: 'vendor'
//     }).select('company');
//     const activeCompanyNames = activeVendors.map(v => v.company);

//     const companies = await Company.find({
//       name: { $in: activeCompanyNames }
//     }).sort({ createdAt: 1 }).limit(6);

//     const result = [];

//     for (const company of companies) {
//       const product = await Product.findOne({
//         company: company.name,
//         vendorId: { $ne: null },
//         stockQuantity: { $gt: 0 }
//       }).sort({ createdAt: 1 });

//       if (product) {
//         const vendor = await Vendor.findById(product.vendorId);
//         if (vendor && vendor.status === 'active') {
//           result.push(formatProduct(product));
//         }
//       }
//     }

//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch best sellers" });
//   }
// });

// // ============================================================
// // GET ARRIVAL BEST SELLERS
// // ============================================================
// router.get("/arrival-best-sellers", async (req, res) => {
//   try {
//     const activeVendors = await Vendor.find({
//       status: 'active',
//       role: 'vendor'
//     }).select('company');
//     const activeCompanyNames = activeVendors.map(v => v.company);

//     const companies = await Company.find({
//       name: { $in: activeCompanyNames }
//     }).sort({ createdAt: 1 }).limit(8);

//     const products = [];

//     for (const company of companies) {
//       const product = await Product.findOne({
//         company: company.name,
//         vendorId: { $ne: null }
//       }).sort({ createdAt: 1 });

//       if (product) {
//         const vendor = await Vendor.findById(product.vendorId);
//         if (vendor && vendor.status === 'active') {
//           const productObj = product.toObject ? product.toObject() : product;
//           products.push({
//             _id: productObj._id,
//             name: productObj.name || productObj.ProductName,
//             price: productObj.price,
//             image: productObj.image,
//             company: productObj.company,
//             category: productObj.category,
//             subcategory: productObj.subcategory || productObj.subCategory || "",
//             subcategories: productObj.subcategories || productObj.subCategories || [],
//             variants: productObj.variants || [],
//             averageRating: productObj.averageRating,
//             stockQuantity: productObj.stockQuantity || 0,
//             stockStatus: productObj.stockStatus || "out_of_stock",
//             inStock: productObj.stockQuantity > 0,
//             availableStock: Math.max(0, productObj.stockQuantity - (productObj.reservedStock || 0)),
//             shippingTime: productObj.shippingTime || "3-5 days",
//             customShippingTime: productObj.customShippingTime || "",
//             // 🆕 Custom Field — only enabled + label
//             customField: {
//               enabled:
//                 productObj.customField?.enabled === true ||
//                 productObj.customField?.enabled === "true",
//               label: productObj.customField?.label || ""
//             }
//           });
//         }
//       }
//     }

//     const inStockProducts = products.filter(p => p.stockQuantity > 0);

//     const slides = [];
//     for (let i = 0; i < inStockProducts.length; i += 4) {
//       slides.push({
//         slideNumber: Math.floor(i / 4) + 1,
//         products: inStockProducts.slice(i, i + 4)
//       });
//     }

//     res.json({
//       success: true,
//       totalProducts: products.length,
//       inStockCount: inStockProducts.length,
//       totalSlides: slides.length,
//       slides: slides,
//       products: products
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch arrival best sellers"
//     });
//   }
// });

// // ============================================================
// // SEARCH PRODUCTS
// // ============================================================
// router.get("/search", async (req, res) => {
//   try {
//     const keyword = req.query.keyword;
//     let products = await Product.find({
//       $or: [
//         { name: { $regex: keyword, $options: "i" } },
//         { ProductName: { $regex: keyword, $options: "i" } }
//       ]
//     }).limit(8);

//     const vendorIds = products.map(p => p.vendorId).filter(id => id);
//     let suspendedVendorIds = [];
//     if (vendorIds.length > 0) {
//       const suspendedVendors = await Vendor.find({
//         _id: { $in: vendorIds },
//         status: 'suspended'
//       }).select('_id');
//       suspendedVendorIds = suspendedVendors.map(v => v._id.toString());
//     }

//     products = products.filter(p =>
//       !suspendedVendorIds.includes(p.vendorId?.toString())
//     );

//     const formattedProducts = products.map(formatProduct);

//     res.status(200).json({ success: true, products: formattedProducts });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, message: "Search failed" });
//   }
// });

// // ============================================================
// // GET PRODUCTS BY COMPANY NAME
// // ============================================================
// router.get("/products/company/:companyName", async (req, res) => {
//   try {
//     const { companyName } = req.params;

//     const vendor = await Vendor.findOne({
//       company: companyName,
//       status: 'suspended'
//     });

//     if (vendor) {
//       return res.status(403).json({
//         message: "This company is currently unavailable",
//         status: 'suspended'
//       });
//     }

//     const products = await Product.find({ company: companyName });
//     const formattedProducts = products.map(formatProduct);

//     res.json(formattedProducts);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch company products" });
//   }
// });

// // ============================================================
// // GET ACTIVE VENDORS
// // ============================================================
// router.get("/active-vendors", async (req, res) => {
//   try {
//     const vendors = await Vendor.find({
//       status: 'active',
//       role: 'vendor'
//     }).select('name company plan status createdAt');

//     res.json({ success: true, vendors });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch vendors" });
//   }
// });

// // ============================================================
// // CART STOCK VALIDATION
// // ============================================================
// router.post("/cart/validate-stock", async (req, res) => {
//   try {
//     const { items } = req.body;

//     if (!items || !Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ success: false, message: "Please provide cart items" });
//     }

//     const stockValidation = [];
//     let allInStock = true;

//     for (const item of items) {
//       const product = await Product.findById(item.productId)
//         .select('name stockQuantity reservedStock stockStatus price vendorId variants');

//       if (!product) {
//         stockValidation.push({
//           productId: item.productId,
//           name: item.name || "Unknown Product",
//           requested: item.quantity,
//           available: 0,
//           inStock: false,
//           issue: "Product not found"
//         });
//         allInStock = false;
//         continue;
//       }

//       if (product.vendorId) {
//         const vendor = await Vendor.findById(product.vendorId);
//         if (vendor && vendor.status === 'suspended') {
//           stockValidation.push({
//             productId: item.productId,
//             name: product.name || item.name,
//             requested: item.quantity,
//             available: 0,
//             inStock: false,
//             issue: "Vendor suspended"
//           });
//           allInStock = false;
//           continue;
//         }
//       }

//       let availableStock;
//       if (item.variantId && product.variants && product.variants.length > 0) {
//         const variant = product.variants.id(item.variantId);
//         if (variant) {
//           availableStock = variant.stock || 0;
//         } else {
//           availableStock = Math.max(0, product.stockQuantity - (product.reservedStock || 0));
//         }
//       } else {
//         availableStock = Math.max(0, product.stockQuantity - (product.reservedStock || 0));
//       }

//       const requested = item.quantity || 1;
//       const inStock = availableStock >= requested;

//       stockValidation.push({
//         productId: item.productId,
//         variantId: item.variantId || null,
//         name: product.name || item.name,
//         requested: requested,
//         available: availableStock,
//         stockQuantity: product.stockQuantity,
//         inStock: inStock,
//         price: item.price || product.price,
//         issue: inStock ? null : "Insufficient stock"
//       });

//       if (!inStock) allInStock = false;
//     }

//     res.json({
//       success: true,
//       allInStock: allInStock,
//       validation: stockValidation,
//       summary: {
//         total: stockValidation.length,
//         inStock: stockValidation.filter(s => s.inStock).length,
//         outOfStock: stockValidation.filter(s => !s.inStock).length
//       }
//     });
//   } catch (err) {
//     console.error("Cart stock validation error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to validate stock",
//       error: err.message
//     });
//   }
// });

// // ============================================================
// // GET LOW STOCK ALERTS
// // ============================================================
// router.get("/low-stock-alerts", async (req, res) => {
//   try {
//     const threshold = parseInt(req.query.threshold) || 5;

//     const activeVendors = await Vendor.find({
//       status: 'active',
//       role: 'vendor'
//     }).select('_id');
//     const activeVendorIds = activeVendors.map(v => v._id);

//     const products = await Product.find({
//       vendorId: { $in: activeVendorIds },
//       stockQuantity: { $lte: threshold, $gt: 0 }
//     }).select('name stockQuantity lowStockThreshold company image');

//     res.json({
//       success: true,
//       count: products.length,
//       threshold: threshold,
//       products: products
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch low stock alerts" });
//   }
// });

// // ============================================================
// // BULK STOCK CHECK
// // ============================================================
// router.post("/products/stock/bulk", async (req, res) => {
//   try {
//     const { productIds } = req.body;

//     if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
//       return res.status(400).json({ success: false, message: "Please provide product IDs" });
//     }

//     const products = await Product.find({
//       _id: { $in: productIds }
//     }).select('_id name stockQuantity reservedStock stockStatus price');

//     const stockData = products.map(p => ({
//       productId: p._id,
//       name: p.name,
//       stockQuantity: p.stockQuantity,
//       reservedStock: p.reservedStock || 0,
//       availableStock: Math.max(0, p.stockQuantity - (p.reservedStock || 0)),
//       stockStatus: p.stockStatus || "out_of_stock",
//       inStock: p.stockQuantity > 0,
//       price: p.price
//     }));

//     res.json({ success: true, products: stockData });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Failed to fetch stock data" });
//   }
// });

// module.exports = router;



// routes/user.routes.js — User-facing API routes

const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");   // 🆕 For ID hashing
const router = express.Router();
const asyncHandler = require("../Comfig/authMiddleware/asyncHandler");
const Company = require("../Models/Company");
const Product = require("../Models/Product");
const Vendor = require("../Models/Vendor");
const VendorSetting = require("../Models/VendorSetting");
const StockService = require("../Comfig/stockService");
const SellerDocument = require("../Models/SellerDocument");
const Category = require("../Models/Category");

// ============================================================
// HELPERS
// ============================================================
const cleanSubString = (s) => {
  if (!s) return "";
  return String(s).replace(/[\[\]"']/g, "").trim();
};

const collectSubcategories = (productObj) => {
  const allSubs = [];

  if (productObj.subCategory) allSubs.push(cleanSubString(productObj.subCategory));
  if (productObj.subcategory) allSubs.push(cleanSubString(productObj.subcategory));

  if (Array.isArray(productObj.subCategories)) {
    productObj.subCategories.forEach(s => allSubs.push(cleanSubString(s)));
  }
  if (Array.isArray(productObj.subcategories)) {
    productObj.subcategories.forEach(s => allSubs.push(cleanSubString(s)));
  }

  if (productObj.categorySubcategoryMap && typeof productObj.categorySubcategoryMap === "object") {
    Object.values(productObj.categorySubcategoryMap).forEach(arr => {
      if (Array.isArray(arr)) arr.forEach(s => allSubs.push(cleanSubString(s)));
    });
  }

  return [...new Set(allSubs.filter(Boolean))];
};

// ============================================================
// FORMAT PRODUCT — Native91 (જૂનું format — frontend માટે)
// ============================================================
const formatProduct = (p) => {
  const productObj = p.toObject ? p.toObject() : p;
  const cleanSubs = collectSubcategories(productObj);

  const cf = productObj.customField || {};
  const cfEnabled =
    cf.enabled === true ||
    cf.enabled === "true" ||
    cf.enabled === 1 ||
    cf.enabled === "1";

  const stockValue =
    typeof productObj.stockQuantity === "number"
      ? productObj.stockQuantity
      : (typeof productObj.stock === "number" ? productObj.stock : 0);

  const reserved = productObj.reservedStock || 0;

  // Image array
  let imageArray = [];
  if (Array.isArray(productObj.image) && productObj.image.length > 0) {
    imageArray = productObj.image.filter(Boolean);
  } else if (typeof productObj.image === "string" && productObj.image.trim()) {
    imageArray = [productObj.image];
  }

  // Variants
  const variants = (productObj.variants || []).map((v, idx) => {
    const vStock = Math.max(0, (v.stock || 0) - (v.reservedStock || 0));
    const variantId = v._id ? v._id.toString() : `${productObj._id}-v${idx}`;

    let vImageSrc = "";
    if (v.image && typeof v.image === "object" && v.image.src) {
      vImageSrc = v.image.src;
    } else if (typeof v.image === "string") {
      vImageSrc = v.image;
    }

    return {
      _id: variantId,
      id: variantId,
      color: v.color || "",
      size: v.size || "",
      title: v.color || v.size || v.variant || `Variant ${idx + 1}`,
      price: Number(v.price || productObj.price || 0),
      stock: vStock,
      quantity: vStock,
      sku: v.sku || productObj.sku || "",
      image: vImageSrc,
      images: vImageSrc ? [vImageSrc] : [],
      isAvailable: vStock > 0,
      option_values: {
        Color: v.color || "",
        Size: v.size || ""
      }
    };
  });

  const firstVariant = variants[0];
  const topLevelPrice =
    productObj.price ||
    (firstVariant ? parseFloat(firstVariant.price) : 0) ||
    0;
  const topLevelStock =
    Math.max(0, stockValue - reserved) ||
    (firstVariant ? firstVariant.quantity : 0) ||
    0;

  return {
    ...productObj,
    subCategory: cleanSubs[0] || "",
    subcategory: cleanSubs[0] || "",
    subCategories: cleanSubs,
    subcategories: cleanSubs,
    variants: variants,

    price: topLevelPrice,
    stock: topLevelStock,
    stockQuantity: stockValue,
    availableStock: topLevelStock,
    inStock: topLevelStock > 0,
    stockStatus: topLevelStock > 0 ? "in_stock" : "out_of_stock",
    reservedStock: reserved,

    image: imageArray,
    images: imageArray,

    customField: {
      enabled: cfEnabled,
      label: cf.label || ""
    },

    shippingTime: productObj.shippingTime || "3-5 days",
    customShippingTime: productObj.customShippingTime || "",
    estimatedDeliveryDays: productObj.estimatedDeliveryDays || { min: 3, max: 5 }
  };
};

// ============================================================
// 🆕 ID CONVERSION — Mongo ObjectId → Shopify int64
// ============================================================
const mongoIdToShopifyId = (mongoId) => {
  if (!mongoId) return 0;
  const idStr = String(mongoId);

  if (/^\d+$/.test(idStr)) {
    const n = parseInt(idStr, 10);
    if (Number.isSafeInteger(n)) return n;
  }

  const hash = crypto.createHash("md5").update(idStr).digest("hex");
  const truncated = hash.substring(0, 13);
  return parseInt(truncated, 16);
};

const mongoVariantIdToShopifyId = (variantId, productId, idx) => {
  if (variantId) return mongoIdToShopifyId(variantId);
  return mongoIdToShopifyId(`${productId}-v${idx}`);
};

// ============================================================
// 🆕 PURE SHOPIFY FORMATTER — Fully compatible
// ============================================================
const formatShopifyProduct = (p) => {
  const productObj = p.toObject ? p.toObject() : p;

  const productId = productObj._id?.toString() || "";
  const shopifyProductId = mongoIdToShopifyId(productId);

  // ---------- Main image ----------
  let mainImageSrc = "";
  if (Array.isArray(productObj.image) && productObj.image.length > 0) {
    mainImageSrc = productObj.image[0];
  } else if (typeof productObj.image === "string" && productObj.image.trim()) {
    mainImageSrc = productObj.image;
  }

  // ---------- Handle ----------
  const handle = (productObj.name || productObj.ProductName || "product")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // ---------- Tags ----------
  const tags = [
    productObj.category,
    ...(Array.isArray(productObj.categories) ? productObj.categories : [])
  ].filter(Boolean).join(", ");

  // ---------- Variants (auto-default if empty) ----------
  const rawVariants = productObj.variants || [];

  const variantsSource = rawVariants.length > 0
    ? rawVariants
    : [{
        _id: `${productId}-default`,
        color: "",
        size: productObj.size || "",
        variant: productObj.variant || "",
        price: productObj.price || 0,
        stock: productObj.stockQuantity || productObj.stock || 0,
        reservedStock: productObj.reservedStock || 0,
        sku: productObj.sku || "",
        image: mainImageSrc
      }];

  // ============================================================
  // 🆕 FIRST PASS — collect which option names are actually USED
  // ============================================================
  const colorSet = new Set();
  const sizeSet = new Set();

  variantsSource.forEach(v => {
    const colorVal = (v.color || "").trim();
    const sizeVal = (v.size || v.variant || "").trim();

    if (colorVal) colorSet.add(colorVal);
    if (sizeVal) sizeSet.add(sizeVal);
  });

  // 🆕 Build options array — ONLY include names that have values
  const options = [];
  if (colorSet.size > 0) {
    options.push({ name: "Color", values: [...colorSet] });
  }
  if (sizeSet.size > 0) {
    options.push({ name: "Size", values: [...sizeSet] });
  }

  // 🆕 Which option names are actually declared?
  const declaredOptionNames = options.map(o => o.name);

  // ============================================================
  // 🆕 SECOND PASS — build variants with ONLY matching option_values
  // ============================================================
  const variants = variantsSource.map((v, idx) => {
    const variantShopifyId = mongoVariantIdToShopifyId(v._id, productId, idx);

    // ---------- Variant image ----------
    let variantImageSrc = "";
    if (v.image) {
      variantImageSrc = typeof v.image === "object" && v.image.src ? v.image.src : v.image;
    }
    if (!variantImageSrc && mainImageSrc) variantImageSrc = mainImageSrc;

    // 🆕 option_values — only keys that are in declared options
    const optionValues = {};
    const colorVal = (v.color || "").trim();
    const sizeVal = (v.size || v.variant || "").trim();

    if (declaredOptionNames.includes("Color")) {
      optionValues.Color = colorVal;
    }
    if (declaredOptionNames.includes("Size")) {
      optionValues.Size = sizeVal;
    }

    const vStock = Math.max(
      0,
      (v.stock || v.quantity || 0) - (v.reservedStock || 0)
    );

    // 🆕 Build variant object — only add image if src exists
    const variantObj = {
      id: variantShopifyId,
      title: v.color || v.size || v.variant || "Default",
      price: Number(v.price || productObj.price || 0).toFixed(2),
      compare_at_price: v.compareAtPrice
        ? Number(v.compareAtPrice).toFixed(2)
        : null,
      sku: v.sku || productObj.sku || "",
      quantity: vStock,
      created_at: productObj.createdAt,
      updated_at: productObj.updatedAt,
      taxable: true,
      option_values: optionValues,
      grams: (productObj.weight || 0) * 1000,
      weight: productObj.weight || 0,
      weight_unit: productObj.weightUnit || "kg"
    };

    // 🆕 Only add image if we have a real src
    if (variantImageSrc) {
      variantObj.image = { src: variantImageSrc };
    }

    return variantObj;
  });

  // ============================================================
  // 🆕 FINAL — only include image if src exists
  // ============================================================
  const result = {
    id: shopifyProductId,
    title: productObj.name || productObj.ProductName || "Unnamed Product",
    body_html: `<p>${(productObj.description || "").replace(/\n/g, "<br/>")}</p>`,
    vendor: productObj.company || "Native91",
    product_type: productObj.category || "",
    created_at: productObj.createdAt,
    handle: handle,
    updated_at: productObj.updatedAt,
    tags: tags,
    status: productObj.isActive === false ? "draft" : "active",
    variants: variants,
    options: options
  };

  // 🆕 Only add product image if src exists (omit if empty)
  if (mainImageSrc) {
    result.image = { src: mainImageSrc };
  }

  return result;
};

// ============================================================
// SEARCH SUGGESTIONS
// ============================================================
router.get("/search-suggestions", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ success: true, products: [] });
    }

    const searchTerm = q.trim();

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
      .select("name ProductName price image company vendorId _id stockQuantity stockStatus category subcategory subcategories variants shippingTime customShippingTime")
      .lean();

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
      .map(p => {
        let imageUrl = null;
        if (p.image) {
          if (Array.isArray(p.image) && p.image.length > 0) {
            imageUrl = p.image[0];
          } else if (typeof p.image === 'string') {
            imageUrl = p.image;
          }
        }

        const firstVariant = (p.variants && p.variants[0]) || {};

        return {
          _id: p._id,
          name: p.name || p.ProductName || "Unnamed Product",
          price: p.price || firstVariant.price || 0,
          image: imageUrl ? [imageUrl] : [],
          company: p.company || "Native91",
          category: p.category || "",
          subcategory: p.subcategory || p.subCategory || "",
          subcategories: p.subcategories || p.subCategories || [],
          variants: p.variants || [],
          stockQuantity: p.stockQuantity || firstVariant.stock || 0,
          stock: p.stockQuantity || firstVariant.stock || 0,
          stockStatus: p.stockStatus || "out_of_stock",
          inStock: (p.stockQuantity || firstVariant.stock || 0) > 0,
          shippingTime: p.shippingTime || "3-5 days",
          customShippingTime: p.customShippingTime || "",
          slug: p.slug || p._id
        };
      });

    res.json({ success: true, products: formattedProducts });
  } catch (error) {
    console.error("❌ Search suggestions error:", error);
    res.status(500).json({
      success: false,
      products: [],
      message: "Failed to fetch suggestions"
    });
  }
});

// ============================================================
// GET COMPANIES
// ============================================================
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
      let logo = vendor.logo || null;

      if (vendor.description) description = vendor.description;

      if (vendor.categories && vendor.categories.length > 0) {
        categories = vendor.categories;
      } else if (vendor.category && typeof vendor.category === 'string') {
        categories = vendor.category.split(",").map(c => c.trim()).filter(Boolean);
      }

      if (categories.length === 0 || !logo) {
        const sellerDoc = await SellerDocument.findOne({ email: vendor.email });
        if (sellerDoc) {
          if (sellerDoc.categories && Array.isArray(sellerDoc.categories) && sellerDoc.categories.length > 0) {
            categories = sellerDoc.categories;
          } else if (sellerDoc.category && typeof sellerDoc.category === 'string') {
            categories = sellerDoc.category.split(",").map(c => c.trim()).filter(Boolean);
          } else if (sellerDoc.brand && Array.isArray(sellerDoc.brand.categories) && sellerDoc.brand.categories.length > 0) {
            categories = sellerDoc.brand.categories;
          } else if (sellerDoc.brand && sellerDoc.brand.category && typeof sellerDoc.brand.category === 'string') {
            categories = sellerDoc.brand.category.split(",").map(c => c.trim()).filter(Boolean);
          }

          if (!logo) {
            if (sellerDoc.logo && typeof sellerDoc.logo === 'object') {
              logo = sellerDoc.logo.image || sellerDoc.logo.url || null;
            } else if (typeof sellerDoc.logo === 'string') {
              logo = sellerDoc.logo;
            }
          }

          if (!description && sellerDoc.brand && sellerDoc.brand.description) {
            description = sellerDoc.brand.description;
          }

          if (sellerDoc.businessName) vendor.company = sellerDoc.businessName;
        }
      }

      if (categories.length === 0 || !logo) {
        const companyData = await Company.findOne({ name: vendor.company || vendor.name });
        if (companyData) {
          if (companyData.categories && companyData.categories.length > 0) {
            categories = companyData.categories;
          } else if (companyData.category && typeof companyData.category === 'string') {
            categories = companyData.category.split(",").map(c => c.trim()).filter(Boolean);
          }

          if (!description && companyData.description) description = companyData.description;
          if (!logo && companyData.logo) logo = companyData.logo;
        }
      }

      if (categories.length === 0) {
        const products = await Product.find({
          company: vendor.company,
          stockQuantity: { $gt: 0 }
        }).select('category').limit(10);

        const productCategories = new Set();
        products.forEach(p => {
          if (p.category) {
            if (Array.isArray(p.category)) {
              p.category.forEach(c => { if (c && c.trim()) productCategories.add(c.trim()); });
            } else if (typeof p.category === 'string') {
              p.category.split(',').forEach(c => { if (c && c.trim()) productCategories.add(c.trim()); });
            }
          }
        });

        categories = Array.from(productCategories);
      }

      if (categories.length === 0) categories = ['Uncategorized'];

      const productCount = await Product.countDocuments({
        company: vendor.company,
        stockQuantity: { $gt: 0 }
      });

      companies.push({
        _id: vendor._id,
        name: vendor.company || vendor.name,
        description: description || `${vendor.company || vendor.name} - Premium brand on Native91`,
        logo: logo,
        email: vendor.email,
        hasLogo: !!logo,
        categories: categories,
        category: categories.length > 0 ? categories[0] : 'Uncategorized',
        plan: vendor.plan || 'STARTER',
        status: vendor.status || 'active',
        productCount: productCount,
        createdAt: vendor.createdAt,
        registeredAt: vendor.createdAt
      });

      categories.forEach(cat => {
        if (!categoryMap[cat]) categoryMap[cat] = [];
        categoryMap[cat].push(vendor.company);
      });
    }

    res.json({
      success: true,
      companies: companies,
      categories: Object.keys(categoryMap).filter(k => k !== 'Uncategorized').sort(),
      stats: {
        total: companies.length,
        withLogos: companies.filter(c => c.hasLogo).length,
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

// ============================================================
// GET SUB-CATEGORIES FOR A CATEGORY
// ============================================================
router.get("/categories/:category/subcategories", async (req, res) => {
  try {
    const { category } = req.params;
    const decodedCategory = decodeURIComponent(category);
    const s1 = await Product.distinct("subcategory", { category: decodedCategory });
    const s2 = await Product.distinct("subCategory", { category: decodedCategory });
    const s3 = await Product.distinct("subcategories", { category: decodedCategory });
    const s4 = await Product.distinct("subCategories", { category: decodedCategory });
    let fromProducts = [...s1, ...s2, ...s3, ...s4];

    fromProducts = fromProducts
      .filter(Boolean)
      .map(s => String(s).replace(/[\[\]"']/g, "").trim())
      .filter(Boolean);

    let fromAdmin = [];
    try {
      const adminCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${decodedCategory}$`, "i") },
        status: "active"
      }).select("subcategories");

      if (adminCategory && Array.isArray(adminCategory.subcategories)) {
        fromAdmin = adminCategory.subcategories
          .filter(sc => sc.status === "active")
          .map(sc => sc.name);
      }
    } catch (adminErr) {
      console.warn("⚠️ Admin category lookup failed:", adminErr.message);
    }

    const allSubCategories = [...fromProducts, ...fromAdmin];
    const uniqueSubCategories = [...new Set(allSubCategories)]
      .filter(s => s && typeof s === "string" && s.trim() !== "")
      .map(s => s.trim());

    res.json({
      success: true,
      category: decodedCategory,
      subCategories: uniqueSubCategories
    });
  } catch (error) {
    console.error("❌ Error fetching sub-categories:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// GET PRODUCTS BY CATEGORY
// ============================================================
router.get("/products/by-category/:category", async (req, res) => {
  try {
    const { category } = req.params;

    const products = await Product.find({
      category: decodeURIComponent(category),
      isActive: true
    }).select('subcategory subcategories subCategory subCategories name price');

    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// CREATE COMPANY
// ============================================================
router.post("/company", async (req, res) => {
  try {
    const { name, description, logo, category } = req.body;

    if (!name) return res.status(400).json({ message: "Company name is required" });

    const exists = await Company.findOne({ name });
    if (exists) return res.status(400).json({ message: "Company already exists" });

    const company = await Company.create({ name, description, logo, category });
    res.status(201).json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create company" });
  }
});

// ============================================================
// GET PRODUCTS — ARRAY response (frontend-safe)
// ============================================================
router.get("/products", async (req, res) => {
  try {
    const { company, category, subcategory, search, inStock, minPrice, maxPrice } = req.query;

    let filter = {};

    if (company) filter.company = company;
    if (category) filter.category = category;

    if (subcategory) {
      filter.$or = [
        { subcategory: subcategory },
        { subCategory: subcategory },
        { subcategories: subcategory },
        { subCategories: subcategory },
      ];
    }
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

    const formattedProducts = products.map(formatProduct);

    res.json(formattedProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// ============================================================
// GET PRODUCT BY ID (variant-aware stock)
// ============================================================
router.get("/product/:id", async (req, res) => {
  try {
    const { variantId } = req.query;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.vendorId) {
      const vendor = await Vendor.findById(product.vendorId);
      if (vendor && vendor.status === "suspended") {
        return res.status(403).json({
          message: "This product is currently unavailable",
          status: "suspended",
        });
      }
    }

    const response = formatProduct(product);

    if (variantId && product.variants && product.variants.length > 0) {
      const targetId = String(variantId).trim();

      const variant = product.variants.find((v) => {
        if (!v._id) return false;
        return v._id.toString() === targetId;
      });

      if (variant) {
        const variantStock = Math.max(
          0,
          (variant.stock || 0) - (variant.reservedStock || 0)
        );

        response.stock = variantStock;
        response.stockQuantity = variantStock;
        response.variantStock = variantStock;
        response.variantId = variant._id;
        response.inStock = variantStock > 0;
        response.availableStock = variantStock;
        response.stockStatus = variantStock > 0 ? "in_stock" : "out_of_stock";

        if (variant.price) response.price = variant.price;
        if (variant.image) response.image = [variant.image];
      }
    }

    res.json(response);
  } catch (err) {
    console.error("❌ Get product error:", err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// ============================================================
// GET BEST SELLERS — ARRAY response
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
          result.push(formatProduct(product));
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
          products.push(formatProduct(product));
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

    const formattedProducts = products.map(formatProduct);

    res.status(200).json({ success: true, products: formattedProducts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Search failed" });
  }
});

// ============================================================
// GET PRODUCTS BY COMPANY NAME — ARRAY response
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
    const formattedProducts = products.map(formatProduct);

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

    res.json({ success: true, vendors });
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
      return res.status(400).json({ success: false, message: "Please provide cart items" });
    }

    const stockValidation = [];
    let allInStock = true;

    for (const item of items) {
      const product = await Product.findById(item.productId)
        .select('name stockQuantity reservedStock stockStatus price vendorId variants');

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

      let availableStock;
      if (item.variantId && product.variants && product.variants.length > 0) {
        const variant = product.variants.id(item.variantId);
        if (variant) {
          availableStock = variant.stock || 0;
        } else {
          availableStock = Math.max(0, product.stockQuantity - (product.reservedStock || 0));
        }
      } else {
        availableStock = Math.max(0, product.stockQuantity - (product.reservedStock || 0));
      }

      const requested = item.quantity || 1;
      const inStock = availableStock >= requested;

      stockValidation.push({
        productId: item.productId,
        variantId: item.variantId || null,
        name: product.name || item.name,
        requested: requested,
        available: availableStock,
        stockQuantity: product.stockQuantity,
        inStock: inStock,
        price: item.price || product.price,
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
      return res.status(400).json({ success: false, message: "Please provide product IDs" });
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

    res.json({ success: true, products: stockData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch stock data" });
  }
});

// ============================================================
// 🆕 V2 PRODUCTS — 100% Shopify Format
// ============================================================
router.get("/v2/products", async (req, res) => {
  try {
    const {
      company, category, subcategory, search,
      inStock, minPrice, maxPrice,
      page = 1, limit = 100
    } = req.query;

    const andConditions = [];

    if (company) andConditions.push({ company: company });
    if (category) andConditions.push({ category: category });

    if (subcategory) {
      andConditions.push({
        $or: [
          { subcategory: subcategory },
          { subCategory: subcategory },
          { subcategories: subcategory },
          { subCategories: subcategory },
        ]
      });
    }

    if (search) {
      andConditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { ProductName: { $regex: search, $options: "i" } }
        ]
      });
    }

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      andConditions.push({ price: priceFilter });
    }

    let filter = {};
    if (andConditions.length > 0) filter.$and = andConditions;

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

    const totalCount = products.length;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 100);
    const startIdx = (pageNum - 1) * limitNum;
    const paginated = products.slice(startIdx, startIdx + limitNum);

    const shopifyProducts = paginated.map(formatShopifyProduct);

    res.json({
      data: {
        total: totalCount,
        products: shopifyProducts
      }
    });
  } catch (err) {
    console.error("❌ v2/products error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });
  }
});

// ============================================================
// 🆕 V2 SINGLE PRODUCT — Shopify Format
// ============================================================
router.get("/v2/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.vendorId) {
      const vendor = await Vendor.findById(product.vendorId);
      if (vendor && vendor.status === "suspended") {
        return res.status(403).json({
          message: "This product is currently unavailable",
          status: "suspended"
        });
      }
    }

    const shopifyProduct = formatShopifyProduct(product);

    res.json({
      data: {
        product: shopifyProduct
      }
    });
  } catch (err) {
    console.error("❌ v2/product/:id error:", err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// ============================================================
// 🆕 V2 BEST SELLERS — Shopify Format
// ============================================================
router.get("/v2/best-sellers", async (req, res) => {
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
          result.push(formatShopifyProduct(product));
        }
      }
    }

    res.json({
      data: {
        total: result.length,
        products: result
      }
    });
  } catch (err) {
    console.error("❌ v2/best-sellers error:", err);
    res.status(500).json({ message: "Failed to fetch best sellers" });
  }
});

// ============================================================
// 🆕 V2 ARRIVAL BEST SELLERS — Shopify Format
// ============================================================
router.get("/v2/arrival-best-sellers", async (req, res) => {
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
          products.push(formatShopifyProduct(product));
        }
      }
    }

    const inStockProducts = products.filter(p => {
      const q = p.variants?.[0]?.quantity || 0;
      return q > 0;
    });

    const slides = [];
    for (let i = 0; i < inStockProducts.length; i += 4) {
      slides.push({
        slideNumber: Math.floor(i / 4) + 1,
        products: inStockProducts.slice(i, i + 4)
      });
    }

    res.json({
      success: true,
      data: {
        total: products.length,
        inStockCount: inStockProducts.length,
        totalSlides: slides.length,
        slides: slides,
        products: products
      }
    });
  } catch (err) {
    console.error("❌ v2/arrival-best-sellers error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch arrival best sellers"
    });
  }
});

// ============================================================
// 🆕 V2 PRODUCTS BY COMPANY — Shopify Format
// ============================================================
router.get("/v2/products/company/:companyName", async (req, res) => {
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
    const shopifyProducts = products.map(formatShopifyProduct);

    res.json({
      data: {
        total: shopifyProducts.length,
        products: shopifyProducts
      }
    });
  } catch (err) {
    console.error("❌ v2/products/company error:", err);
    res.status(500).json({ message: "Failed to fetch company products" });
  }
});

// ============================================================
// 🆕 V2 SEARCH SUGGESTIONS — Shopify Format
// ============================================================
router.get("/v2/search-suggestions", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: { total: 0, products: [] }
      });
    }

    const searchTerm = q.trim();

    const products = await Product.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { ProductName: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { category: { $regex: searchTerm, $options: "i" } },
        { company: { $regex: searchTerm, $options: "i" } }
      ],
      isActive: true
    }).limit(10);

    const vendorIds = products.map(p => p.vendorId).filter(id => id);
    let suspendedVendorIds = [];
    if (vendorIds.length > 0) {
      const suspendedVendors = await Vendor.find({
        _id: { $in: vendorIds },
        status: 'suspended'
      }).select('_id');
      suspendedVendorIds = suspendedVendors.map(v => v._id.toString());
    }

    const shopifyProducts = products
      .filter(p => !suspendedVendorIds.includes(p.vendorId?.toString()))
      .map(formatShopifyProduct);

    res.json({
      success: true,
      data: {
        total: shopifyProducts.length,
        products: shopifyProducts
      }
    });
  } catch (error) {
    console.error("❌ v2/search-suggestions error:", error);
    res.status(500).json({
      success: false,
      data: { total: 0, products: [] },
      message: "Failed to fetch suggestions"
    });
  }
});

module.exports = router;