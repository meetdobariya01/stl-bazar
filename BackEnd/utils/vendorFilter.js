// utils/vendorFilter.js

const Vendor = require("../Models/Vendor");

// ✅ Helper function to filter products from suspended vendors
const filterSuspendedVendors = async (products) => {
  if (!products || products.length === 0) return products;
  
  // Get all vendor IDs from products
  const vendorIds = products.map(p => p.vendorId).filter(id => id);
  
  if (vendorIds.length === 0) return products;
  
  // Find suspended vendors
  const suspendedVendors = await Vendor.find({
    _id: { $in: vendorIds },
    status: 'suspended'
  }).select('_id');
  
  const suspendedVendorIds = suspendedVendors.map(v => v._id.toString());
  
  // Filter out products from suspended vendors
  return products.filter(p => 
    !suspendedVendorIds.includes(p.vendorId?.toString())
  );
};

// ✅ Check if a vendor is suspended
const isVendorSuspended = async (vendorId) => {
  if (!vendorId) return false;
  const vendor = await Vendor.findById(vendorId);
  return vendor && vendor.status === 'suspended';
};

// ✅ Get active vendor IDs
const getActiveVendorIds = async () => {
  const vendors = await Vendor.find({ 
    status: 'active',
    role: 'vendor'
  }).select('_id');
  return vendors.map(v => v._id.toString());
};

// ✅ Get active company names
const getActiveCompanyNames = async () => {
  const vendors = await Vendor.find({ 
    status: 'active',
    role: 'vendor'
  }).select('company');
  return vendors.map(v => v.company);
};

module.exports = {
  filterSuspendedVendors,
  isVendorSuspended,
  getActiveVendorIds,
  getActiveCompanyNames
};