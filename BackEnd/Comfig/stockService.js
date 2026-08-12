// Comfig/stockService.js - USE 'stock' NOT 'stockQuantity'
const Product = require("../Models/Product");
const Order = require("../Models/Order");

class StockService {
  static async checkStockAvailability(items) {
    console.log("🔍 StockService: Checking stock for", items.length, "items");
    
    const stockIssues = [];
    
    for (const item of items) {
      const productId = item.productId || item._id;
      
      console.log(`  Checking product ID: ${productId}`);
      
      if (!productId) {
        stockIssues.push({
          productId: productId,
          name: item.name || "Unknown Product",
          issue: "Product ID missing"
        });
        continue;
      }

      const product = await Product.findById(productId);
      
      if (!product) {
        console.log(`  ❌ Product not found: ${productId}`);
        stockIssues.push({
          productId: productId,
          name: item.name || "Unknown Product",
          issue: "Product not found in database"
        });
        continue;
      }
      
      // ✅ USE 'stock' (not 'stockQuantity')
      const stockAvailable = product.stock || 0;
      const reserved = product.reservedStock || 0;
      const available = Math.max(0, stockAvailable - reserved);
      const requested = item.quantity || 1;
      
      console.log(`  📊 ${product.name}: DB Stock=${stockAvailable}, Reserved=${reserved}, Available=${available}, Requested=${requested}`);
      
      if (available < requested) {
        stockIssues.push({
          productId: productId,
          name: product.name || item.name,
          requested: requested,
          available: available,
          stockQuantity: stockAvailable,
          reservedStock: reserved,
          issue: `Only ${available} available, but ${requested} requested`
        });
      }
    }
    
    const hasStock = stockIssues.length === 0;
    console.log(`✅ Stock check result: ${hasStock ? 'PASSED' : 'FAILED'}`);
    
    return {
      hasStock: hasStock,
      issues: stockIssues
    };
  }

  static async reserveStock(orderId, items) {
    console.log(`🔒 Reserving stock for order: ${orderId}`);
    const results = [];
    
    for (const item of items) {
      const productId = item.productId || item._id;
      
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }
      
      // ✅ USE 'stock' (not 'stockQuantity')
      const stockAvailable = product.stock || 0;
      const reserved = product.reservedStock || 0;
      const available = Math.max(0, stockAvailable - reserved);
      const quantity = item.quantity || 1;
      
      if (available < quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${available}, Requested: ${quantity}`);
      }
      
      product.reservedStock = (reserved || 0) + quantity;
      await product.save();
      
      console.log(`✅ Reserved ${quantity} of ${product.name}. New reserved: ${product.reservedStock}`);
      
      results.push({
        productId: productId,
        name: product.name,
        reserved: quantity,
        remainingStock: stockAvailable - (reserved + quantity),
        updatedReservedStock: product.reservedStock
      });
    }
    
    await Order.findByIdAndUpdate(orderId, {
      stockReserved: true
    });
    
    return results;
  }

  static async confirmStock(orderId) {
    console.log(`✅ Confirming stock for order: ${orderId}`);
    
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");
    
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const reserveAmount = Math.min(item.quantity || 1, product.reservedStock || 0);
        // ✅ USE 'stock' (not 'stockQuantity')
        product.stock = Math.max(0, (product.stock || 0) - reserveAmount);
        product.reservedStock = Math.max(0, (product.reservedStock || 0) - reserveAmount);
        await product.save();
        console.log(`✅ Deducted ${reserveAmount} from ${product.name}. New stock: ${product.stock}`);
      }
    }
    
    await Order.findByIdAndUpdate(orderId, {
      stockReserved: false,
      stockConfirmed: true
    });
    
    return { success: true, orderId };
  }

  static async releaseStock(orderId) {
    console.log(`🔓 Releasing stock for order: ${orderId}`);
    
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");
    
    if (!order.stockReserved) {
      console.log("⚠️ No stock to release");
      return { success: true, message: "No stock to release" };
    }
    
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const releaseAmount = Math.min(item.quantity || 1, product.reservedStock || 0);
        product.reservedStock = Math.max(0, (product.reservedStock || 0) - releaseAmount);
        await product.save();
        console.log(`✅ Released ${releaseAmount} from ${product.name}. New reserved: ${product.reservedStock}`);
      }
    }
    
    await Order.findByIdAndUpdate(orderId, {
      stockReserved: false,
      stockReleased: true
    });
    
    return { success: true, orderId };
  }

  static async logStockMovement(orderId, action, extra = {}) {
    console.log(`📝 [Stock Log] ${action}`, { orderId, ...extra });
  }
}

module.exports = StockService;