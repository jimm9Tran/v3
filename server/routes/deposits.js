const express = require('express');
const { body, validationResult } = require('express-validator');
const Deposit = require('../models/Deposit');
const User = require('../models/User');
const auth = require('../middleware/auth');
const payosService = require('../services/payosService');
const router = express.Router();

// @route   POST /api/deposits/create
// @desc    Tạo yêu cầu nạp tiền
// @access  Private
router.post('/create', auth, [
  body('amount', 'Số tiền không được để trống').isNumeric().isInt({ min: 10000 }),
  body('description', 'Mô tả không được để trống').notEmpty().isLength({ max: 200 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { amount, description } = req.body;

    // Tạo deposit record
    const deposit = new Deposit({
      userId: req.user.id,
      amount,
      description,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await deposit.save();

    // Tạo dữ liệu thanh toán PayOS
    const paymentData = payosService.createDepositPaymentData({
      userId: req.user.id,
      amount,
      description,
      returnUrl: `${process.env.CLIENT_URL}/deposit/success?orderCode=${deposit.orderCode}`,
      cancelUrl: `${process.env.CLIENT_URL}/deposit/cancel?orderCode=${deposit.orderCode}`
    });

    // Tạo URL thanh toán
    const payosResult = await payosService.createPaymentUrl(paymentData);

    if (!payosResult.success) {
      deposit.status = 'failed';
      deposit.failedReason = payosResult.error;
      await deposit.save();

      return res.status(400).json({
        success: false,
        message: 'Không thể tạo thanh toán',
        error: payosResult.error
      });
    }

    // Cập nhật thông tin PayOS
    deposit.payosPaymentUrl = payosResult.data.paymentUrl;
    deposit.payosQrCode = payosResult.data.qrCode;
    deposit.payosDeepLink = payosResult.data.deepLink;
    await deposit.save();

    res.json({
      success: true,
      message: 'Tạo yêu cầu nạp tiền thành công',
      data: {
        depositId: deposit._id,
        orderCode: deposit.orderCode,
        amount: deposit.amount,
        paymentUrl: payosResult.data.paymentUrl,
        qrCode: payosResult.data.qrCode,
        deepLink: payosResult.data.deepLink,
        status: deposit.status
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

// @route   GET /api/deposits
// @desc    Lấy danh sách nạp tiền của user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { userId: req.user.id };
    if (status) {
      query.status = status;
    }

    const deposits = await Deposit.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'fullName email');

    const total = await Deposit.countDocuments(query);

    res.json({
      success: true,
      data: {
        deposits,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
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

// @route   GET /api/deposits/:id
// @desc    Lấy chi tiết nạp tiền
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const deposit = await Deposit.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('userId', 'fullName email');

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch nạp tiền'
      });
    }

    res.json({
      success: true,
      data: deposit
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   POST /api/deposits/cancel/:orderCode
// @desc    Hủy yêu cầu nạp tiền
// @access  Private
router.post('/cancel/:orderCode', auth, async (req, res) => {
  try {
    const { orderCode } = req.params;

    const deposit = await Deposit.findOne({
      orderCode,
      userId: req.user.id
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch nạp tiền'
      });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy giao dịch đã hoàn thành'
      });
    }

    // Hủy giao dịch trên PayOS
    const cancelResult = await payosService.cancelTransaction(orderCode);

    // Cập nhật trạng thái
    deposit.status = 'cancelled';
    await deposit.save();

    res.json({
      success: true,
      message: 'Hủy giao dịch thành công',
      data: {
        orderCode: deposit.orderCode,
        status: deposit.status
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

// @route   POST /api/deposits/webhook
// @desc    Webhook từ PayOS
// @access  Public
router.post('/webhook', async (req, res) => {
  try {
    const webhookData = req.body;

    // Xác thực webhook
    if (!payosService.verifyWebhook(webhookData)) {
      return res.status(400).json({
        success: false,
        message: 'Webhook không hợp lệ'
      });
    }

    const { orderCode, status, transactionId } = webhookData;

    // Tìm deposit
    const deposit = await Deposit.findOne({ orderCode });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    // Cập nhật trạng thái
    if (status === 'PAID') {
      deposit.status = 'completed';
      deposit.payosTransactionId = transactionId;
      deposit.webhookData = webhookData;

      // Cộng tiền vào tài khoản user
      const user = await User.findById(deposit.userId);
      if (user) {
        user.balance += deposit.amount;
        await user.save();
      }

    } else if (status === 'CANCELLED') {
      deposit.status = 'cancelled';
      deposit.webhookData = webhookData;
    } else if (status === 'FAILED') {
      deposit.status = 'failed';
      deposit.failedReason = webhookData.reason || 'Thanh toán thất bại';
      deposit.webhookData = webhookData;
    }

    await deposit.save();

    res.json({
      success: true,
      message: 'Webhook xử lý thành công'
    });

  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi xử lý webhook'
    });
  }
});

// @route   GET /api/deposits/check/:orderCode
// @desc    Kiểm tra trạng thái giao dịch
// @access  Private
router.get('/check/:orderCode', auth, async (req, res) => {
  try {
    const { orderCode } = req.params;

    const deposit = await Deposit.findOne({
      orderCode,
      userId: req.user.id
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    // Kiểm tra trạng thái trên PayOS
    const transactionInfo = await payosService.getTransactionInfo(orderCode);

    res.json({
      success: true,
      data: {
        deposit,
        payosStatus: transactionInfo.success ? transactionInfo.data.status : null
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