// Router/shiprocketRouter.js
const express = require('express');
const router = express.Router();
const Order = require('../Models/Order');
const shiprocketService = require('../utils/shiprocketService');

// ============================================
// TRACK SHIPMENT
// ============================================
router.get('/track/:shipmentId', async (req, res) => {
  try {
    const result = await shiprocketService.getShipmentTracking(req.params.shipmentId);
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// GENERATE LABEL FOR SHIPMENT
// ============================================
router.post('/label/:shipmentId', async (req, res) => {
  try {
    const result = await shiprocketService.generateLabel(req.params.shipmentId);
    res.json({
      success: true,
      labelUrl: result.labelUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// CANCEL SHIPMENT
// ============================================
router.post('/cancel/:shipmentId', async (req, res) => {
  try {
    const result = await shiprocketService.cancelShipment(req.params.shipmentId);
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// GET ORDER SHIPMENTS
// ============================================
router.get('/order/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .select('shipments shiprocketSyncStatus shiprocketError');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      shipments: order.shipments || [],
      syncStatus: order.shiprocketSyncStatus,
      error: order.shiprocketError
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// GET SHIPMENT STATUS
// ============================================
router.get('/status/:shipmentId', async (req, res) => {
  try {
    const tracking = await shiprocketService.getShipmentTracking(req.params.shipmentId);
    res.json({
      success: true,
      status: tracking.data?.current_status,
      tracking: tracking.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;