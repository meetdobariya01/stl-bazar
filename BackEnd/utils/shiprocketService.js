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



// Services/shiprocketService.js - FULLY FIXED + AUTO AWB
// + FIXED: .env variable name mismatch (supports both SHIPROCKET_* and SHIPROCKET_API_*)
// + FIXED: Block detection with clear error message
// + FIXED: Pickup location all response shapes
// + FIXED: Auto-retry on wrong pickup location
// + 🆕 FIXED: Payment method (Prepaid vs COD) — Paid orders now create as Prepaid
// + 🆕 NEW: assignAWB() — auto assign AWB after shipment creation
// + 🆕 IMPROVED: generateLabel() — better error handling

const axios = require('axios');
const Vendor = require('../Models/Vendor');
const SellerDocument = require('../Models/SellerDocument');
const PickupLocation = require('../Models/PickupLocation');

class ShiprocketService {
  constructor() {
    // ✅ Support BOTH variable naming conventions
    this.baseURL =
      process.env.SHIPROCKET_API_URL ||
      process.env.SHIPROCKET_API_BASE ||
      'https://apiv2.shiprocket.in/v1/external';

    this.email =
      process.env.SHIPROCKET_EMAIL ||
      process.env.SHIPROCKET_API_EMAIL;

    this.password =
      process.env.SHIPROCKET_PASSWORD ||
      process.env.SHIPROCKET_API_PASSWORD;

    this.token = null;
    this.tokenExpiry = null;

    // Block state
    this.authBlocked = false;
    this.authBlockedUntil = null;

    // Cache
    this.pickupCache = null;
    this.pickupCacheExpiry = null;

    // Log resolved config (mask password)
    console.log('⚙️  Shiprocket config resolved:');
    console.log(`   📧 Email: ${this.email || '(MISSING!)'}`);
    console.log(`   🔑 Password: ${this.password ? '***set***' : '(MISSING!)'}`);
    console.log(`   🌐 Base URL: ${this.baseURL}`);
  }

  // ============================================
  // HELPER: Determine Shiprocket payment method
  // Shiprocket accepts only "COD" or "Prepaid"
  // ============================================
  determinePaymentMethod(orderData) {
    // If order is paid → Prepaid
    if (
      orderData.paymentStatus === 'Paid' ||
      orderData.isPaid === true
    ) {
      return 'Prepaid';
    }

    const raw = String(orderData.paymentMethod || '').toLowerCase().trim();

    // COD explicitly
    if (raw === 'cod' || raw === 'cash on delivery') {
      return 'COD';
    }

    // Everything else → Prepaid (online, shiprocket, fastrr, payu, upi, card, etc.)
    if (
      raw === 'prepaid' ||
      raw === 'paid' ||
      raw === 'online' ||
      raw === 'upi' ||
      raw === 'card' ||
      raw === 'payu' ||
      raw === 'shiprocket' ||
      raw === 'fastrr' ||
      raw === ''
    ) {
      return 'Prepaid';
    }

    // Default fallback
    return 'COD';
  }

  // ============================================
  // AUTH (with block detection)
  // ============================================
  async authenticate() {
    // Valid cached token?
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry - 15 * 60 * 1000) {
      return this.token;
    }

    // Already blocked? Skip call
    if (this.authBlocked && Date.now() < this.authBlockedUntil) {
      const minsLeft = Math.ceil((this.authBlockedUntil - Date.now()) / 60000);
      throw new Error(
        `🚨 Shiprocket BLOCKED — reset password at app.shiprocket.in → Settings → API Users. Retry in ${minsLeft} min.`
      );
    }

    // Validate credentials exist
    if (!this.email || !this.password) {
      const msg = 'Shiprocket credentials MISSING. Check .env: SHIPROCKET_EMAIL/SHIPROCKET_PASSWORD (or SHIPROCKET_API_EMAIL/SHIPROCKET_API_PASSWORD)';
      console.error(`❌ ${msg}`);
      console.error(`   Email loaded: ${this.email || 'undefined'}`);
      console.error(`   Password loaded: ${this.password ? 'set' : 'undefined'}`);
      throw new Error(msg);
    }

    try {
      console.log('🔐 Authenticating with Shiprocket...');
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: this.email,
        password: this.password,
      });

      this.token = response.data.token;
      this.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
      this.authBlocked = false;
      console.log('✅ Shiprocket authentication successful');
      return this.token;
    } catch (error) {
      const errData = error.response?.data;
      console.error('❌ Auth failed:', errData || error.message);

      // Detect block
      if (
        errData?.message?.toLowerCase().includes('blocked') ||
        errData?.status_code === 403
      ) {
        this.authBlocked = true;
        this.authBlockedUntil = Date.now() + 10 * 60 * 1000;
        console.error('\n🚨 ============================================');
        console.error('🚨 SHIPROCKET ACCOUNT BLOCKED!');
        console.error('🚨 ============================================');
        console.error('🔧 FIX:');
        console.error('   1. https://app.shiprocket.in → Settings → API Users');
        console.error('   2. support@native91.com → Reset Password');
        console.error("   3. .env: SHIPROCKET_PASSWORD='new_pwd'");
        console.error('   4. pm2 restart stl-bazar-backend');
        console.error('🚨 ============================================\n');

        throw new Error('Shiprocket account BLOCKED — reset password in Shiprocket dashboard');
      }

      throw new Error(`Shiprocket auth failed: ${errData?.message || error.message}`);
    }
  }

  async getHeaders() {
    const token = await this.authenticate();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // ============================================
  // HELPER: Unique SKU
  // ============================================
  generateUniqueSku(item, index) {
    const rawProductId = item.productId;
    let productId = '';
    if (rawProductId) {
      productId =
        typeof rawProductId === 'object'
          ? String(rawProductId._id || rawProductId)
          : String(rawProductId);
    }
    if (!productId && item.sku) productId = String(item.sku);
    if (!productId) productId = `SKU${String(index + 1).padStart(3, '0')}`;

    let variantId = '';
    const rawVariantId = item.variantId;
    if (rawVariantId && String(rawVariantId).trim() !== '' && String(rawVariantId) !== 'null') {
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

    if (!/\d/.test(clean)) clean = `House No. 1, ${clean}`;
    if (clean.length < 10) clean = `House No. 1, Main Road, ${clean}`;
    if (clean.length > 100) clean = clean.substring(0, 100);

    return clean;
  }

  // ============================================
  // SANITIZE PHONE
  // ============================================
  sanitizePhone(phone) {
    if (!phone) return '9999999999';
    let digits = String(phone).replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) digits = digits.substring(2);
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
    if (digits.length !== 6) digits = '400001';
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
  // FETCH PICKUP LOCATIONS (all response shapes)
  // ============================================
  async fetchShiprocketPickupLocations() {
    if (this.pickupCache && Date.now() < this.pickupCacheExpiry) {
      return this.pickupCache;
    }

    try {
      const headers = await this.getHeaders();
      const res = await axios.get(`${this.baseURL}/settings/company/pickup`, {
        headers,
        timeout: 15000,
      });

      const body = res.data || {};
      let locations = [];

      if (Array.isArray(body)) locations = body;
      else if (Array.isArray(body.data)) locations = body.data;
      else if (body.data && Array.isArray(body.data.shipping_address))
        locations = body.data.shipping_address;
      else if (Array.isArray(body.shipping_address))
        locations = body.shipping_address;
      else if (body.data && typeof body.data === 'object') {
        for (const key of Object.keys(body.data)) {
          if (Array.isArray(body.data[key])) {
            locations = body.data[key];
            break;
          }
        }
      }

      this.pickupCache = locations;
      this.pickupCacheExpiry = Date.now() + 60 * 60 * 1000;

      console.log(`📦 Shiprocket has ${locations.length} pickup location(s)`);
      if (locations.length > 0) {
        console.log(
          `   Nicknames: [${locations.map((l) => l.pickup_location || l.nickname).join(', ')}]`
        );
      }

      return locations;
    } catch (error) {
      console.error('❌ Fetch pickup locations failed:', error.response?.data || error.message);
      return [];
    }
  }

  // ============================================
  // CREATE PICKUP LOCATION
  // ============================================
  async createShiprocketPickupLocation(payload) {
    try {
      const headers = await this.getHeaders();
      const res = await axios.post(`${this.baseURL}/settings/company/addpickup`, payload, {
        headers,
        timeout: 15000,
      });
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
    console.log(`📌 Desired nickname: ${desiredNickname}`);

    // TRY 1: DB cache
    try {
      const cachedPickup = await PickupLocation.findOne({
        vendorId: vendorId,
        isActive: true,
        verified: true,
      });
      if (cachedPickup && cachedPickup.nickname) {
        console.log(`✅ Using cached pickup: ${cachedPickup.nickname}`);
        return cachedPickup.nickname;
      }
    } catch (e) { /* ignore */ }

    try {
      const shiprocketLocations = await this.fetchShiprocketPickupLocations();
      const availableNicknames = shiprocketLocations
        .map((l) => l.pickup_location || l.nickname)
        .filter(Boolean);

      console.log(`📋 Shiprocket available: [${availableNicknames.join(', ')}]`);

      // STEP 1: Already exists?
      if (availableNicknames.includes(desiredNickname)) {
        console.log(`✅ Vendor-specific pickup EXISTS: ${desiredNickname}`);
        const srLoc = shiprocketLocations.find(
          (l) => (l.pickup_location || l.nickname) === desiredNickname
        );
        await this.savePickupToDb(vendorId, desiredNickname, srLoc);
        return desiredNickname;
      }

      // STEP 2: Create
      console.log(`⚠️ "${desiredNickname}" not in Shiprocket — trying to create`);

      const vendorData = await this.getVendorAddress(vendorId);
      if (!vendorData) {
        console.warn('⚠️ Vendor data not found — using nickname directly');
        return desiredNickname;
      }

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
        this.pickupCache = null;
        this.pickupCacheExpiry = null;
        await this.savePickupToDb(vendorId, desiredNickname);
        return desiredNickname;
      }

      // STEP 3: Fallback
      const fallbackNickname =
        process.env.SHIPROCKET_DEFAULT_PICKUP || availableNicknames[0];

      if (fallbackNickname) {
        console.log(`🔄 Using fallback pickup: ${fallbackNickname}`);
        await this.savePickupToDb(vendorId, fallbackNickname);
        return fallbackNickname;
      }

      console.log(`⚠️ No fallback — using vendor nickname directly: ${desiredNickname}`);
      return desiredNickname;
    } catch (error) {
      console.error('❌ getPickupLocationForVendor error:', error.message);
      console.log(`⚠️ Emergency — using vendor nickname directly: ${desiredNickname}`);
      return desiredNickname;
    }
  }

  // ============================================
  // HELPER: Save pickup to DB
  // ============================================
  async savePickupToDb(vendorId, nickname, shiprocketLoc = null) {
    try {
      await PickupLocation.findOneAndUpdate(
        { vendorId: vendorId },
        {
          vendorId: vendorId,
          nickname: nickname,
          shiprocketPickupId: shiprocketLoc?.id || shiprocketLoc?.pickup_id || nickname,
          address: shiprocketLoc?.address || '',
          city: shiprocketLoc?.city || '',
          state: shiprocketLoc?.state || '',
          pincode: shiprocketLoc?.pin_code || shiprocketLoc?.pincode || '',
          country: shiprocketLoc?.country || 'India',
          phone: shiprocketLoc?.phone || '',
          email: shiprocketLoc?.email || '',
          isActive: true,
          verified: !!shiprocketLoc,
          fallback: false,
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.error('savePickupToDb error:', e.message);
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
        message: 'Pickup location ready',
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
          hsn: item.hsn || '',
        };
      });

      const skus = orderItems.map((i) => i.sku);
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

      const pickupLocation =
        overridePickup || (await this.getPickupLocationForVendor(orderData.vendorId));

      console.log(`📍 Using pickup location: ${pickupLocation}`);

      // ✅ Determine correct payment method
      const shiprocketPaymentMethod = this.determinePaymentMethod(orderData);
      console.log(
        `💳 Payment method → Shiprocket: "${shiprocketPaymentMethod}" (input: "${orderData.paymentMethod}", status: "${orderData.paymentStatus}")`
      );

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
        payment_method: shiprocketPaymentMethod,
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
        weight_unit: 'kg',
      };

      const headers = await this.getHeaders();

      console.log('📤 REQUEST');
      console.log(`🆔 Order ID: ${orderData.orderId}`);
      console.log(`📍 Pickup: ${pickupLocation}`);
      console.log(`💳 Payment: ${shiprocketPaymentMethod}`);

      const response = await axios.post(
        `${this.baseURL}/orders/create/adhoc`,
        payload,
        { headers, timeout: 20000 }
      );

      // Detect wrong pickup even on 200
      if (
        response.data?.message &&
        response.data.message.includes('Wrong Pickup location')
      ) {
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
        labelUrl: response.data.label_url || '',
      };
    } catch (error) {
      // AUTO-RETRY on wrong pickup
      if (
        error.message === 'WRONG_PICKUP_LOCATION' ||
        error.response?.data?.message?.includes('Wrong Pickup location')
      ) {
        console.warn('⚠️ Wrong pickup location — retrying with fallback');

        const fallback = process.env.SHIPROCKET_DEFAULT_PICKUP || 'work';

        if (overridePickup === fallback) {
          console.error('❌ Fallback pickup also failed!');
          console.error(
            JSON.stringify(error.shiprocketResponse || error.response?.data, null, 2)
          );
          throw new Error('Fallback pickup failed — check Shiprocket dashboard');
        }

        console.log(`🔄 Retrying with fallback: ${fallback}`);
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
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const totalWeight = vendorItems.reduce(
        (sum, item) => sum + (item.weight || 0.5) * item.quantity,
        0
      );

      const orderData = {
        orderId: `${order.orderId || order._id}-${vendor._id}`,
        vendorId: vendor._id,
        items: vendorItems,
        customer: customer || order.shippingAddress,
        paymentMethod: order.paymentMethod || 'COD',
        paymentStatus: order.paymentStatus || 'Pending',
        isPaid: order.paymentStatus === 'Paid',
        subtotal: subtotal,
        totalPrice: subtotal,
        weight: Math.max(totalWeight, 0.5),
        length: 10,
        breadth: 10,
        height: 10,
        discount: 0,
        shippingCharges: 0,
      };

      console.log(
        `💳 Order payment info → method: "${orderData.paymentMethod}", status: "${orderData.paymentStatus}"`
      );

      const result = await this.createOrder(orderData);

      return {
        success: true,
        vendorId: vendor._id,
        company: vendor.company || vendor.name,
        orderId: orderData.orderId,
        shipmentId: result.shipmentId,
        awbCode: result.awbCode,
        labelUrl: result.labelUrl,
        items: vendorItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: subtotal,
      };
    } catch (error) {
      console.error(`❌ Vendor shipment error (${vendor._id}):`, error.message);
      return {
        success: false,
        vendorId: vendor._id,
        company: vendor.company || vendor.name,
        error: error.message,
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

    const successCount = results.filter((r) => r.success).length;
    console.log(`\n✅ ${successCount}/${results.length} vendor shipments created`);
    return results;
  }

  // ============================================
  // ✅ ASSIGN AWB (NEW METHOD)
  // Called after shipment creation to get AWB code
  // ============================================
  async assignAWB(shipmentId) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${this.baseURL}/courier/assign/awb`,
        { shipment_id: shipmentId },
        { headers, timeout: 20000 }
      );

      console.log('📥 AWB Response:', JSON.stringify(response.data, null, 2));

      const awbCode =
        response.data?.response?.data?.awb_code ||
        response.data?.awb_code ||
        response.data?.data?.awb_code ||
        null;

      if (awbCode) {
        return { success: true, awbCode, data: response.data };
      }

      return {
        success: false,
        error: response.data?.message || 'AWB not returned',
        data: response.data,
      };
    } catch (error) {
      console.error('❌ assignAWB failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
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

  // ============================================
  // ✅ GENERATE LABEL (IMPROVED)
  // ============================================
  async generateLabel(shipmentId) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${this.baseURL}/courier/generate/label`,
        { shipment_id: [shipmentId] },
        { headers, timeout: 20000 }
      );

      console.log('📥 Label Response:', JSON.stringify(response.data, null, 2));

      const labelUrl =
        response.data?.label_url ||
        response.data?.response?.label_url ||
        response.data?.data?.label_url ||
        null;

      if (labelUrl) {
        return { success: true, labelUrl, data: response.data };
      }

      return {
        success: false,
        error: response.data?.message || 'Label URL not returned',
        data: response.data,
      };
    } catch (error) {
      console.error('❌ generateLabel failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
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
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Cancel error:', error.response?.data || error.message);
      throw new Error('Failed to cancel shipment');
    }
  }
}

module.exports = new ShiprocketService();