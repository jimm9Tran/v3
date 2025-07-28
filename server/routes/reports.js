const express = require('express');
const { body, validationResult } = require('express-validator');
const ParkingSession = require('../models/ParkingSession');
const Vehicle = require('../models/Vehicle');
const ParkingLot = require('../models/ParkingLot');
const User = require('../models/User');
const auth = require('../middleware/auth');
const moment = require('moment');
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

// @route   GET /api/reports/revenue
// @desc    Báo cáo doanh thu
// @access  Private (Admin)
router.get('/revenue', auth, adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, parkingLotId } = req.query;
    
    let query = { status: 'completed' };
    
    if (startDate && endDate) {
      query.entryTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (parkingLotId) {
      query.parkingLot = parkingLotId;
    }

    const sessions = await ParkingSession.find(query)
      .populate('parkingLot', 'name')
      .sort({ entryTime: -1 });

    // Tính toán thống kê
    const totalRevenue = sessions.reduce((sum, session) => sum + (session.totalAmount || session.fee), 0);
    const totalSessions = sessions.length;
    const averageFee = totalSessions > 0 ? totalRevenue / totalSessions : 0;
    
    // Thống kê theo ngày
    const dailyStats = {};
    sessions.forEach(session => {
      const date = moment(session.entryTime).format('YYYY-MM-DD');
      if (!dailyStats[date]) {
        dailyStats[date] = {
          revenue: 0,
          sessions: 0,
          vehicles: new Set()
        };
      }
      dailyStats[date].revenue += session.totalAmount || session.fee;
      dailyStats[date].sessions += 1;
      dailyStats[date].vehicles.add(session.detectedLicensePlate);
    });

    // Chuyển đổi Set thành số lượng
    Object.keys(dailyStats).forEach(date => {
      dailyStats[date].uniqueVehicles = dailyStats[date].vehicles.size;
      delete dailyStats[date].vehicles;
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue: Math.round(totalRevenue),
          totalSessions,
          averageFee: Math.round(averageFee),
          period: {
            start: startDate || moment().subtract(30, 'days').format('YYYY-MM-DD'),
            end: endDate || moment().format('YYYY-MM-DD')
          }
        },
        dailyStats,
        sessions: sessions.slice(0, 100) // Giới hạn 100 session gần nhất
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

// @route   GET /api/reports/vehicles
// @desc    Báo cáo thống kê xe
// @access  Private (Admin)
router.get('/vehicles', auth, adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { isActive: true };
    
    if (startDate && endDate) {
      query.registrationDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const vehicles = await Vehicle.find(query)
      .populate('owner', 'fullName phone')
      .sort({ registrationDate: -1 });

    // Thống kê theo loại xe
    const vehicleTypeStats = {};
    vehicles.forEach(vehicle => {
      if (!vehicleTypeStats[vehicle.vehicleType]) {
        vehicleTypeStats[vehicle.vehicleType] = 0;
      }
      vehicleTypeStats[vehicle.vehicleType]++;
    });

    // Thống kê theo hãng xe
    const brandStats = {};
    vehicles.forEach(vehicle => {
      if (!brandStats[vehicle.brand]) {
        brandStats[vehicle.brand] = 0;
      }
      brandStats[vehicle.brand]++;
    });

    res.json({
      success: true,
      data: {
        totalVehicles: vehicles.length,
        vehicleTypeStats,
        brandStats,
        vehicles: vehicles.slice(0, 100) // Giới hạn 100 xe gần nhất
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

// @route   GET /api/reports/parking-lots
// @desc    Báo cáo thống kê bãi xe
// @access  Private (Admin)
router.get('/parking-lots', auth, adminAuth, async (req, res) => {
  try {
    const parkingLots = await ParkingLot.find({ isActive: true });
    
    const lotStats = await Promise.all(parkingLots.map(async (lot) => {
      const activeSessions = await ParkingSession.countDocuments({
        parkingLot: lot._id,
        status: 'active'
      });

      const completedSessions = await ParkingSession.countDocuments({
        parkingLot: lot._id,
        status: 'completed'
      });

      const totalRevenue = await ParkingSession.aggregate([
        {
          $match: {
            parkingLot: lot._id,
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ['$totalAmount', '$fee'] } }
          }
        }
      ]);

      return {
        lotId: lot._id,
        lotName: lot.name,
        totalSpaces: lot.totalSpaces,
        availableSpaces: lot.availableSpaces,
        occupancyRate: lot.getOccupancyRate(),
        activeSessions,
        completedSessions,
        totalRevenue: totalRevenue[0]?.total || 0
      };
    }));

    res.json({
      success: true,
      data: lotStats
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/reports/user/:userId
// @desc    Báo cáo thống kê user
// @access  Private (Admin)
router.get('/user/:userId', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    let query = { user: userId };
    if (startDate && endDate) {
      query.entryTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sessions = await ParkingSession.find(query)
      .populate('parkingLot', 'name')
      .sort({ entryTime: -1 });

    const vehicles = await Vehicle.find({ owner: userId, isActive: true });

    const totalSpent = sessions.reduce((sum, session) => sum + (session.totalAmount || session.fee), 0);
    const totalTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          balance: user.balance,
          role: user.role
        },
        statistics: {
          totalSessions: sessions.length,
          totalSpent: Math.round(totalSpent),
          totalTime: Math.round(totalTime / 60), // Chuyển về giờ
          averageSessionTime: sessions.length > 0 ? Math.round(totalTime / sessions.length / 60) : 0,
          averageSessionCost: sessions.length > 0 ? Math.round(totalSpent / sessions.length) : 0,
          totalVehicles: vehicles.length
        },
        sessions: sessions.slice(0, 50),
        vehicles
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

// @route   GET /api/reports/export
// @desc    Xuất báo cáo Excel
// @access  Private (Admin)
router.get('/export', auth, adminAuth, async (req, res) => {
  try {
    const { type, startDate, endDate, parkingLotId } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.entryTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (parkingLotId) {
      query.parkingLot = parkingLotId;
    }

    let data = [];
    
    switch (type) {
      case 'sessions':
        data = await ParkingSession.find(query)
          .populate('parkingLot', 'name')
          .populate('user', 'fullName phone')
          .sort({ entryTime: -1 });
        break;
        
      case 'vehicles':
        data = await Vehicle.find({ isActive: true })
          .populate('owner', 'fullName phone')
          .sort({ registrationDate: -1 });
        break;
        
      case 'revenue':
        data = await ParkingSession.find({ ...query, status: 'completed' })
          .populate('parkingLot', 'name')
          .sort({ entryTime: -1 });
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Loại báo cáo không hợp lệ'
        });
    }

    // Tạo CSV data
    const csvData = data.map(item => {
      if (type === 'sessions') {
        return {
          sessionId: item.sessionId,
          licensePlate: item.detectedLicensePlate,
          entryTime: moment(item.entryTime).format('YYYY-MM-DD HH:mm:ss'),
          exitTime: item.exitTime ? moment(item.exitTime).format('YYYY-MM-DD HH:mm:ss') : '',
          duration: item.duration,
          fee: item.fee,
          totalAmount: item.totalAmount,
          paymentStatus: item.paymentStatus,
          parkingLot: item.parkingLot?.name || '',
          user: item.user?.fullName || ''
        };
      } else if (type === 'vehicles') {
        return {
          licensePlate: item.licensePlate,
          brand: item.brand,
          model: item.model,
          color: item.color,
          vehicleType: item.vehicleType,
          owner: item.owner?.fullName || '',
          registrationDate: moment(item.registrationDate).format('YYYY-MM-DD'),
          totalParkingTime: item.totalParkingTime,
          totalFees: item.totalFees
        };
      }
      return item;
    });

    res.json({
      success: true,
      data: {
        type,
        totalRecords: data.length,
        csvData,
        period: {
          start: startDate || moment().subtract(30, 'days').format('YYYY-MM-DD'),
          end: endDate || moment().format('YYYY-MM-DD')
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

module.exports = router; 