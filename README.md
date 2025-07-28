# 🚗 Hệ thống IoT Bãi gửi xe thông minh

Hệ thống quản lý bãi gửi xe thông minh sử dụng công nghệ IoT, MERN stack và TailwindCSS.

## 🌟 Tính năng chính

### 👥 Đối tượng sử dụng
- **Khách gửi xe**: Đăng ký xe, thanh toán, xem lịch sử
- **Nhân viên bảo vệ**: Quản lý xe vào/ra, điều khiển barrier
- **Quản lý bãi xe**: Báo cáo, thống kê, quản trị hệ thống

### 🚘 Quản lý xe vào
- Nhận diện biển số tự động bằng camera
- Tự động mở barrier cho xe đã đăng ký
- Cấp vé tạm thời cho xe chưa đăng ký
- Lưu ảnh và thông tin xe

### 🚘 Quản lý xe ra
- So sánh biển số với database
- Tính toán thời gian và phí gửi xe
- Hỗ trợ thanh toán QR code
- Mở barrier sau khi thanh toán

### 👤 Quản lý tài khoản
- Đăng ký xe và tài khoản qua app
- Tra cứu lịch sử gửi xe
- Xem hóa đơn và số dư
- Nạp tiền vào ví

### 👷 Ứng dụng nhân viên
- Hiển thị xe vào/ra gần nhất
- Điều khiển barrier thủ công
- Cảnh báo biển số giả
- Quản lý xe chưa thanh toán

### 🏢 Quản trị hệ thống
- Tạo/sửa/xóa tài khoản
- Báo cáo doanh thu
- Thống kê lưu lượng xe
- Xuất báo cáo Excel

## 🛠 Công nghệ sử dụng

### Backend
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose**
- **Socket.IO** cho real-time
- **JWT** authentication
- **bcryptjs** mã hóa mật khẩu
- **QRCode** tạo mã thanh toán

### Frontend
- **React.js** & **React Router**
- **TailwindCSS** styling
- **Socket.IO Client**
- **Axios** HTTP client
- **React Icons**
- **React Hot Toast** notifications

### IoT Integration
- **Camera** nhận diện biển số
- **Barrier** điều khiển tự động
- **Sensor** cảm biến xe
- **Real-time** communication

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js 16+
- MongoDB 5+
- npm hoặc yarn

### 1. Clone repository
```bash
git clone <repository-url>
cd smart-parking-system
```

### 2. Cài đặt dependencies
```bash
# Cài đặt backend dependencies
npm install

# Cài đặt frontend dependencies
cd client
npm install
cd ..
```

### 3. Cấu hình môi trường
Tạo file `.env` trong thư mục gốc:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-parking
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:3000
```

### 4. Khởi chạy ứng dụng

#### Cách 1: Chạy tất cả services cùng lúc
```bash
./start_all.sh
```

#### Cách 2: Chạy riêng lẻ

**Service nhận diện biển số (Port 5000):**
```bash
cd alpr_service_simple
python3 -m pip install -r requirements.txt
python3 simple_app.py
```

**Backend Server (Port 8080):**
```bash
npm run server
```

**Frontend (Port 3000):**
```bash
cd client
npm start
```

## 🚀 Sử dụng

### 1. Truy cập ứng dụng
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- ALPR Service: http://localhost:5000

### 2. Tạo tài khoản admin đầu tiên
```javascript
// Trong MongoDB shell hoặc MongoDB Compass
db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  password: "$2a$12$...", // bcrypt hash của "admin123"
  fullName: "Administrator",
  phone: "0123456789",
  role: "admin",
  isActive: true
})
```

### 3. Đăng nhập và sử dụng
- Đăng nhập với tài khoản admin
- Tạo bãi xe và cấu hình
- Đăng ký xe cho người dùng
- Test các tính năng IoT

## 📁 Cấu trúc dự án

```
smart-parking-system/
├── server/
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── index.js          # Server entry point
├── client/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   └── App.js        # Main app component
│   └── package.json
├── alpr_service_simple/  # IoT service
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user

### Parking
- `POST /api/parking/entry` - Xe vào bãi
- `POST /api/parking/exit` - Xe ra bãi
- `GET /api/parking/active` - Xe đang gửi
- `GET /api/parking/sessions` - Lịch sử gửi xe

### Vehicles
- `POST /api/vehicles` - Đăng ký xe
- `GET /api/vehicles` - Danh sách xe
- `PUT /api/vehicles/:id` - Cập nhật xe
- `DELETE /api/vehicles/:id` - Xóa xe

### Payments
- `POST /api/payments/create-qr` - Tạo QR thanh toán
- `POST /api/payments/process` - Xử lý thanh toán
- `GET /api/payments/history` - Lịch sử thanh toán

### Admin
- `GET /api/admin/dashboard` - Dashboard admin
- `GET /api/admin/users` - Quản lý users
- `GET /api/admin/reports/revenue` - Báo cáo doanh thu

### IoT
- `POST /api/iot/barrier-control` - Điều khiển barrier
- `GET /api/iot/parking-lot/:id/status` - Trạng thái bãi xe
- `POST /api/iot/camera-status` - Trạng thái camera

## 🔧 Cấu hình IoT

### Camera Setup
```python
# alpr_service_simple/simple_ocr_service.py
# Cấu hình camera và nhận diện biển số
```

### Barrier Control
```javascript
// API endpoint để điều khiển barrier
POST /api/iot/barrier-control
{
  "parkingLotId": "parking_lot_id",
  "barrierId": "barrier_1",
  "action": "open" // hoặc "close"
}
```

## 📊 Báo cáo và thống kê

### Dashboard Admin
- Tổng số người dùng
- Tổng số xe đăng ký
- Xe đang gửi
- Doanh thu hôm nay
- Tổng doanh thu

### Báo cáo Excel
- Báo cáo theo ngày/tuần/tháng
- Thống kê lưu lượng xe
- Báo cáo doanh thu
- Danh sách xe vi phạm

## 🔒 Bảo mật

- JWT authentication
- Password hashing với bcrypt
- Rate limiting
- Input validation
- CORS configuration
- Helmet security headers

## 🧪 Testing

```bash
# Test backend
npm test

# Test frontend
cd client
npm test
```

## 📝 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📞 Liên hệ

- Email: support@smartparking.com
- Website: https://smartparking.com
- GitHub: https://github.com/smartparking

---

**Smart Parking System** - Hệ thống bãi gửi xe thông minh với IoT 🚗✨ 