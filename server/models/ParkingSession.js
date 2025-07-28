const mongoose = require('mongoose');

const parkingSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  parkingLot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: true
  },
  entryTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  exitTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  entryImage: {
    type: String,
    required: true
  },
  exitImage: {
    type: String
  },
  detectedLicensePlate: {
    type: String,
    required: true,
    uppercase: true
  },
  confirmedLicensePlate: {
    type: String,
    uppercase: true
  },
  fee: {
    type: Number,
    default: 0
  },
  hourlyRate: {
    type: Number,
    default: 0
  },
  dailyRate: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['qr', 'cash', 'card', 'wallet'],
    default: 'qr'
  },
  paymentId: {
    type: String
  },
  paymentTime: {
    type: Date
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  discountReason: {
    type: String
  },
  lateFee: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  barrierEntry: {
    type: String,
    required: true
  },
  barrierExit: {
    type: String
  },
  notes: {
    type: String,
    trim: true
  },
  isRegisteredVehicle: {
    type: Boolean,
    default: false
  },
  tempTicketNumber: {
    type: String
  }
}, {
  timestamps: true
});

// Generate session ID
parkingSessionSchema.pre('save', function(next) {
  if (!this.sessionId) {
    this.sessionId = `PS${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

// Calculate duration when exit time is set
parkingSessionSchema.pre('save', function(next) {
  if (this.exitTime && this.entryTime) {
    this.duration = Math.ceil((this.exitTime - this.entryTime) / (1000 * 60)); // minutes
  }
  next();
});

// Indexes for better performance
parkingSessionSchema.index({ sessionId: 1 });
parkingSessionSchema.index({ vehicle: 1 });
parkingSessionSchema.index({ user: 1 });
parkingSessionSchema.index({ status: 1 });
parkingSessionSchema.index({ entryTime: 1 });
parkingSessionSchema.index({ detectedLicensePlate: 1 });

module.exports = mongoose.model('ParkingSession', parkingSessionSchema); 