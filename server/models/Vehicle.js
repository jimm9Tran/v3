const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  licensePlate: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['car', 'motorcycle', 'truck', 'bus'],
    default: 'car'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isRegistered: {
    type: Boolean,
    default: false
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastParkingSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSession'
  },
  totalParkingTime: {
    type: Number,
    default: 0 // in minutes
  },
  totalFees: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
vehicleSchema.index({ licensePlate: 1 });
vehicleSchema.index({ owner: 1 });
vehicleSchema.index({ isRegistered: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema); 