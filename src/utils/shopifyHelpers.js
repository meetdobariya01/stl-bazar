// src/utils/shopifyHelpers.js
// 🆕 Shopify + Native91 hybrid handler (stock/price fully fixed)

export const extractProducts = (responseData) => {
  if (!responseData) return [];
  if (responseData.data?.products && Array.isArray(responseData.data.products)) {
    return responseData.data.products;
  }
  if (Array.isArray(responseData.products)) return responseData.products;
  if (Array.isArray(responseData)) return responseData;
  return [];
};

// 🆕 Safe number extractor
const num = (val) => {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string" && val.trim() !== "") {
    const n = parseFloat(val);
    if (!isNaN(n)) return n;
  }
  return null;
};

export const toLegacyProduct = (sp) => {
  if (!sp) return null;

  const firstVariant = sp.variants?.[0] || {};

  // ============================================================
  // 🆕 STOCK — try every possible field, prefer non-zero
  // ============================================================
  const stockCandidates = [
    num(sp.stock),
    num(sp.stockQuantity),
    num(sp.availableStock),
    num(sp.inventory),
    num(sp.totalStock),
    num(firstVariant.quantity),
    num(firstVariant.stock),
    num(firstVariant.availableStock),
  ];
  const stockValue =
    stockCandidates.find((v) => v !== null && v > 0) ??
    stockCandidates.find((v) => v !== null) ??
    0;

  // ============================================================
  // 🆕 PRICE — try every possible field, prefer non-zero
  // ============================================================
  const priceCandidates = [
    num(firstVariant.price),
    num(sp.price),
    num(sp.sellingPrice),
    num(sp.mrp),
  ];
  const priceValue =
    priceCandidates.find((v) => v !== null && v > 0) ??
    priceCandidates.find((v) => v !== null) ??
    0;

  // ============================================================
  // 🆕 IMAGE
  // ============================================================
  let mainImage = "";
  if (sp.image && typeof sp.image === "object" && sp.image.src) {
    mainImage = sp.image.src;
  } else if (Array.isArray(sp.image) && sp.image.length > 0) {
    mainImage = sp.image[0];
  } else if (Array.isArray(sp.images) && sp.images.length > 0) {
    mainImage = sp.images[0];
  } else if (typeof sp.image === "string") {
    mainImage = sp.image;
  }

  // ============================================================
  // 🆕 VARIANTS
  // ============================================================
  const variants = (sp.variants || []).map((v) => {
    const vStock =
      num(v.quantity) ?? num(v.stock) ?? num(v.availableStock) ?? 0;

    const vPrice = num(v.price) ?? priceValue;

    let vImageSrc = "";
    if (v.image && typeof v.image === "object" && v.image.src) {
      vImageSrc = v.image.src;
    } else if (typeof v.image === "string") {
      vImageSrc = v.image;
    }

    return {
      _id: v.id || v._id,
      id: v.id || v._id,
      color: v.option_values?.Color || v.color || "",
      size: v.option_values?.Size || v.size || "",
      title: v.title || "",
      price: vPrice,
      stock: vStock,
      quantity: vStock,
      sku: v.sku || "",
      image: vImageSrc,
      images: vImageSrc ? [vImageSrc] : [],
      isAvailable: vStock > 0,
    };
  });

  // ============================================================
  // 🆕 FINAL OBJECT — both Native91 + Shopify fields
  // ============================================================
  return {
    // Native91
    _id: sp.id || sp._id,
    name: sp.title || sp.name || "Unnamed Product",
    price: priceValue,
    description: (sp.body_html || sp.description || "").replace(/<[^>]*>/g, ""),
    company: sp.vendor || sp.company || "Native91",
    image: mainImage ? [mainImage] : [],
    images: mainImage ? [mainImage] : [],

    // 🆕 Stock — બધા fields
    stock: stockValue,
    stockQuantity: stockValue,
    availableStock: stockValue,
    inStock: stockValue > 0,
    stockStatus: stockValue > 0 ? "in_stock" : "out_of_stock",

    category: sp.product_type || sp.category || "",
    subcategory: sp.product_type || sp.subcategory || sp.subCategory || "",
    subCategory: sp.product_type || sp.subCategory || "",
    subCategories: sp.product_type ? [sp.product_type] : [],
    subcategories: sp.product_type ? [sp.product_type] : [],

    sku: firstVariant.sku || sp.sku || "",
    size: firstVariant.option_values?.Size || sp.size || "",
    weight: num(firstVariant.weight) ?? num(sp.weight) ?? 0,
    weightUnit: firstVariant.weight_unit || sp.weightUnit || "kg",

    shippingTime: sp.shippingTime || "3-5 days",
    customShippingTime: sp.customShippingTime || "",
    estimatedDeliveryDays: sp.estimatedDeliveryDays || { min: 3, max: 5 },
    customField: sp.customField || { enabled: false, label: "" },

    averageRating: num(sp.averageRating) ?? 0,
    ratings: sp.ratings || [],
    handmadePolicy: sp.handmadePolicy || false,
    ingredients: sp.ingredients || "",
    ingredientsList: sp.ingredientsList || [],
    allergens: sp.allergens || [],
    nutritionalInfo: sp.nutritionalInfo || {},
    dietaryInfo: sp.dietaryInfo || {},
    dimensions: sp.dimensions || {},
    createdAt: sp.created_at || sp.createdAt,
    updatedAt: sp.updated_at || sp.updatedAt,

    variants: variants,

    // Shopify fields (backwards compat)
    id: sp.id,
    title: sp.title,
    body_html: sp.body_html,
    vendor: sp.vendor,
    product_type: sp.product_type,
    handle: sp.handle,
    tags: sp.tags,
    status: sp.status,
    created_at: sp.created_at,
    updated_at: sp.updated_at,
    options: sp.options || [],
  };
};

export const getLegacyProducts = (responseData) => {
  const shopifyProducts = extractProducts(responseData);
  if (!Array.isArray(shopifyProducts)) return [];
  return shopifyProducts.map(toLegacyProduct);
};