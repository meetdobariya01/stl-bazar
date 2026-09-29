// // Services/shiprocketService.js - FULLY FIXED
// // + FIXED: .env variable name mismatch (supports both SHIPROCKET_* and SHIPROCKET_API_*)
// // + FIXED: Block detection with clear error message
// // + FIXED: Pickup location all response shapes
// // + FIXED: Auto-retry on wrong pickup location
// // + 🆕 FIXED: Payment method (Prepaid vs COD) — Paid orders now create as Prepaid

// const axios = require('axios');
// const Vendor = require('../Models/Vendor');
// const SellerDocument = require('../Models/SellerDocument');
// const PickupLocation = require('../Models/PickupLocation');

// class ShiprocketService {
//   constructor() {
//     // ✅ Support BOTH variable naming conventions
//     this.baseURL =
//       process.env.SHIPROCKET_API_URL ||
//       process.env.SHIPROCKET_API_BASE ||
//       'https://apiv2.shiprocket.in/v1/external';

//     this.email =
//       process.env.SHIPROCKET_EMAIL ||
//       process.env.SHIPROCKET_API_EMAIL;

//     this.password =
//       process.env.SHIPROCKET_PASSWORD ||
//       process.env.SHIPROCKET_API_PASSWORD;

//     this.token = null;
//     this.tokenExpiry = null;

//     // Block state
//     this.authBlocked = false;
//     this.authBlockedUntil = null;

//     // Cache
//     this.pickupCache = null;
//     this.pickupCacheExpiry = null;

//     // Log resolved config (mask password)
//     console.log('⚙️  Shiprocket config resolved:');
//     console.log(`   📧 Email: ${this.email || '(MISSING!)'}`);
//     console.log(`   🔑 Password: ${this.password ? '***set***' : '(MISSING!)'}`);
//     console.log(`   🌐 Base URL: ${this.baseURL}`);
//   }

//   // ============================================
//   // HELPER: Determine Shiprocket payment method
//   // Shiprocket accepts only "COD" or "Prepaid"
//   // ============================================
//   determinePaymentMethod(orderData) {
//     // If order is paid → Prepaid
//     if (
//       orderData.paymentStatus === 'Paid' ||
//       orderData.isPaid === true
//     ) {
//       return 'Prepaid';
//     }

//     const raw = String(orderData.paymentMethod || '').toLowerCase().trim();

//     // COD explicitly
//     if (raw === 'cod' || raw === 'cash on delivery') {
//       return 'COD';
//     }

//     // Everything else → Prepaid (online, shiprocket, fastrr, payu, upi, card, etc.)
//     if (
//       raw === 'prepaid' ||
//       raw === 'paid' ||
//       raw === 'online' ||
//       raw === 'upi' ||
//       raw === 'card' ||
//       raw === 'payu' ||
//       raw === 'shiprocket' ||
//       raw === 'fastrr' ||
//       raw === ''
//     ) {
//       return 'Prepaid';
//     }

//     // Default fallback
//     return 'COD';
//   }

//   // ============================================
//   // AUTH (with block detection)
//   // ============================================
//   async authenticate() {
//     // Valid cached token?
//     if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry - 15 * 60 * 1000) {
//       return this.token;
//     }

//     // Already blocked? Skip call
//     if (this.authBlocked && Date.now() < this.authBlockedUntil) {
//       const minsLeft = Math.ceil((this.authBlockedUntil - Date.now()) / 60000);
//       throw new Error(
//         `🚨 Shiprocket BLOCKED — reset password at app.shiprocket.in → Settings → API Users. Retry in ${minsLeft} min.`
//       );
//     }

//     // Validate credentials exist
//     if (!this.email || !this.password) {
//       const msg = 'Shiprocket credentials MISSING. Check .env: SHIPROCKET_EMAIL/SHIPROCKET_PASSWORD (or SHIPROCKET_API_EMAIL/SHIPROCKET_API_PASSWORD)';
//       console.error(`❌ ${msg}`);
//       console.error(`   Email loaded: ${this.email || 'undefined'}`);
//       console.error(`   Password loaded: ${this.password ? 'set' : 'undefined'}`);
//       throw new Error(msg);
//     }

//     try {
//       console.log('🔐 Authenticating with Shiprocket...');
//       const response = await axios.post(`${this.baseURL}/auth/login`, {
//         email: this.email,
//         password: this.password,
//       });

//       this.token = response.data.token;
//       this.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
//       this.authBlocked = false;
//       console.log('✅ Shiprocket authentication successful');
//       return this.token;
//     } catch (error) {
//       const errData = error.response?.data;
//       console.error('❌ Auth failed:', errData || error.message);

//       // Detect block
//       if (
//         errData?.message?.toLowerCase().includes('blocked') ||
//         errData?.status_code === 403
//       ) {
//         this.authBlocked = true;
//         this.authBlockedUntil = Date.now() + 10 * 60 * 1000;
//         console.error('\n🚨 ============================================');
//         console.error('🚨 SHIPROCKET ACCOUNT BLOCKED!');
//         console.error('🚨 ============================================');
//         console.error('🔧 FIX:');
//         console.error('   1. https://app.shiprocket.in → Settings → API Users');
//         console.error('   2. support@native91.com → Reset Password');
//         console.error("   3. .env: SHIPROCKET_PASSWORD='new_pwd'");
//         console.error('   4. pm2 restart stl-bazar-backend');
//         console.error('🚨 ============================================\n');

//         throw new Error('Shiprocket account BLOCKED — reset password in Shiprocket dashboard');
//       }

//       throw new Error(`Shiprocket auth failed: ${errData?.message || error.message}`);
//     }
//   }

//   async getHeaders() {
//     const token = await this.authenticate();
//     return {
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     };
//   }

//   // ============================================
//   // HELPER: Unique SKU
//   // ============================================
//   generateUniqueSku(item, index) {
//     const rawProductId = item.productId;
//     let productId = '';
//     if (rawProductId) {
//       productId =
//         typeof rawProductId === 'object'
//           ? String(rawProductId._id || rawProductId)
//           : String(rawProductId);
//     }
//     if (!productId && item.sku) productId = String(item.sku);
//     if (!productId) productId = `SKU${String(index + 1).padStart(3, '0')}`;

//     let variantId = '';
//     const rawVariantId = item.variantId;
//     if (rawVariantId && String(rawVariantId).trim() !== '' && String(rawVariantId) !== 'null') {
//       variantId = String(rawVariantId).trim();
//     }

//     let uniqueSku = variantId ? `${productId}-${variantId}` : productId;
//     if (uniqueSku.length > 50) uniqueSku = uniqueSku.substring(0, 50);
//     return uniqueSku;
//   }

//   // ============================================
//   // SANITIZE ADDRESS
//   // ============================================
//   sanitizeAddress(address) {
//     if (!address) return 'House No. 1, Main Road';

//     let clean = String(address)
//       .replace(/[\r\n]+/g, ', ')
//       .replace(/\s+/g, ' ')
//       .replace(/,+/g, ',')
//       .replace(/^[,\s]+|[,\s]+$/g, '')
//       .trim();

//     if (!/\d/.test(clean)) clean = `House No. 1, ${clean}`;
//     if (clean.length < 10) clean = `House No. 1, Main Road, ${clean}`;
//     if (clean.length > 100) clean = clean.substring(0, 100);

//     return clean;
//   }

//   // ============================================
//   // SANITIZE PHONE
//   // ============================================
//   sanitizePhone(phone) {
//     if (!phone) return '9999999999';
//     let digits = String(phone).replace(/\D/g, '');
//     if (digits.length === 12 && digits.startsWith('91')) digits = digits.substring(2);
//     if (digits.length > 10) digits = digits.substring(0, 10);
//     if (digits.length < 10) digits = digits.padStart(10, '9');
//     return digits;
//   }

//   // ============================================
//   // SANITIZE PINCODE
//   // ============================================
//   sanitizePincode(pincode) {
//     if (!pincode) return '400001';
//     let digits = String(pincode).replace(/\D/g, '');
//     if (digits.length !== 6) digits = '400001';
//     return digits;
//   }

//   // ============================================
//   // VENDOR ADDRESS
//   // ============================================
//   async getVendorAddress(vendorId) {
//     try {
//       const vendor = await Vendor.findById(vendorId);
//       if (!vendor) return null;

//       let doc = await SellerDocument.findOne({ email: vendor.email });
//       if (!doc && vendor.company) {
//         doc = await SellerDocument.findOne({ company: vendor.company });
//       }

//       const vendorData = {
//         _id: vendor._id,
//         name: vendor.name || vendor.company,
//         company: vendor.company || 'N/A',
//         email: vendor.email,
//         phone: doc?.contact?.phone || doc?.phone || vendor.phone || '9876543210',
//         address: doc?.contact?.address || doc?.address || 'Default Address',
//         city: doc?.contact?.city || doc?.city || 'Mumbai',
//         state: doc?.contact?.state || doc?.state || 'Maharashtra',
//         pincode: doc?.contact?.pincode || doc?.pincode || '400001',
//         country: doc?.contact?.country || doc?.country || 'India',
//       };

//       console.log(`✅ Vendor address: ${vendorData.company}`);
//       console.log(`   📍 ${vendorData.address}, ${vendorData.city} - ${vendorData.pincode}`);

//       return vendorData;
//     } catch (error) {
//       console.error('❌ getVendorAddress error:', error.message);
//       return null;
//     }
//   }

//   // ============================================
//   // FETCH PICKUP LOCATIONS (all response shapes)
//   // ============================================
//   async fetchShiprocketPickupLocations() {
//     if (this.pickupCache && Date.now() < this.pickupCacheExpiry) {
//       return this.pickupCache;
//     }

//     try {
//       const headers = await this.getHeaders();
//       const res = await axios.get(`${this.baseURL}/settings/company/pickup`, {
//         headers,
//         timeout: 15000,
//       });

//       const body = res.data || {};
//       let locations = [];

//       if (Array.isArray(body)) locations = body;
//       else if (Array.isArray(body.data)) locations = body.data;
//       else if (body.data && Array.isArray(body.data.shipping_address))
//         locations = body.data.shipping_address;
//       else if (Array.isArray(body.shipping_address))
//         locations = body.shipping_address;
//       else if (body.data && typeof body.data === 'object') {
//         for (const key of Object.keys(body.data)) {
//           if (Array.isArray(body.data[key])) {
//             locations = body.data[key];
//             break;
//           }
//         }
//       }

//       this.pickupCache = locations;
//       this.pickupCacheExpiry = Date.now() + 60 * 60 * 1000;

//       console.log(`📦 Shiprocket has ${locations.length} pickup location(s)`);
//       if (locations.length > 0) {
//         console.log(
//           `   Nicknames: [${locations.map((l) => l.pickup_location || l.nickname).join(', ')}]`
//         );
//       }

//       return locations;
//     } catch (error) {
//       console.error('❌ Fetch pickup locations failed:', error.response?.data || error.message);
//       return [];
//     }
//   }

//   // ============================================
//   // CREATE PICKUP LOCATION
//   // ============================================
//   async createShiprocketPickupLocation(payload) {
//     try {
//       const headers = await this.getHeaders();
//       const res = await axios.post(`${this.baseURL}/settings/company/addpickup`, payload, {
//         headers,
//         timeout: 15000,
//       });
//       console.log('✅ Shiprocket addpickup response:', JSON.stringify(res.data));
//       return { success: true, data: res.data };
//     } catch (error) {
//       console.error('❌ addpickup failed:');
//       console.error(JSON.stringify(error.response?.data || error.message, null, 2));
//       return { success: false, error: error.response?.data || error.message };
//     }
//   }

//   // ============================================
//   // ✅ GET PICKUP LOCATION FOR VENDOR
//   // ============================================
//   async getPickupLocationForVendor(vendorId) {
//     const vendorIdStr = vendorId.toString();
//     const desiredNickname = `vendor-${vendorIdStr}`;

//     console.log(`\n🔍 Pickup Location for vendor: ${vendorIdStr}`);
//     console.log(`📌 Desired nickname: ${desiredNickname}`);

//     // TRY 1: DB cache
//     try {
//       const cachedPickup = await PickupLocation.findOne({
//         vendorId: vendorId,
//         isActive: true,
//         verified: true,
//       });
//       if (cachedPickup && cachedPickup.nickname) {
//         console.log(`✅ Using cached pickup: ${cachedPickup.nickname}`);
//         return cachedPickup.nickname;
//       }
//     } catch (e) { /* ignore */ }

//     try {
//       const shiprocketLocations = await this.fetchShiprocketPickupLocations();
//       const availableNicknames = shiprocketLocations
//         .map((l) => l.pickup_location || l.nickname)
//         .filter(Boolean);

//       console.log(`📋 Shiprocket available: [${availableNicknames.join(', ')}]`);

//       // STEP 1: Already exists?
//       if (availableNicknames.includes(desiredNickname)) {
//         console.log(`✅ Vendor-specific pickup EXISTS: ${desiredNickname}`);
//         const srLoc = shiprocketLocations.find(
//           (l) => (l.pickup_location || l.nickname) === desiredNickname
//         );
//         await this.savePickupToDb(vendorId, desiredNickname, srLoc);
//         return desiredNickname;
//       }

//       // STEP 2: Create
//       console.log(`⚠️ "${desiredNickname}" not in Shiprocket — trying to create`);

//       const vendorData = await this.getVendorAddress(vendorId);
//       if (!vendorData) {
//         console.warn('⚠️ Vendor data not found — using nickname directly');
//         return desiredNickname;
//       }

//       const cleanAddress = this.sanitizeAddress(vendorData.address);
//       const cleanPhone = this.sanitizePhone(vendorData.phone);
//       const cleanPincode = this.sanitizePincode(vendorData.pincode);

//       console.log(`🧹 Sanitized address: "${cleanAddress}"`);
//       console.log(`🧹 Sanitized phone: ${cleanPhone}`);
//       console.log(`🧹 Sanitized pincode: ${cleanPincode}`);

//       const payload = {
//         pickup_location: desiredNickname,
//         name: vendorData.company || vendorData.name || 'Vendor',
//         email: vendorData.email,
//         phone: cleanPhone,
//         address: cleanAddress,
//         address_2: '',
//         city: vendorData.city || 'Mumbai',
//         state: vendorData.state || 'Maharashtra',
//         country: vendorData.country || 'India',
//         pin_code: cleanPincode,
//       };

//       const createResult = await this.createShiprocketPickupLocation(payload);

//       if (createResult.success) {
//         console.log(`✅ Created in Shiprocket: ${desiredNickname}`);
//         this.pickupCache = null;
//         this.pickupCacheExpiry = null;
//         await this.savePickupToDb(vendorId, desiredNickname);
//         return desiredNickname;
//       }

//       // STEP 3: Fallback
//       const fallbackNickname =
//         process.env.SHIPROCKET_DEFAULT_PICKUP || availableNicknames[0];

//       if (fallbackNickname) {
//         console.log(`🔄 Using fallback pickup: ${fallbackNickname}`);
//         await this.savePickupToDb(vendorId, fallbackNickname);
//         return fallbackNickname;
//       }

//       console.log(`⚠️ No fallback — using vendor nickname directly: ${desiredNickname}`);
//       return desiredNickname;
//     } catch (error) {
//       console.error('❌ getPickupLocationForVendor error:', error.message);
//       console.log(`⚠️ Emergency — using vendor nickname directly: ${desiredNickname}`);
//       return desiredNickname;
//     }
//   }

//   // ============================================
//   // HELPER: Save pickup to DB
//   // ============================================
//   async savePickupToDb(vendorId, nickname, shiprocketLoc = null) {
//     try {
//       await PickupLocation.findOneAndUpdate(
//         { vendorId: vendorId },
//         {
//           vendorId: vendorId,
//           nickname: nickname,
//           shiprocketPickupId: shiprocketLoc?.id || shiprocketLoc?.pickup_id || nickname,
//           address: shiprocketLoc?.address || '',
//           city: shiprocketLoc?.city || '',
//           state: shiprocketLoc?.state || '',
//           pincode: shiprocketLoc?.pin_code || shiprocketLoc?.pincode || '',
//           country: shiprocketLoc?.country || 'India',
//           phone: shiprocketLoc?.phone || '',
//           email: shiprocketLoc?.email || '',
//           isActive: true,
//           verified: !!shiprocketLoc,
//           fallback: false,
//         },
//         { upsert: true, new: true }
//       );
//     } catch (e) {
//       console.error('savePickupToDb error:', e.message);
//     }
//   }

//   // ============================================
//   // WRAPPER
//   // ============================================
//   async createPickupLocation(vendorData) {
//     try {
//       const nickname = await this.getPickupLocationForVendor(vendorData._id);
//       console.log(`✅ Using pickup location: ${nickname}`);
//       return {
//         success: true,
//         data: { pickup_location: nickname, message: 'Pickup location ready' },
//         message: 'Pickup location ready',
//       };
//     } catch (error) {
//       console.error('❌ createPickupLocation error:', error.message);
//       throw new Error(`Failed to get pickup location: ${error.message}`);
//     }
//   }

//   // ============================================
//   // ✅ CREATE ORDER (with AUTO-RETRY on wrong pickup)
//   // ============================================
//   async createOrder(orderData) {
//     return this._createOrderWithPickup(orderData, null);
//   }

//   async _createOrderWithPickup(orderData, overridePickup) {
//     try {
//       console.log('\n' + '='.repeat(60));
//       console.log('📦 SHIPROCKET ORDER CREATION');
//       console.log(`📌 Vendor: ${orderData.vendorId}`);
//       console.log('='.repeat(60));

//       const orderItems = orderData.items.map((item, index) => {
//         const uniqueSku = this.generateUniqueSku(item, index);
//         return {
//           name: item.name || 'Product',
//           sku: uniqueSku,
//           units: item.quantity || 1,
//           selling_price: parseFloat(item.price) || 0,
//           discount: parseFloat(item.discountAmount || item.discount) || 0,
//           tax: parseFloat(item.tax) || 0,
//           hsn: item.hsn || '',
//         };
//       });

//       const skus = orderItems.map((i) => i.sku);
//       const duplicateSkus = skus.filter((sku, idx) => skus.indexOf(sku) !== idx);

//       console.log('\n📋 Order Items SKUs:');
//       orderItems.forEach((item, idx) => {
//         console.log(`   [${idx + 1}] ${item.name} → SKU: ${item.sku} (₹${item.selling_price})`);
//       });

//       if (duplicateSkus.length > 0) {
//         console.error('❌ DUPLICATE SKUs:', duplicateSkus);
//       } else {
//         console.log(`✅ All ${skus.length} SKUs are UNIQUE`);
//       }

//       const customer = orderData.customer || orderData.shippingAddress;
//       const fullName = customer.name || 'Customer';
//       const nameParts = fullName.split(' ');
//       const lastName = nameParts.slice(1).join(' ') || '';

//       const pickupLocation =
//         overridePickup || (await this.getPickupLocationForVendor(orderData.vendorId));

//       console.log(`📍 Using pickup location: ${pickupLocation}`);

//       // 🆕 FIXED: Determine correct payment method
//       const shiprocketPaymentMethod = this.determinePaymentMethod(orderData);
//       console.log(
//         `💳 Payment method → Shiprocket: "${shiprocketPaymentMethod}" (input: "${orderData.paymentMethod}", status: "${orderData.paymentStatus}")`
//       );

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
//         payment_method: shiprocketPaymentMethod,   // 🆕 FIXED
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
//         weight_unit: 'kg',
//       };

//       const headers = await this.getHeaders();

//       console.log('📤 REQUEST');
//       console.log(`🆔 Order ID: ${orderData.orderId}`);
//       console.log(`📍 Pickup: ${pickupLocation}`);
//       console.log(`💳 Payment: ${shiprocketPaymentMethod}`);

//       const response = await axios.post(
//         `${this.baseURL}/orders/create/adhoc`,
//         payload,
//         { headers, timeout: 20000 }
//       );

//       // Detect wrong pickup even on 200
//       if (
//         response.data?.message &&
//         response.data.message.includes('Wrong Pickup location')
//       ) {
//         const err = new Error('WRONG_PICKUP_LOCATION');
//         err.shiprocketResponse = response.data;
//         throw err;
//       }

//       console.log('📥 RESPONSE:');
//       console.log(JSON.stringify(response.data, null, 2));
//       console.log('='.repeat(60) + '\n');

//       return {
//         success: true,
//         data: response.data,
//         orderId: response.data.order_id || response.data.id || 'UNKNOWN',
//         shipmentId: response.data.shipment_id || 'UNKNOWN',
//         awbCode: response.data.awb_code || 'UNKNOWN',
//         labelUrl: response.data.label_url || '',
//       };
//     } catch (error) {
//       // AUTO-RETRY on wrong pickup
//       if (
//         error.message === 'WRONG_PICKUP_LOCATION' ||
//         error.response?.data?.message?.includes('Wrong Pickup location')
//       ) {
//         console.warn('⚠️ Wrong pickup location — retrying with fallback');

//         const fallback = process.env.SHIPROCKET_DEFAULT_PICKUP || 'work';

//         if (overridePickup === fallback) {
//           console.error('❌ Fallback pickup also failed!');
//           console.error(
//             JSON.stringify(error.shiprocketResponse || error.response?.data, null, 2)
//           );
//           throw new Error('Fallback pickup failed — check Shiprocket dashboard');
//         }

//         console.log(`🔄 Retrying with fallback: ${fallback}`);
//         return this._createOrderWithPickup(orderData, fallback);
//       }

//       console.log('\n❌ SHIPROCKET ERROR');
//       if (error.response) {
//         console.log(`Status: ${error.response.status}`);
//         console.log(JSON.stringify(error.response.data, null, 2));
//       } else {
//         console.log(error.message);
//       }
//       console.log('='.repeat(60) + '\n');
//       throw error;
//     }
//   }

//   // ============================================
//   // CREATE VENDOR SHIPMENT
//   // ============================================
//   async createVendorShipment(order, vendor, vendorItems, customer) {
//     try {
//       console.log(`\n🔵 VENDOR SHIPMENT: ${vendor.company || vendor.name} (${vendor._id})`);

//       const subtotal = vendorItems.reduce(
//         (sum, item) => sum + item.price * item.quantity,
//         0
//       );

//       const totalWeight = vendorItems.reduce(
//         (sum, item) => sum + (item.weight || 0.5) * item.quantity,
//         0
//       );

//       // 🆕 FIXED: Pass paymentStatus + proper paymentMethod
//       const orderData = {
//         orderId: `${order.orderId || order._id}-${vendor._id}`,
//         vendorId: vendor._id,
//         items: vendorItems,
//         customer: customer || order.shippingAddress,
//         paymentMethod: order.paymentMethod || 'COD',
//         paymentStatus: order.paymentStatus || 'Pending',   // 🆕 pass along
//         isPaid: order.paymentStatus === 'Paid',            // 🆕 convenience flag
//         subtotal: subtotal,
//         totalPrice: subtotal,
//         weight: Math.max(totalWeight, 0.5),
//         length: 10,
//         breadth: 10,
//         height: 10,
//         discount: 0,
//         shippingCharges: 0,
//       };

//       console.log(
//         `💳 Order payment info → method: "${orderData.paymentMethod}", status: "${orderData.paymentStatus}"`
//       );

//       const result = await this.createOrder(orderData);

//       return {
//         success: true,
//         vendorId: vendor._id,
//         company: vendor.company || vendor.name,
//         orderId: orderData.orderId,
//         shipmentId: result.shipmentId,
//         awbCode: result.awbCode,
//         labelUrl: result.labelUrl,
//         items: vendorItems.map((item) => ({
//           name: item.name,
//           quantity: item.quantity,
//           price: item.price,
//         })),
//         subtotal: subtotal,
//       };
//     } catch (error) {
//       console.error(`❌ Vendor shipment error (${vendor._id}):`, error.message);
//       return {
//         success: false,
//         vendorId: vendor._id,
//         company: vendor.company || vendor.name,
//         error: error.message,
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
//           results.push({ vendorId, success: false, error: 'Vendor not found' });
//           continue;
//         }

//         const result = await this.createVendorShipment(order, vendor, items, customer);
//         results.push(result);
//       } catch (error) {
//         console.error(`Error processing vendor ${vendorId}:`, error.message);
//         results.push({ vendorId, success: false, error: error.message });
//       }
//     }

//     const successCount = results.filter((r) => r.success).length;
//     console.log(`\n✅ ${successCount}/${results.length} vendor shipments created`);
//     return results;
//   }

//   // ============================================
//   // TRACK / LABEL / CANCEL
//   // ============================================
//   async getShipmentTracking(shipmentId) {
//     try {
//       const headers = await this.getHeaders();
//       const response = await axios.get(
//         `${this.baseURL}/shipments/${shipmentId}/tracking`,
//         { headers }
//       );
//       return { success: true, data: response.data };
//     } catch (error) {
//       console.error('Tracking error:', error.response?.data || error.message);
//       throw new Error('Failed to get tracking information');
//     }
//   }

//   async generateLabel(shipmentId) {
//     try {
//       const headers = await this.getHeaders();
//       const response = await axios.post(
//         `${this.baseURL}/shipments/${shipmentId}/generate-label`,
//         {},
//         { headers }
//       );
//       return { success: true, labelUrl: response.data.label_url };
//     } catch (error) {
//       console.error('Label error:', error.response?.data || error.message);
//       throw new Error('Failed to generate label');
//     }
//   }

//   async cancelShipment(shipmentId) {
//     try {
//       const headers = await this.getHeaders();
//       const response = await axios.post(
//         `${this.baseURL}/shipments/${shipmentId}/cancel`,
//         {},
//         { headers }
//       );
//       return { success: true, data: response.data };
//     } catch (error) {
//       console.error('Cancel error:', error.response?.data || error.message);
//       throw new Error('Failed to cancel shipment');
//     }
//   }
// }

// module.exports = new ShiprocketService();


// Router/orderRouter.js - COMPLETE WITH FASTrr CHECKOUT + ORDER VISIBILITY FIX + COD DETECTION
// ✅ FIX: COD orders always visible, Fastrr/Shiprocket orders visible only after payment
// ✅ FIX: Pending Fastrr orders hidden from order list
// ✅ FIX: Cancelled orders hidden from order list
// ✅ FIX: COD detection in webhook (payment_type + is_cod)
// ✅ FIX: Proper paymentMethod set for COD vs Prepaid
// STRICT MATCHING — no random fallback (fixes iframe close for new products)
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const crypto = require("crypto");
const Order = require("../Models/Order");
const Cart = require("../Models/Cart");
const Vendor = require("../Models/Vendor");
const SellerDocument = require("../Models/SellerDocument");
const Product = require("../Models/Product");
const Coupon = require("../Models/Coupon");
const axios = require("axios");
const {
  sendEmail,
  getCustomerOrderEmail,
  getAdminOrderEmail,
  getVendorOrderEmail,
  emailMode,
} = require("../Comfig/emailConfig");

const shiprocketService = require("../utils/shiprocketService");

const VENDOR_API_URL =
  process.env.VENDOR_API_URL ||
  "https://api.brandelvendor.starlighttechlabsindia.com/api";

// ============================================
// HELPER: Order visibility filter
// ============================================
/**
 * Returns a MongoDB filter to only show orders that should be visible
 * to customers in their order list:
 *
 *  1. COD orders → always visible (regardless of payment status)
 *  2. Paid orders → visible (any payment method)
 *  3. Pending Shiprocket/Fastrr orders → HIDDEN
 *  4. Cancelled orders → HIDDEN
 */
const getVisibleOrdersFilter = (extraFilter = {}) => {
  return {
    ...extraFilter,
    orderStatus: { $nin: ["Cancelled"] },
    $or: [
      // ✅ COD orders always visible (all variants)
      {
        paymentMethod: {
          $in: [
            "COD",
            "cod",
            "Cod",
            "Cash on Delivery",
            "cash on delivery",
            "cash_on_delivery",
          ],
        },
      },
      // ✅ OR payment is completed
      { paymentStatus: "Paid" },
    ],
  };
};

// ============================================
// PAYU HELPER FUNCTIONS
// ============================================
const generatePayUHash = (data) => {
  const { key, txnid, amount, productinfo, firstname, email, salt } = data;
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
  console.log("🔑 PayU Hash String:", hashString);
  return crypto.createHash("sha512").update(hashString).digest("hex");
};

const verifyPayUHash = (data) => {
  const { key, salt, status, txnid, amount, productinfo, firstname, email, hash, additionalCharges } = data;

  let hashString;
  if (additionalCharges) {
    hashString = `${additionalCharges}|${salt}|${status}||||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  } else {
    hashString = `${salt}|${status}||||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  }

  const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");
  console.log("🔐 Reverse Hash Calculated:", calculatedHash);
  console.log("🔐 Reverse Hash Received  :", hash);
  return calculatedHash === hash;
};

// ============================================
// HELPER: Get complete vendor data
// ============================================
async function getCompleteVendorData(vendorId) {
  try {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return null;

    const sellerDoc = await SellerDocument.findOne({ vendorId: vendorId });

    return {
      _id: vendor._id,
      name: vendor.name || vendor.company,
      company: vendor.company || "N/A",
      email: vendor.email,
      phone: vendor.phone || sellerDoc?.contact?.phone || "9876543210",
      address: sellerDoc?.contact?.address || "Default Address",
      city: sellerDoc?.contact?.city || "Mumbai",
      state: sellerDoc?.contact?.state || "Maharashtra",
      pincode: sellerDoc?.contact?.pincode || "400001",
      country: sellerDoc?.contact?.country || "India",
    };
  } catch (error) {
    console.error("Error fetching vendor data:", error.message);
    return null;
  }
}

// ============================================
// HELPER: Normalize string for matching
// ============================================
const normalizeString = (s) =>
  (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");

// ============================================
// PLACE ORDER (Standard COD/PayU)
// ============================================
router.post("/place", async (req, res) => {
  const { guestId, shippingAddress, paymentMethod, couponCode } = req.body;

  if (!guestId || !shippingAddress) {
    return res.status(400).json({ success: false, message: "Incomplete data" });
  }

  try {
    const cart = await Cart.findOne({ guestId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const itemsWithVendorInfo = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.productId).populate({
          path: "vendorId",
          select: "company name email _id",
        });

        let company = null;
        let vendorId = null;

        if (product?.vendorId) {
          if (product.vendorId._id) vendorId = product.vendorId._id;
          else vendorId = product.vendorId;
        }
        if (!vendorId && product?.vendor) vendorId = product.vendor;
        if (!vendorId && item.company) {
          const vendorByCompany = await Vendor.findOne({
            company: { $regex: new RegExp(`^${item.company}$`, "i") },
          });
          if (vendorByCompany) vendorId = vendorByCompany._id;
        }

        if (product && product.company) company = product.company;
        else if (product && product.vendorId && product.vendorId.company)
          company = product.vendorId.company;
        else if (product && product.vendor) {
          const vendorDoc = await Vendor.findById(product.vendor);
          if (vendorDoc && vendorDoc.company) company = vendorDoc.company;
        }
        if (!company && vendorId) {
          const vendor = await Vendor.findById(vendorId);
          if (vendor && vendor.company) company = vendor.company;
        }
        if (!company && item.company) company = item.company;

        const variantImage = item.variantImage || null;
        const variantPrice = item.variantPrice || 0;
        const customFieldLabel = item.customFieldLabel || null;
        const customFieldValue = item.customFieldValue || null;

        return {
          productId: item.productId,
          name: item.name || product?.name || "Unknown Product",
          price: item.price || product?.price || 0,
          quantity: item.quantity || 1,
          stock: product?.stock || 0,
          image: variantImage
            ? variantImage
            : Array.isArray(item.image)
            ? item.image[0]
            : item.image || product?.image?.[0] || null,
          vendorId: vendorId,
          company: company || "N/A",
          weight: product?.weight || 0.5,
          variantId: item.variantId || null,
          selectedColor: item.selectedColor || "",
          selectedSize: item.selectedSize || "",
          variantImage: item.variantImage || "",
          variantPrice: variantPrice,
          customFieldLabel: customFieldLabel,
          customFieldValue: customFieldValue,
        };
      })
    );

    // Stock validation
    for (const item of itemsWithVendorInfo) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }

      if (item.variantId && product.variants && product.variants.length > 0) {
        const variant = product.variants.id(item.variantId);
        if (!variant) {
          return res.status(400).json({ success: false, message: `Variant not found for ${product.name}` });
        }
        if (variant.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${variant.stock}`,
          });
        }
      } else {
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          });
        }
      }
    }

    let subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let totalPrice = subtotal;
    let couponData = {
      code: null,
      discountType: null,
      discountValue: 0,
      discountAmount: 0,
      couponId: null,
    };

    if (couponCode) {
      try {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

        if (coupon) {
          const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
          const usageLimitReached = coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit;
          const minOrderNotMet = coupon.minOrderAmount && subtotal < coupon.minOrderAmount;

          if (!isExpired && !usageLimitReached && !minOrderNotMet) {
            let discountAmount = 0;

            if (coupon.discountType === "percentage") {
              discountAmount = (subtotal * coupon.discountValue) / 100;
              if (coupon.maxDiscountAmount) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
              }
            } else {
              discountAmount = Math.min(coupon.discountValue, subtotal);
            }

            totalPrice = subtotal - discountAmount;

            couponData = {
              code: coupon.code,
              discountType: coupon.discountType,
              discountValue: coupon.discountValue,
              discountAmount: Number(discountAmount.toFixed(2)),
              couponId: coupon._id,
            };

            coupon.usageCount = (coupon.usageCount || 0) + 1;
            await coupon.save();
          }
        }
      } catch (couponError) {
        console.error("Coupon validation error:", couponError);
      }
    }

    const isOnlinePayment =
      paymentMethod === "PayU" || paymentMethod === "Online" ||
      paymentMethod === "upi" || paymentMethod === "card";

    const order = new Order({
      guestId,
      items: itemsWithVendorInfo.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        stockAtPurchase: item.stock,
        image: item.image ? [item.image] : [],
        vendorId: item.vendorId,
        company: item.company,
        weight: item.weight || 0.5,
        variantId: item.variantId || null,
        selectedColor: item.selectedColor || "",
        selectedSize: item.selectedSize || "",
        variantImage: item.variantImage || "",
        variantPrice: item.variantPrice || 0,
        customFieldLabel: item.customFieldLabel || null,
        customFieldValue: item.customFieldValue || null,
      })),
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: "Pending",
      subtotal: subtotal,
      totalPrice: totalPrice,
      coupon: couponData,
      orderStatus: "Pending",
    });

    await order.save();

    for (const item of itemsWithVendorInfo) {
      if (item.variantId) {
        await Product.updateOne(
          { _id: item.productId, "variants._id": item.variantId },
          { $inc: { "variants.$.stock": -item.quantity } }
        );
      } else {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
      }
    }

    await Cart.findOneAndDelete({ guestId });

    const orderId = order._id;

    // SHIPROCKET INTEGRATION
    let shipmentResults = [];
    let shiprocketSyncStatus = "pending";

    try {
      if (process.env.SHIPROCKET_ENABLED === "true") {
        const vendorItemsMap = {};

        for (const item of itemsWithVendorInfo) {
          if (item.vendorId) {
            const vendorId = item.vendorId.toString();
            if (!vendorItemsMap[vendorId]) vendorItemsMap[vendorId] = [];
            vendorItemsMap[vendorId].push({ ...item, weight: item.weight || 0.5 });
          }
        }

        const vendorIds = Object.keys(vendorItemsMap);

        if (vendorIds.length > 0) {
          for (const vendorId of vendorIds) {
            try {
              const vendorData = await getCompleteVendorData(vendorId);
              if (!vendorData) {
                shipmentResults.push({ vendorId, success: false, error: "Vendor not found" });
                continue;
              }

              const vendorItems = vendorItemsMap[vendorId];
              const result = await shiprocketService.createVendorShipment(
                order, vendorData, vendorItems, shippingAddress
              );
              shipmentResults.push(result);
            } catch (vendorError) {
              shipmentResults.push({ vendorId, success: false, error: vendorError.message });
            }
          }

          const successfulShipments = shipmentResults.filter((r) => r.success);
          order.shipments = successfulShipments.map((r) => ({
            vendorId: r.vendorId,
            company: r.company,
            shipmentId: r.shipmentId,
            orderId: r.orderId,
            awbCode: r.awbCode,
            labelUrl: r.labelUrl,
            status: "created",
            createdAt: new Date(),
          }));

          if (successfulShipments.length === shipmentResults.length) {
            shiprocketSyncStatus = "synced";
          } else if (successfulShipments.length > 0) {
            shiprocketSyncStatus = "partial";
          } else {
            shiprocketSyncStatus = "failed";
          }

          order.shiprocketSyncStatus = shiprocketSyncStatus;
          await order.save();
        } else {
          order.shiprocketSyncStatus = "skipped";
          await order.save();
        }
      } else {
        order.shiprocketSyncStatus = "disabled";
        await order.save();
      }
    } catch (shiprocketError) {
      order.shiprocketSyncStatus = "failed";
      order.shiprocketError = shiprocketError.message;
      await order.save();
    }

    // EMAILS
    const emailResults = { customer: false, admin: false, vendors: [] };

    const customerEmail = shippingAddress.email;
    if (customerEmail && !isOnlinePayment) {
      try {
        const customerHtml = getCustomerOrderEmail(order, orderId);
        const result = await sendEmail(customerEmail, `Order Confirmed! - Order #${orderId}`, customerHtml);
        emailResults.customer = result.success;
      } catch (error) {
        console.error("Error sending customer email:", error.message);
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL || "orders@native91.com";
    if (adminEmail) {
      try {
        const adminHtml = getAdminOrderEmail(order, orderId);
        const result = await sendEmail(adminEmail, `New Order Received - Order #${orderId}`, adminHtml);
        emailResults.admin = result.success;
      } catch (error) {
        console.error("Error sending admin email:", error.message);
      }
    }

    const vendorGroups = new Map();
    for (const item of itemsWithVendorInfo) {
      if (item.company && item.company !== "N/A") {
        const company = item.company;
        if (!vendorGroups.has(company)) {
          vendorGroups.set(company, { company, items: [], vendorId: item.vendorId });
        }
        vendorGroups.get(company).items.push(item);
      }
    }

    for (const [company, vendorData] of vendorGroups) {
      try {
        let vendor = await Vendor.findOne({ company }).select("email name company phone");
        if (!vendor) {
          vendor = await Vendor.findOne({
            company: { $regex: new RegExp(`^${company}$`, "i") },
          }).select("email name company phone");
        }

        if (vendor && vendor.email) {
          const vendorHtml = getVendorOrderEmail(order, orderId, vendorData.items, {
            name: vendor.name || company,
            email: vendor.email,
            shopName: company,
            phone: vendor?.phone || "N/A",
          });

          const result = await sendEmail(
            vendor.email,
            `New Order Received for ${company} - Order #${orderId}`,
            vendorHtml
          );
          emailResults.vendors.push({ company, email: vendor.email, success: result.success });
        }
      } catch (vendorErr) {
        console.error(`Error sending email to vendor ${company}:`, vendorErr.message);
      }
    }

    // VENDOR NOTIFICATIONS
    const notificationResults = [];
    for (const [company, vendorData] of vendorGroups) {
      try {
        const vendorItems = vendorData.items;
        const vendorTotal = vendorItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

        const notificationData = {
          company,
          title: "🛒 New Order Received!",
          message: `You have received a new order #${orderId.toString().slice(-6)}.\n\nTotal Amount: ₹${vendorTotal}\nItems: ${vendorItems.length} product(s)\nCustomer: ${shippingAddress?.name || "Customer"}\nPhone: ${shippingAddress?.phone || "N/A"}\nOrder Date: ${new Date().toLocaleString()}\n\nPlease check and process the order.`,
          read: false,
          orderId: orderId,
        };

        await axios.post(`${VENDOR_API_URL}/notifications/create`, notificationData, {
          headers: { "Content-Type": "application/json" },
          timeout: 5000,
        });
        notificationResults.push({ company, success: true });
      } catch (vendorError) {
        notificationResults.push({ company, success: false, error: vendorError.message });
      }
    }

    // PAYU PARAMS
    let payuParams = null;
    if (isOnlinePayment) {
      const txnid = `TXN_${Date.now()}_${order._id}`;
      order.payuTxnId = txnid;
      await order.save();

      const cleanAmount = Number(order.totalPrice).toFixed(2);

      const hashData = {
        key: process.env.PAYU_KEY,
        txnid: txnid,
        amount: cleanAmount,
        productinfo: "Order Payment",
        firstname: shippingAddress.name,
        email: shippingAddress.email,
        salt: process.env.PAYU_SALT,
      };

      const hash = generatePayUHash(hashData);

      payuParams = {
        key: process.env.PAYU_KEY,
        txnid: txnid,
        amount: cleanAmount,
        productinfo: "Order Payment",
        firstname: shippingAddress.name,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        surl: `${process.env.BACKEND_URL}/api/order/payu/success`,
        furl: `${process.env.BACKEND_URL}/api/order/payu/failure`,
        hash: hash,
        service_provider: "payu_paisa",
      };
    }

    res.json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
      order: {
        _id: order._id,
        subtotal: order.subtotal,
        totalPrice: order.totalPrice,
        coupon: order.coupon,
        discountApplied: order.coupon.discountAmount > 0,
      },
      payuParams: payuParams,
      shipments: shipmentResults,
      shiprocketSyncStatus: shiprocketSyncStatus,
      emailResults: emailResults,
      notificationResults: notificationResults,
      vendorCount: vendorGroups.size,
      emailMode: emailMode,
    });
  } catch (err) {
    console.error("Order placement error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
    });
  }
});

// ============================================
// PAYU SUCCESS CALLBACK
// ============================================
router.post("/payu/success", async (req, res) => {
  try {
    const responseData = req.body;

    const isValid = verifyPayUHash({
      ...responseData,
      salt: process.env.PAYU_SALT,
      key: process.env.PAYU_KEY,
    });

    if (!isValid) {
      console.error("❌ PayU Hash verification failed");
      return res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=failed`);
    }

    const orderId = responseData.txnid.split("_")[2];

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: "Paid",
        payuPaymentId: responseData.mihpayid,
        orderStatus: "Processing",
      },
      { new: true }
    );

    if (!order) {
      return res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=error`);
    }

    try {
      const customerEmail = order.shippingAddress.email;
      if (customerEmail) {
        const customerHtml = getCustomerOrderEmail(order, orderId);
        await sendEmail(customerEmail, `Order Confirmed! - Order #${orderId}`, customerHtml);
      }
    } catch (emailErr) {
      console.error("Error sending post-payment email:", emailErr);
    }

    res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=success&orderId=${orderId}`);
  } catch (error) {
    console.error("PayU Success Error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=error`);
  }
});

// ============================================
// PAYU FAILURE CALLBACK
// ============================================
router.post("/payu/failure", async (req, res) => {
  try {
    const responseData = req.body;
    const orderId = responseData.txnid ? responseData.txnid.split("_")[2] : null;

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "Failed",
        orderStatus: "Cancelled",
      });
    }

    res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=failed`);
  } catch (error) {
    console.error("PayU Failure Error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=error`);
  }
});

// ============================================
// FASTrr STATUS CHECK — Is product in Fastrr catalog?
// GET /api/order/fastrr-status/:productId
// ============================================
router.get("/fastrr-status/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.json({ synced: false, reason: "product_not_found" });

    const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";
    const apiRes = await axios.get(`${BASE_URL}/api/v2/products?limit=500`, {
      timeout: 10000,
    });
    const apiProducts = apiRes.data?.data?.products || [];

    const productName = (product.name || "").trim();
    const normalizedDbName = normalizeString(productName);

    const matched = apiProducts.find(
      (p) => normalizeString(p.title) === normalizedDbName
    );

    res.json({
      synced: !!matched,
      productName,
      matchedTitle: matched?.title || null,
    });
  } catch (err) {
    console.error("Fastrr status check error:", err.message);
    res.json({ synced: false, reason: "api_error", error: err.message });
  }
});

// ============================================
// CHECK FASTRR COMPATIBILITY (Pre-check before checkout)
// POST /api/order/check-fastrr-compatibility
// ============================================
router.post("/check-fastrr-compatibility", async (req, res) => {
  try {
    const { cartItems } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        compatible: false,
        reason: "Cart is empty",
      });
    }

    const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";

    let apiProducts = [];
    try {
      const apiRes = await axios.get(
        `${BASE_URL}/api/v2/products?page=1&limit=500`,
        { timeout: 10000 }
      );
      apiProducts = apiRes.data?.data?.products || [];
      console.log(`📦 [Compat Check] Fetched ${apiProducts.length} Fastrr products`);
    } catch (apiErr) {
      console.error("❌ [Compat Check] Fastrr catalog fetch failed:", apiErr.message);
      return res.status(500).json({
        compatible: false,
        reason: "Fastrr catalog service is currently unavailable. Please use standard checkout.",
      });
    }

    for (const item of cartItems) {
      let productName = (item.name || "").trim();

      if (item.productId) {
        try {
          const product = await Product.findById(item.productId);
          if (product) {
            productName = (product.name || product.ProductName || productName).trim();
          }
        } catch (dbErr) {
          console.warn(`[Compat Check] Product lookup failed for ${item.productId}:`, dbErr.message);
        }
      }

      if (!productName) {
        return res.json({
          compatible: false,
          reason: "Product name missing for compatibility check.",
          productId: item.productId,
        });
      }

      const lowerName = productName.toLowerCase();
      const normalizedName = normalizeString(productName);

      let matched = apiProducts.find(
        (p) => (p.title || "").trim().toLowerCase() === lowerName
      );

      if (!matched) {
        matched = apiProducts.find(
          (p) => normalizeString(p.title) === normalizedName
        );
      }

      if (!matched) {
        console.warn(`⚠️ [Compat Check] "${productName}" NOT in Fastrr catalog`);
        return res.json({
          compatible: false,
          reason: `"${productName}" is not yet available for Fastrr checkout.`,
          productName,
          productId: item.productId,
        });
      }

      console.log(`✅ [Compat Check] Matched: "${matched.title}"`);
    }

    return res.json({ compatible: true });
  } catch (error) {
    console.error("Fastrr compatibility check error:", error.message);
    return res.status(500).json({
      compatible: false,
      reason: "Compatibility check failed. Please use standard checkout.",
      error: error.message,
    });
  }
});

// ============================================
// FASTrr CHECKOUT — CREATE ORDER + ACCESS TOKEN
// ✅ FIX: Token mangvama aave PEHLA, pachi order DB ma save thay
// STRICT MATCHING — no random fallback
// POST /api/order/shiprocket-checkout
// ============================================
router.post("/shiprocket-checkout", async (req, res) => {
  try {
    const { guestId, shippingAddress, cartItems, couponCode, subtotal, total } = req.body;

    if (!guestId || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid cart" });
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.email) {
      return res.status(400).json({ success: false, message: "Shipping address required" });
    }

    const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";

    // Fetch Fastrr catalog
    let apiProducts = [];
    try {
      const apiRes = await axios.get(
        `${BASE_URL}/api/v2/products?page=1&limit=500`,
        { timeout: 10000 }
      );
      apiProducts = apiRes.data?.data?.products || [];
      console.log(`📦 Fetched ${apiProducts.length} products from /api/v2/products`);
    } catch (apiErr) {
      console.error("❌ Failed to fetch /api/v2/products:", apiErr.message);
      return res.status(500).json({
        success: false,
        code: "FASTRR_CATALOG_UNAVAILABLE",
        message: "Fastrr catalog temporarily unavailable. Please use standard checkout.",
      });
    }

    const itemsWithVendorInfo = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.productId).populate({
        path: "vendorId",
        select: "company name email _id",
      });

      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }

      let effectiveStock = product.stock || 0;
      let variantIdx = 0;
      let variantDoc = null;

      if (item.variantId && product.variants && product.variants.length > 0) {
        variantDoc = product.variants.id(item.variantId);
        if (!variantDoc) {
          return res.status(400).json({ success: false, message: `Variant not found for ${product.name}` });
        }
        effectiveStock = variantDoc.stock || 0;
        variantIdx = product.variants.findIndex(
          (v) => v._id && v._id.toString() === item.variantId.toString()
        );
        if (variantIdx < 0) variantIdx = 0;
      }

      if (effectiveStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${effectiveStock}`,
        });
      }

      let vendorId = null;
      if (product.vendorId && product.vendorId._id) vendorId = product.vendorId._id;
      else if (product.vendorId) vendorId = product.vendorId;
      else if (product.vendor) vendorId = product.vendor;

      const productName = (product.name || product.ProductName || "").trim();

      console.log(`🔍 Looking for product in Fastrr catalog: "${productName}"`);

      let matchedApiProduct = apiProducts.find((p) => {
        const apiTitle = (p.title || "").trim().toLowerCase();
        return apiTitle === productName.toLowerCase();
      });

      if (!matchedApiProduct) {
        const normalizedDbName = normalizeString(productName);
        matchedApiProduct = apiProducts.find(
          (p) => normalizeString(p.title) === normalizedDbName
        );
      }

      if (!matchedApiProduct) {
        console.warn(`⚠️ Product "${productName}" NOT in Fastrr catalog.`);
        console.warn(`   First 10 available titles:`);
        apiProducts.slice(0, 10).forEach((p) => console.warn(`   - "${p.title}"`));

        return res.status(400).json({
          success: false,
          code: "FASTRR_CATALOG_MISSING",
          message: `"${productName}" is not yet available for Fastrr checkout. It may still be syncing. Please use standard checkout (COD/PayU).`,
          productName,
          productId: item.productId,
        });
      }

      console.log(`✅ Matched Fastrr product: "${matchedApiProduct.title}" (ID: ${matchedApiProduct.id})`);

      let shiprocketVariantId = null;

      if (matchedApiProduct.variants && matchedApiProduct.variants.length > 0) {
        if (variantDoc) {
          const variantTitle = (variantDoc.color || variantDoc.size || variantDoc.variant || "").trim().toLowerCase();
          console.log(`   Looking for variant: "${variantTitle}"`);

          const matchedApiVariant = matchedApiProduct.variants.find((av) => {
            const apiVariantTitle = (av.title || "").trim().toLowerCase();
            return apiVariantTitle === variantTitle;
          });

          if (matchedApiVariant) {
            shiprocketVariantId = matchedApiVariant.id;
            console.log(`   ✅ Matched variant by title -> ${shiprocketVariantId}`);
          } else {
            shiprocketVariantId = matchedApiProduct.variants[variantIdx]?.id
              || matchedApiProduct.variants[0]?.id
              || null;
            console.log(`   ⚠️ Variant title not matched, using index ${variantIdx} -> ${shiprocketVariantId}`);
          }
        } else {
          shiprocketVariantId = matchedApiProduct.variants[0]?.id || null;
          console.log(`   ✅ No variant, using first -> ${shiprocketVariantId}`);
        }
      }

      if (!shiprocketVariantId) {
        console.warn(`⚠️ No Fastrr variant ID for "${productName}".`);
        return res.status(400).json({
          success: false,
          code: "FASTRR_VARIANT_MISSING",
          message: `Variant for "${productName}" is not available in Fastrr catalog. Please use standard checkout.`,
          productName,
          productId: item.productId,
        });
      }

      console.log(`🛒 Item: ${productName} | variantIdx: ${variantIdx} | Fastrr ID: ${shiprocketVariantId}`);

      itemsWithVendorInfo.push({
        productId: item.productId,
        variantId: item.variantId || null,
        shiprocketVariantId,
        name: item.name || product.name,
        price: item.price || product.price,
        quantity: item.quantity,
        stock: effectiveStock,
        image: Array.isArray(item.image) ? item.image : [item.image],
        vendorId,
        company: product.company || product.vendorId?.company || "N/A",
        weight: product.weight || 0.5,
        selectedColor: item.selectedColor || "",
        selectedSize: item.selectedSize || "",
        variantImage: item.variantImage || "",
        variantPrice: item.variantPrice || 0,
        customFieldLabel: item.customFieldLabel || null,
        customFieldValue: item.customFieldValue || null,
        sku: item.sku || "",
      });
    }

    // ============================================================
    // ✅ FIX: PEHLA Shiprocket token mangho
    // ============================================================
    const accessTokenPayload = {
      cart_data: {
        items: itemsWithVendorInfo.map((i) => ({
          variant_id: String(i.shiprocketVariantId),
          quantity: Number(i.quantity),
        })),
      },
      redirect_url: `${process.env.FRONTEND_URL}/order-complete?orderId=TEMP_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    const payloadString = JSON.stringify(accessTokenPayload);

    const hmac = crypto
      .createHmac("sha256", process.env.SHIPROCKET_CHECKOUT_SECRET)
      .update(payloadString)
      .digest("base64");

    console.log("🔑 Fastrr Access Token Request:");
    console.log("Payload String:", payloadString);
    console.log("HMAC:", hmac);
    console.log("API Key:", process.env.SHIPROCKET_CHECKOUT_API_KEY);

    let accessToken = null;
    let shiprocketOrderId = null;

    try {
      const tokenResponse = await axios.post(
        "https://checkout-api.shiprocket.com/api/v1/access-token/checkout",
        payloadString,
        {
          headers: {
            "X-Api-Key": process.env.SHIPROCKET_CHECKOUT_API_KEY,
            "X-Api-HMAC-SHA256": hmac,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      console.log("✅ Fastrr Access Token Response:", JSON.stringify(tokenResponse.data));

      accessToken = tokenResponse.data?.result?.token || tokenResponse.data?.token || null;
      shiprocketOrderId = tokenResponse.data?.result?.data?.order_id
        || tokenResponse.data?.result?.order_id
        || tokenResponse.data?.order_id
        || null;

    } catch (tokenErr) {
      console.error("❌ Fastrr Token API error:", tokenErr.response?.data || tokenErr.message);

      return res.status(500).json({
        success: false,
        message: "Failed to generate checkout token",
        error: tokenErr.response?.data || tokenErr.message,
      });
    }

    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: "No access token received from Fastrr",
      });
    }

    // ============================================================
    // ✅ FIX: Token mali gayu — HAVE order DB ma save karo
    // ============================================================
    const order = new Order({
      guestId,
      items: itemsWithVendorInfo,
      shippingAddress,
      paymentMethod: "Shiprocket",
      paymentStatus: "Pending",
      subtotal,
      totalPrice: total,
      orderStatus: "Pending",
      shiprocketOrderId: shiprocketOrderId,
      coupon: couponCode
        ? { code: couponCode, discountAmount: Number((subtotal - total).toFixed(2)) }
        : { code: null, discountAmount: 0 },
    });

    await order.save();

    console.log(`✅ Order saved: ${order._id} (Shiprocket: ${shiprocketOrderId})`);

    // Update redirect URL with real order ID
    console.log(`🔗 Redirect will go to: ${process.env.FRONTEND_URL}/order-complete?orderId=${order._id}`);

    res.json({
      success: true,
      orderId: order._id,
      accessToken,
      shiprocketOrderId,
    });
  } catch (err) {
    console.error("Shiprocket checkout create error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================
// FASTrr CHECKOUT — ORDER WEBHOOK
// ✅ FIX: COD detection via payment_type + is_cod
// ✅ FIX: Proper paymentMethod set for COD vs Prepaid
// ✅ FIX: Already cancelled orders skip karo
// ============================================
router.post("/shiprocket-webhook", async (req, res) => {
  try {
    console.log("📩 Fastrr Order Webhook received:", JSON.stringify(req.body, null, 2));

    const {
      order_id,
      cart_data,
      status,
      phone,
      email,
      payment_type,
      payment_method,
      is_cod,
      total_amount_payable,
      shipping_address,
    } = req.body;

    // ✅ COD detection — multiple sources thi
    const rawPaymentType = String(payment_type || payment_method || "").toLowerCase().trim();
    const isCOD =
      is_cod === true ||
      is_cod === "true" ||
      rawPaymentType === "cod" ||
      rawPaymentType === "cash on delivery" ||
      rawPaymentType === "cash_on_delivery";

    console.log(`💳 Payment detection → raw: "${rawPaymentType}", is_cod: ${is_cod}, final isCOD: ${isCOD}`);

    let order = null;

    if (order_id) {
      order = await Order.findOne({ shiprocketOrderId: order_id });
    }

    if (!order && (email || phone)) {
      order = await Order.findOne({
        paymentMethod: "Shiprocket",
        paymentStatus: "Pending",
        $or: [
          { "shippingAddress.email": email },
          { "shippingAddress.phone": phone },
        ],
      }).sort({ createdAt: -1 });
    }

    if (!order) {
      console.warn("⚠️ No matching order found for webhook:", order_id);
      return res.json({ success: true, message: "Order not found but webhook received" });
    }

    // ✅ FIX: Already cancelled order — skip
    if (order.orderStatus === "Cancelled") {
      console.log(`⚠️ Order ${order._id} already cancelled — skipping webhook`);
      return res.json({ success: true, message: "Order already cancelled" });
    }

    // ============================================================
    // ✅ CASE 1: COD ORDER
    // ============================================================
    if (isCOD) {
      console.log(`🟢 COD order detected for ${order._id}`);

      // COD success → order confirm, payment Pending rahe
      if (
        status === "SUCCESS" || status === "success" ||
        status === "PAID" || status === "paid" ||
        status === "CONFIRMED" || status === "confirmed" ||
        status === "PLACED" || status === "placed"
      ) {
        order.paymentMethod = "COD";
        order.paymentStatus = "Pending";
        order.orderStatus = "Processing";
        order.shiprocketPaymentId = order_id;
        order.totalPrice = total_amount_payable || order.totalPrice;

        order.statusUpdatedAt = new Date();
        order.statusUpdatedBy = null;
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({
          status: "Processing",
          updatedAt: new Date(),
          updatedBy: null,
          note: "COD order confirmed via Shiprocket webhook",
        });

        await order.save();

        for (const item of order.items) {
          if (item.variantId) {
            await Product.updateOne(
              { _id: item.productId, "variants._id": item.variantId },
              { $inc: { "variants.$.stock": -item.quantity } }
            );
          } else {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { stock: -item.quantity },
            });
          }
        }

        await Cart.findOneAndDelete({ guestId: order.guestId });

        try {
          const customerEmail = order.shippingAddress?.email;
          if (customerEmail) {
            const html = getCustomerOrderEmail(order, order._id);
            await sendEmail(customerEmail, `Order Confirmed! - Order #${order._id}`, html);
          }
        } catch (emailErr) {
          console.error("Email error:", emailErr.message);
        }

        try {
          const adminEmail = process.env.ADMIN_EMAIL || "orders@native91.com";
          if (adminEmail) {
            const adminHtml = getAdminOrderEmail(order, order._id);
            await sendEmail(adminEmail, `New COD Order - #${order._id}`, adminHtml);
          }
        } catch (emailErr) {
          console.error("Admin email error:", emailErr.message);
        }

        return res.json({ success: true, orderId: order._id, type: "COD_SUCCESS" });
      }

      // COD failed/cancelled
      if (status === "FAILED" || status === "failed" || status === "CANCELLED" || status === "cancelled") {
        order.paymentMethod = "COD";
        order.paymentStatus = "Failed";
        order.orderStatus = "Cancelled";

        order.statusUpdatedAt = new Date();
        order.statusUpdatedBy = null;
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({
          status: "Cancelled",
          updatedAt: new Date(),
          updatedBy: null,
          note: "COD order cancelled via Shiprocket webhook",
        });

        await order.save();
        return res.json({ success: true, orderId: order._id, type: "COD_CANCELLED" });
      }

      return res.json({ success: true, orderId: order._id, type: "COD_UNKNOWN_STATUS" });
    }

    // ============================================================
    // ✅ CASE 2: ONLINE (Prepaid) ORDER
    // ============================================================
    if (status === "SUCCESS" || status === "success" || status === "PAID" || status === "paid") {
      order.paymentStatus = "Paid";
      order.orderStatus = "Processing";
      order.paymentMethod = rawPaymentType
        ? rawPaymentType.charAt(0).toUpperCase() + rawPaymentType.slice(1)
        : "Prepaid";
      order.shiprocketPaymentId = order_id;
      order.totalPrice = total_amount_payable || order.totalPrice;

      order.statusUpdatedAt = new Date();
      order.statusUpdatedBy = null;
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: "Processing",
        updatedAt: new Date(),
        updatedBy: null,
        note: `Paid via Shiprocket (${order.paymentMethod}) webhook`,
      });

      if (shipping_address && !order.shippingAddress?.address) {
        order.shippingAddress = {
          name: shipping_address.name || order.shippingAddress?.name,
          email: email || order.shippingAddress?.email,
          phone: phone || order.shippingAddress?.phone,
          address: shipping_address.line1 || shipping_address.address,
          city: shipping_address.city,
          state: shipping_address.state,
          pincode: shipping_address.pincode,
          country: shipping_address.country || "India",
        };
      }

      await order.save();

      for (const item of order.items) {
        if (item.variantId) {
          await Product.updateOne(
            { _id: item.productId, "variants._id": item.variantId },
            { $inc: { "variants.$.stock": -item.quantity } }
          );
        } else {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
          });
        }
      }

      await Cart.findOneAndDelete({ guestId: order.guestId });

      try {
        const customerEmail = order.shippingAddress?.email;
        if (customerEmail) {
          const html = getCustomerOrderEmail(order, order._id);
          await sendEmail(customerEmail, `Order Confirmed! - Order #${order._id}`, html);
        }
      } catch (emailErr) {
        console.error("Email error:", emailErr.message);
      }

      try {
        const adminEmail = process.env.ADMIN_EMAIL || "orders@native91.com";
        if (adminEmail) {
          const adminHtml = getAdminOrderEmail(order, order._id);
          await sendEmail(adminEmail, `New Order (Fastrr) - #${order._id}`, adminHtml);
        }
      } catch (emailErr) {
        console.error("Admin email error:", emailErr.message);
      }

      return res.json({ success: true, orderId: order._id, type: "PREPAID_SUCCESS" });
    }

    // Failed / Cancelled (online)
    if (status === "FAILED" || status === "failed" || status === "CANCELLED" || status === "cancelled") {
      order.paymentStatus = "Failed";
      order.orderStatus = "Cancelled";

      order.statusUpdatedAt = new Date();
      order.statusUpdatedBy = null;
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: "Cancelled",
        updatedAt: new Date(),
        updatedBy: null,
        note: "Auto-cancelled via Shiprocket (Fastrr) webhook",
      });

      await order.save();
      return res.json({ success: true, orderId: order._id, type: "PREPAID_CANCELLED" });
    }

    res.json({ success: true, orderId: order._id, type: "UNKNOWN_STATUS" });
  } catch (err) {
    console.error("Fastrr webhook error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================
// FASTrr CHECKOUT — CONFIRM (from frontend)
// ============================================
router.post("/shiprocket-confirm", async (req, res) => {
  try {
    const { orderId, shiprocketPaymentId, shiprocketOrderId, status } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (status === "success") {
      order.paymentStatus = "Paid";
      order.orderStatus = "Processing";
      order.shiprocketPaymentId = shiprocketPaymentId || null;
      order.shiprocketOrderId = shiprocketOrderId || null;

      order.statusUpdatedAt = new Date();
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: "Processing",
        updatedAt: new Date(),
        updatedBy: null,
        note: "Confirmed via Fastrr frontend callback",
      });

      for (const item of order.items) {
        if (item.variantId) {
          await Product.updateOne(
            { _id: item.productId, "variants._id": item.variantId },
            { $inc: { "variants.$.stock": -item.quantity } }
          );
        } else {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
          });
        }
      }

      await Cart.findOneAndDelete({ guestId: order.guestId });

      try {
        const customerEmail = order.shippingAddress?.email;
        if (customerEmail) {
          const html = getCustomerOrderEmail(order, order._id);
          await sendEmail(customerEmail, `Order Confirmed! - Order #${order._id}`, html);
        }
      } catch (emailErr) {
        console.error("Email error:", emailErr.message);
      }
    } else {
      order.paymentStatus = "Failed";
      order.orderStatus = "Cancelled";

      order.statusUpdatedAt = new Date();
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: "Cancelled",
        updatedAt: new Date(),
        updatedBy: null,
        note: "Failed via Fastrr frontend callback",
      });
    }

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    console.error("Confirm error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================
// GET SINGLE ORDER
// ============================================
router.get("/single/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================
// ✅ GET ORDERS BY GUEST — FILTERED
// Fakt COD + Paid orders batav, Cancelled hide karo
// ============================================
router.get("/guest/:guestId", async (req, res) => {
  try {
    const filter = getVisibleOrdersFilter({ guestId: req.params.guestId });
    const orders = await Order.find(filter).sort({ createdAt: -1 });

    console.log(`📋 Guest orders for ${req.params.guestId}: ${orders.length} visible`);

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================
// ✅ GET USER ORDERS — FILTERED
// ============================================
router.get("/user/:userId", async (req, res) => {
  try {
    const filter = getVisibleOrdersFilter({ userId: req.params.userId });
    const orders = await Order.find(filter).sort({ createdAt: -1 });

    console.log(`📋 User orders for ${req.params.userId}: ${orders.length} visible`);

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================
// ADMIN: GET ORDER WITH COMMISSION
// ============================================
router.get("/admin/commission/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    let totalAdminCommission = 0;
    let totalVendorCommission = 0;
    const vendorBreakdown = {};

    for (const item of order.items) {
      if (item.vendorId) {
        const vendorIdStr = item.vendorId.toString();
        const vendor = await Vendor.findById(item.vendorId).populate("planId");

        let commissionPercentage = 8;
        if (vendor && vendor.planId) {
          commissionPercentage = vendor.planId.commissionPercentage || 8;
        }

        const itemTotal = item.price * item.quantity;
        const vendorCommission = (itemTotal * commissionPercentage) / 100;
        const adminCommission = itemTotal - vendorCommission;

        totalVendorCommission += vendorCommission;
        totalAdminCommission += adminCommission;

        if (!vendorBreakdown[vendorIdStr]) {
          vendorBreakdown[vendorIdStr] = {
            company: item.company || "Unknown",
            vendorId: item.vendorId,
            vendorName: vendor?.name || "Unknown",
            vendorEmail: vendor?.email || "N/A",
            commissionPercentage: commissionPercentage,
            items: [],
            totalItemValue: 0,
            totalVendorCommission: 0,
            totalAdminCommission: 0,
          };
        }

        vendorBreakdown[vendorIdStr].items.push({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: itemTotal,
          vendorCommission: vendorCommission,
          adminCommission: adminCommission,
          selectedColor: item.selectedColor || "",
          selectedSize: item.selectedSize || "",
          variantImage: item.variantImage || "",
          customFieldLabel: item.customFieldLabel || null,
          customFieldValue: item.customFieldValue || null,
        });

        vendorBreakdown[vendorIdStr].totalItemValue += itemTotal;
        vendorBreakdown[vendorIdStr].totalVendorCommission += vendorCommission;
        vendorBreakdown[vendorIdStr].totalAdminCommission += adminCommission;
      }
    }

    res.json({
      success: true,
      orderId: order._id,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal || order.totalPrice,
      totalPrice: order.totalPrice,
      coupon: order.coupon || null,
      createdAt: order.createdAt,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      shipments: order.shipments || [],
      shiprocketSyncStatus: order.shiprocketSyncStatus,
      shiprocketError: order.shiprocketError || null,
      commissionSummary: {
        totalAdminCommission,
        totalVendorCommission,
        platformCommissionRate:
          order.totalPrice > 0
            ? ((totalAdminCommission / order.totalPrice) * 100).toFixed(2) + "%"
            : "0%",
        vendorCommissionRate:
          order.totalPrice > 0
            ? ((totalVendorCommission / order.totalPrice) * 100).toFixed(2) + "%"
            : "0%",
      },
      vendorBreakdown: Object.values(vendorBreakdown),
    });
  } catch (err) {
    console.error("Commission view error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ============================================
// ADMIN: GET ALL ORDERS WITH COMMISSIONS
// ============================================
router.get("/admin/commissions", async (req, res) => {
  try {
    const { startDate, endDate, vendorId, status } = req.query;
    let filter = {};
    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (status) filter.orderStatus = status;

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    const orderSummaries = [];
    let totalAdminCommission = 0;
    let totalVendorCommission = 0;
    let totalRevenue = 0;

    for (const order of orders) {
      let orderAdminCommission = 0;
      let orderVendorCommission = 0;
      const vendorSet = new Set();

      for (const item of order.items) {
        if (item.vendorId) {
          vendorSet.add(item.vendorId.toString());
          const vendor = await Vendor.findById(item.vendorId).populate("planId");
          let commissionPercentage = 8;
          if (vendor && vendor.planId) {
            commissionPercentage = vendor.planId.commissionPercentage || 8;
          }
          const itemTotal = item.price * item.quantity;
          const vendorCommission = (itemTotal * commissionPercentage) / 100;
          const adminCommission = itemTotal - vendorCommission;
          orderVendorCommission += vendorCommission;
          orderAdminCommission += adminCommission;
        }
      }

      totalAdminCommission += orderAdminCommission;
      totalVendorCommission += orderVendorCommission;
      totalRevenue += order.totalPrice || 0;

      orderSummaries.push({
        _id: order._id,
        subtotal: order.subtotal || order.totalPrice,
        totalPrice: order.totalPrice,
        coupon: order.coupon || null,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        vendorCount: vendorSet.size,
        shipmentCount: order.shipments?.length || 0,
        shiprocketSyncStatus: order.shiprocketSyncStatus || "pending",
        adminCommission: orderAdminCommission,
        vendorCommission: orderVendorCommission,
        platformCommissionRate:
          order.totalPrice > 0
            ? ((orderAdminCommission / order.totalPrice) * 100).toFixed(2) + "%"
            : "0%",
      });
    }

    let filteredSummaries = orderSummaries;
    if (vendorId) {
      const filteredOrders = await Order.find({ ...filter, "items.vendorId": vendorId }).sort({ createdAt: -1 });
      const filteredResults = [];
      let filteredAdminCommission = 0;
      let filteredVendorCommission = 0;
      let filteredRevenue = 0;

      for (const order of filteredOrders) {
        let orderAdminCommission = 0;
        let orderVendorCommission = 0;
        const vendorSet = new Set();

        for (const item of order.items) {
          if (item.vendorId && item.vendorId.toString() === vendorId) {
            vendorSet.add(item.vendorId.toString());
            const vendor = await Vendor.findById(item.vendorId).populate("planId");
            let commissionPercentage = 8;
            if (vendor && vendor.planId) {
              commissionPercentage = vendor.planId.commissionPercentage || 8;
            }
            const itemTotal = item.price * item.quantity;
            const vendorCommission = (itemTotal * commissionPercentage) / 100;
            const adminCommission = itemTotal - vendorCommission;
            orderVendorCommission += vendorCommission;
            orderAdminCommission += adminCommission;
          }
        }

        filteredAdminCommission += orderAdminCommission;
        filteredVendorCommission += orderVendorCommission;
        filteredRevenue += order.totalPrice || 0;

        filteredResults.push({
          _id: order._id,
          subtotal: order.subtotal || order.totalPrice,
          totalPrice: order.totalPrice,
          coupon: order.coupon || null,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,
          vendorCount: vendorSet.size,
          shipmentCount: order.shipments?.length || 0,
          shiprocketSyncStatus: order.shiprocketSyncStatus || "pending",
          adminCommission: orderAdminCommission,
          vendorCommission: orderVendorCommission,
          platformCommissionRate:
            order.totalPrice > 0
              ? ((orderAdminCommission / order.totalPrice) * 100).toFixed(2) + "%"
              : "0%",
        });
      }

      filteredSummaries = filteredResults;
      totalAdminCommission = filteredAdminCommission;
      totalVendorCommission = filteredVendorCommission;
      totalRevenue = filteredRevenue;
    }

    res.json({
      success: true,
      summary: {
        totalOrders: filteredSummaries.length,
        totalRevenue,
        totalAdminCommission,
        totalVendorCommission,
        platformCommissionRate:
          totalRevenue > 0
            ? ((totalAdminCommission / totalRevenue) * 100).toFixed(2) + "%"
            : "0%",
      },
      orders: filteredSummaries,
    });
  } catch (err) {
    console.error("Admin commissions fetch error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ============================================
// ADMIN: UPDATE ORDER STATUS
// ============================================
router.put("/admin/status/:orderId", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed: Pending, Processing, Shipped, Delivered, Cancelled",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: status },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({
      success: true,
      message: "Order status updated successfully",
      order: {
        _id: order._id,
        orderStatus: order.orderStatus,
        updatedAt: order.updatedAt,
        shipments: order.shipments || [],
        shiprocketSyncStatus: order.shiprocketSyncStatus,
      },
    });
  } catch (err) {
    console.error("Order status update error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ============================================
// SEND ORDER CONFIRMATION EMAIL (Manual)
// ============================================
router.post("/send-confirmation", async (req, res) => {
  try {
    const {
      to, subject, orderId, customerName, items, subtotal,
      couponDiscount, shippingCost, total, paymentMethod, orderDate,
    } = req.body;

    if (!to) return res.status(400).json({ success: false, message: "Recipient email is required" });

    const html = `
      <!DOCTYPE html>
      <html><head><meta charset="UTF-8"><style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #28a745, #218838); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { color: #fff; margin: 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
        .items-table td { padding: 10px; border-bottom: 1px solid #dee2e6; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; }
      </style></head>
      <body><div class="container">
        <div class="header"><h1>🎉 Order Confirmed!</h1><p>Thank you, ${customerName || "Customer"}!</p></div>
        <div style="padding: 20px;">
          <p><strong>📋 Order #:</strong> ${orderId}</p>
          <p><strong>📅 Date:</strong> ${orderDate || new Date().toLocaleString()}</p>
          <p><strong>💳 Payment:</strong> ${paymentMethod || "COD"}</p>
          <h3>🛍️ Order Items</h3>
          <table class="items-table"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
          <tbody>${(items || []).map((item) => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>₹${(item.price || 0).toFixed(2)}</td><td>₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td></tr>`).join("")}</tbody></table>
          <div style="margin-top:15px; border-top:2px solid #eee; padding-top:15px;">
            <div><span>Subtotal</span><span style="float:right;">₹${(subtotal || 0).toFixed(2)}</span></div>
            ${couponDiscount > 0 ? `<div style="color:#28a745;"><span>Discount</span><span style="float:right;">-₹${(couponDiscount || 0).toFixed(2)}</span></div>` : ""}
            <div><span>Shipping</span><span style="float:right;">${shippingCost === 0 ? "FREE" : `₹${(shippingCost || 0).toFixed(2)}`}</span></div>
            <div style="font-size:20px; font-weight:bold; border-top:2px solid #28a745; margin-top:10px; padding-top:10px;"><span>Total</span><span style="float:right; color:#28a745;">₹${(total || 0).toFixed(2)}</span></div>
          </div>
          <div class="footer"><p>Thank you for shopping with us! 🛍️</p></div>
        </div>
      </div></body></html>`;

    const result = await sendEmail(to, subject || `Order Confirmation - #${orderId}`, html);
    if (result.success) {
      res.json({ success: true, message: "Email sent successfully" });
    } else {
      res.status(500).json({ success: false, message: "Failed to send email", error: result.error });
    }
  } catch (err) {
    console.error("Send confirmation error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;