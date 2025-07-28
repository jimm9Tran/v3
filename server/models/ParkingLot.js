const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  totalSpaces: {
    type: Number,
    required: true,
    min: 1
  },
  availableSpaces: {
    type: Number,
    required: true,
    min: 0
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 0
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0
  },
  monthlyRate: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  barriers: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['entry', 'exit'],
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'maintenance'],
      default: 'closed'
    }
  }],
  cameras: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastMaintenance: {
      type: Date,
      default: Date.now
    }
  }],
  operatingHours: {
    open: {
      type: String,
      default: '06:00'
    },
    close: {
      type: String,
      default: '22:00'
    },
    is24Hours: {
      type: Boolean,
      default: false
    }
  },
  contactInfo: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    }
  },
  coordinates: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  features: [{
    type: String,
    enum: ['security', 'lighting', 'cctv', 'accessibility', 'charging', 'covered']
  }],
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  staff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Calculate available spaces
parkingLotSchema.methods.updateAvailableSpaces = function() {
  return this.model('ParkingSession').countDocuments({
    parkingLot: this._id,
    status: 'active'
  }).then(activeSessions => {
    this.availableSpaces = this.totalSpaces - activeSessions;
    return this.save();
  });
};

// Get occupancy rate
parkingLotSchema.methods.getOccupancyRate = function() {
  return ((this.totalSpaces - this.availableSpaces) / this.totalSpaces * 100).toFixed(2);
};

// Indexes
parkingLotSchema.index({ name: 1 });
parkingLotSchema.index({ isActive: 1 });
parkingLotSchema.index({ 'barriers.id': 1 });

module.exports = mongoose.model('ParkingLot', parkingLotSchema); 