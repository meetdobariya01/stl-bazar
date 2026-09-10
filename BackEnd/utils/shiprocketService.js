// Services/shiprocketService.js - FULLY DYNAMIC WITH SELLERDOCUMENT

const axios = require('axios');
const Vendor = require('../Models/Vendor');
const SellerDocument = require('../Models/SellerDocument');
const PickupLocation = require('../Models/PickupLocation');

class ShiprocketService {
  constructor() {
    this.baseURL = process.env.SHIPROCKET_API_URL || 'https://apiv2.shiprocket.in/v1/external';
    this.email = process.env.SHIPROCKET_EMAIL;
    this.password = process.env.SHIPROCKET_PASSWORD;
    this.token = null;
    this.tokenExpiry = null;
  }

  // ============================================
  // AUTHENTICATION
  // ============================================
  async authenticate() {
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry - 15 * 60 * 1000) {
      return this.token;
    }

    try {
      console.log('🔐 Authenticating with Shiprocket...');
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: this.email,
        password: this.password
      });

      this.token = response.data.token;
      this.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
      console.log('✅ Shiprocket authentication successful');
      return this.token;
    } catch (error) {
      console.error('❌ Shiprocket authentication failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Shiprocket');
    }
  }

  // ============================================
  // GET HEADERS
  // ============================================
  async getHeaders() {
    const token = await this.authenticate();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // ============================================
  // ✅ HELPER: Generate UNIQUE SKU for Shiprocket
  // ============================================
  generateUniqueSku(item, index) {
    // Extract product ID (handle both object and string)
    const rawProductId = item.productId;
    let productId = "";

    if (rawProductId) {
      if (typeof rawProductId === "object") {
        productId = String(rawProductId._id || rawProductId);
      } else {
        productId = String(rawProductId);
      }
    }

    // Fallback: use item.sku if provided
    if (!productId && item.sku) {
      productId = String(item.sku);
    }

    // Fallback: generate one
    if (!productId) {
      productId = `SKU${String(index + 1).padStart(3, "0")}`;
    }

    // ✅ Extract variant ID
    const rawVariantId = item.variantId;
    let variantId = "";
    if (rawVariantId && String(rawVariantId).trim() !== "" && String(rawVariantId) !== "null") {
      variantId = String(rawVariantId).trim();
    }

    // ✅ Build unique SKU
    // - Base product: "PRODUCT_ID"
    // - Variant product: "PRODUCT_ID-VARIANT_ID"
    let uniqueSku = variantId
      ? `${productId}-${variantId}`
      : productId;

    // ✅ Shiprocket SKU max 50 chars
    if (uniqueSku.length > 50) {
      uniqueSku = uniqueSku.substring(0, 50);
    }

    return uniqueSku;
  }

  // ============================================
  // GET VENDOR ADDRESS FROM SELLERDOCUMENT
  // ============================================
  async getVendorAddress(vendorId) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        console.log(`❌ Vendor not found: ${vendorId}`);
        return null;
      }

      const sellerDoc = await SellerDocument.findOne({ vendorId: vendorId });
      
      const vendorData = {
        _id: vendor._id,
        name: vendor.name || vendor.company,
        company: vendor.company || 'N/A',
        email: vendor.email,
        phone: sellerDoc?.contact?.phone || vendor.phone || '9876543210',
        address: sellerDoc?.contact?.address || 'Default Address',
        city: sellerDoc?.contact?.city || 'Mumbai',
        state: sellerDoc?.contact?.state || 'Maharashtra',
        pincode: sellerDoc?.contact?.pincode || '400001',
        country: sellerDoc?.contact?.country || 'India'
      };

      console.log(`✅ Vendor address fetched for: ${vendorData.company}`);
      console.log(`   📍 Address: ${vendorData.address}, ${vendorData.city}, ${vendorData.state}`);
      
      return vendorData;
      
    } catch (error) {
      console.error('❌ Error fetching vendor address:', error.message);
      return null;
    }
  }

  // ============================================
  // GET OR CREATE PICKUP LOCATION - DYNAMIC
  // ============================================
  async getOrCreatePickupLocation(vendorId) {
    const vendorIdStr = vendorId.toString();
    
    console.log(`🔍 Getting/creating pickup location for vendor: ${vendorIdStr}`);
    
    try {
      let pickupLocation = await PickupLocation.findOne({ vendorId: vendorIdStr });
      
      if (pickupLocation) {
        console.log(`✅ Found pickup location in DB: ${pickupLocation.nickname}`);
        return pickupLocation;
      }

      const vendorData = await this.getVendorAddress(vendorId);
      if (!vendorData) {
        throw new Error('Vendor data not found');
      }

      console.log(`📍 Creating pickup location for: ${vendorData.company}`);

      const pickupNickname = `vendor-${vendorIdStr}`;
      
      const payload = {
        pickup_location: pickupNickname,
        name: vendorData.company || vendorData.name,
        email: vendorData.email,
        phone: vendorData.phone,
        address: vendorData.address,
        city: vendorData.city,
        state: vendorData.state,
        country: vendorData.country || 'India',
        pincode: vendorData.pincode
      };

      const headers = await this.getHeaders();
      
      console.log('📦 Creating pickup location with payload:', JSON.stringify(payload, null, 2));

      let shiprocketResponse;
      try {
        shiprocketResponse = await axios.post(
          `${this.baseURL}/settings/pickup`,
          payload,
          { headers }
        );
        console.log('✅ Pickup location created in Shiprocket');
      } catch (error) {
        console.warn('⚠️ Could not create pickup location via API, using fallback');
        shiprocketResponse = {
          data: {
            id: `fallback-${Date.now()}`,
            pickup_location: pickupNickname
          }
        };
      }

      pickupLocation = new PickupLocation({
        vendorId: vendorIdStr,
        shiprocketPickupId: shiprocketResponse.data?.id || `fallback-${Date.now()}`,
        nickname: pickupNickname,
        address: vendorData.address,
        city: vendorData.city,
        state: vendorData.state,
        pincode: vendorData.pincode,
        country: vendorData.country || 'India',
        phone: vendorData.phone,
        email: vendorData.email,
        isActive: true
      });

      await pickupLocation.save();
      console.log(`✅ Pickup location saved to database: ${pickupNickname}`);
      
      return pickupLocation;
      
    } catch (error) {
      console.error('❌ Error in getOrCreatePickupLocation:', error.message);
      
      console.log('⚠️ Using fallback pickup location');
      const fallbackNickname = `vendor-${vendorIdStr}`;
      
      let pickupLocation = await PickupLocation.findOne({ vendorId: vendorIdStr });
      if (!pickupLocation) {
        pickupLocation = new PickupLocation({
          vendorId: vendorIdStr,
          shiprocketPickupId: `fallback-${Date.now()}`,
          nickname: fallbackNickname,
          address: 'Default Address',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
          phone: '9876543210',
          email: 'vendor@example.com',
          isActive: true
        });
        await pickupLocation.save();
      }
      
      return pickupLocation;
    }
  }

  // ============================================
  // GET PICKUP LOCATION FOR VENDOR
  // ============================================
  async getPickupLocationForVendor(vendorId) {
    const pickupLocation = await this.getOrCreatePickupLocation(vendorId);
    return pickupLocation.nickname;
  }

  // ============================================
  // GET ALL PICKUP LOCATIONS
  // ============================================
  async getPickupLocations() {
    try {
      const pickupLocations = await PickupLocation.find({ isActive: true });
      return { 
        data: pickupLocations.map(p => ({
          pickup_location: p.nickname,
          vendorId: p.vendorId,
          address: p.address,
          city: p.city,
          state: p.state,
          pincode: p.pincode
        }))
      };
    } catch (error) {
      console.error('❌ Get pickup locations error:', error.message);
      return { data: [] };
    }
  }

  // ============================================
  // CREATE PICKUP LOCATION - USE EXISTING OR CREATE NEW
  // ============================================
  async createPickupLocation(vendorData) {
    try {
      console.log('📍 Getting/creating pickup location for:', vendorData.company || vendorData.name);
      
      const pickupLocation = await this.getOrCreatePickupLocation(vendorData._id);
      
      console.log(`✅ Using pickup location: ${pickupLocation.nickname}`);
      
      return {
        success: true,
        data: { 
          pickup_location: pickupLocation.nickname,
          message: 'Pickup location ready'
        },
        message: 'Pickup location ready'
      };
      
    } catch (error) {
      console.error('❌ Pickup location error:', error.message);
      throw new Error(`Failed to get pickup location: ${error.message}`);
    }
  }

  // ============================================
  // ✅ CREATE ORDER/SHIPMENT (FIXED — UNIQUE SKUs)
  // ============================================
  async createOrder(orderData) {
    try {
      console.log('\n' + '='.repeat(60));
      console.log('📦 SHIPROCKET ORDER CREATION STARTED');
      console.log('='.repeat(60));
      
      // ✅ FIXED: Generate UNIQUE SKU per item (variant-aware)
      const orderItems = orderData.items.map((item, index) => {
        const uniqueSku = this.generateUniqueSku(item, index);
        
        return {
          name: item.name || 'Product',
          sku: uniqueSku,                    // ← ✅ UNIQUE SKU
          units: item.quantity || 1,
          selling_price: parseFloat(item.price) || 0,
          discount: parseFloat(item.discountAmount || item.discount) || 0,
          tax: parseFloat(item.tax) || 0,
          hsn: item.hsn || ''
        };
      });

      // ✅ DEBUG: Check for duplicate SKUs
      const skus = orderItems.map(i => i.sku);
      const duplicateSkus = skus.filter((sku, idx) => skus.indexOf(sku) !== idx);
      
      console.log('\n📋 Order Items SKUs:');
      orderItems.forEach((item, idx) => {
        console.log(`   [${idx + 1}] ${item.name} → SKU: ${item.sku} (₹${item.selling_price})`);
      });
      
      if (duplicateSkus.length > 0) {
        console.error('❌❌❌ DUPLICATE SKUs DETECTED:', duplicateSkus);
        console.error('   Aa fix nathi lagyu! Check karo variantId cart ma save chhe ke nahi.');
      } else {
        console.log(`✅ All ${skus.length} SKUs are UNIQUE`);
      }

      // Prepare customer info
      const customer = orderData.customer || orderData.shippingAddress;
      const fullName = customer.name || 'Customer';
      const nameParts = fullName.split(' ');
      const lastName = nameParts.slice(1).join(' ') || '';

      // Get pickup location
      const pickupLocation = await this.getPickupLocationForVendor(orderData.vendorId);
      
      const payload = {
        order_id: orderData.orderId,
        order_date: new Date().toISOString().split('T')[0],
        
        billing_customer_name: fullName,
        billing_last_name: lastName,
        billing_address: customer.address || 'Address',
        billing_city: customer.city || 'Mumbai',
        billing_pincode: customer.pincode || '400001',
        billing_state: customer.state || 'Maharashtra',
        billing_country: customer.country || 'India',
        billing_phone: customer.phone || '9876543210',
        billing_email: customer.email || 'customer@example.com',
        
        shipping_customer_name: fullName,
        shipping_last_name: lastName,
        shipping_address: customer.address || 'Address',
        shipping_city: customer.city || 'Mumbai',
        shipping_pincode: customer.pincode || '400001',
        shipping_state: customer.state || 'Maharashtra',
        shipping_country: customer.country || 'India',
        shipping_phone: customer.phone || '9876543210',
        shipping_email: customer.email || 'customer@example.com',
        
        shipping_is_billing: true,
        
        order_items: orderItems,
        payment_method: orderData.paymentMethod || 'COD',
        shipping_charges: orderData.shippingCharges || 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: orderData.discount || 0,
        sub_total: orderData.subtotal || orderData.totalPrice || 0,
        length: orderData.length || 10,
        breadth: orderData.breadth || 10,
        height: orderData.height || 10,
        weight: orderData.weight || 0.5,
        
        pickup_location: pickupLocation,
        
        dimensions_unit: 'cm',
        weight_unit: 'kg'
      };

      const headers = await this.getHeaders();
      
      console.log('📤 SHIPROCKET REQUEST');
      console.log(`🆔 Order ID: ${orderData.orderId}`);
      console.log(`📍 Pickup Location: ${pickupLocation}`);
      console.log('📦 Payload:', JSON.stringify(payload, null, 2));
      
      const response = await axios.post(
        `${this.baseURL}/orders/create/adhoc`,
        payload,
        { headers }
      );

      console.log('📥 SHIPROCKET RESPONSE:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('='.repeat(60) + '\n');

      const orderId = response.data.order_id || 
                      response.data.id || 
                      response.data.data?.order_id ||
                      'UNKNOWN';
      
      const shipmentId = response.data.shipment_id || 
                         response.data.shipmentId || 
                         response.data.data?.shipment_id ||
                         'UNKNOWN';
      
      const awbCode = response.data.awb_code || 
                      response.data.awbCode || 
                      response.data.data?.awb_code ||
                      'UNKNOWN';
      
      const labelUrl = response.data.label_url || 
                       response.data.labelUrl || 
                       response.data.data?.label_url ||
                       '';

      return {
        success: true,
        data: response.data,
        orderId: orderId,
        shipmentId: shipmentId,
        awbCode: awbCode,
        labelUrl: labelUrl
      };
      
    } catch (error) {
      console.log('\n' + '='.repeat(60));
      console.log('❌ SHIPROCKET ERROR');
      console.log('='.repeat(60));
      
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log(JSON.stringify(error.response.data, null, 2));
        
        if (error.response.data?.errors) {
          console.log('\n📋 Validation Errors:');
          Object.entries(error.response.data.errors).forEach(([field, messages]) => {
            console.log(`   - ${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`);
          });
        }
      } else {
        console.log(error.message);
      }
      
      console.log('='.repeat(60) + '\n');
      throw error;
    }
  }

  // ============================================
  // CREATE VENDOR SHIPMENT
  // ============================================
  async createVendorShipment(order, vendor, vendorItems, customer) {
    try {
      console.log(`\n🔵 CREATE VENDOR SHIPMENT: ${vendor.company || vendor.name}`);
      
      const pickupResult = await this.createPickupLocation(vendor);
      
      const subtotal = vendorItems.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      );
      
      const totalWeight = vendorItems.reduce(
        (sum, item) => sum + ((item.weight || 0.5) * item.quantity),
        0
      );

      const pickupLocationName = await this.getPickupLocationForVendor(vendor._id);
      
      const orderData = {
        orderId: `${order.orderId || order._id}-${vendor._id}`,
        vendorId: vendor._id,
        items: vendorItems,
        customer: customer || order.shippingAddress,
        paymentMethod: order.paymentMethod || 'COD',
        subtotal: subtotal,
        totalPrice: subtotal,
        weight: Math.max(totalWeight, 0.5),
        length: 10,
        breadth: 10,
        height: 10,
        pickupLocation: pickupLocationName,
        discount: 0,
        shippingCharges: 0
      };

      const result = await this.createOrder(orderData);

      return {
        success: true,
        vendorId: vendor._id,
        company: vendor.company || vendor.name,
        orderId: orderData.orderId,
        shipmentId: result.shipmentId,
        awbCode: result.awbCode,
        labelUrl: result.labelUrl,
        pickupLocation: pickupLocationName,
        items: vendorItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: subtotal
      };
      
    } catch (error) {
      console.error(`❌ Vendor shipment error for ${vendor._id}:`, error.message);
      return {
        success: false,
        vendorId: vendor._id,
        company: vendor.company || vendor.name,
        error: error.message
      };
    }
  }

  // ============================================
  // CREATE SHIPMENTS FOR ALL VENDORS
  // ============================================
  async createVendorShipments(order, vendorItems, customer) {
    console.log(`\n🚀 Creating shipments for ${Object.keys(vendorItems).length} vendor(s)`);
    const results = [];
    
    for (const [vendorId, items] of Object.entries(vendorItems)) {
      try {
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
          console.warn(`⚠️ Vendor ${vendorId} not found`);
          results.push({
            vendorId,
            success: false,
            error: 'Vendor not found'
          });
          continue;
        }

        const result = await this.createVendorShipment(
          order,
          vendor,
          items,
          customer
        );
        
        results.push(result);
      } catch (error) {
        console.error(`Error processing vendor ${vendorId}:`, error.message);
        results.push({
          vendorId,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ ${successCount}/${results.length} vendor shipments created`);
    return results;
  }

  // ============================================
  // TRACK SHIPMENT
  // ============================================
  async getShipmentTracking(shipmentId) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${this.baseURL}/shipments/${shipmentId}/tracking`,
        { headers }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Tracking error:', error.response?.data || error.message);
      throw new Error('Failed to get tracking information');
    }
  }

  // ============================================
  // GENERATE LABEL
  // ============================================
  async generateLabel(shipmentId) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${this.baseURL}/shipments/${shipmentId}/generate-label`,
        {},
        { headers }
      );
      return {
        success: true,
        labelUrl: response.data.label_url
      };
    } catch (error) {
      console.error('Label generation error:', error.response?.data || error.message);
      throw new Error('Failed to generate label');
    }
  }

  // ============================================
  // CANCEL SHIPMENT
  // ============================================
  async cancelShipment(shipmentId) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${this.baseURL}/shipments/${shipmentId}/cancel`,
        {},
        { headers }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Cancellation error:', error.response?.data || error.message);
      throw new Error('Failed to cancel shipment');
    }
  }
}

module.exports = new ShiprocketService();