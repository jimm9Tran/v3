const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Lấy thông tin profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('vehicles')
      .populate({
        path: 'parkingHistory',
        options: { sort: { createdAt: -1 }, limit: 5 }
      });

    res.json({
      success: true,
      data: user.getPublicProfile()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Cập nhật thông tin profile
// @access  Private
router.put('/profile', auth, [
  body('fullName', 'Họ tên không được để trống').notEmpty(),
  body('phone', 'Số điện thoại không hợp lệ').isMobilePhone('vi-VN')
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

    const { fullName, phone, avatar } = req.body;

    // Kiểm tra số điện thoại đã tồn tại
    const existingUser = await User.findOne({ 
      phone, 
      _id: { $ne: req.user.id } 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại đã được sử dụng'
      });
    }

    const user = await User.findById(req.user.id);
    user.fullName = fullName;
    user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: 'Cập nhật profile thành công',
      data: user.getPublicProfile()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   PUT /api/users/password
// @desc    Đổi mật khẩu
// @access  Private
router.put('/password', auth, [
  body('currentPassword', 'Mật khẩu hiện tại không được để trống').notEmpty(),
  body('newPassword', 'Mật khẩu mới phải có ít nhất 6 ký tự').isLength({ min: 6 })
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

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không chính xác'
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   POST /api/users/topup
// @desc    Nạp tiền vào ví
// @access  Private
router.post('/topup', auth, [
  body('amount', 'Số tiền phải lớn hơn 0').isFloat({ min: 1000 })
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

    const { amount } = req.body;

    const user = await User.findById(req.user.id);
    user.balance += amount;
    await user.save();

    res.json({
      success: true,
      message: 'Nạp tiền thành công',
      data: {
        newBalance: user.balance,
        topupAmount: amount
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

// @route   GET /api/users/history
// @desc    Lấy lịch sử gửi xe
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const sessions = await ParkingSession.find({ user: req.user.id })
      .populate('parkingLot', 'name')
      .populate('vehicle')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ParkingSession.countDocuments({ user: req.user.id });

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