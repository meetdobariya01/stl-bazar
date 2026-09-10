// routes/subcategory.routes.js - NO AUTH (Public)

const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Category = require("../Models/Category");

// ============================================================
// ✅ GET sub-categories for a category - PUBLIC
// Merges: (1) Vendor products' sub-categories
//         (2) Admin Category collection's sub-categories
// ============================================================
router.get("/categories/:category/subcategories", async (req, res) => {
  try {
    const { category } = req.params;
    const decodedCategory = decodeURIComponent(category);

    console.log(`🔍 Fetching sub-categories for: "${decodedCategory}"`);

    // 1️⃣ From vendor products — try BOTH casing variants
    const subCategoriesLower = await Product.distinct("subcategory", {
      category: decodedCategory
    });
    const subCategoriesUpper = await Product.distinct("subCategory", {
      category: decodedCategory
    });
    const subCategoriesArrayLower = await Product.distinct("subcategories", {
      category: decodedCategory
    });
    const subCategoriesArrayUpper = await Product.distinct("subCategories", {
      category: decodedCategory
    });

    const fromProducts = [
      ...subCategoriesLower,
      ...subCategoriesUpper,
      ...subCategoriesArrayLower,
      ...subCategoriesArrayUpper
    ];

    // 2️⃣ From admin Category collection
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

    // 3️⃣ Merge + dedupe
    const allSubCategories = [...fromProducts, ...fromAdmin];
    const uniqueSubCategories = [...new Set(allSubCategories)]
      .filter(s => s && typeof s === "string" && s.trim() !== "")
      .map(s => s.trim());

    console.log(`📂 Found ${uniqueSubCategories.length} sub-categories (products: ${fromProducts.length}, admin: ${fromAdmin.length})`);

    res.json({
      success: true,
      category: decodedCategory,
      subCategories: uniqueSubCategories
    });
  } catch (error) {
    console.error("❌ Error fetching sub-categories:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================================
// ✅ GET all categories with sub-categories - PUBLIC
// Merges: (1) Vendor products' sub-categories
//         (2) Admin Category collection's sub-categories
// ============================================================
router.get("/categories-with-sub", async (req, res) => {
  try {
    // Get all categories (from products + admin)
    const productCategories = await Product.distinct("category");
    const adminCategories = await Category.find({ status: "active" }).select("name");

    const categorySet = new Set([
      ...productCategories.filter(Boolean),
      ...adminCategories.map(c => c.name).filter(Boolean)
    ]);

    const result = [];

    for (const category of categorySet) {
      // From vendor products — both casings
      const s1 = await Product.distinct("subcategory", { category });
      const s2 = await Product.distinct("subCategory", { category });
      const s3 = await Product.distinct("subcategories", { category });
      const s4 = await Product.distinct("subCategories", { category });
      const fromProducts = [...s1, ...s2, ...s3, ...s4];

      // From admin Category collection
      let fromAdmin = [];
      try {
        const adminCategory = await Category.findOne({
          name: { $regex: new RegExp(`^${category}$`, "i") },
          status: "active"
        }).select("subcategories");

        if (adminCategory && Array.isArray(adminCategory.subcategories)) {
          fromAdmin = adminCategory.subcategories
            .filter(sc => sc.status === "active")
            .map(sc => sc.name);
        }
      } catch (adminErr) {
        console.warn(`⚠️ Admin lookup failed for "${category}":`, adminErr.message);
      }

      const uniqueSubCategories = [...new Set([...fromProducts, ...fromAdmin])]
        .filter(s => s && typeof s === "string" && s.trim() !== "")
        .map(s => s.trim());

      result.push({
        category,
        subCategories: uniqueSubCategories
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("❌ Error fetching categories with sub-categories:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;