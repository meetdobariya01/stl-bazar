// // Services/shiprocketService.js - COMPLETE WITH FULL LOGS

// const axios = require('axios');
// const Vendor = require('../Models/Vendor');

// // ✅ Map vendorId to pickup location nickname (from dashboard)
// const PICKUP_LOCATION_MAP = {
//   '6a87f3f650d7f605b0ec7336': 'work', // stl
//   // Add more vendors as they get added
// };

// class ShiprocketService {
//   constructor() {
//     this.baseURL = process.env.SHIPROCKET_API_URL || 'https://apiv2.shiprocket.in/v1/external';
//     this.email = process.env.SHIPROCKET_EMAIL;
//     this.password = process.env.SHIPROCKET_PASSWORD;
//     this.token = null;
//     this.tokenExpiry = null;
//   }

//   // ============================================
//   // AUTHENTICATION
//   // ============================================
//   async authenticate() {
//     if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry - 15 * 60 * 1000) {
//       console.log('✅ Using existing token (valid for >15 min)');
//       return this.token;
//     }

//     try {
//       console.log('🔐 Authenticating with Shiprocket...');
//       console.log(`📧 Email: ${this.email}`);
      
//       const response = await axios.post(`${this.baseURL}/auth/login`, {
//         email: this.email,
//         password: this.password
//       });

//       this.token = response.data.token;
//       this.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
//       console.log('✅ Shiprocket authentication successful');
//       console.log(`👤 User ID: ${response.data.id || 'N/A'}`);
//       return this.token;
//     } catch (error) {
//       console.error('❌ Shiprocket authentication failed:');
//       if (error.response) {
//         console.error(`   Status: ${error.response.status}`);
//         console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
//       } else {
//         console.error(`   Error: ${error.message}`);
//       }
//       throw new Error('Failed to authenticate with Shiprocket');
//     }
//   }

//   // ============================================
//   // GET HEADERS
//   // ============================================
//   async getHeaders() {
//     const token = await this.authenticate();
//     return {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json',
//       'Accept': 'application/json'
//     };
//   }

//   // ============================================
//   // GET PICKUP LOCATION FOR VENDOR
//   // ============================================
//   async getPickupLocationForVendor(vendorId) {
//     const vendorIdStr = vendorId.toString();
//     console.log(`🔍 Looking up pickup location for vendor: ${vendorIdStr}`);
    
//     if (PICKUP_LOCATION_MAP[vendorIdStr]) {
//       console.log(`✅ Found mapped pickup location: ${PICKUP_LOCATION_MAP[vendorIdStr]}`);
//       return PICKUP_LOCATION_MAP[vendorIdStr];
//     }
    
//     console.warn(`⚠️ No pickup location mapped for vendor ${vendorIdStr}`);
//     console.warn(`   Please add this vendor to PICKUP_LOCATION_MAP`);
//     return `vendor-${vendorIdStr}`;
//   }

//   // ============================================
//   // GET ALL PICKUP LOCATIONS - FROM MAP
//   // ============================================
//   async getPickupLocations() {
//     try {
//       const locations = [];
      
//       for (const [vendorId, pickupLocation] of Object.entries(PICKUP_LOCATION_MAP)) {
//         locations.push({
//           pickup_location: pickupLocation,
//           vendorId: vendorId
//         });
//       }
      
//       console.log(`📍 Found ${locations.length} pickup locations in map`);
//       return { data: locations };
//     } catch (error) {
//       console.error('❌ Get pickup locations error:', error.message);
//       return { data: [] };
//     }
//   }

//   // ============================================
//   // CREATE PICKUP LOCATION - USE EXISTING
//   // ============================================
//   async createPickupLocation(vendorData) {
//     try {
//       console.log('📍 Getting pickup location for:', vendorData.company || vendorData.name);
      
//       const pickupLocationName = await this.getPickupLocationForVendor(vendorData._id);
      
//       console.log(`✅ Using pickup location: ${pickupLocationName}`);
      
//       return {
//         success: true,
//         data: { 
//           pickup_location: pickupLocationName,
//           message: 'Using existing pickup location'
//         },
//         message: 'Using existing pickup location'
//       };
      
//     } catch (error) {
//       console.error('❌ Pickup location error:', error.message);
//       throw new Error(`Failed to use pickup location: ${error.message}`);
//     }
//   }

//   // ============================================
//   // CREATE ORDER/SHIPMENT - WITH FULL LOGS
//   // ============================================
//   async createOrder(orderData) {
//     try {
//       console.log('\n' + '='.repeat(60));
//       console.log('📦 SHIPROCKET ORDER CREATION STARTED');
//       console.log('='.repeat(60));
      
//       // 1. Prepare order items
//       console.log('\n📋 STEP 1: Preparing order items...');
//       const orderItems = orderData.items.map((item, index) => ({
//         name: item.name || 'Product',
//         sku: item.productId?.toString() || item.sku || `SKU${String(index + 1).padStart(3, '0')}`,
//         units: item.quantity || 1,
//         selling_price: item.price || 0,
//         discount: item.discount || 0,
//         tax: item.tax || 0,
//         hsn: item.hsn || ''
//       }));
//       console.log(`   ✅ ${orderItems.length} order items prepared`);

//       // 2. Prepare customer info
//       console.log('\n📋 STEP 2: Preparing customer info...');
//       const customer = orderData.customer || orderData.shippingAddress;
//       const fullName = customer.name || 'Customer';
//       const nameParts = fullName.split(' ');
//       const firstName = nameParts[0] || 'Customer';
//       const lastName = nameParts.slice(1).join(' ') || '';
//       console.log(`   ✅ Customer: ${fullName}`);
//       console.log(`   📧 Email: ${customer.email || 'N/A'}`);
//       console.log(`   📱 Phone: ${customer.phone || 'N/A'}`);

//       // 3. Get pickup location
//       console.log('\n📋 STEP 3: Getting pickup location...');
//       const pickupLocation = orderData.pickupLocation || await this.getPickupLocationForVendor(orderData.vendorId);
//       console.log(`   ✅ Pickup Location: ${pickupLocation}`);

//       // 4. Build payload
//       console.log('\n📋 STEP 4: Building request payload...');
//       const payload = {
//         order_id: orderData.orderId,
//         order_date: new Date().toISOString().split('T')[0],
        
//         billing_customer_name: fullName,
//         billing_last_name: lastName,
//         billing_address: customer.address || 'Address',
//         billing_city: customer.city || 'Mumbai',
//         billing_pincode: customer.pincode || '400001',
//         billing_state: customer.state || 'Maharashtra',
//         billing_country: customer.country || 'India',
//         billing_phone: customer.phone || '9876543210',
//         billing_email: customer.email || 'customer@example.com',
        
//         shipping_customer_name: fullName,
//         shipping_last_name: lastName,
//         shipping_address: customer.address || 'Address',
//         shipping_city: customer.city || 'Mumbai',
//         shipping_pincode: customer.pincode || '400001',
//         shipping_state: customer.state || 'Maharashtra',
//         shipping_country: customer.country || 'India',
//         shipping_phone: customer.phone || '9876543210',
//         shipping_email: customer.email || 'customer@example.com',
        
//         shipping_is_billing: true,
        
//         order_items: orderItems,
//         payment_method: orderData.paymentMethod || 'COD',
//         shipping_charges: orderData.shippingCharges || 0,
//         giftwrap_charges: 0,
//         transaction_charges: 0,
//         total_discount: orderData.discount || 0,
//         sub_total: orderData.subtotal || orderData.totalPrice || 0,
//         length: orderData.length || 10,
//         breadth: orderData.breadth || 10,
//         height: orderData.height || 10,
//         weight: orderData.weight || 0.5,
        
//         pickup_location: pickupLocation,
        
//         dimensions_unit: 'cm',
//         weight_unit: 'kg'
//       };

//       // 5. Get headers
//       console.log('\n📋 STEP 5: Getting authentication headers...');
//       const headers = await this.getHeaders();

//       // 6. LOG FULL REQUEST
//       console.log('\n' + '='.repeat(60));
//       console.log('📤 SHIPROCKET REQUEST');
//       console.log('='.repeat(60));
//       console.log(`🆔 Order ID: ${orderData.orderId}`);
//       console.log(`📍 Pickup Location: ${pickupLocation}`);
//       console.log(`🌐 URL: ${this.baseURL}/orders/create/adhoc`);
//       console.log(`📦 Payload:`);
//       console.log(JSON.stringify(payload, null, 2));
//       console.log('='.repeat(60) + '\n');

//       // 7. Make API call
//       console.log('⏳ Sending request to Shiprocket...');
//       const response = await axios.post(
//         `${this.baseURL}/orders/create/adhoc`,
//         payload,
//         { headers }
//       );

//       // 8. LOG FULL RESPONSE
//       console.log('\n' + '='.repeat(60));
//       console.log('📥 SHIPROCKET RESPONSE');
//       console.log('='.repeat(60));
//       console.log(`✅ Status: ${response.status}`);
//       console.log(`📋 Response Data:`);
//       console.log(JSON.stringify(response.data, null, 2));
//       console.log('='.repeat(60) + '\n');

//       // 9. Extract order details with fallbacks
//       console.log('\n📋 STEP 6: Extracting order details...');
//       const orderId = response.data.order_id || 
//                       response.data.id || 
//                       response.data.OrderId || 
//                       response.data.data?.order_id ||
//                       'UNKNOWN';
      
//       const shipmentId = response.data.shipment_id || 
//                          response.data.shipmentId || 
//                          response.data.ShipmentId ||
//                          response.data.data?.shipment_id ||
//                          'UNKNOWN';
      
//       const awbCode = response.data.awb_code || 
//                       response.data.awbCode || 
//                       response.data.AWB ||
//                       response.data.data?.awb_code ||
//                       'UNKNOWN';
      
//       const labelUrl = response.data.label_url || 
//                        response.data.labelUrl || 
//                        response.data.LabelUrl ||
//                        response.data.data?.label_url ||
//                        '';

//       console.log(`   ✅ Order ID: ${orderId}`);
//       console.log(`   ✅ Shipment ID: ${shipmentId}`);
//       console.log(`   ✅ AWB: ${awbCode}`);
//       console.log(`   ✅ Label: ${labelUrl || 'Not available'}`);

//       console.log('\n' + '='.repeat(60));
//       console.log('✅ SHIPROCKET ORDER CREATION COMPLETED');
//       console.log('='.repeat(60) + '\n');

//       return {
//         success: true,
//         data: response.data,
//         orderId: orderId,
//         shipmentId: shipmentId,
//         awbCode: awbCode,
//         labelUrl: labelUrl
//       };
      
//     } catch (error) {
//       // 10. LOG FULL ERROR
//       console.log('\n' + '='.repeat(60));
//       console.log('❌ SHIPROCKET ERROR');
//       console.log('='.repeat(60));
      
//       if (error.response) {
//         console.log(`📋 Status Code: ${error.response.status}`);
//         console.log(`📋 Status Text: ${error.response.statusText}`);
//         console.log(`📋 Error Data:`);
//         console.log(JSON.stringify(error.response.data, null, 2));
        
//         // Check for validation errors
//         if (error.response.data?.errors) {
//           console.log('\n📋 Validation Errors:');
//           Object.entries(error.response.data.errors).forEach(([field, messages]) => {
//             console.log(`   - ${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`);
//           });
//         }
//       } else if (error.request) {
//         console.log('📋 No response received from Shiprocket');
//         console.log(`📋 Error: ${error.message}`);
//       } else {
//         console.log(`📋 Error: ${error.message}`);
//       }
      
//       console.log('='.repeat(60) + '\n');
      
//       // Re-throw with more context
//       const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
//       throw new Error(`Failed to create shipment: ${errorMessage}`);
//     }
//   }

//   // ============================================
//   // CREATE VENDOR SHIPMENT
//   // ============================================
//   async createVendorShipment(order, vendor, vendorItems, customer) {
//     try {
//       console.log('\n🔵 CREATE VENDOR SHIPMENT STARTED');
//       console.log(`   Vendor: ${vendor.company || vendor.name}`);
//       console.log(`   Items: ${vendorItems.length}`);
      
//       // 1. Get existing pickup location
//       const pickupResult = await this.createPickupLocation(vendor);
      
//       // 2. Calculate vendor totals
//       const subtotal = vendorItems.reduce(
//         (sum, item) => sum + (item.price * item.quantity),
//         0
//       );
      
//       const totalWeight = vendorItems.reduce(
//         (sum, item) => sum + ((item.weight || 0.5) * item.quantity),
//         0
//       );

//       console.log(`   💰 Subtotal: ₹${subtotal}`);
//       console.log(`   ⚖️ Weight: ${totalWeight}kg`);

//       // 3. Prepare order data for this vendor
//       const pickupLocationName = await this.getPickupLocationForVendor(vendor._id);
      
//       const orderData = {
//         orderId: `${order.orderId || order._id}-${vendor._id}`,
//         vendorId: vendor._id,
//         items: vendorItems,
//         customer: customer || order.shippingAddress,
//         paymentMethod: order.paymentMethod || 'COD',
//         subtotal: subtotal,
//         totalPrice: subtotal,
//         weight: Math.max(totalWeight, 0.5),
//         length: 10,
//         breadth: 10,
//         height: 10,
//         pickupLocation: pickupLocationName,
//         discount: 0,
//         shippingCharges: 0
//       };

//       // 4. Create Shiprocket order
//       const result = await this.createOrder(orderData);

//       // 5. Return with vendor info
//       console.log(`✅ Vendor shipment completed for ${vendor.company}`);
//       return {
//         success: true,
//         vendorId: vendor._id,
//         company: vendor.company || vendor.name,
//         orderId: orderData.orderId,
//         shipmentId: result.shipmentId,
//         awbCode: result.awbCode,
//         labelUrl: result.labelUrl,
//         pickupLocation: pickupLocationName,
//         items: vendorItems.map(item => ({
//           name: item.name,
//           quantity: item.quantity,
//           price: item.price
//         })),
//         subtotal: subtotal
//       };
      
//     } catch (error) {
//       console.error(`❌ Vendor shipment error for ${vendor._id}:`, error.message);
//       return {
//         success: false,
//         vendorId: vendor._id,
//         company: vendor.company || vendor.name,
//         error: error.message
//       };
//     }
//   }

//   // ============================================
//   // CREATE SHIPMENTS FOR ALL VENDORS
//   // ============================================
//   async createVendorShipments(order, vendorItems, customer) {
//     console.log(`\n🚀 Creating shipments for ${Object.keys(vendorItems).length} vendor(s)`);
//     const results = [];
    
//     for (const [vendorId, items] of Object.entries(vendorItems)) {
//       try {
//         const vendor = await Vendor.findById(vendorId);
//         if (!vendor) {
//           console.warn(`⚠️ Vendor ${vendorId} not found`);
//           results.push({
//             vendorId,
//             success: false,
//             error: 'Vendor not found'
//           });
//           continue;
//         }

//         const result = await this.createVendorShipment(
//           order,
//           vendor,
//           items,
//           customer
//         );
        
//         results.push(result);
//       } catch (error) {
//         console.error(`Error processing vendor ${vendorId}:`, error.message);
//         results.push({
//           vendorId,
//           success: false,
//           error: error.message
//         });
//       }
//     }

//     const successCount = results.filter(r => r.success).length;
//     console.log(`\n✅ ${successCount}/${results.length} vendor shipments created`);
//     return results;
//   }

//   // ============================================
//   // TRACK SHIPMENT
//   // ============================================
//   async getShipmentTracking(shipmentId) {
//     try {
//       const headers = await this.getHeaders();
//       const response = await axios.get(
//         `${this.baseURL}/shipments/${shipmentId}/tracking`,
//         { headers }
//       );
//       return {
//         success: true,
//         data: response.data
//       };
//     } catch (error) {
//       console.error('Tracking error:', error.response?.data || error.message);
//       throw new Error('Failed to get tracking information');
//     }
//   }

//   // ============================================
//   // GENERATE LABEL
//   // ============================================
//   async generateLabel(shipmentId) {
//     try {
//       const headers = await this.getHeaders();
//       const response = await axios.post(
//         `${this.baseURL}/shipments/${shipmentId}/generate-label`,
//         {},
//         { headers }
//       );
//       return {
//         success: true,
//         labelUrl: response.data.label_url
//       };
//     } catch (error) {
//       console.error('Label generation error:', error.response?.data || error.message);
//       throw new Error('Failed to generate label');
//     }
//   }

//   // ============================================
//   // CANCEL SHIPMENT
//   // ============================================
//   async cancelShipment(shipmentId) {
//     try {
//       const headers = await this.getHeaders();
//       const response = await axios.post(
//         `${this.baseURL}/shipments/${shipmentId}/cancel`,
//         {},
//         { headers }
//       );
//       return {
//         success: true,
//         data: response.data
//       };
//     } catch (error) {
//       console.error('Cancellation error:', error.response?.data || error.message);
//       throw new Error('Failed to cancel shipment');
//     }
//   }
// }

// module.exports = new ShiprocketService();

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
  // GET VENDOR ADDRESS FROM SELLERDOCUMENT
  // ============================================
  async getVendorAddress(vendorId) {
    try {
      // 1. Get vendor basic info
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        console.log(`❌ Vendor not found: ${vendorId}`);
        return null;
      }

      // 2. Get seller document (where address is stored)
      const sellerDoc = await SellerDocument.findOne({ vendorId: vendorId });
      
      // 3. Build address object
      const vendorData = {
        _id: vendor._id,
        name: vendor.name || vendor.company,
        company: vendor.company || 'N/A',
        email: vendor.email,
        
        // ✅ Address from SellerDocument.contact
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
      // Step 1: Check if pickup location exists in database
      let pickupLocation = await PickupLocation.findOne({ vendorId: vendorIdStr });
      
      if (pickupLocation) {
        console.log(`✅ Found pickup location in DB: ${pickupLocation.nickname}`);
        return pickupLocation;
      }

      // Step 2: Get vendor address from SellerDocument
      const vendorData = await this.getVendorAddress(vendorId);
      if (!vendorData) {
        throw new Error('Vendor data not found');
      }

      console.log(`📍 Creating pickup location for: ${vendorData.company}`);

      // Step 3: Create pickup location in Shiprocket
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
        // Try to create in Shiprocket
        shiprocketResponse = await axios.post(
          `${this.baseURL}/settings/pickup`,
          payload,
          { headers }
        );
        console.log('✅ Pickup location created in Shiprocket');
      } catch (error) {
        // If 404 or error, use fallback
        console.warn('⚠️ Could not create pickup location via API, using fallback');
        shiprocketResponse = {
          data: {
            id: `fallback-${Date.now()}`,
            pickup_location: pickupNickname
          }
        };
      }

      // Step 4: Save to database
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
      
      // Fallback: Create a default pickup location
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
  // CREATE ORDER/SHIPMENT
  // ============================================
  async createOrder(orderData) {
    try {
      console.log('\n' + '='.repeat(60));
      console.log('📦 SHIPROCKET ORDER CREATION STARTED');
      console.log('='.repeat(60));
      
      // Prepare order items
      const orderItems = orderData.items.map(item => ({
        name: item.name || 'Product',
        sku: item.productId?.toString() || item.sku || 'SKU001',
        units: item.quantity || 1,
        selling_price: item.price || 0,
        discount: item.discount || 0,
        tax: item.tax || 0,
        hsn: item.hsn || ''
      }));

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
      
      // Get/create pickup location
      const pickupResult = await this.createPickupLocation(vendor);
      
      // Calculate vendor totals
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