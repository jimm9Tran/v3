const express = require('express');
const payosService = require('../services/payosService');
const router = express.Router();

// @route   GET /api/test-payos/health
// @desc    Kiểm tra kết nối PayOS
// @access  Public
router.get('/health', async (req, res) => {
  try {
    const config = {
      clientId: process.env.PAYOS_CLIENT_ID,
      apiKey: process.env.PAYOS_API_KEY,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY,
      baseUrl: process.env.PAYOS_BASE_URL
    };

    res.json({
      success: true,
      message: 'PayOS Configuration',
      data: {
        clientId: config.clientId ? '✅ Configured' : '❌ Not configured',
        apiKey: config.apiKey ? '✅ Configured' : '❌ Not configured',
        checksumKey: config.checksumKey ? '✅ Configured' : '❌ Not configured',
        baseUrl: config.baseUrl || 'https://api-merchant.payos.vn'
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   POST /api/test-payos/create-payment
// @desc    Test tạo thanh toán PayOS
// @access  Public
router.post('/create-payment', async (req, res) => {
  try {
    const { amount = 10000, description = 'Test payment' } = req.body;

    const paymentData = payosService.createDepositPaymentData({
      userId: 'test_user',
      amount,
      description,
      returnUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel'
    });

    const result = await payosService.createPaymentUrl(paymentData);

    res.json({
      success: true,
      message: 'Test PayOS Payment',
      data: {
        paymentData,
        result
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router; 