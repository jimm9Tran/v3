const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const ParkingLot = require('../models/ParkingLot');
const ParkingSession = require('../models/ParkingSession');
const Vehicle = require('../models/Vehicle');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware kiểm tra quyền admin
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập'
    });
  }
  next();
};

// @route   GET /api/admin/dashboard
// @desc    Lấy thống kê dashboard
// @access  Private (Admin)
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalVehicles,
      activeSessions,
      todaySessions,
      todayRevenue,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      Vehicle.countDocuments(),
      ParkingSession.countDocuments({ status: 'active' }),
      ParkingSession.countDocuments({ 
        createdAt: { $gte: today } 
      }),
      ParkingSession.aggregate([
        { $match: { 
          createdAt: { $gte: today },
          paymentStatus: 'paid'
        }},
        { $group: { _id: null, total: { $sum: '$fee' }}}
      ]),
      ParkingSession.aggregate([
        { $match: { paymentStatus: 'paid' }},
        { $group: { _id: null, total: { $sum: '$fee' }}}
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalVehicles,
        activeSessions,
        todaySessions,
        todayRevenue: todayRevenue[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0
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

// @route   GET /api/admin/users
// @desc    Lấy danh sách users
// @access  Private (Admin)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' }},
        { email: { $regex: search, $options: 'i' }},
        { phone: { $regex: search, $options: 'i' }}
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
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

// @route   PUT /api/admin/users/:id/status
// @desc    Cập nhật trạng thái user
// @access  Private (Admin)
router.put('/users/:id/status', auth, adminAuth, [
  body('isActive', 'Trạng thái không hợp lệ').isBoolean()
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

    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: user
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/admin/reports/revenue
// @desc    Báo cáo doanh thu
// @access  Private (Admin)
router.get('/reports/revenue', auth, adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const matchStage = { paymentStatus: 'paid' };
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const groupStage = {};
    if (groupBy === 'day') {
      groupStage._id = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }};
    } else if (groupBy === 'month') {
      groupStage._id = { $dateToString: { format: '%Y-%m', date: '$createdAt' }};
    }

    const revenue = await ParkingSession.aggregate([
      { $match: matchStage },
      { $group: {
        _id: groupStage._id,
        totalRevenue: { $sum: '$fee' },
        totalSessions: { $sum: 1 }
      }},
      { $sort: { _id: 1 }}
    ]);

    res.json({
      success: true,
      data: revenue
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/admin/reports/parking-lots
// @desc    Báo cáo bãi xe
// @access  Private (Admin)
router.get('/reports/parking-lots', auth, adminAuth, async (req, res) => {
  try {
    const parkingLots = await ParkingLot.find()
      .populate('manager', 'fullName')
      .populate('staff', 'fullName');

    const reports = await Promise.all(
      parkingLots.map(async (lot) => {
        const activeSessions = await ParkingSession.countDocuments({
          parkingLot: lot._id,
          status: 'active'
        });

        const todaySessions = await ParkingSession.countDocuments({
          parkingLot: lot._id,
          createdAt: { 
            $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
          }
        });

        const todayRevenue = await ParkingSession.aggregate([
          { $match: {
            parkingLot: lot._id,
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            paymentStatus: 'paid'
          }},
          { $group: { _id: null, total: { $sum: '$fee' }}}
        ]);

        return {
          ...lot.toObject(),
          activeSessions,
          todaySessions,
          todayRevenue: todayRevenue[0]?.total || 0,
          occupancyRate: lot.getOccupancyRate()
        };
      })
    );

    res.json({
      success: true,
      data: reports
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