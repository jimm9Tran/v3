const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderCode: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: 10000 // Tối thiểu 10,000 VNĐ
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['payos', 'bank_transfer', 'cash'],
    default: 'payos'
  },
  payosTransactionId: {
    type: String
  },
  payosPaymentUrl: {
    type: String
  },
  payosQrCode: {
    type: String
  },
  payosDeepLink: {
    type: String
  },
  completedAt: {
    type: Date
  },
  failedReason: {
    type: String
  },
  webhookData: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
depositSchema.index({ userId: 1 });
depositSchema.index({ orderCode: 1 });
depositSchema.index({ status: 1 });
depositSchema.index({ createdAt: 1 });

// Virtual field cho tổng tiền đã nạp
depositSchema.virtual('formattedAmount').get(function() {
  return this.amount.toLocaleString('vi-VN') + ' VNĐ';
});

// Pre-save middleware
depositSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Deposit', depositSchema); 