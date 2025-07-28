# 🌐 Cấu hình Mạng cho Smart Parking System

## 📡 Thông tin Mạng hiện tại

### 🖥️ **Backend Server (Mac)**
- **IP Address**: `192.168.102.3`
- **Port**: `8080`
- **URL**: `http://192.168.102.3:8080`
- **Network**: `192.168.102.0/24`

### 🔍 **ALPR Service**
- **IP Address**: `192.168.102.3`
- **Port**: `5001`
- **URL**: `http://192.168.102.3:5001`

### 🖥️ **Client (Frontend)**
- **IP Address**: `192.168.102.3`
- **Port**: `3000`
- **URL**: `http://192.168.102.3:3000`

## 🤖 **ESP32 Configuration**

### 📝 **Cập nhật trong `esp32_rfid_servo_lcd.ino`:**

```cpp
// WiFi credentials - Cập nhật theo mạng của bạn
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend server URL - IP thực tế
const char* serverUrl = "http://192.168.102.3:8080/api/iot/rfid-data";
```

### 🔧 **Các API Endpoints cho ESP32:**

```cpp
// RFID Data
POST http://192.168.102.3:8080/api/iot/rfid-data

// Barrier Control
POST http://192.168.102.3:8080/api/iot/barrier-control

// Parking Lot Status
GET http://192.168.102.3:8080/api/iot/parking-lot/{id}/status
```

## 📱 **Client Configuration**

### 🌐 **Truy cập từ thiết bị khác:**
- **Backend API**: `http://192.168.102.3:8080`
- **Frontend**: `http://192.168.102.3:3000`
- **ALPR Service**: `http://192.168.102.3:5001`

### 📋 **Health Checks:**
```bash
# Test Backend
curl http://192.168.102.3:8080/api/health

# Test ALPR Service
curl http://192.168.102.3:5001/health

# Test Frontend
curl http://192.168.102.3:3000
```

## 🔍 **Kiểm tra kết nối**

### 📡 **Từ ESP32:**
```cpp
// Test WiFi connection
if (WiFi.status() == WL_CONNECTED) {
  Serial.println("WiFi Connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

// Test server connection
HTTPClient http;
http.begin("http://192.168.102.3:8080/api/health");
int httpCode = http.GET();
if (httpCode > 0) {
  Serial.println("Server connected!");
}
```

### 📱 **Từ thiết bị khác:**
```bash
# Ping test
ping 192.168.102.3

# Port test
nc -zv 192.168.102.3 8080
nc -zv 192.168.102.3 3000
nc -zv 192.168.102.3 5001
```

## 🔧 **Troubleshooting**

### ❌ **ESP32 không kết nối được:**
1. Kiểm tra WiFi credentials
2. Đảm bảo ESP32 và Server cùng mạng WiFi
3. Kiểm tra firewall settings
4. Test ping từ ESP32 đến Server

### ❌ **Server không accessible:**
1. Kiểm tra server đang chạy: `lsof -i :8080`
2. Kiểm tra firewall: `sudo ufw status`
3. Test localhost: `curl http://localhost:8080/api/health`

### ❌ **ALPR Service không accessible:**
1. Kiểm tra service đang chạy: `lsof -i :5001`
2. Test local: `curl http://localhost:5001/health`
3. Kiểm tra port conflict

## 📊 **Network Information**

### 🌐 **Subnet:**
- **Network**: `192.168.102.0/24`
- **Gateway**: `192.168.102.1`
- **DNS**: `8.8.8.8`, `8.8.4.4`

### 🔧 **Ports in use:**
- **8080**: Backend Server
- **3000**: Frontend Client
- **5001**: ALPR Service
- **27017**: MongoDB (nếu local)

## 🚀 **Deployment Checklist**

- [x] **Backend Server**: Running on `192.168.102.3:8080`
- [x] **ALPR Service**: Running on `192.168.102.3:5001`
- [x] **Frontend**: Running on `192.168.102.3:3000`
- [x] **ESP32 Config**: Updated with correct IP
- [x] **Network Access**: All devices can reach server
- [x] **Firewall**: Ports are open
- [x] **DNS**: Resolving correctly

---

**🎯 ESP32 có thể kết nối đến Server qua IP: `192.168.102.3:8080`** 