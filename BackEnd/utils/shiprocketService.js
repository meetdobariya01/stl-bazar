// Services/shiprocketService.js - COMPLETE FIXED VERSION
const axios = require('axios');
const Vendor = require('../Models/Vendor');

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
  // GET ALL PICKUP LOCATIONS - FIXED
  // ============================================
// ============================================
// GET ALL PICKUP LOCATIONS - HANDLE 404
// ============================================
async getPickupLocations() {
  try {
    const headers = await this.getHeaders();
    const response = await axios.get(
      `${this.baseURL}/settings/pickup`,
      { headers }
    );
    return response.data;
  } catch (error) {
    // If 404, return empty array (no pickup locations exist yet)
    if (error.response?.status === 404) {
      console.log('ℹ️ No pickup locations found (new account)');
      return { data: [] };
    }
    console.error('❌ Get pickup locations error:', error.response?.data || error.message);
    return { data: [] };
  }
}

  // ============================================
  // CREATE PICKUP LOCATION - FIXED
  // ============================================
// ============================================
// CREATE PICKUP LOCATION - FIXED ENDPOINT
// ============================================
// ============================================
// CREATE PICKUP LOCATION - FULLY FIXED
// ============================================
async createPickupLocation(vendorData) {
  try {
    console.log('📍 Creating pickup location for:', vendorData.company || vendorData.name);
    
    const pickupLocation = `vendor-${vendorData._id}`;
    
    // Try to get existing pickup locations (will return empty if none exist)
    let existingLocation = null;
    try {
      const existing = await this.getPickupLocations();
      if (existing && existing.data) {
        existingLocation = existing.data.find(
          loc => loc.pickup_location === pickupLocation
        );
      }
    } catch (e) {
      // If 404, just continue - no pickup locations exist yet
      console.log('ℹ️ No existing pickup locations found, creating new one');
    }

    if (existingLocation) {
      console.log(`✅ Pickup location already exists: ${pickupLocation}`);
      return {
        success: true,
        data: existingLocation,
        message: 'Pickup location already exists'
      };
    }

    // Create new pickup location
    const payload = {
      pickup_location: pickupLocation,
      name: vendorData.company || vendorData.name || 'Vendor',
      email: vendorData.email || 'vendor@example.com',
      phone: vendorData.phone || '9876543210',
      address: vendorData.address || 'Default Address',
      address_2: '',
      city: vendorData.city || 'Mumbai',
      state: vendorData.state || 'Maharashtra',
      country: 'India',
      pincode: vendorData.pincode || '400001'
    };

    const headers = await this.getHeaders();
    
    console.log('📦 Creating pickup location with payload:', JSON.stringify(payload, null, 2));

    // ✅ CORRECT ENDPOINT - NO /add
    const response = await axios.post(
      `${this.baseURL}/settings/pickup`,
      payload,
      { headers }
    );

    console.log(`✅ Pickup location created: ${pickupLocation}`);
    return {
      success: true,
      data: response.data,
      message: 'Pickup location created successfully'
    };
  } catch (error) {
    console.error('❌ Create pickup location error:', error.response?.data || error.message);
    
    // If the error says the location already exists, treat as success
    const errorMsg = error.response?.data?.message || error.message;
    if (errorMsg.toLowerCase().includes('already exists') || 
        errorMsg.toLowerCase().includes('duplicate')) {
      console.log('ℹ️ Pickup location already exists, continuing...');
      return {
        success: true,
        data: { pickup_location: `vendor-${vendorData._id}` },
        message: 'Pickup location already exists'
      };
    }
    
    throw new Error(`Failed to create pickup location: ${errorMsg}`);
  }
}

  // ============================================
  // CREATE ORDER/SHIPMENT
  // ============================================
  async createOrder(orderData) {
    try {
      // Prepare order items
      const orderItems = orderData.items.map(item => ({
        name: item.name,
        sku: item.productId?.toString() || item.sku || 'SKU001',
        units: item.quantity,
        selling_price: item.price,
        discount: item.discount || 0,
        tax: item.tax || 0,
        hsn: item.hsn || ''
      }));

      // Prepare customer info
      const customer = orderData.customer || orderData.shippingAddress;
      
      const payload = {
        order_id: orderData.orderId,
        order_date: new Date().toISOString().split('T')[0],
        
        billing_customer_name: customer.name,
        billing_address: customer.address,
        billing_city: customer.city,
        billing_pincode: customer.pincode,
        billing_state: customer.state,
        billing_country: customer.country || 'India',
        billing_phone: customer.phone,
        billing_email: customer.email || 'customer@example.com',
        
        shipping_customer_name: customer.name,
        shipping_address: customer.address,
        shipping_city: customer.city,
        shipping_pincode: customer.pincode,
        shipping_state: customer.state,
        shipping_country: customer.country || 'India',
        shipping_phone: customer.phone,
        shipping_email: customer.email || 'customer@example.com',
        
        order_items: orderItems,
        payment_method: orderData.paymentMethod || 'COD',
        shipping_charges: orderData.shippingCharges || 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: orderData.discount || 0,
        sub_total: orderData.subtotal || orderData.totalPrice,
        length: orderData.length || 10,
        breadth: orderData.breadth || 10,
        height: orderData.height || 10,
        weight: orderData.weight || 0.5,
        
        pickup_location: orderData.pickupLocation || `vendor-${orderData.vendorId}`,
        
        dimensions_unit: 'cm',
        weight_unit: 'kg'
      };

      const headers = await this.getHeaders();
      console.log('📦 Creating Shiprocket order with ID:', orderData.orderId);
      
      const response = await axios.post(
        `${this.baseURL}/orders/create/adhoc`,
        payload,
        { headers }
      );

      console.log(`✅ Shiprocket order created: ${response.data.order_id}`);
      return {
        success: true,
        data: response.data,
        orderId: response.data.order_id,
        shipmentId: response.data.shipment_id,
        awbCode: response.data.awb_code,
        labelUrl: response.data.label_url
      };
    } catch (error) {
      console.error('❌ Create order error:', error.response?.data || error.message);
      throw new Error(`Failed to create shipment: ${error.response?.data?.message || error.message}`);
    }
  }

  // ============================================
  // CREATE VENDOR SHIPMENT
  // ============================================
  async createVendorShipment(order, vendor, vendorItems, customer) {
    try {
      // 1. Ensure vendor has pickup location
      const pickupResult = await this.createPickupLocation(vendor);
      
      // 2. Calculate vendor totals
      const subtotal = vendorItems.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      );
      
      const totalWeight = vendorItems.reduce(
        (sum, item) => sum + ((item.weight || 0.5) * item.quantity),
        0
      );

      // 3. Prepare order data for this vendor
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
        pickupLocation: `vendor-${vendor._id}`,
        discount: 0,
        shippingCharges: 0
      };

      // 4. Create Shiprocket order
      const result = await this.createOrder(orderData);

      // 5. Return with vendor info
      return {
        success: true,
        vendorId: vendor._id,
        company: vendor.company || vendor.name,
        orderId: orderData.orderId,
        shipmentId: result.shipmentId,
        awbCode: result.awbCode,
        labelUrl: result.labelUrl,
        pickupLocation: pickupResult.data?.pickup_location || `vendor-${vendor._id}`,
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
    const results = [];
    
    for (const [vendorId, items] of Object.entries(vendorItems)) {
      try {
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
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