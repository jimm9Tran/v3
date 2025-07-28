# Staff Dashboard Integration

## Tổng quan

Staff Dashboard đã được tích hợp vào client React hiện có, cung cấp giao diện giám sát camera và ALPR detections cho nhân viên.

## Tính năng đã tích hợp

### 📹 **Camera Monitoring**
- **Real-time status**: Trạng thái camera vào/ra
- **Detection counters**: Đếm số lần phát hiện
- **Visual indicators**: Chỉ báo trạng thái trực quan
- **Camera controls**: Khởi động/dừng camera

### 🚗 **ALPR Detection Display**
- **License plate recognition**: Hiển thị biển số được nhận diện
- **Confidence levels**: Độ tin cậy với color coding
- **Vehicle type identification**: Loại xe (car, motorcycle, truck, bus)
- **Detection history**: Lịch sử 10 detections gần nhất

### 🎛️ **Control Panel**
- **Start/Stop cameras**: Điều khiển camera streams
- **Refresh status**: Làm mới trạng thái hệ thống
- **Real-time notifications**: Thông báo popup khi có detection mới

### 📊 **System Status**
- **Camera status**: Trạng thái camera vào/ra
- **ALPR service status**: Kết nối với ALPR service
- **Detection counts**: Số lần phát hiện
- **Connection status**: Trạng thái kết nối real-time

## Cấu trúc tích hợp

### Frontend (React Client)
```
client/src/components/staff/
└── StaffDashboard.js          # Component chính cho staff dashboard
```

### Backend (API Routes)
```
alpr_service_simple/
├── staff_api_routes.py        # API endpoints cho staff
├── integrate_staff_api.py     # Server integration
└── staff_monitoring_dashboard.py  # Flask dashboard (backup)
```

## API Endpoints

### Staff Status
```http
GET /api/staff/status
```
Lấy trạng thái hệ thống cho staff dashboard

### Detections
```http
GET /api/staff/detections
```
Lấy danh sách detections gần đây

### Camera Control
```http
POST /api/staff/cameras/start
POST /api/staff/cameras/stop
```
Điều khiển camera streams

### Camera Status
```http
GET /api/staff/cameras/status
```
Lấy trạng thái chi tiết camera

### ALPR Test
```http
POST /api/staff/alpr/test
```
Test kết nối ALPR service

### System Logs
```http
GET /api/staff/logs
```
Lấy system logs

### Analytics
```http
GET /api/staff/analytics
```
Lấy dữ liệu analytics

## Cách sử dụng

### 1. Khởi động Staff API Server
```bash
cd alpr_service_simple
python integrate_staff_api.py
```

### 2. Truy cập Staff Dashboard
- Đăng nhập với tài khoản staff
- Truy cập `/staff` route
- Hoặc click vào "Staff Dashboard" trong navigation

### 3. Sử dụng các tính năng
- **Monitor cameras**: Xem trạng thái camera real-time
- **View detections**: Xem danh sách phát hiện gần đây
- **Control cameras**: Khởi động/dừng camera
- **Check system status**: Kiểm tra trạng thái hệ thống

## Socket.IO Integration

### Events được hỗ trợ
```javascript
// Client → Server
socket.emit('request_camera_status');

// Server → Client
socket.on('camera_frame', (data) => {
  // Update camera frame
});

socket.on('alpr_detection', (detection) => {
  // Handle new detection
});

socket.on('camera_status', (status) => {
  // Update camera status
});

socket.on('system_status', (status) => {
  // Update system status
});
```

## State Management

### Camera State
```javascript
const [cameras, setCameras] = useState({
  entry: { status: 'stopped', detectionCount: 0, stream: null },
  exit: { status: 'stopped', detectionCount: 0, stream: null }
});
```

### Detections State
```javascript
const [detections, setDetections] = useState([]);
```

### System Status State
```javascript
const [systemStatus, setSystemStatus] = useState({
  alprService: 'disconnected',
  totalDetections: 0
});
```

## UI Components

### Header
- Logo và tên hệ thống
- Connection status
- User info và logout

### System Status Panel
- Camera status cards
- ALPR service status
- Detection counters

### Camera Feeds
- Entry camera với live stream
- Exit camera với live stream
- Camera info với status và detection count

### Control Panel
- Start/Stop camera buttons
- Refresh status button
- Real-time notifications

### Recent Detections
- License plate information
- Confidence levels với color coding
- Vehicle type
- Camera source
- Timestamp

## Color Coding

### Confidence Levels
- **High (≥70%)**: 🟢 Green
- **Low (30-70%)**: 🟡 Yellow  
- **None (<30%)**: 🔴 Red

### Detection Cases
- **VALID_LICENSE_PLATE**: 🟢 Green badge
- **LOW_CONFIDENCE_PLATE**: 🟡 Yellow badge
- **NO_LICENSE_PLATE**: 🔴 Red badge

### Camera Status
- **Running**: 🟢 Green text
- **Stopped**: 🔴 Red text

## Real-time Features

### Auto-refresh
- System status: 30 giây
- Detections: Real-time via Socket.IO
- Camera status: Real-time via Socket.IO

### Notifications
- New detection alerts
- Camera status changes
- System errors

### Socket.IO Connection
- Real-time camera frames
- Live ALPR detections
- Instant status updates

## Error Handling

### API Errors
```javascript
try {
  const response = await axios.get('/api/staff/status');
  setSystemStatus(response.data);
} catch (error) {
  console.error('Error loading system status:', error);
  toast.error('Không thể tải trạng thái hệ thống');
}
```

### Socket.IO Errors
```javascript
socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
  toast.error('Mất kết nối real-time');
});
```

### Camera Errors
```javascript
const handleStartCameras = async () => {
  setLoading(true);
  try {
    await axios.post('/api/staff/cameras/start');
    toast.success('Đã khởi động camera');
  } catch (error) {
    toast.error('Không thể khởi động camera');
  } finally {
    setLoading(false);
  }
};
```

## Performance Optimization

### Lazy Loading
- Load detections on demand
- Paginate large datasets
- Cache frequently accessed data

### Real-time Updates
- Efficient Socket.IO events
- Debounced status updates
- Optimized re-renders

### Memory Management
- Clean up Socket.IO listeners
- Clear intervals on unmount
- Limit detection history

## Security Considerations

### Authentication
- Staff-only access
- Role-based permissions
- Session management

### API Security
- Input validation
- Rate limiting
- Error sanitization

### Data Protection
- Sensitive data encryption
- Audit logging
- Privacy compliance

## Testing

### Unit Tests
```bash
# Test staff dashboard component
npm test -- --testPathPattern=StaffDashboard

# Test API endpoints
python -m pytest test_staff_api.py
```

### Integration Tests
```bash
# Test full staff workflow
npm run test:integration:staff
```

### Manual Testing
1. Start staff API server
2. Login as staff user
3. Navigate to `/staff`
4. Test all features
5. Verify real-time updates

## Deployment

### Development
```bash
# Start staff API server
cd alpr_service_simple
python integrate_staff_api.py

# Start React client
cd client
npm start
```

### Production
```bash
# Build React app
npm run build

# Deploy staff API
gunicorn -w 4 -k gevent -b 0.0.0.0:5003 integrate_staff_api:app
```

## Troubleshooting

### Common Issues

#### 1. Socket.IO Connection Failed
```bash
# Check if staff API server is running
curl http://localhost:5003/health

# Check Socket.IO configuration
# Verify CORS settings
```

#### 2. Camera Not Starting
```bash
# Check camera permissions
# Verify camera index
# Check system resources
```

#### 3. ALPR Service Not Connected
```bash
# Test ALPR service
curl -X POST http://localhost:5003/api/staff/alpr/test

# Check ALPR service logs
# Verify network connectivity
```

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('debug', 'staff-dashboard:*');

// Check browser console for detailed logs
console.log('Staff Dashboard Debug Mode');
```

## Future Enhancements

### Planned Features
- **Multi-camera support**: Hỗ trợ nhiều camera
- **Recording**: Ghi lại video streams
- **Analytics**: Phân tích dữ liệu nâng cao
- **Mobile app**: Ứng dụng mobile cho staff

### AI Integration
- **Face recognition**: Nhận diện khuôn mặt
- **Vehicle classification**: Phân loại xe nâng cao
- **Anomaly detection**: Phát hiện bất thường

### User Experience
- **Dark mode**: Chế độ tối
- **Customizable layout**: Layout tùy chỉnh
- **Multi-language**: Đa ngôn ngữ
- **Accessibility**: Hỗ trợ người khuyết tật

---

**Staff Dashboard Integration** - Giải pháp giám sát camera tích hợp hoàn chỉnh cho hệ thống bãi xe thông minh. 