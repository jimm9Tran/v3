import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import SimpleCameraFeed from './SimpleCameraFeed';
import {
  FaVideo,
  FaCar,
  FaEye,
  FaEyeSlash,
  FaPlay,
  FaStop,
  FaSync,
  FaCog,
  FaChartLine,
  FaHistory,
  FaBell,
  FaQrcode,
  FaCamera,
  FaSignOutAlt,
  FaHome,
  FaUsers,
  FaParking,
  FaVideoSlash,
  FaExclamationTriangle
} from 'react-icons/fa';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const { socket, isConnected } = useSocket();
  
  // State management
  const [cameras, setCameras] = useState({
    entry: { status: 'stopped', detectionCount: 0, stream: null, error: null },
    exit: { status: 'stopped', detectionCount: 0, stream: null, error: null }
  });
  const [detections, setDetections] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    alprService: 'disconnected',
    totalDetections: 0
  });
  const [loading, setLoading] = useState(false);
  const [showCameraControls, setShowCameraControls] = useState(false);
  const [cameraStreams, setCameraStreams] = useState({
    entry: null,
    exit: null
  });

  // Refs for video elements
  const entryVideoRef = useRef(null);
  const exitVideoRef = useRef(null);

  useEffect(() => {
    loadSystemStatus();
    setupSocketListeners();
    initializeCameraStreams();
    
    // Load initial detections
    loadRecentDetections();
    
    // Auto-refresh status every 30 seconds
    const interval = setInterval(loadSystemStatus, 30000);
    
    return () => {
      clearInterval(interval);
      stopCameraStreams();
    };
  }, []);

  const setupSocketListeners = () => {
    if (!socket) return;

    // Listen for camera frames
    socket.on('camera_frame', (data) => {
      updateCameraFrame(data);
    });

    // Listen for ALPR detections
    socket.on('alpr_detection', (detection) => {
      addDetection(detection);
      showDetectionNotification(detection);
    });

    // Listen for camera status updates
    socket.on('camera_status', (status) => {
      updateCameraStatus(status);
    });

    // Listen for system status
    socket.on('system_status', (status) => {
      setSystemStatus(status);
    });

    // Listen for camera stream errors
    socket.on('camera_error', (error) => {
      handleCameraError(error);
    });
  };

  const initializeCameraStreams = async () => {
    try {
      // Start camera streams immediately for demo
      setCameras(prev => ({
        entry: { ...prev.entry, status: 'running', detectionCount: 15 },
        exit: { ...prev.exit, status: 'running', detectionCount: 12 }
      }));
      
      console.log('Camera streams initialized');
    } catch (error) {
      console.error('Error initializing camera streams:', error);
      toast.error('Không thể khởi tạo camera streams');
    }
  };

  const startCameraStream = async (cameraId) => {
    try {
      // Simulate camera stream start
      setCameras(prev => ({
        ...prev,
        [cameraId]: {
          ...prev[cameraId],
          status: 'running',
          error: null,
          detectionCount: Math.floor(Math.random() * 20) + 1
        }
      }));

      toast.success(`Đã khởi động camera ${cameraId === 'entry' ? 'vào' : 'ra'}`);

    } catch (error) {
      console.error(`Error starting ${cameraId} camera:`, error);
      
      // Update camera status with error
      setCameras(prev => ({
        ...prev,
        [cameraId]: {
          ...prev[cameraId],
          status: 'error',
          error: error.message
        }
      }));

      toast.error(`Không thể khởi động camera ${cameraId === 'entry' ? 'vào' : 'ra'}`);
    }
  };

  const stopCameraStreams = () => {
    // Simulate stopping camera streams
    setCameraStreams({
      entry: null,
      exit: null
    });

    // Update camera status
    setCameras(prev => ({
      entry: { ...prev.entry, status: 'stopped', error: null },
      exit: { ...prev.exit, status: 'stopped', error: null }
    }));

    toast.success('Đã dừng tất cả camera');
  };

  const handleCameraError = (error) => {
    console.error('Camera error:', error);
    toast.error(`Lỗi camera: ${error.message}`);
  };

  const loadSystemStatus = async () => {
    try {
      const response = await axios.get('/api/staff/status');
      setSystemStatus(response.data);
    } catch (error) {
      console.error('Error loading system status:', error);
    }
  };

  const loadRecentDetections = async () => {
    try {
      const response = await axios.get('/api/staff/detections');
      setDetections(response.data.detections || []);
    } catch (error) {
      console.error('Error loading detections:', error);
    }
  };

  const updateCameraFrame = (data) => {
    const { camera_id, frame } = data;
    
    // Update camera stream (in real implementation, this would be video stream)
    if (camera_id === 'entry' && entryVideoRef.current) {
      // For demo, we'll show a placeholder
      entryVideoRef.current.src = `data:image/jpeg;base64,${frame}`;
    } else if (camera_id === 'exit' && exitVideoRef.current) {
      exitVideoRef.current.src = `data:image/jpeg;base64,${frame}`;
    }
  };

  const updateCameraStatus = (status) => {
    setCameras(prev => ({
      ...prev,
      entry: { ...prev.entry, ...status.entry },
      exit: { ...prev.exit, ...status.exit }
    }));
  };

  const addDetection = (detection) => {
    setDetections(prev => [detection, ...prev.slice(0, 9)]); // Keep last 10
    setSystemStatus(prev => ({
      ...prev,
      totalDetections: prev.totalDetections + 1
    }));
  };

  const showDetectionNotification = (detection) => {
    const confidenceText = detection.confidence >= 0.7 ? 'Cao' : 
                          detection.confidence >= 0.3 ? 'Thấp' : 'Không xác định';
    
    toast.success(
      `Phát hiện: ${detection.license_plate} (${confidenceText})`,
      {
        duration: 4000,
        icon: '🚗',
      }
    );
  };

  const handleStartCameras = async () => {
    setLoading(true);
    try {
      await axios.post('/api/staff/cameras/start');
      await initializeCameraStreams();
      toast.success('Đã khởi động camera');
      loadSystemStatus();
    } catch (error) {
      toast.error('Không thể khởi động camera');
    } finally {
      setLoading(false);
    }
  };

  const handleStopCameras = async () => {
    setLoading(true);
    try {
      await axios.post('/api/staff/cameras/stop');
      stopCameraStreams();
      toast.success('Đã dừng camera');
      loadSystemStatus();
    } catch (error) {
      toast.error('Không thể dừng camera');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = () => {
    loadSystemStatus();
    loadRecentDetections();
    toast.success('Đã làm mới trạng thái');
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'text-green-600 bg-green-100';
    if (confidence >= 0.3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.7) return 'Cao';
    if (confidence >= 0.3) return 'Thấp';
    return 'Không xác định';
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  const renderCameraFeed = (cameraId, camera) => {
    return (
      <SimpleCameraFeed
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <FaVideo className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Staff Monitoring Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  {isConnected ? '🟢 Đã kết nối' : '🔴 Mất kết nối'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500">Nhân viên</p>
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <FaSignOutAlt className="h-4 w-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FaCamera className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Camera Vào
                </h3>
                <p className={`text-sm ${cameras.entry.status === 'running' ? 'text-green-600' : 'text-red-600'}`}>
                  {cameras.entry.status === 'running' ? 'Đang hoạt động' : 'Đã dừng'}
                </p>
                <p className="text-xs text-gray-500">
                  {cameras.entry.detectionCount} phát hiện
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-success-100 rounded-lg flex items-center justify-center">
                <FaCamera className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Camera Ra
                </h3>
                <p className={`text-sm ${cameras.exit.status === 'running' ? 'text-green-600' : 'text-red-600'}`}>
                  {cameras.exit.status === 'running' ? 'Đang hoạt động' : 'Đã dừng'}
                </p>
                <p className="text-xs text-gray-500">
                  {cameras.exit.detectionCount} phát hiện
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <FaQrcode className="h-6 w-6 text-warning-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  ALPR Service
                </h3>
                <p className={`text-sm ${systemStatus.alprService === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                  {systemStatus.alprService === 'connected' ? 'Đã kết nối' : 'Mất kết nối'}
                </p>
                <p className="text-xs text-gray-500">
                  {systemStatus.totalDetections} tổng phát hiện
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-danger-100 rounded-lg flex items-center justify-center">
                <FaBell className="h-6 w-6 text-danger-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Thông báo
                </h3>
                <p className="text-sm text-gray-600">
                  {detections.length} gần đây
                </p>
                <p className="text-xs text-gray-500">
                  Real-time alerts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Camera Feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Entry Camera */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <FaVideo className="h-5 w-5 text-primary-600" />
                <span>Camera Vào</span>
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  cameras.entry.status === 'running' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {cameras.entry.status === 'running' ? 'Đang chạy' : 'Đã dừng'}
                </span>
              </div>
            </div>
            
            {renderCameraFeed('entry', cameras.entry)}
          </div>

          {/* Exit Camera */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <FaVideo className="h-5 w-5 text-success-600" />
                <span>Camera Ra</span>
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  cameras.exit.status === 'running' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {cameras.exit.status === 'running' ? 'Đang chạy' : 'Đã dừng'}
                </span>
              </div>
            </div>
            
            {renderCameraFeed('exit', cameras.exit)}
          </div>
        </div>

        {/* Control Panel */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <FaCog className="h-5 w-5 text-gray-600" />
              <span>Điều khiển hệ thống</span>
            </h3>
            <button
              onClick={() => setShowCameraControls(!showCameraControls)}
              className="btn btn-secondary"
            >
              {showCameraControls ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
            </button>
          </div>

          {showCameraControls && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleStartCameras}
                disabled={loading}
                className="btn btn-success flex items-center justify-center space-x-2"
              >
                <FaPlay className="h-4 w-4" />
                <span>Khởi động Camera</span>
              </button>
              
              <button
                onClick={handleStopCameras}
                disabled={loading}
                className="btn btn-danger flex items-center justify-center space-x-2"
              >
                <FaStop className="h-4 w-4" />
                <span>Dừng Camera</span>
              </button>
              
              <button
                onClick={handleRefreshStatus}
                disabled={loading}
                className="btn btn-primary flex items-center justify-center space-x-2"
              >
                <FaSync className="h-4 w-4" />
                <span>Làm mới trạng thái</span>
              </button>
            </div>
          )}
        </div>

        {/* Recent Detections */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <FaHistory className="h-5 w-5 text-gray-600" />
              <span>Phát hiện gần đây</span>
            </h3>
            <span className="text-sm text-gray-500">
              {detections.length} kết quả
            </span>
          </div>

          {detections.length === 0 ? (
            <div className="text-center py-12">
              <FaCar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có phát hiện nào
              </h3>
              <p className="text-gray-500">
                Camera sẽ hiển thị phát hiện biển số xe ở đây
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {detections.map((detection, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-soft transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FaCar className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {detection.license_plate}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {detection.vehicle_type} • {detection.camera}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(detection.confidence)}`}>
                            {getConfidenceText(detection.confidence)} ({Math.round(detection.confidence * 100)}%)
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(detection.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        detection.case === 'VALID_LICENSE_PLATE' ? 'bg-green-100 text-green-800' :
                        detection.case === 'LOW_CONFIDENCE_PLATE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {detection.case === 'VALID_LICENSE_PLATE' ? 'Hợp lệ' :
                         detection.case === 'LOW_CONFIDENCE_PLATE' ? 'Độ tin cậy thấp' :
                         'Không xác định'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard; 