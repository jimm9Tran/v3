const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  // Lấy token từ header
  const token = req.header('x-auth-token');

  // Kiểm tra token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không có token, quyền truy cập bị từ chối'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Kiểm tra user tồn tại
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị khóa'
      });
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }
}; 