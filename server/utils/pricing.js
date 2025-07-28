const moment = require('moment');

/**
 * Tính phí gửi xe dựa trên thời gian và loại xe
 * @param {number} durationMinutes - Thời gian gửi xe (phút)
 * @param {Object} parkingLot - Thông tin bãi xe
 * @param {string} vehicleType - Loại xe (car, motorcycle, truck, bus)
 * @returns {Object} Thông tin phí
 */
const calculateParkingFee = (durationMinutes, parkingLot, vehicleType = 'car') => {
  const hours = Math.ceil(durationMinutes / 60);
  const days = Math.ceil(hours / 24);
  
  let hourlyRate = parkingLot.hourlyRate;
  let dailyRate = parkingLot.dailyRate;
  
  // Điều chỉnh giá theo loại xe
  const vehicleRateMultiplier = {
    'motorcycle': 0.5,
    'car': 1.0,
    'truck': 1.5,
    'bus': 2.0
  };
  
  const multiplier = vehicleRateMultiplier[vehicleType] || 1.0;
  hourlyRate *= multiplier;
  dailyRate *= multiplier;
  
  let fee = 0;
  let calculationMethod = '';
  
  // Tính phí theo ngày nếu > 24h
  if (days > 1) {
    fee = days * dailyRate;
    calculationMethod = 'daily';
  } else {
    // Tính theo giờ
    fee = hours * hourlyRate;
    calculationMethod = 'hourly';
  }
  
  return {
    fee: Math.round(fee),
    hourlyRate: Math.round(hourlyRate),
    dailyRate: Math.round(dailyRate),
    calculationMethod,
    durationHours: hours,
    durationDays: days,
    vehicleType,
    multiplier
  };
};

/**
 * Tính phí trễ (nếu có)
 * @param {Date} exitTime - Thời gian ra
 * @param {Date} expectedExitTime - Thời gian ra dự kiến
 * @param {number} hourlyRate - Giá theo giờ
 * @returns {number} Phí trễ
 */
const calculateLateFee = (exitTime, expectedExitTime, hourlyRate) => {
  if (!exitTime || !expectedExitTime) return 0;
  
  const lateMinutes = moment(exitTime).diff(moment(expectedExitTime), 'minutes');
  if (lateMinutes <= 0) return 0;
  
  const lateHours = Math.ceil(lateMinutes / 60);
  return lateHours * hourlyRate * 1.5; // Phí trễ = 1.5x giá thường
};

/**
 * Tính giảm giá (nếu có)
 * @param {number} originalFee - Phí gốc
 * @param {Object} user - Thông tin user
 * @param {number} durationHours - Số giờ gửi xe
 * @returns {Object} Thông tin giảm giá
 */
const calculateDiscount = (originalFee, user, durationHours) => {
  let discountAmount = 0;
  let discountReason = '';
  
  // Giảm giá cho khách hàng VIP
  if (user.role === 'vip' || user.balance > 1000000) {
    discountAmount = originalFee * 0.1; // 10% giảm giá
    discountReason = 'Khách hàng VIP';
  }
  
  // Giảm giá cho gửi xe > 24h
  if (durationHours >= 24) {
    const longTermDiscount = originalFee * 0.05; // 5% giảm giá
    discountAmount += longTermDiscount;
    discountReason += discountReason ? ' + Gửi xe dài hạn' : 'Gửi xe dài hạn';
  }
  
  return {
    discountAmount: Math.round(discountAmount),
    discountReason,
    finalFee: Math.round(originalFee - discountAmount)
  };
};

/**
 * Tính tổng phí cuối cùng
 * @param {Object} session - Thông tin session gửi xe
 * @param {Object} parkingLot - Thông tin bãi xe
 * @returns {Object} Thông tin phí chi tiết
 */
const calculateTotalFee = (session, parkingLot) => {
  const durationMinutes = session.duration || 0;
  const vehicleType = session.vehicleType || 'car';
  
  // Tính phí cơ bản
  const basicFee = calculateParkingFee(durationMinutes, parkingLot, vehicleType);
  
  // Tính phí trễ (nếu có)
  const lateFee = calculateLateFee(
    session.exitTime,
    session.expectedExitTime,
    basicFee.hourlyRate
  );
  
  // Tính giảm giá
  const discount = calculateDiscount(
    basicFee.fee + lateFee,
    session.user || {},
    basicFee.durationHours
  );
  
  const totalAmount = discount.finalFee;
  
  return {
    ...basicFee,
    lateFee: Math.round(lateFee),
    discountAmount: discount.discountAmount,
    discountReason: discount.discountReason,
    totalAmount: Math.round(totalAmount),
    breakdown: {
      basicFee: basicFee.fee,
      lateFee: Math.round(lateFee),
      discount: discount.discountAmount,
      total: Math.round(totalAmount)
    }
  };
};

/**
 * Tạo QR code data cho thanh toán
 * @param {Object} session - Thông tin session
 * @param {Object} feeInfo - Thông tin phí
 * @returns {string} QR code data
 */
const generatePaymentQRData = (session, feeInfo) => {
  const paymentData = {
    sessionId: session.sessionId,
    licensePlate: session.detectedLicensePlate,
    amount: feeInfo.totalAmount,
    timestamp: new Date().toISOString(),
    paymentMethod: 'qr'
  };
  
  return JSON.stringify(paymentData);
};

/**
 * Validate license plate format
 * @param {string} licensePlate - Biển số xe
 * @returns {boolean} True nếu format hợp lệ
 */
const validateLicensePlate = (licensePlate) => {
  if (!licensePlate) return false;
  
  // Format biển số Việt Nam
  const patterns = [
    /^[0-9]{2}[A-Z][0-9]{4,5}$/, // 30A-12345
    /^[0-9]{2}[A-Z][0-9]{3,4}[A-Z]$/, // 51F-6789A
    /^[A-Z][0-9]{2}[A-Z][0-9]{4,5}$/, // A30-12345
    /^[0-9]{2}[A-Z][0-9]{3,4}$/ // 29H-5432
  ];
  
  const cleanPlate = licensePlate.replace(/[-\s]/g, '').toUpperCase();
  return patterns.some(pattern => pattern.test(cleanPlate));
};

/**
 * Format license plate
 * @param {string} licensePlate - Biển số xe
 * @returns {string} Biển số đã format
 */
const formatLicensePlate = (licensePlate) => {
  if (!licensePlate) return '';
  
  const cleanPlate = licensePlate.replace(/[-\s]/g, '').toUpperCase();
  
  // Format theo pattern phổ biến
  if (/^[0-9]{2}[A-Z][0-9]{4,5}$/.test(cleanPlate)) {
    return `${cleanPlate.slice(0, 2)}-${cleanPlate.slice(2, 3)}-${cleanPlate.slice(3)}`;
  }
  
  if (/^[0-9]{2}[A-Z][0-9]{3,4}[A-Z]$/.test(cleanPlate)) {
    return `${cleanPlate.slice(0, 2)}-${cleanPlate.slice(2, 3)}-${cleanPlate.slice(3, -1)}-${cleanPlate.slice(-1)}`;
  }
  
  return cleanPlate;
};

module.exports = {
  calculateParkingFee,
  calculateLateFee,
  calculateDiscount,
  calculateTotalFee,
  generatePaymentQRData,
  validateLicensePlate,
  formatLicensePlate
}; 