// models/Product.js (PUBLIC / user backend)
const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  color: { type: String, default: "" },
  size: { type: String, default: "" },
  image: { type: String, default: "" },
  stock: { type: Number, default: 0, min: 0 },
  isAvailable: { type: Boolean, default: true },
  price: { type: Number, default: 0 }
}, { _id: true });

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: { type: String, required: true },
    categoryIcon: { type: String, default: "FaBoxOpen" },

    // Multi-category
    categories: { type: [String], default: [] },
    categorySubcategoryMap: { type: Map, of: [String], default: {} },

    // Sub-category (all spellings — vendor backend may write either)
    subcategory: { type: String, default: "" },
    subcategories: { type: [String], default: [] },
    subCategory: { type: String, default: "" },
    subCategories: { type: [String], default: [] },

    // VARIANTS
    variants: { type: [variantSchema], default: [] },

    image: [{ type: String }],
    size: { type: String },
    company: { type: String, required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    stock: { type: Number, default: 0, min: 0 },
    ratings: [{
      userName: { type: String, default: "Anonymous" },
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      createdAt: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 },

    // Shipping
    shippingTime: { type: String, default: "7 days" },
    customShippingTime: { type: String, default: "" },
    estimatedDeliveryDays: {
      min: { type: Number, default: 3 },
      max: { type: Number, default: 5 }
    },
    shippingCharge: { type: Number, default: 0 },
    isFreeShipping: { type: Boolean, default: true },

    // Ingredients / nutrition
    ingredients: { type: String, default: "" },
    ingredientsList: { type: [String], default: [] },
    nutritionalInfo: {
      servingSize: { type: String, default: "" },
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbohydrates: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      sodium: { type: Number, default: 0 }
    },
    allergens: { type: [String], default: [] },
    dietaryInfo: {
      isVegetarian: { type: Boolean, default: false },
      isVegan: { type: Boolean, default: false },
      isGlutenFree: { type: Boolean, default: false },
      isDairyFree: { type: Boolean, default: false },
      isNutFree: { type: Boolean, default: false },
      isOrganic: { type: Boolean, default: false }
    },

    // Weight / dimensions / sku / variant
    weight: { type: Number, default: 0 },
    weightUnit: { type: String, default: "" },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      unit: { type: String, default: "cm" }
    },
    sku: { type: String, default: "" },
    variant: { type: String, default: "" },

    // ✅ CUSTOM FIELD — vendor enables + names; customer types the value at runtime
    customField: {
      enabled: { type: Boolean, default: false },
      label:   { type: String, default: "" }   // e.g., "Name to Print"
    }
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("Product", ProductSchema);