// test-shiprocket.js
const axios = require('axios');
require('dotenv').config();

async function testPickup() {
  try {
    // Login
    const login = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/auth/login',
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      }
    );
    
    const token = login.data.token;
    console.log('✅ Login successful');
    
    // Test GET pickup locations
    try {
      const get = await axios.get(
        'https://apiv2.shiprocket.in/v1/external/settings/pickup',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('✅ GET pickup locations:', get.data);
    } catch (e) {
      console.log('❌ GET failed:', e.response?.status, e.response?.data);
    }
    
    // Test POST pickup location
    try {
      const post = await axios.post(
        'https://apiv2.shiprocket.in/v1/external/settings/pickup',
        {
          pickup_location: 'test-vendor-123',
          name: 'Test Vendor',
          email: 'test@example.com',
          phone: '9876543210',
          address: 'Test Address',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          pincode: '400001'
        },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      console.log('✅ POST successful:', post.data);
    } catch (e) {
      console.log('❌ POST failed:', e.response?.status, e.response?.data);
    }
    
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

testPickup();
