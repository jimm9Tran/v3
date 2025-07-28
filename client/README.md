# Smart Parking Client

Ứng dụng web client cho hệ thống bãi gửi xe thông minh, được xây dựng bằng React và Tailwind CSS.

## 🚀 Tính năng chính

### 👤 Quản lý người dùng
- **Đăng nhập/Đăng ký**: Hệ thống xác thực an toàn
- **Hồ sơ cá nhân**: Cập nhật thông tin, đổi mật khẩu
- **Nạp tiền**: Hỗ trợ nhiều phương thức thanh toán

### 🚗 Quản lý xe
- **Đăng ký xe**: Thêm, chỉnh sửa, xóa thông tin xe
- **Phân loại xe**: Ô tô, xe máy, xe tải
- **Tìm kiếm & lọc**: Tìm kiếm nhanh theo biển số, hãng xe

### 🅿️ Gửi xe thông minh
- **Theo dõi real-time**: Xem xe đang gửi với thời gian thực
- **Tự động nhận diện**: Biển số xe được nhận diện tự động
- **Tính phí tự động**: Tính toán phí gửi xe chính xác

### 💳 Thanh toán
- **Đa dạng phương thức**: Ví điện tử, QR Code, tiền mặt
- **Hóa đơn điện tử**: In và tải xuống hóa đơn
- **Lịch sử giao dịch**: Theo dõi tất cả giao dịch

### 📊 Lịch sử & Báo cáo
- **Lịch sử gửi xe**: Xem lại tất cả phiên gửi xe
- **Tìm kiếm nâng cao**: Lọc theo thời gian, trạng thái
- **Chi tiết phiên gửi**: Thông tin đầy đủ về từng lần gửi xe

## 🛠️ Công nghệ sử dụng

- **React 18**: Framework chính
- **React Router**: Điều hướng ứng dụng
- **Tailwind CSS**: Styling và responsive design
- **Axios**: HTTP client
- **Socket.io**: Real-time communication
- **React Hot Toast**: Thông báo
- **React Icons**: Icon library
- **Chart.js**: Biểu đồ thống kê

## 📱 Responsive Design

Ứng dụng được thiết kế responsive hoàn toàn:
- **Desktop**: Giao diện đầy đủ với sidebar
- **Tablet**: Layout tối ưu cho màn hình trung bình
- **Mobile**: Navigation hamburger menu, layout dọc

## 🎨 UI/UX Features

### Design System
- **Color Palette**: Primary blue, success green, warning yellow, danger red
- **Typography**: Inter font family
- **Spacing**: Consistent spacing system
- **Shadows**: Soft và medium shadows
- **Animations**: Smooth transitions và hover effects

### Components
- **Navigation**: Responsive navigation với mobile menu
- **Cards**: Reusable card components
- **Buttons**: Primary, secondary, success, danger variants
- **Forms**: Input fields với validation
- **Modals**: Overlay modals cho forms
- **Loading States**: Spinner animations
- **Empty States**: Friendly empty state messages

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 16+
- npm hoặc yarn

### Cài đặt dependencies
```bash
cd client
npm install
```

### Chạy development server
```bash
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

### Build production
```bash
npm run build
```

## 📁 Cấu trúc thư mục

```
src/
├── components/
│   ├── auth/           # Đăng nhập, đăng ký
│   ├── common/         # Components dùng chung
│   ├── dashboard/      # Trang chủ
│   ├── history/        # Lịch sử gửi xe
│   ├── payment/        # Thanh toán
│   ├── profile/        # Hồ sơ cá nhân
│   ├── vehicles/       # Quản lý xe
│   ├── admin/          # Admin dashboard
│   └── staff/          # Staff dashboard
├── contexts/           # React contexts
├── App.js             # Component chính
└── index.js           # Entry point
```

## 🔧 Cấu hình

### Environment Variables
Tạo file `.env` trong thư mục client:

```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_SOCKET_URL=http://localhost:8080
```

### Tailwind Config
File `tailwind.config.js` chứa:
- Custom color palette
- Custom shadows
- Font family configuration

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎯 Performance

- **Code Splitting**: Lazy loading cho routes
- **Image Optimization**: Optimized images
- **Bundle Size**: Minimized bundle size
- **Caching**: Browser caching strategies

## 🔒 Security

- **Protected Routes**: Route protection với authentication
- **Input Validation**: Form validation
- **XSS Prevention**: Sanitized inputs
- **CSRF Protection**: CSRF tokens

## 🧪 Testing

```bash
# Chạy tests
npm test

# Chạy tests với coverage
npm test -- --coverage
```

## 📦 Deployment

### Build cho production
```bash
npm run build
```

### Deploy lên server
```bash
# Copy build folder lên server
scp -r build/ user@server:/var/www/html/
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub repository. 