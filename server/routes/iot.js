const express = require('express');
const { body, validationResult } = require('express-validator');
const ParkingLot = require('../models/ParkingLot');
// Import Socket.IO middleware
const socketMiddleware = require('../middleware/socket');

// Tạo model RFIDData nếu chưa có
const mongoose = require('mongoose');

const rfidDataSchema = new mongoose.Schema({
  reader_id: {
    type: Number,
    required: true,
    enum: [1, 2] // Chỉ cho phép reader 1 hoặc 2
  },
  card_id: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Number,
    required: true
  },
  device_id: {
    type: String,
    required: true,
    default: 'ESP32_RFID_System'
  },
  parking_lot_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes cho RFID data
rfidDataSchema.index({ reader_id: 1 });
rfidDataSchema.index({ card_id: 1 });
rfidDataSchema.index({ created_at: 1 });
rfidDataSchema.index({ parking_lot_id: 1 });

const RFIDData = mongoose.model('RFIDData', rfidDataSchema);

const router = express.Router();

// @route   POST /api/iot/barrier-control
// @desc    Điều khiển barrier
// @access  Public (IoT device)
router.post('/barrier-control', [
  body('parkingLotId', 'ID bãi xe không được để trống').notEmpty(),
  body('barrierId', 'ID barrier không được để trống').notEmpty(),
  body('action', 'Hành động không hợp lệ').isIn(['open', 'close'])
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

    const { parkingLotId, barrierId, action } = req.body;

    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bãi xe'
      });
    }

    // Cập nhật trạng thái barrier
    const barrier = parkingLot.barriers.find(b => b.id === barrierId);
    if (!barrier) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy barrier'
      });
    }

    barrier.status = action === 'open' ? 'open' : 'closed';
    await parkingLot.save();

    // Emit socket event
    const io = socketMiddleware.getIO();
    if (io) {
      io.to(`parking-lot-${parkingLotId}`).emit('barrier-updated', {
        barrierId,
        action,
        status: barrier.status,
        timestamp: Date.now()
      });
    }

    res.json({
      success: true,
      message: `Barrier ${action} thành công`,
      data: {
        barrierId,
        status: barrier.status
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

// @route   GET /api/iot/parking-lot/:id/status
// @desc    Lấy trạng thái bãi xe
// @access  Public (IoT device)
router.get('/parking-lot/:id/status', async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);
    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bãi xe'
      });
    }

    // Cập nhật số chỗ trống
    await parkingLot.updateAvailableSpaces();

    res.json({
      success: true,
      data: {
        id: parkingLot._id,
        name: parkingLot.name,
        totalSpaces: parkingLot.totalSpaces,
        availableSpaces: parkingLot.availableSpaces,
        occupancyRate: parkingLot.getOccupancyRate(),
        barriers: parkingLot.barriers,
        isActive: parkingLot.isActive
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

// @route   POST /api/iot/camera-status
// @desc    Cập nhật trạng thái camera
// @access  Public (IoT device)
router.post('/camera-status', [
  body('parkingLotId', 'ID bãi xe không được để trống').notEmpty(),
  body('cameraId', 'ID camera không được để trống').notEmpty(),
  body('isActive', 'Trạng thái camera không hợp lệ').isBoolean()
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

    const { parkingLotId, cameraId, isActive } = req.body;

    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bãi xe'
      });
    }

    // Cập nhật trạng thái camera
    const camera = parkingLot.cameras.find(c => c.id === cameraId);
    if (!camera) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy camera'
      });
    }

    camera.isActive = isActive;
    if (!isActive) {
      camera.lastMaintenance = Date.now();
    }

    await parkingLot.save();

    res.json({
      success: true,
      message: `Camera ${isActive ? 'hoạt động' : 'bảo trì'} thành công`,
      data: {
        cameraId,
        isActive: camera.isActive
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

// @route   POST /api/iot/rfid-data
// @desc    Nhận dữ liệu RFID từ ESP32
// @access  Public (IoT device)
router.post('/rfid-data', [
  body('reader_id', 'Reader ID không được để trống').isInt({ min: 1, max: 2 }),
  body('card_id', 'Card ID không được để trống').notEmpty(),
  body('timestamp', 'Timestamp không được để trống').isNumeric(),
  body('device_id', 'Device ID không được để trống').notEmpty()
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

    const { reader_id, card_id, timestamp, device_id, parking_lot_id } = req.body;

    // Tạo record mới
    const newRFIDData = new RFIDData({
      reader_id,
      card_id,
      timestamp,
      device_id,
      parking_lot_id
    });

    await newRFIDData.save();

    // Log để debug
    console.log(`RFID Data received: Reader ${reader_id}, Card ${card_id}`);

    // Emit socket event cho real-time updates
    const io = socketMiddleware.getIO();
    if (io) {
      io.emit('rfid-data-received', {
        reader_id,
        card_id,
        timestamp,
        device_id,
        parking_lot_id
      });
    }

    res.status(200).json({
      success: true,
      message: 'RFID data saved successfully',
      data: {
        id: newRFIDData._id,
        reader_id: newRFIDData.reader_id,
        card_id: newRFIDData.card_id,
        timestamp: newRFIDData.timestamp
      }
    });

  } catch (error) {
    console.error('Error saving RFID data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   GET /api/iot/rfid-data
// @desc    Lấy dữ liệu RFID
// @access  Private
router.get('/rfid-data', async (req, res) => {
  try {
    const { reader_id, limit = 100, page = 1, parking_lot_id } = req.query;
    
    let query = {};
    if (reader_id) {
      query.reader_id = parseInt(reader_id);
    }
    if (parking_lot_id) {
      query.parking_lot_id = parking_lot_id;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const rfidData = await RFIDData.find(query)
      .populate('parking_lot_id', 'name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await RFIDData.countDocuments(query);
    
    res.json({
      success: true,
      data: rfidData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Error fetching RFID data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   GET /api/iot/rfid-stats
// @desc    Lấy thống kê RFID
// @access  Private
router.get('/rfid-stats', async (req, res) => {
  try {
    const { reader_id, days = 7, parking_lot_id } = req.query;
    
    let matchQuery = {};
    if (reader_id) {
      matchQuery.reader_id = parseInt(reader_id);
    }
    if (parking_lot_id) {
      matchQuery.parking_lot_id = mongoose.Types.ObjectId(parking_lot_id);
    }
    
    // Thống kê theo ngày
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(days));
    matchQuery.created_at = { $gte: dateFilter };
    
    const stats = await RFIDData.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            reader_id: '$reader_id',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } }
          },
          count: { $sum: 1 },
          unique_cards: { $addToSet: '$card_id' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          readers: {
            $push: {
              reader_id: '$_id.reader_id',
              count: '$count',
              unique_cards: { $size: '$unique_cards' }
            }
          },
          total_count: { $sum: '$count' },
          total_unique_cards: { $addToSet: '$unique_cards' }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching RFID stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   GET /api/iot/rfid-health
// @desc    Health check cho RFID system
// @access  Public
router.get('/rfid-health', async (req, res) => {
  try {
    const totalRecords = await RFIDData.countDocuments();
    const todayRecords = await RFIDData.countDocuments({
      created_at: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    
    res.json({
      success: true,
      message: 'RFID API is running',
      data: {
        total_records: totalRecords,
        today_records: todayRecords,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'RFID API error',
      error: error.message
    });
  }
});

// @route   POST /api/iot/rfid-alpr-integration
// @desc    Xử lý RFID + ALPR integration
// @access  Public (IoT device)
router.post('/rfid-alpr-integration', [
  body('reader_id', 'Reader ID không được để trống').isInt({ min: 1, max: 2 }),
  body('card_id', 'Card ID không được để trống').notEmpty(),
  body('device_id', 'Device ID không được để trống').notEmpty(),
  body('parking_lot_id', 'Parking lot ID không được để trống').notEmpty(),
  body('entry_image', 'Entry image không được để trống').notEmpty(),
  body('barrier_id', 'Barrier ID không được để trống').notEmpty()
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

    const { 
      reader_id, 
      card_id, 
      device_id, 
      parking_lot_id, 
      entry_image, 
      barrier_id 
    } = req.body;

    const timestamp = Date.now();

    // 1. Lưu RFID data
    const newRFIDData = new RFIDData({
      reader_id,
      card_id,
      timestamp,
      device_id,
      parking_lot_id
    });

    await newRFIDData.save();

        // 2. Gọi ALPR service để nhận diện biển số
    const axios = require('axios');
    const FormData = require('form-data');
    
    const formData = new FormData();
    const imageBuffer = Buffer.from(entry_image, 'base64');
    formData.append('image', imageBuffer, {
      filename: 'entry_image.jpg',
      contentType: 'image/jpeg'
    });
    formData.append('parkingLotId', parking_lot_id);
    formData.append('barrierId', barrier_id);
    
    let alprResult;
    try {
      const alprResponse = await axios.post('http://192.168.102.3:5001/api/detect', formData, {
        headers: {
          ...formData.getHeaders()
        }
      });
      alprResult = alprResponse.data;
    } catch (error) {
      // Nếu có lỗi nhưng vẫn có dữ liệu biển số, sử dụng dữ liệu đó
      if (error.response && error.response.data && error.response.data.license_plate) {
        alprResult = error.response.data;
        console.log('ALPR detected license plate despite error:', error.response.data);
      } else {
        return res.status(500).json({
          success: false,
          message: 'ALPR service không khả dụng',
          rfid_saved: true,
          alpr_error: true
        });
      }
    }

    // Kiểm tra xem ALPR có nhận diện được biển số không
    if (!alprResult.success && !alprResult.license_plate) {
      return res.status(400).json({
        success: false,
        message: 'Không thể nhận diện biển số xe',
        rfid_saved: true,
        alpr_error: true,
        alpr_message: alprResult.error
      });
    }
    
    // Nếu ALPR nhận diện được biển số nhưng có lỗi khác, vẫn tiếp tục
    if (!alprResult.success && alprResult.license_plate) {
      console.log('ALPR detected license plate but had other errors:', alprResult.error);
    }

    // 3. Xử lý parking entry với biển số đã nhận diện
    const parkingEntryResponse = await axios.post(`http://192.168.102.3:8080/api/parking/entry`, {
      licensePlate: alprResult.license_plate,
      parkingLotId: parking_lot_id,
      entryImage: entry_image,
      barrierId: barrier_id,
      detectionConfidence: alprResult.confidence
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const parkingResult = parkingEntryResponse.data;

    // 4. Emit socket events
    const io = socketMiddleware.getIO();
    if (io) {
      // Emit RFID event
      io.emit('rfid-data-received', {
        reader_id,
        card_id,
        timestamp,
        device_id,
        parking_lot_id
      });

      // Emit ALPR event
      io.emit('alpr-detection-completed', {
        license_plate: alprResult.license_plate,
        confidence: alprResult.confidence,
        rfid_card: card_id,
        reader_id,
        timestamp
      });

      // Emit parking event
      if (parkingResult.success) {
        io.emit('parking-entry-completed', {
          sessionId: parkingResult.data.sessionId,
          licensePlate: alprResult.license_plate,
          isRegisteredVehicle: parkingResult.data.isRegisteredVehicle,
          shouldOpenBarrier: parkingResult.data.shouldOpenBarrier,
          rfid_card: card_id
        });
      }
    }

    // 5. Trả về kết quả tổng hợp
    res.json({
      success: true,
      message: 'RFID + ALPR integration completed',
      data: {
        rfid: {
          reader_id,
          card_id,
          timestamp,
          saved: true
        },
        alpr: {
          license_plate: alprResult.license_plate,
          confidence: alprResult.confidence,
          success: true
        },
        parking: parkingResult
      }
    });

  } catch (error) {
    console.error('Error in RFID-ALPR integration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 