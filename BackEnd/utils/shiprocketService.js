// Services/shiprocketService.js - FULLY FIXED with Auto-Retry Fallback

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

    // Cache
    this.pickupCache = null;
    this.pickupCacheExpiry = null;
  }

  // ============================================
  // AUTH
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
      console.error('❌ Auth failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Shiprocket');
    }
  }

  async getHeaders() {
    const token = await this.authenticate();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // ============================================
  // HELPER: Unique SKU
  // ============================================
  generateUniqueSku(item, index) {
    const rawProductId = item.productId;
    let productId = "";
    if (rawProductId) {
      productId = typeof rawProductId === "object"
        ? String(rawProductId._id || rawProductId)
        : String(rawProductId);
    }
    if (!productId && item.sku) productId = String(item.sku);
    if (!productId) productId = `SKU${String(index + 1).padStart(3, "0")}`;

    let variantId = "";
    const rawVariantId = item.variantId;
    if (rawVariantId && String(rawVariantId).trim() !== "" && String(rawVariantId) !== "null") {
      variantId = String(rawVariantId).trim();
    }

    let uniqueSku = variantId ? `${productId}-${variantId}` : productId;
    if (uniqueSku.length > 50) uniqueSku = uniqueSku.substring(0, 50);
    return uniqueSku;
  }

  // ============================================
  // SANITIZE ADDRESS
  // ============================================
  sanitizeAddress(address) {
    if (!address) return 'House No. 1, Main Road';

    let clean = String(address)
      .replace(/[\r\n]+/g, ', ')
      .replace(/\s+/g, ' ')
      .replace(/,+/g, ',')
      .replace(/^[,\s]+|[,\s]+$/g, '')
      .trim();

    const hasNumber = /\d/.test(clean);
    if (!hasNumber) {
      clean = `House No. 1, ${clean}`;
    }

    if (clean.length < 10) {
      clean = `House No. 1, Main Road, ${clean}`;
    }

    if (clean.length > 100) {
      clean = clean.substring(0, 100);
    }

    return clean;
  }

  // ============================================
  // SANITIZE PHONE
  // ============================================
  sanitizePhone(phone) {
    if (!phone) return '9999999999';
    let digits = String(phone).replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
      digits = digits.substring(2);
    }
    if (digits.length > 10) digits = digits.substring(0, 10);
    if (digits.length < 10) digits = digits.padStart(10, '9');
    return digits;
  }

  // ============================================
  // SANITIZE PINCODE
  // ============================================
  sanitizePincode(pincode) {
    if (!pincode) return '400001';
    let digits = String(pincode).replace(/\D/g, '');
    if (digits.length !== 6) {
      digits = '400001';
    }
    return digits;
  }

  // ============================================
  // VENDOR ADDRESS
  // ============================================
  async getVendorAddress(vendorId) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) return null;

      let doc = await SellerDocument.findOne({ email: vendor.email });
      if (!doc && vendor.company) {
        doc = await SellerDocument.findOne({ company: vendor.company });
      }

      const vendorData = {
        _id: vendor._id,
        name: vendor.name || vendor.company,
        company: vendor.company || 'N/A',
        email: vendor.email,
        phone: doc?.contact?.phone || doc?.phone || vendor.phone || '9876543210',
        address: doc?.contact?.address || doc?.address || 'Default Address',
        city: doc?.contact?.city || doc?.city || 'Mumbai',
        state: doc?.contact?.state || doc?.state || 'Maharashtra',
        pincode: doc?.contact?.pincode || doc?.pincode || '400001',
        country: doc?.contact?.country || doc?.country || 'India',
      };

      console.log(`✅ Vendor address: ${vendorData.company}`);
      console.log(`   📍 ${vendorData.address}, ${vendorData.city} - ${vendorData.pincode}`);

      return vendorData;
    } catch (error) {
      console.error('❌ getVendorAddress error:', error.message);
      return null;
    }
  }

  // ============================================
  // FETCH SHIPROCKET PICKUP LOCATIONS (CACHED)
  // ============================================
  async fetchShiprocketPickupLocations() {
    if (this.pickupCache && Date.now() < this.pickupCacheExpiry) {
      return this.pickupCache;
    }
    try {
      const headers = await this.getHeaders();
      const res = await axios.get(
        `${this.baseURL}/settings/company/pickup`,
        { headers }
      );
      this.pickupCache = res.data?.data?.shipping_address || [];
      this.pickupCacheExpiry = Date.now() + 60 * 60 * 1000;
      console.log(`📦 Shiprocket has ${this.pickupCache.length} pickup location(s)`);
      return this.pickupCache;
    } catch (error) {
      console.error('❌ Fetch pickup locations failed:', error.response?.data || error.message);
      return [];
    }
  }

  // ============================================
  // CREATE PICKUP LOCATION IN SHIPROCKET
  // ============================================
  async createShiprocketPickupLocation(payload) {
    try {
      const headers = await this.getHeaders();
      const res = await axios.post(
        `${this.baseURL}/settings/company/addpickup`,
        payload,
        { headers }
      );
      console.log('✅ Shiprocket addpickup response:', JSON.stringify(res.data));
      return { success: true, data: res.data };
    } catch (error) {
      console.error('❌ addpickup failed:');
      console.error(JSON.stringify(error.response?.data || error.message, null, 2));
      return { success: false, error: error.response?.data || error.message };
    }
  }

  // ============================================
  // ✅ GET PICKUP LOCATION FOR VENDOR
  // ============================================
  async getPickupLocationForVendor(vendorId) {
    const vendorIdStr = vendorId.toString();
    const desiredNickname = `vendor-${vendorIdStr}`;

    console.log(`\n🔍 Pickup Location for vendor: ${vendorIdStr}`);

    try {
      const shiprocketLocations = await this.fetchShiprocketPickupLocations();
      const availableNicknames = shiprocketLocations.map(l => l.pickup_location);

      console.log(`📋 Shiprocket available: [${availableNicknames.join(', ')}]`);

      // STEP 1: Already exists?
      if (availableNicknames.includes(desiredNickname)) {
        console.log(`✅ Vendor-specific pickup EXISTS: ${desiredNickname}`);

        const srLoc = shiprocketLocations.find(l => l.pickup_location === desiredNickname);
        await PickupLocation.findOneAndUpdate(
          { vendorId: vendorId },
          {
            vendorId: vendorId,
            nickname: desiredNickname,
            shiprocketPickupId: String(srLoc.id),
            address: srLoc.address,
            city: srLoc.city,
            state: srLoc.state,
            pincode: srLoc.pin_code,
            country: srLoc.country || 'India',
            phone: srLoc.phone,
            email: srLoc.email,
            isActive: true,
            verified: true,
            fallback: false,
          },
          { upsert: true, new: true }
        );
        return desiredNickname;
      }

      // STEP 2: Create
      console.log(`⚠️ "${desiredNickname}" not in Shiprocket — trying to create`);

      const vendorData = await this.getVendorAddress(vendorId);
      if (!vendorData) throw new Error('Vendor data not found');

      const cleanAddress = this.sanitizeAddress(vendorData.address);
      const cleanPhone = this.sanitizePhone(vendorData.phone);
      const cleanPincode = this.sanitizePincode(vendorData.pincode);

      console.log(`🧹 Sanitized address: "${cleanAddress}"`);
      console.log(`🧹 Sanitized phone: ${cleanPhone}`);
      console.log(`🧹 Sanitized pincode: ${cleanPincode}`);

      const payload = {
        pickup_location: desiredNickname,
        name: vendorData.company || vendorData.name || 'Vendor',
        email: vendorData.email,
        phone: cleanPhone,
        address: cleanAddress,
        address_2: '',
        city: vendorData.city || 'Mumbai',
        state: vendorData.state || 'Maharashtra',
        country: vendorData.country || 'India',
        pin_code: cleanPincode,
      };

      const createResult = await this.createShiprocketPickupLocation(payload);

      if (createResult.success) {
        console.log(`✅ Created in Shiprocket: ${desiredNickname}`);

        // Clear cache
        this.pickupCache = null;
        this.pickupCacheExpiry = null;

        await PickupLocation.findOneAndUpdate(
          { vendorId: vendorId },
          {
            vendorId: vendorId,
            nickname: desiredNickname,
            shiprocketPickupId: createResult.data?.id || desiredNickname,
            address: cleanAddress,
            city: vendorData.city,
            state: vendorData.state,
            pincode: cleanPincode,
            country: vendorData.country || 'India',
            phone: cleanPhone,
            email: vendorData.email,
            isActive: true,
            verified: false,
            fallback: false,
          },
          { upsert: true, new: true }
        );
        return desiredNickname;
      }

      // STEP 3: Create fail → fallback
      console.warn(`⚠️ Could not create vendor pickup — using fallback`);

      const fallbackNickname =
        process.env.SHIPROCKET_DEFAULT_PICKUP ||
        availableNicknames[0];

      if (!fallbackNickname || !availableNicknames.includes(fallbackNickname)) {
        throw new Error(
          `No fallback pickup available. Shiprocket has: [${availableNicknames.join(', ')}]`
        );
      }

      console.log(`🔄 Using fallback pickup: ${fallbackNickname}`);

      await PickupLocation.findOneAndUpdate(
        { vendorId: vendorId },
        {
          vendorId: vendorId,
          nickname: fallbackNickname,
          shiprocketPickupId: fallbackNickname,
          address: vendorData.address,
          city: vendorData.city,
          state: vendorData.state,
          pincode: cleanPincode,
          country: vendorData.country || 'India',
          phone: cleanPhone,
          email: vendorData.email,
          isActive: true,
          verified: true,
          fallback: true,
        },
        { upsert: true, new: true }
      );

      return fallbackNickname;

    } catch (error) {
      console.error('❌ getPickupLocationForVendor error:', error.message);

      // EMERGENCY FALLBACK
      const shiprocketLocations = await this.fetchShiprocketPickupLocations();
      const fallback =
        process.env.SHIPROCKET_DEFAULT_PICKUP ||
        shiprocketLocations[0]?.pickup_location;

      if (!fallback) {
        throw new Error('No Shiprocket pickup location available. Add one in dashboard.');
      }

      console.log(`🔄 Emergency fallback: ${fallback}`);
      return fallback;
    }
  }

  // ============================================
  // WRAPPER
  // ============================================
  async createPickupLocation(vendorData) {
    try {
      const nickname = await this.getPickupLocationForVendor(vendorData._id);
      console.log(`✅ Using pickup location: ${nickname}`);
      return {
        success: true,
        data: { pickup_location: nickname, message: 'Pickup location ready' },
        message: 'Pickup location ready'
      };
    } catch (error) {
      console.error('❌ createPickupLocation error:', error.message);
      throw new Error(`Failed to get pickup location: ${error.message}`);
    }
  }

  // ============================================
  // ✅ CREATE ORDER (with AUTO-RETRY on wrong pickup)
  // ============================================
  async createOrder(orderData) {
    return this._createOrderWithPickup(orderData, null);
  }

  async _createOrderWithPickup(orderData, overridePickup) {
    try {
      console.log('\n' + '='.repeat(60));
      console.log('📦 SHIPROCKET ORDER CREATION');
      console.log(`📌 Vendor: ${orderData.vendorId}`);
      console.log('='.repeat(60));

      const orderItems = orderData.items.map((item, index) => {
        const uniqueSku = this.generateUniqueSku(item, index);
        return {
          name: item.name || 'Product',
          sku: uniqueSku,
          units: item.quantity || 1,
          selling_price: parseFloat(item.price) || 0,
          discount: parseFloat(item.discountAmount || item.discount) || 0,
          tax: parseFloat(item.tax) || 0,
          hsn: item.hsn || ''
        };
      });

      const skus = orderItems.map(i => i.sku);
      const duplicateSkus = skus.filter((sku, idx) => skus.indexOf(sku) !== idx);

      console.log('\n📋 Order Items SKUs:');
      orderItems.forEach((item, idx) => {
        console.log(`   [${idx + 1}] ${item.name} → SKU: ${item.sku} (₹${item.selling_price})`);
      });

      if (duplicateSkus.length > 0) {
        console.error('❌ DUPLICATE SKUs:', duplicateSkus);
      } else {
        console.log(`✅ All ${skus.length} SKUs are UNIQUE`);
      }

      const customer = orderData.customer || orderData.shippingAddress;
      const fullName = customer.name || 'Customer';
      const nameParts = fullName.split(' ');
      const lastName = nameParts.slice(1).join(' ') || '';

      // Use override OR vendor-specific
      const pickupLocation = overridePickup ||
        await this.getPickupLocationForVendor(orderData.vendorId);

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

      console.log('📤 REQUEST');
      console.log(`🆔 Order ID: ${orderData.orderId}`);
      console.log(`📍 Pickup: ${pickupLocation}`);
      console.log('📦 Payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${this.baseURL}/orders/create/adhoc`,
        payload,
        { headers }
      );

      // 🆕 Detect "wrong pickup" error even on 200 status
      if (response.data?.message &&
          response.data.message.includes('Wrong Pickup location')) {
        const err = new Error('WRONG_PICKUP_LOCATION');
        err.shiprocketResponse = response.data;
        throw err;
      }

      console.log('📥 RESPONSE:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('='.repeat(60) + '\n');

      return {
        success: true,
        data: response.data,
        orderId: response.data.order_id || response.data.id || 'UNKNOWN',
        shipmentId: response.data.shipment_id || 'UNKNOWN',
        awbCode: response.data.awb_code || 'UNKNOWN',
        labelUrl: response.data.label_url || ''
      };

    } catch (error) {
      // 🆕 AUTO-RETRY: wrong pickup → retry with fallback
      if (error.message === 'WRONG_PICKUP_LOCATION' ||
          error.response?.data?.message?.includes('Wrong Pickup location')) {

        console.warn('⚠️ Wrong pickup location — retrying with fallback');

        const fallback = process.env.SHIPROCKET_DEFAULT_PICKUP || 'work';

        // Prevent infinite loop
        if (overridePickup === fallback) {
          console.error('❌ Fallback pickup also failed!');
          console.error(JSON.stringify(error.shiprocketResponse || error.response?.data, null, 2));
          throw new Error('Fallback pickup failed — check Shiprocket dashboard');
        }

        console.log(`🔄 Retrying with fallback: ${fallback}`);

        // Retry with fallback
        return this._createOrderWithPickup(orderData, fallback);
      }

      console.log('\n❌ SHIPROCKET ERROR');
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log(JSON.stringify(error.response.data, null, 2));
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
      console.log(`\n🔵 VENDOR SHIPMENT: ${vendor.company || vendor.name} (${vendor._id})`);

      const subtotal = vendorItems.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      );

      const totalWeight = vendorItems.reduce(
        (sum, item) => sum + ((item.weight || 0.5) * item.quantity),
        0
      );

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
        items: vendorItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: subtotal
      };

    } catch (error) {
      console.error(`❌ Vendor shipment error (${vendor._id}):`, error.message);
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
          results.push({ vendorId, success: false, error: 'Vendor not found' });
          continue;
        }

        const result = await this.createVendorShipment(order, vendor, items, customer);
        results.push(result);
      } catch (error) {
        console.error(`Error processing vendor ${vendorId}:`, error.message);
        results.push({ vendorId, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ ${successCount}/${results.length} vendor shipments created`);
    return results;
  }

  // ============================================
  // TRACK / LABEL / CANCEL
  // ============================================
  async getShipmentTracking(shipmentId) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${this.baseURL}/shipments/${shipmentId}/tracking`,
        { headers }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Tracking error:', error.response?.data || error.message);
      throw new Error('Failed to get tracking information');
    }
  }

  async generateLabel(shipmentId) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${this.baseURL}/shipments/${shipmentId}/generate-label`,
        {},
        { headers }
      );
      return { success: true, labelUrl: response.data.label_url };
    } catch (error) {
      console.error('Label error:', error.response?.data || error.message);
      throw new Error('Failed to generate label');
    }
  }

  async cancelShipment(shipmentId) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${this.baseURL}/shipments/${shipmentId}/cancel`,
        {},
        { headers }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Cancel error:', error.response?.data || error.message);
      throw new Error('Failed to cancel shipment');
    }
  }
}

module.exports = new ShiprocketService();