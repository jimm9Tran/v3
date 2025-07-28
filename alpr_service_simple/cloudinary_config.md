# ☁️ Cloudinary Integration Guide

## 📋 Tổng quan

ALPR Service đã được tích hợp với Cloudinary để lưu trữ ảnh thay vì lưu Base64 trong MongoDB. Điều này giúp tối ưu hiệu suất và quản lý ảnh tốt hơn.

## 🚀 Cài đặt Cloudinary

### 1. Tạo tài khoản Cloudinary
- Truy cập: https://cloudinary.com/
- Đăng ký tài khoản miễn phí
- Lấy thông tin credentials từ Dashboard

### 2. Cấu hình Environment Variables

Tạo file `.env` trong thư mục `alpr_service_simple`:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Smart Parking Server Configuration
SMART_PARKING_SERVER_URL=http://192.168.102.3:8080

# ALPR Service Configuration
ALPR_SERVICE_PORT=5001
```

### 3. Cài đặt dependencies
```bash
pip3 install -r requirements.txt
```

## 📁 Cấu trúc lưu trữ trên Cloudinary

```
parking-system/
├── parking_lot_1/
│   ├── entry/
│   │   ├── parking_entry_51A123_parking_lot_1_20240115_103000
│   │   └── parking_entry_51B456_parking_lot_1_20240115_104500
│   └── exit/
│       ├── parking_exit_51A123_parking_lot_1_20240115_123000
│       └── parking_exit_51B456_parking_lot_1_20240115_124500
└── parking_lot_2/
    ├── entry/
    └── exit/
```

## 🔧 Tính năng Cloudinary Service

### Upload ảnh với metadata
```python
# Upload ảnh parking
result = cloudinary_service.upload_parking_image(
    image_bytes=image_bytes,
    license_plate="51A123",
    parking_lot_id="parking_lot_1",
    image_type="entry"
)
```

### Tự động tối ưu ảnh
- **Resize**: 800x600 pixels
- **Quality**: Auto optimization
- **Format**: JPEG
- **Compression**: Tự động

### Metadata được lưu trữ
```json
{
  "license_plate": "51A123",
  "parking_lot_id": "parking_lot_1",
  "image_type": "entry",
  "upload_time": "20240115_103000"
}
```

## 📡 API Endpoints

### Upload ảnh tự động
```bash
POST /api/detect
Content-Type: multipart/form-data

Response:
{
  "success": true,
  "license_plate": "51A123",
  "confidence": 0.95,
  "cloudinary_url": "https://res.cloudinary.com/your-cloud/image/upload/...",
  "server_response": {...}
}
```

## 💾 Lưu trữ Database

Thay vì lưu Base64, giờ lưu URL Cloudinary:

```javascript
// MongoDB Document
{
  "_id": ObjectId("..."),
  "sessionId": "PS1234567890",
  "entryImageUrl": "https://res.cloudinary.com/your-cloud/image/upload/...",
  "entryImagePublicId": "parking_entry_51A123_parking_lot_1_20240115_103000",
  "detectedLicensePlate": "51A123",
  "entryTime": "2024-01-15T10:30:00.000Z"
}
```

## 🎯 Lợi ích của Cloudinary

### ✅ Ưu điểm:
- **CDN**: Tự động phân phối toàn cầu
- **Optimization**: Tự động tối ưu ảnh
- **Transformations**: Resize, crop, filter
- **Backup**: Tự động backup
- **Analytics**: Thống kê sử dụng
- **Security**: HTTPS, access control

### 📊 Performance:
- **Load time**: Nhanh hơn Base64
- **Storage**: Tiết kiệm database space
- **Bandwidth**: Giảm network traffic
- **Scalability**: Không giới hạn storage

## 🔍 Monitoring

### Health Check
```bash
GET /health
{
  "status": "healthy",
  "cloudinary": "connected",
  "services": ["ocr", "cloudinary"]
}
```

### List Images
```python
# Liệt kê ảnh trong Cloudinary
result = cloudinary_service.list_images(
    folder="parking-system",
    max_results=50
)
```

## 🛠 Troubleshooting

### Lỗi thường gặp:

1. **Invalid credentials**
```bash
# Kiểm tra environment variables
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY
echo $CLOUDINARY_API_SECRET
```

2. **Upload failed**
```bash
# Kiểm tra kết nối internet
ping cloudinary.com
```

3. **Image not found**
```bash
# Kiểm tra public_id
curl https://res.cloudinary.com/your-cloud/image/upload/public_id
```

## 📈 Usage Limits

### Free Plan:
- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month
- **Uploads**: 25,000/month

### Pro Plan:
- **Storage**: 100GB
- **Bandwidth**: 100GB/month
- **Transformations**: 100,000/month
- **Uploads**: 100,000/month

## 🔐 Security

### Best Practices:
- **Environment variables**: Không hardcode credentials
- **HTTPS**: Tất cả requests qua HTTPS
- **Access control**: Restrict uploads
- **Backup**: Regular backups

## 🚀 Deployment

### Production Checklist:
- [x] Cloudinary account setup
- [x] Environment variables configured
- [x] Dependencies installed
- [x] Service tested
- [x] Monitoring configured

---

**🎉 Cloudinary integration hoàn tất! Ảnh sẽ được lưu trữ an toàn và hiệu quả trên cloud!** 