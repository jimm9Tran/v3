# Camera Test Guide

## 🎯 Cách test Camera Streams

### **1. Khởi động ứng dụng:**

```bash
# Terminal 1: Start Staff API Server
cd alpr_service_simple
python integrate_staff_api.py

# Terminal 2: Start React Client
cd client
npm start
```

### **2. Truy cập Camera Test:**

- **URL**: `http://localhost:3000/camera-test`
- **Route**: `/camera-test`
- **Access**: Staff account required

### **3. Test các trạng thái Camera:**

#### **Running State (Mặc định):**
- ✅ Animated background với gradient
- ✅ Moving vehicles (simulating traffic)
- ✅ Real-time timestamp
- ✅ Camera info overlay
- ✅ Live indicator (red dot)
- ✅ Detection counter

#### **Stopped State:**
- Click "Toggle Entry Camera" hoặc "Toggle Exit Camera"
- ✅ Gray background
- ✅ "Camera đã dừng" message
- ✅ Video slash icon

#### **Error State:**
- Click "Simulate Entry Error"
- ✅ Red error icon
- ✅ Error message
- ✅ Retry button

### **4. Camera Controls:**

#### **Toggle Camera Status:**
```javascript
// Toggle giữa running và stopped
toggleCameraStatus('entry')  // Entry camera
toggleCameraStatus('exit')   // Exit camera
```

#### **Simulate Error:**
```javascript
// Simulate camera error
simulateError('entry')  // Entry camera error
```

#### **Reset Cameras:**
```javascript
// Reset tất cả camera về running state
resetCameras()
```

### **5. Camera Features:**

#### **Animation:**
- **60 FPS**: Smooth animation
- **Moving vehicles**: Simulating traffic flow
- **Real-time clock**: Live timestamp
- **Gradient background**: Professional look

#### **Overlay Information:**
- **Camera name**: "Camera Vào" / "Camera Ra"
- **Detection count**: Number of detections
- **Frame counter**: Performance tracking
- **Live indicator**: Red dot for active status

#### **Status Indicators:**
- **🟢 Running**: Green badge
- **🔴 Error**: Red badge  
- **⚫ Stopped**: Gray badge

### **6. Troubleshooting:**

#### **Camera không hiển thị:**
```bash
# Kiểm tra console errors
# Kiểm tra browser permissions
# Kiểm tra HTTPS requirement
```

#### **Animation lag:**
```bash
# Kiểm tra browser performance
# Kiểm tra hardware acceleration
# Kiểm tra memory usage
```

#### **Canvas errors:**
```bash
# Kiểm tra browser support
# Kiểm tra JavaScript errors
# Kiểm tra component mounting
```

### **7. Expected Behavior:**

#### **Running State:**
```
┌─────────────────────────────────────┐
│ 🎬 [Animated Background]            │
│ 🚗 [Moving Vehicles]               │
│ 📊 Camera Vào - Detections: 15     │
│ 🕐 10:30:45 - Frame: 1234         │
│ 🔴 [Live Indicator]                │
└─────────────────────────────────────┘
```

#### **Stopped State:**
```
┌─────────────────────────────────────┐
│ ⏸️  [Gray Background]              │
│ 📹 Camera đã dừng                  │
│ Camera vào hiện không hoạt động     │
└─────────────────────────────────────┘
```

#### **Error State:**
```
┌─────────────────────────────────────┐
│ ⚠️  [Red Error Icon]               │
│ ❌ Lỗi Camera                      │
│ Không thể kết nối camera           │
│ [Thử lại] Button                   │
└─────────────────────────────────────┘
```

### **8. Performance Metrics:**

#### **Animation Performance:**
- **Target FPS**: 60 FPS
- **Memory usage**: < 50MB per camera
- **CPU usage**: < 10% per camera
- **Smooth animation**: No lag or stutter

#### **Responsive Design:**
- **Desktop**: 2-column layout
- **Tablet**: Optimized layout
- **Mobile**: Single column layout
- **Touch-friendly**: Mobile controls

### **9. Browser Compatibility:**

#### **Supported Browsers:**
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

#### **Required Features:**
- ✅ Canvas API
- ✅ requestAnimationFrame
- ✅ ES6+ support
- ✅ CSS Grid/Flexbox

### **10. Development Notes:**

#### **Component Structure:**
```
CameraTest
├── SimpleCameraFeed
│   ├── Canvas Animation
│   ├── Status States
│   └── Error Handling
└── Control Panel
    ├── Toggle Buttons
    ├── Error Simulation
    └── Reset Function
```

#### **State Management:**
```javascript
const [cameras, setCameras] = useState({
  entry: { status: 'running', detectionCount: 15 },
  exit: { status: 'running', detectionCount: 12 }
});
```

#### **Animation Loop:**
```javascript
const animate = () => {
  // Draw frame
  drawFrame();
  
  // Continue animation
  if (isAnimating) {
    requestAnimationFrame(animate);
  }
};
```

### **11. Production Considerations:**

#### **Real Camera Integration:**
```javascript
// Replace canvas with real video stream
const stream = await navigator.mediaDevices.getUserMedia({
  video: { width: 640, height: 480 }
});
```

#### **Performance Optimization:**
- **WebGL**: For complex animations
- **Web Workers**: For heavy processing
- **Memory management**: Clean up resources
- **Error boundaries**: Handle crashes

#### **Security:**
- **HTTPS required**: For camera access
- **Permission handling**: User consent
- **Error sanitization**: Safe error messages
- **Access control**: Staff-only access

### **12. Testing Checklist:**

#### **Functionality Tests:**
- ✅ Camera animation displays
- ✅ Status changes work
- ✅ Error simulation works
- ✅ Retry button functions
- ✅ Reset button works

#### **Performance Tests:**
- ✅ Smooth 60 FPS animation
- ✅ Low memory usage
- ✅ Responsive design
- ✅ Mobile compatibility

#### **Error Tests:**
- ✅ Error state displays
- ✅ Retry mechanism works
- ✅ Graceful degradation
- ✅ User-friendly messages

### **🎉 Kết luận:**

Camera test dashboard cung cấp:

- ✅ **Visual feedback**: Animated camera streams
- ✅ **Interactive controls**: Toggle, error, reset
- ✅ **Status monitoring**: Real-time status display
- ✅ **Error handling**: Graceful error recovery
- ✅ **Performance testing**: Smooth animation
- ✅ **Responsive design**: Mobile-friendly interface

**Camera streams** đã được test và hoạt động đúng với các trạng thái khác nhau! 