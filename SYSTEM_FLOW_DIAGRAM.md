# 🔄 Luồng hoạt động của Smart Parking System

## 📋 Tổng quan hệ thống

Hệ thống Smart Parking hoạt động với 3 thành phần chính:
- **🤖 ESP32**: Thiết bị IoT đọc RFID và điều khiển barrier
- **🖥️ Server**: Backend xử lý dữ liệu và quản lý hệ thống
- **🔍 ALPR Service**: Nhận diện biển số xe

## 🔄 Luồng hoạt động chi tiết

### 1. 🚗 **Luồng xe vào bãi (Entry Flow)**

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│   Camera    │───▶│ ALPR Service │───▶│   Server    │───▶│   Client    │
│  (Entry)    │    │   (Port 5001)│    │ (Port 8080) │    │ (Port 3000) │
└─────────────┘    └──────────────┘    └─────────────┘    └─────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
   Chụp ảnh xe    Nhận diện biển số    Lưu session     Hiển thị real-time
   (JPEG/Base64)   (PaddleOCR)        (MongoDB)        (Socket.IO)
```

**Chi tiết:**
1. **Camera** chụp ảnh xe khi xe đến barrier
2. **ALPR Service** nhận ảnh và nhận diện biển số bằng PaddleOCR
3. **ALPR Service** gửi dữ liệu đến Server: `POST /api/parking/entry`
4. **Server** tạo parking session và lưu vào MongoDB
5. **Server** emit Socket.IO event cho Client real-time update
6. **Client** nhận thông tin và hiển thị trên dashboard

### 2. 🆔 **Luồng RFID (RFID Flow)**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   ESP32     │───▶│   Server    │───▶│  Database   │───▶│   Client    │
│ (RFID Read) │    │ (Port 8080) │    │ (MongoDB)   │    │ (Port 3000) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
   Đọc RFID card    Lưu RFID data     Store trong      Hiển thị RFID
   (Reader 1/2)     (IoT API)         RFIDData         events
```

**Chi tiết:**
1. **ESP32** đọc RFID card từ reader 1 hoặc 2
2. **ESP32** gửi dữ liệu đến Server: `POST /api/iot/rfid-data`
3. **Server** lưu RFID data vào MongoDB (RFIDData collection)
4. **Server** emit Socket.IO event: `rfid-data-received`
5. **Client** nhận event và hiển thị real-time

### 3. 🚪 **Luồng điều khiển Barrier (Barrier Control Flow)**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   ESP32     │◄───│   Server    │◄───│ ALPR Service│◄───│   Camera    │
│ (Servo)     │    │ (Port 8080) │    │ (Port 5001) │    │  (Entry)    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
   Mở/Đóng barrier   Xử lý logic      Forward data    Chụp ảnh xe
   (Servo motor)     (Business)       (ESP32 API)     (Trigger)
```

**Chi tiết:**
1. **Camera** chụp ảnh xe khi xe đến
2. **ALPR Service** nhận diện biển số và forward đến Server
3. **Server** xử lý logic (kiểm tra quyền, tính phí, etc.)
4. **Server** gửi lệnh điều khiển barrier: `POST /api/iot/barrier-control`
5. **ESP32** nhận lệnh và điều khiển servo motor mở/đóng barrier

### 4. 🚗 **Luồng xe ra bãi (Exit Flow)**

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│   Camera    │───▶│ ALPR Service │───▶│   Server    │───▶│   Client    │
│   (Exit)    │    │   (Port 5001)│    │ (Port 8080) │    │ (Port 3000) │
└─────────────┘    └──────────────┘    └─────────────┘    └─────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
   Chụp ảnh xe    Nhận diện biển số    Tính phí &      Hiển thị kết quả
   (JPEG/Base64)   (PaddleOCR)        Cập nhật DB     (Payment UI)
```

**Chi tiết:**
1. **Camera** chụp ảnh xe khi xe ra
2. **ALPR Service** nhận diện biển số
3. **Server** tính phí và cập nhật parking session
4. **Server** tạo payment record và cập nhật database
5. **Client** hiển thị thông tin thanh toán

## 📡 API Endpoints

### 🤖 **ESP32 → Server**
```bash
# RFID Data
POST http://localhost:8080/api/iot/rfid-data
{
  "reader_id": 1,
  "card_id": "ABC123",
  "timestamp": 1234567890,
  "device_id": "ESP32_RFID_System"
}

# Barrier Control
POST http://localhost:8080/api/iot/barrier-control
{
  "parkingLotId": "parking_lot_id",
  "barrierId": "barrier-1",
  "action": "open"
}
```

### 🔍 **ALPR Service → Server**
```bash
# License Plate Detection
POST http://localhost:8080/api/parking/entry
{
  "licensePlate": "30A-12345",
  "parkingLotId": "parking_lot_id",
  "entryImage": "base64_image",
  "barrierId": "barrier-1",
  "detectionConfidence": 0.95
}
```

### 🖥️ **Client → Server**
```bash
# Real-time updates via Socket.IO
GET http://localhost:8080/api/parking
GET http://localhost:8080/api/iot/rfid-data
GET http://localhost:8080/api/iot/rfid-stats
```

## 🔧 **Cấu hình Port**

| Service | Port | URL | Chức năng |
|---------|------|-----|-----------|
| **Server** | 8080 | `http://localhost:8080` | Backend API, Database |
| **Client** | 3000 | `http://localhost:3000` | Frontend UI |
| **ALPR Service** | 5001 | `http://localhost:5001` | License plate recognition |

## 📊 **Database Schema**

### **RFIDData Collection**
```javascript
{
  reader_id: 1,           // RFID reader 1 hoặc 2
  card_id: "ABC123",      // RFID card ID
  timestamp: 1234567890,  // Unix timestamp
  device_id: "ESP32_RFID_System",
  parking_lot_id: ObjectId,
  created_at: Date
}
```

### **ParkingSession Collection**
```javascript
{
  sessionId: "PS123456789",
  vehicle: ObjectId,
  user: ObjectId,
  parkingLot: ObjectId,
  entryTime: Date,
  exitTime: Date,
  duration: Number,
  status: "active|completed",
  fee: Number,
  paymentStatus: "pending|paid"
}
```

## 🔄 **Real-time Communication**

### **Socket.IO Events**
```javascript
// Server → Client
io.emit('rfid-data-received', { reader_id, card_id, timestamp });
io.emit('vehicle-entered', { licensePlate, parkingLotId });
io.emit('vehicle-exited', { licensePlate, parkingLotId, fee });
io.emit('barrier-updated', { barrierId, action, status });
```

## ⚡ **Performance Metrics**

- **ESP32 Response Time**: < 100ms
- **ALPR Processing Time**: < 200ms per image
- **Server API Response**: < 50ms
- **Real-time Updates**: < 10ms latency
- **Database Operations**: < 20ms

## 🛡️ **Security & Error Handling**

### **ESP32**
- WiFi connection retry
- HTTP timeout handling
- JSON parsing validation
- LCD error display

### **ALPR Service**
- Image format validation
- OCR confidence threshold
- Server connection retry
- Error logging

### **Server**
- Input validation (express-validator)
- JWT authentication
- Rate limiting
- Error middleware

---

**🎯 Hệ thống hoạt động theo luồng real-time, đảm bảo tính chính xác và tốc độ xử lý cao!** 