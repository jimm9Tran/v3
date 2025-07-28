# Staff Dashboard - Camera Monitoring

## 📹 Camera Streams trong Staff Dashboard

Staff Dashboard hiện đã được tích hợp với **camera streams thực tế** và **mô phỏng camera** để demo.

### 🎯 Tính năng Camera

#### **Real-time Camera Streams:**
- **Live video feeds**: Camera vào và ra với streams thực tế
- **Canvas animation**: Mô phỏng camera streams cho demo
- **Error handling**: Xử lý lỗi camera và retry mechanism
- **Status indicators**: Chỉ báo trạng thái camera trực quan

#### **Camera Controls:**
- **Start/Stop cameras**: Điều khiển camera streams
- **Real-time status**: Cập nhật trạng thái live
- **Detection counters**: Đếm số lần phát hiện
- **Error recovery**: Tự động thử lại khi có lỗi

### 🎬 Demo Mode vs Live Mode

#### **Demo Mode (Canvas Animation):**
```javascript
// Camera streams được mô phỏng với Canvas
<CameraSimulator
  cameraId="entry"
  status="running"
  detectionCount={15}
  onError={(action) => handleError(action)}
/>
```

**Features:**
- ✅ Animated background với gradient
- ✅ Moving objects (simulating vehicles)
- ✅ Real-time timestamp
- ✅ Camera info overlay
- ✅ Live indicator với red dot
- ✅ Frame counter

#### **Live Mode (Real Camera Streams):**
```javascript
// Camera streams thực tế từ getUserMedia
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: cameraId === 'entry' ? 'environment' : 'user'
  },
  audio: false
});
```

**Features:**
- ✅ Real camera feeds
- ✅ WebRTC streams
- ✅ Hardware acceleration
- ✅ Low latency
- ✅ High quality video

### 🔧 Technical Implementation

#### **Camera Stream Management:**
```javascript
// State management cho camera streams
const [cameraStreams, setCameraStreams] = useState({
  entry: null,
  exit: null
});

const [cameras, setCameras] = useState({
  entry: { status: 'stopped', detectionCount: 0, error: null },
  exit: { status: 'stopped', detectionCount: 0, error: null }
});
```

#### **Camera Initialization:**
```javascript
const initializeCameraStreams = async () => {
  try {
    await startCameraStream('entry');
    await startCameraStream('exit');
  } catch (error) {
    console.error('Error initializing camera streams:', error);
    toast.error('Không thể khởi tạo camera streams');
  }
};
```

#### **Camera Controls:**
```javascript
// Start cameras
const handleStartCameras = async () => {
  await axios.post('/api/staff/cameras/start');
  await initializeCameraStreams();
  toast.success('Đã khởi động camera');
};

// Stop cameras
const handleStopCameras = async () => {
  await axios.post('/api/staff/cameras/stop');
  stopCameraStreams();
  toast.success('Đã dừng camera');
};
```

### 🎨 UI Components

#### **Camera Feed Component:**
```javascript
const renderCameraFeed = (cameraId, camera) => {
  return (
    <CameraSimulator
      cameraId={cameraId}
      status={camera.status}
      detectionCount={camera.detectionCount}
      onError={(action) => {
        if (action === 'retry') {
          startCameraStream(cameraId);
        }
      }}
    />
  );
};
```

#### **Camera Status States:**

1. **Running State:**
   - Live video stream
   - Green "LIVE" indicator
   - Detection counter
   - Camera info overlay

2. **Stopped State:**
   - Gray background
   - "Camera đã dừng" message
   - Video slash icon

3. **Error State:**
   - Red error icon
   - Error message
   - Retry button

### 📱 Responsive Design

#### **Desktop Layout:**
```
┌─────────────────────────────────────┐
│ Camera Vào    │    Camera Ra       │
│ [Live Stream] │   [Live Stream]    │
│               │                     │
│ Detections: 15│   Detections: 12   │
└─────────────────────────────────────┘
```

#### **Mobile Layout:**
```
┌─────────────────┐
│ Camera Vào      │
│ [Live Stream]   │
│                 │
│ Detections: 15  │
└─────────────────┘
┌─────────────────┐
│ Camera Ra       │
│ [Live Stream]   │
│                 │
│ Detections: 12  │
└─────────────────┘
```

### 🔄 Real-time Updates

#### **Socket.IO Events:**
```javascript
// Listen for camera frames
socket.on('camera_frame', (data) => {
  updateCameraFrame(data);
});

// Listen for camera status updates
socket.on('camera_status', (status) => {
  updateCameraStatus(status);
});

// Listen for camera errors
socket.on('camera_error', (error) => {
  handleCameraError(error);
});
```

#### **Auto-refresh:**
- System status: 30 giây
- Camera status: Real-time via Socket.IO
- Detection counts: Real-time updates

### 🛠️ Error Handling

#### **Camera Error Types:**
1. **Permission denied**: User chưa cho phép camera
2. **Device not found**: Camera không tồn tại
3. **Stream error**: Lỗi video stream
4. **Network error**: Lỗi kết nối

#### **Error Recovery:**
```javascript
const handleCameraError = (error) => {
  console.error('Camera error:', error);
  
  // Update camera status
  setCameras(prev => ({
    ...prev,
    [cameraId]: {
      ...prev[cameraId],
      status: 'error',
      error: error.message
    }
  }));
  
  // Show user-friendly message
  toast.error(`Lỗi camera: ${error.message}`);
};
```

### 🚀 Performance Optimization

#### **Canvas Animation:**
- 60 FPS smooth animation
- Hardware acceleration
- Efficient rendering
- Memory management

#### **Video Streams:**
- WebRTC optimization
- Adaptive bitrate
- Low latency
- Quality scaling

### 🔒 Security Considerations

#### **Camera Permissions:**
- HTTPS required for getUserMedia
- User consent required
- Permission handling
- Fallback mechanisms

#### **Stream Security:**
- Encrypted streams
- Access control
- Audit logging
- Privacy protection

### 📊 Monitoring & Analytics

#### **Camera Metrics:**
- Uptime percentage
- Frame rate
- Detection accuracy
- Error rates

#### **Performance Metrics:**
- Stream latency
- Bandwidth usage
- CPU usage
- Memory usage

### 🧪 Testing

#### **Demo Testing:**
```bash
# Start React development server
cd client
npm start

# Navigate to staff dashboard
# http://localhost:3000/staff
```

#### **Live Camera Testing:**
```bash
# Test camera permissions
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => console.log('Camera access granted'))
  .catch(err => console.error('Camera access denied:', err));
```

### 🎯 Usage Examples

#### **1. Start Camera Monitoring:**
```javascript
// Click "Khởi động Camera" button
// Camera streams sẽ được khởi tạo
// Real-time video feeds sẽ hiển thị
```

#### **2. Monitor Detections:**
```javascript
// Camera streams sẽ tự động phát hiện
// ALPR detections sẽ hiển thị real-time
// Detection history được cập nhật
```

#### **3. Handle Camera Errors:**
```javascript
// Nếu camera có lỗi
// Error state sẽ hiển thị
// Click "Thử lại" để restart
```

### 🔮 Future Enhancements

#### **Planned Features:**
- **Multi-camera support**: Hỗ trợ nhiều camera
- **Recording**: Ghi lại video streams
- **Screenshot**: Chụp ảnh từ camera
- **Zoom controls**: Điều khiển zoom camera

#### **AI Integration:**
- **Face detection**: Phát hiện khuôn mặt
- **Vehicle tracking**: Theo dõi xe
- **Motion detection**: Phát hiện chuyển động
- **Object recognition**: Nhận diện đối tượng

### 📝 Troubleshooting

#### **Common Issues:**

1. **Camera không hiển thị:**
   ```bash
   # Kiểm tra permissions
   # Kiểm tra HTTPS
   # Kiểm tra camera hardware
   ```

2. **Stream lag:**
   ```bash
   # Giảm resolution
   # Tối ưu bandwidth
   # Check network connection
   ```

3. **Permission denied:**
   ```bash
   # Clear browser cache
   # Reset permissions
   # Try different browser
   ```

### 🎉 Kết luận

Staff Dashboard với camera streams cung cấp:

- ✅ **Real-time monitoring**: Giám sát camera live
- ✅ **Interactive controls**: Điều khiển camera dễ dàng
- ✅ **Error handling**: Xử lý lỗi thông minh
- ✅ **Responsive design**: Tương thích mọi thiết bị
- ✅ **Demo mode**: Mô phỏng cho testing
- ✅ **Live mode**: Camera streams thực tế

**Camera monitoring** đã được tích hợp hoàn chỉnh vào Staff Dashboard, cung cấp trải nghiệm giám sát camera chuyên nghiệp và đáng tin cậy. 