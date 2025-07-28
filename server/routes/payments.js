const express = require('express');
const { body, validationResult } = require('express-validator');
const ParkingSession = require('../models/ParkingSession');
const User = require('../models/User');
const auth = require('../middleware/auth');
const QRCode = require('qrcode');
const { generatePaymentQRData } = require('../utils/pricing');

const router = express.Router();

// @route   POST /api/payments/create-qr
// @desc    Tạo mã QR thanh toán
// @access  Private
router.post('/create-qr', auth, [
  body('sessionId', 'Session ID không được để trống').notEmpty()
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

    const { sessionId } = req.body;

    const session = await ParkingSession.findOne({ sessionId })
      .populate('user', 'fullName phone')
      .populate('parkingLot', 'name');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiên gửi xe'
      });
    }

    // Tạo dữ liệu QR với thông tin chi tiết
    const qrData = {
      sessionId: session.sessionId,
      fee: session.fee,
      totalAmount: session.totalAmount || session.fee,
      licensePlate: session.detectedLicensePlate,
      parkingLot: session.parkingLot.name,
      discountAmount: session.discountAmount || 0,
      discountReason: session.discountReason || '',
      timestamp: Date.now()
    };

    // Tạo QR code
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    res.json({
      success: true,
      data: {
        qrCode,
        qrData,
        session: {
          sessionId: session.sessionId,
          fee: session.fee,
          totalAmount: session.totalAmount || session.fee,
          licensePlate: session.detectedLicensePlate,
          duration: session.duration,
          entryTime: session.entryTime,
          discountAmount: session.discountAmount || 0,
          discountReason: session.discountReason || ''
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

// @route   POST /api/payments/process
// @desc    Xử lý thanh toán
// @access  Public
router.post('/process', [
  body('sessionId', 'Session ID không được để trống').notEmpty(),
  body('paymentMethod', 'Phương thức thanh toán không hợp lệ').isIn(['qr', 'cash', 'card', 'wallet']),
  body('amount', 'Số tiền không được để trống').isNumeric()
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

    const { sessionId, paymentMethod, amount } = req.body;

    const session = await ParkingSession.findOne({ sessionId })
      .populate('user')
      .populate('parkingLot');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiên gửi xe'
      });
    }

    if (session.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Phiên gửi xe đã được thanh toán'
      });
    }

    // Kiểm tra số tiền
    if (amount < session.fee) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền thanh toán không đủ'
      });
    }

    // Cập nhật trạng thái thanh toán
    session.paymentStatus = 'paid';
    session.paymentMethod = paymentMethod;
    session.paymentId = `PAY${Date.now()}`;

    await session.save();

    // Cập nhật số dư user nếu thanh toán bằng ví
    if (paymentMethod === 'wallet' && session.user) {
      const user = await User.findById(session.user._id);
      if (user.balance >= amount) {
        user.balance -= amount;
        await user.save();
      }
    }

    res.json({
      success: true,
      message: 'Thanh toán thành công',
      data: {
        sessionId: session.sessionId,
        paymentId: session.paymentId,
        amount: session.fee,
        paymentMethod,
        shouldOpenBarrier: true
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

// @route   GET /api/payments/history
// @desc    Lấy lịch sử thanh toán
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const sessions = await ParkingSession.find({
      user: req.user.id,
      paymentStatus: 'paid'
    })
      .populate('parkingLot', 'name')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ParkingSession.countDocuments({
      user: req.user.id,
      paymentStatus: 'paid'
    });

    res.json({
      success: true,
      data: {
        sessions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
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