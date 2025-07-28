const express = require('express');
const { body, validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { validateLicensePlate, formatLicensePlate } = require('../utils/pricing');
const router = express.Router();

// @route   POST /api/vehicles
// @desc    Đăng ký xe mới
// @access  Private
router.post('/', auth, [
  body('licensePlate', 'Biển số xe không được để trống').notEmpty(),
  body('brand', 'Hãng xe không được để trống').notEmpty(),
  body('model', 'Dòng xe không được để trống').notEmpty(),
  body('color', 'Màu xe không được để trống').notEmpty(),
  body('vehicleType', 'Loại xe không hợp lệ').isIn(['car', 'motorcycle', 'truck', 'bus'])
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

    const { licensePlate, brand, model, color, vehicleType } = req.body;

    // Validate biển số xe
    if (!validateLicensePlate(licensePlate)) {
      return res.status(400).json({
        success: false,
        message: 'Biển số xe không đúng định dạng'
      });
    }

    const formattedLicensePlate = formatLicensePlate(licensePlate);

    // Kiểm tra biển số đã tồn tại
    const existingVehicle = await Vehicle.findOne({ 
      licensePlate: formattedLicensePlate 
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Biển số xe đã được đăng ký'
      });
    }

    // Tạo xe mới
    const vehicle = new Vehicle({
      licensePlate: formattedLicensePlate,
      brand,
      model,
      color,
      vehicleType,
      owner: req.user.id,
      isRegistered: true,
      registrationDate: Date.now()
    });

    await vehicle.save();

    // Cập nhật user
    await User.findByIdAndUpdate(req.user.id, {
      $push: { vehicles: vehicle._id }
    });

    res.json({
      success: true,
      message: 'Đăng ký xe thành công',
      data: vehicle
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/vehicles
// @desc    Lấy danh sách xe của user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ 
      owner: req.user.id,
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: vehicles
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/vehicles/:id
// @desc    Lấy thông tin chi tiết xe
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('lastParkingSession');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy xe'
      });
    }

    res.json({
      success: true,
      data: vehicle
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   PUT /api/vehicles/:id
// @desc    Cập nhật thông tin xe
// @access  Private
router.put('/:id', auth, [
  body('brand', 'Hãng xe không được để trống').notEmpty(),
  body('model', 'Dòng xe không được để trống').notEmpty(),
  body('color', 'Màu xe không được để trống').notEmpty(),
  body('vehicleType', 'Loại xe không hợp lệ').isIn(['car', 'motorcycle', 'truck', 'bus'])
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

    const { brand, model, color, vehicleType, notes } = req.body;

    const vehicle = await Vehicle.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id
      },
      {
        brand,
        model,
        color,
        vehicleType,
        notes
      },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy xe'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật xe thành công',
      data: vehicle
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   DELETE /api/vehicles/:id
// @desc    Xóa xe
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id
      },
      { isActive: false },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy xe'
      });
    }

    // Cập nhật user
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { vehicles: vehicle._id }
    });

    res.json({
      success: true,
      message: 'Xóa xe thành công'
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/vehicles/search/:licensePlate
// @desc    Tìm xe theo biển số
// @access  Public
router.get('/search/:licensePlate', async (req, res) => {
  try {
    const { licensePlate } = req.params;
    const formattedLicensePlate = formatLicensePlate(licensePlate);

    const vehicle = await Vehicle.findOne({
      licensePlate: formattedLicensePlate,
      isActive: true
    }).populate('owner', 'fullName phone');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy xe'
      });
    }

    res.json({
      success: true,
      data: vehicle
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/vehicles/validate/:licensePlate
// @desc    Validate biển số xe
// @access  Public
router.get('/validate/:licensePlate', async (req, res) => {
  try {
    const { licensePlate } = req.params;
    
    const isValid = validateLicensePlate(licensePlate);
    const formattedPlate = formatLicensePlate(licensePlate);

    res.json({
      success: true,
      data: {
        isValid,
        formattedPlate,
        originalPlate: licensePlate
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