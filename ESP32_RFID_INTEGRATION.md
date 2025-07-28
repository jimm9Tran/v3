# Tích hợp ESP32 RFID với Smart Parking System

## 🎯 Tổng quan

Hệ thống ESP32 RFID đã được tích hợp vào server Smart Parking hiện tại thông qua route `/api/iot/rfid-data`.

## 📁 Files đã được cập nhật

### 1. `server/routes/iot.js` - Đã thêm endpoints RFID
- `POST /api/iot/rfid-data` - Nhận dữ liệu từ ESP32
- `GET /api/iot/rfid-data` - Lấy dữ liệu RFID
- `GET /api/iot/rfid-stats` - Thống kê RFID
- `GET /api/iot/rfid-health` - Health check

### 2. `esp32_rfid_servo_lcd.ino` - Code Arduino đã cập nhật
- Sử dụng endpoint `/api/iot/rfid-data`
- Parse response JSON để kiểm tra success
- Cải thiện error handling

## 🔧 Cấu hình ESP32

### 1. Cập nhật thông tin WiFi và Server
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://your-server-url.com/api/iot/rfid-data";
```

### 2. Cài đặt thư viện Arduino
- MFRC522
- ArduinoJson
- LiquidCrystal_I2C
- ESP32Servo

## 📊 API Endpoints

### POST /api/iot/rfid-data
**Request:**
```json
{
  "reader_id": 1,
  "card_id": "A1B2C3D4",
  "timestamp": 1234567890,
  "device_id": "ESP32_RFID_System",
  "parking_lot_id": "optional_parking_lot_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "RFID data saved successfully",
  "data": {
    "id": "mongo_id",
    "reader_id": 1,
    "card_id": "A1B2C3D4",
    "timestamp": 1234567890
  }
}
```

### GET /api/iot/rfid-data
**Query Parameters:**
- `reader_id` (optional): Filter theo reader (1 hoặc 2)
- `parking_lot_id` (optional): Filter theo bãi xe
- `limit` (default: 100): Số record trả về
- `page` (default: 1): Trang hiện tại

### GET /api/iot/rfid-stats
**Query Parameters:**
- `reader_id` (optional): Filter theo reader
- `days` (default: 7): Số ngày thống kê
- `parking_lot_id` (optional): Filter theo bãi xe

### GET /api/iot/rfid-health
**Response:**
```json
{
  "success": true,
  "message": "RFID API is running",
  "data": {
    "total_records": 150,
    "today_records": 25,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🔌 Socket.IO Events

Server sẽ emit event `rfid-data-received` khi nhận được dữ liệu RFID:

```javascript
// Client side
socket.on('rfid-data-received', (data) => {
  console.log('RFID Data:', data);
  // Update UI real-time
});
```

## 📈 Database Schema

### RFIDData Collection
```javascript
{
  reader_id: Number,        // 1 hoặc 2
  card_id: String,          // RFID card ID
  timestamp: Number,         // ESP32 timestamp
  device_id: String,        // "ESP32_RFID_System"
  parking_lot_id: ObjectId, // Reference to ParkingLot
  created_at: Date          // Server timestamp
}
```

## 🚀 Cách sử dụng

### 1. Upload code lên ESP32
```bash
# Mở Arduino IDE
# Chọn board ESP32
# Upload file esp32_rfid_servo_lcd.ino
```

### 2. Cấu hình server
```bash
# Server đã sẵn sàng, không cần thêm gì
# Chỉ cần đảm bảo MongoDB đang chạy
```

### 3. Test API
```bash
# Test health check
curl http://localhost:5000/api/iot/rfid-health

# Test gửi dữ liệu RFID
curl -X POST http://localhost:5000/api/iot/rfid-data \
  -H "Content-Type: application/json" \
  -d '{
    "reader_id": 1,
    "card_id": "TEST123",
    "timestamp": 1234567890,
    "device_id": "ESP32_RFID_System"
  }'
```

## 🔍 Monitoring và Debug

### 1. Server Logs
```bash
# Xem logs RFID
tail -f server.log | grep "RFID Data received"
```

### 2. ESP32 Serial Monitor
```
Baud Rate: 115200
Format: Serial output từ ESP32
```

### 3. Database Queries
```javascript
// Xem dữ liệu RFID
db.rfiddatas.find().sort({created_at: -1}).limit(10)

// Thống kê theo reader
db.rfiddatas.aggregate([
  {$group: {_id: "$reader_id", count: {$sum: 1}}}
])
```

## 🛠️ Troubleshooting

### ESP32 không kết nối WiFi
- Kiểm tra SSID và password
- Đảm bảo WiFi ổn định
- Reset ESP32 nếu cần

### RFID không đọc được
- Kiểm tra kết nối dây
- Verify pin configuration
- Test với I2C scanner

### Server không nhận dữ liệu
- Kiểm tra URL server
- Verify network connectivity
- Check server logs

### Database errors
- Kiểm tra MongoDB connection
- Verify database permissions
- Check schema validation

## 📱 Frontend Integration

### Real-time Updates
```javascript
// Kết nối Socket.IO
const socket = io('http://localhost:5000');

// Lắng nghe RFID events
socket.on('rfid-data-received', (data) => {
  updateRFIDDisplay(data);
  showNotification(`Card ${data.card_id} scanned`);
});
```

### API Calls
```javascript
// Lấy dữ liệu RFID
const getRFIDData = async () => {
  const response = await fetch('/api/iot/rfid-data');
  const data = await response.json();
  return data;
};

// Lấy thống kê
const getRFIDStats = async () => {
  const response = await fetch('/api/iot/rfid-stats?days=7');
  const data = await response.json();
  return data;
};
```

## 🔐 Security Considerations

1. **API Security**: Endpoint RFID hiện tại là public, có thể thêm authentication nếu cần
2. **Data Validation**: Server validate tất cả input từ ESP32
3. **Rate Limiting**: Áp dụng rate limiting cho IoT endpoints
4. **Logging**: Log tất cả RFID activities để audit

## 📋 TODO

- [ ] Thêm authentication cho IoT endpoints
- [ ] Implement card whitelist/blacklist
- [ ] Add RFID card management UI
- [ ] Create RFID analytics dashboard
- [ ] Implement automatic barrier control based on RFID
- [ ] Add email/SMS notifications for RFID events 