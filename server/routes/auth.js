const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Đăng ký tài khoản mới
// @access  Public
router.post('/register', [
  body('username', 'Tên đăng nhập phải có ít nhất 3 ký tự').isLength({ min: 3 }),
  body('email', 'Email không hợp lệ').isEmail(),
  body('password', 'Mật khẩu phải có ít nhất 6 ký tự').isLength({ min: 6 }),
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

    const { username, email, password, fullName, phone } = req.body;

    // Kiểm tra username đã tồn tại
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập đã tồn tại'
      });
    }

    // Kiểm tra email đã tồn tại
    user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Kiểm tra số điện thoại đã tồn tại
    user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại đã được sử dụng'
      });
    }

    // Tạo user mới
    user = new User({
      username,
      email,
      password,
      fullName,
      phone
    });

    await user.save();

    // Tạo JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          message: 'Đăng ký thành công',
          token,
          user: user.getPublicProfile()
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Đăng nhập
// @access  Public
router.post('/login', [
  body('username', 'Tên đăng nhập không được để trống').notEmpty(),
  body('password', 'Mật khẩu không được để trống').notEmpty()
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

    const { username, password } = req.body;

    // Kiểm tra user tồn tại
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }]
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Thông tin đăng nhập không chính xác'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản đã bị khóa'
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Thông tin đăng nhập không chính xác'
      });
    }

    // Cập nhật lastLogin
    user.lastLogin = Date.now();
    await user.save();

    // Tạo JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          message: 'Đăng nhập thành công',
          token,
          user: user.getPublicProfile()
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Lấy thông tin user hiện tại
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('vehicles')
      .populate({
        path: 'parkingHistory',
        options: { sort: { createdAt: -1 }, limit: 10 }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Làm mới token
// @access  Private
router.post('/refresh', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router; 