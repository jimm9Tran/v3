const express = require('express');
const { body, validationResult } = require('express-validator');
const ParkingSession = require('../models/ParkingSession');
const Vehicle = require('../models/Vehicle');
const ParkingLot = require('../models/ParkingLot');
const User = require('../models/User');
const auth = require('../middleware/auth');
// Import Socket.IO middleware
const socketMiddleware = require('../middleware/socket');
const { 
  calculateTotalFee, 
  validateLicensePlate, 
  formatLicensePlate 
} = require('../utils/pricing');

const router = express.Router();

// @route   POST /api/parking/entry
// @desc    Xe vào bãi
// @access  Public (IoT device)
router.post('/entry', [
  body('licensePlate', 'Biển số xe không được để trống').notEmpty(),
  body('parkingLotId', 'ID bãi xe không được để trống').notEmpty(),
  body('entryImage', 'Ảnh xe vào không được để trống').notEmpty(),
  body('barrierId', 'ID barrier không được để trống').notEmpty()
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

    const { licensePlate, parkingLotId, entryImage, barrierId } = req.body;

    // Kiểm tra bãi xe tồn tại
    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot || !parkingLot.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Bãi xe không tồn tại hoặc đã đóng'
      });
    }

    // Kiểm tra xe đã có phiên gửi xe đang hoạt động
    const activeSession = await ParkingSession.findOne({
      detectedLicensePlate: licensePlate.toUpperCase(),
      status: 'active'
    });

    if (activeSession) {
      return res.status(400).json({
        success: false,
        message: 'Xe này đã có phiên gửi xe đang hoạt động'
      });
    }

    // Tìm xe trong database
    let vehicle = await Vehicle.findOne({ 
      licensePlate: licensePlate.toUpperCase() 
    }).populate('owner');

    let isRegisteredVehicle = false;
    let userId = null;
    let vehicleId = null;

    if (vehicle && vehicle.isActive) {
      isRegisteredVehicle = true;
      userId = vehicle.owner._id;
      vehicleId = vehicle._id;
    }

    // Tạo phiên gửi xe mới
    const parkingSession = new ParkingSession({
      sessionId: `SESS${Date.now()}`,
      vehicle: vehicleId,
      user: userId,
      parkingLot: parkingLotId,
      entryImage,
      detectedLicensePlate: licensePlate.toUpperCase(),
      barrierEntry: barrierId,
      isRegisteredVehicle,
      tempTicketNumber: !isRegisteredVehicle ? `TEMP${Date.now()}` : null
    });

    await parkingSession.save();

    // Cập nhật số chỗ trống
    await parkingLot.updateAvailableSpaces();

    // Emit socket event
    const io = socketMiddleware.getIO();
    if (io) {
      io.to(`parking-lot-${parkingLotId}`).emit('vehicle-entered', {
        sessionId: parkingSession.sessionId,
        licensePlate: licensePlate.toUpperCase(),
        isRegisteredVehicle,
        entryTime: parkingSession.entryTime,
        availableSpaces: parkingLot.availableSpaces
      });
    }

    res.json({
      success: true,
      message: isRegisteredVehicle ? 'Xe đã đăng ký - Mở barrier' : 'Xe chưa đăng ký - Cấp vé tạm',
      data: {
        sessionId: parkingSession.sessionId,
        isRegisteredVehicle,
        tempTicketNumber: parkingSession.tempTicketNumber,
        shouldOpenBarrier: isRegisteredVehicle
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

// @route   POST /api/parking/exit
// @desc    Xe ra bãi
// @access  Public (IoT device)
router.post('/exit', [
  body('licensePlate', 'Biển số xe không được để trống').notEmpty(),
  body('parkingLotId', 'ID bãi xe không được để trống').notEmpty(),
  body('exitImage', 'Ảnh xe ra không được để trống').notEmpty(),
  body('barrierId', 'ID barrier không được để trống').notEmpty()
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

    const { licensePlate, parkingLotId, exitImage, barrierId } = req.body;

    // Tìm phiên gửi xe đang hoạt động
    const parkingSession = await ParkingSession.findOne({
      detectedLicensePlate: licensePlate.toUpperCase(),
      status: 'active'
    }).populate('vehicle user parkingLot');

    if (!parkingSession) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy phiên gửi xe cho xe này'
      });
    }

    // Cập nhật thông tin ra
    parkingSession.exitTime = Date.now();
    parkingSession.exitImage = exitImage;
    parkingSession.barrierExit = barrierId;
    parkingSession.status = 'completed';

    // Tính phí chi tiết
    const duration = Math.ceil((parkingSession.exitTime - parkingSession.entryTime) / (1000 * 60));
    parkingSession.duration = duration;
    
    // Tính phí với utility function
    const feeInfo = calculateTotalFee(parkingSession, parkingSession.parkingLot);
    
    parkingSession.fee = feeInfo.fee;
    parkingSession.hourlyRate = feeInfo.hourlyRate;
    parkingSession.dailyRate = feeInfo.dailyRate;
    parkingSession.lateFee = feeInfo.lateFee;
    parkingSession.discountAmount = feeInfo.discountAmount;
    parkingSession.discountReason = feeInfo.discountReason;
    parkingSession.totalAmount = feeInfo.totalAmount;

    await parkingSession.save();

    // Cập nhật thống kê xe
    if (parkingSession.vehicle) {
      const vehicle = await Vehicle.findById(parkingSession.vehicle);
      if (vehicle) {
        vehicle.totalParkingTime += duration;
        vehicle.totalFees += parkingSession.totalAmount;
        vehicle.lastParkingSession = parkingSession._id;
        await vehicle.save();
      }
    }

    // Cập nhật số chỗ trống
    const parkingLot = await ParkingLot.findById(parkingLotId);
    await parkingLot.updateAvailableSpaces();

    // Emit socket event
    io.to(`parking-lot-${parkingLotId}`).emit('vehicle-exited', {
      sessionId: parkingSession.sessionId,
      licensePlate: licensePlate.toUpperCase(),
      duration,
      fee: parkingSession.fee,
      availableSpaces: parkingLot.availableSpaces
    });

    res.json({
      success: true,
      message: 'Xe đã ra bãi',
      data: {
        sessionId: parkingSession.sessionId,
        duration,
        fee: parkingSession.fee,
        totalAmount: parkingSession.totalAmount,
        discountAmount: parkingSession.discountAmount,
        discountReason: parkingSession.discountReason,
        paymentStatus: parkingSession.paymentStatus,
        feeBreakdown: feeInfo.breakdown
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

// @route   GET /api/parking/sessions
// @desc    Lấy danh sách phiên gửi xe
// @access  Private
router.get('/sessions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, parkingLotId } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (parkingLotId) query.parkingLot = parkingLotId;

    const sessions = await ParkingSession.find(query)
      .populate('vehicle')
      .populate('user', 'fullName phone')
      .populate('parkingLot', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ParkingSession.countDocuments(query);

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

// @route   GET /api/parking/sessions/:id
// @desc    Lấy chi tiết phiên gửi xe
// @access  Private
router.get('/sessions/:id', auth, async (req, res) => {
  try {
    const session = await ParkingSession.findById(req.params.id)
      .populate('vehicle')
      .populate('user', 'fullName phone email')
      .populate('parkingLot', 'name address');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiên gửi xe'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/parking/active
// @desc    Lấy danh sách xe đang gửi
// @access  Private
router.get('/active', auth, async (req, res) => {
  try {
    const { parkingLotId } = req.query;
    
    const query = { status: 'active' };
    if (parkingLotId) query.parkingLot = parkingLotId;

    const activeSessions = await ParkingSession.find(query)
      .populate('vehicle')
      .populate('user', 'fullName phone')
      .populate('parkingLot', 'name')
      .sort({ entryTime: -1 });

    res.json({
      success: true,
      data: activeSessions
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