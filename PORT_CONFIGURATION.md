# 🚀 Cấu hình Port cho Smart Parking System

## 📋 Tổng quan

Hệ thống Smart Parking đã được cấu hình với các port sau:

## 🔧 Cấu hình Port

### 🖥️ **Server (Backend)**
- **Port**: 8080
- **URL**: http://localhost:8080
- **File**: `server/index.js`
- **Status**: ✅ Đã cấu hình

### 🖥️ **Client (Frontend)**
- **Port**: 3000
- **URL**: http://localhost:3000
- **File**: `client/package.json` (proxy: http://localhost:8080)
- **Status**: ✅ Đã cấu hình

### 🤖 **ALPR Service**
- **Port**: 5001
- **URL**: http://localhost:5001
- **File**: `alpr_service_simple/alpr_integration.py`
- **Status**: ✅ Đã cấu hình

## 📡 API Endpoints

### Server (Port 8080)
```bash
# Health Check
GET http://localhost:8080/api/health

# Parking API
GET http://localhost:8080/api/parking
POST http://localhost:8080/api/parking/entry
POST http://localhost:8080/api/parking/exit

# IoT API
POST http://localhost:8080/api/iot/rfid-data
GET http://localhost:8080/api/iot/rfid-data
GET http://localhost:8080/api/iot/rfid-stats
```

### ALPR Service (Port 5001)
```bash
# Health Check
GET http://localhost:5001/health

# License Plate Detection
POST http://localhost:5001/api/detect

# ESP32 Integration
POST http://localhost:5001/api/esp32/vehicle_detected
POST http://localhost:5001/api/esp32/barrier_status
POST http://localhost:5001/api/esp32/heartbeat
```

## 🚀 Cách khởi động

### 1. Khởi động Server
```bash
cd server
npm start
# Server sẽ chạy trên http://localhost:8080
```

### 2. Khởi động Client
```bash
cd client
npm start
# Client sẽ chạy trên http://localhost:3000
```

### 3. Khởi động ALPR Service
```bash
cd alpr_service_simple
python3 alpr_integration.py
# ALPR Service sẽ chạy trên http://localhost:5001
```

### 4. Khởi động toàn bộ hệ thống
```bash
./start_smart_parking_system.sh
```

## 🧪 Testing

### Test Server
```bash
curl http://localhost:8080/api/health
```

### Test Client
```bash
curl http://localhost:3000
```

### Test ALPR Service
```bash
curl http://localhost:5001/health
```

### Test Integration
```bash
cd alpr_service_simple
python3 test_integration.py
```

## 🔗 Tích hợp

### ALPR → Server
- ALPR Service gửi dữ liệu biển số đến Server qua `http://localhost:8080/api/parking/entry`
- ESP32 data được forward qua ALPR Service đến Server

### Client → Server
- Client giao tiếp với Server qua proxy: `http://localhost:8080`
- Socket.IO connection cho real-time updates

### ESP32 → Server
- ESP32 gửi RFID data trực tiếp đến Server: `http://localhost:8080/api/iot/rfid-data`
- Hoặc qua ALPR Service nếu cần xử lý thêm

## ⚠️ Lưu ý

### Port Conflicts
- **Port 5000**: Được sử dụng bởi macOS ControlCenter
- **Port 5001**: ALPR Service (đã tránh conflict)
- **Port 8080**: Server (đã cấu hình)
- **Port 3000**: Client (mặc định React)

### Troubleshooting
```bash
# Kiểm tra port đang sử dụng
lsof -i :8080
lsof -i :3000
lsof -i :5001

# Kill process nếu cần
kill <PID>
```

## 📊 Status

- ✅ **Server**: Port 8080 - Đã cấu hình
- ✅ **Client**: Port 3000 - Đã cấu hình  
- ✅ **ALPR Service**: Port 5001 - Đã cấu hình
- ✅ **Integration**: Tất cả services đã tích hợp
- ✅ **Documentation**: Đã cập nhật

---

**🎉 Hệ thống đã sẵn sàng với cấu hình port mới!** 