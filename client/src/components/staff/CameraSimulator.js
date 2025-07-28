import React, { useRef, useEffect, useState } from 'react';
import { FaVideo, FaVideoSlash, FaExclamationTriangle } from 'react-icons/fa';

const CameraSimulator = ({ cameraId, status, detectionCount, onError }) => {
  const canvasRef = useRef(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    if (status === 'running' && !isSimulating) {
      startSimulation();
    } else if (status === 'stopped' && isSimulating) {
      stopSimulation();
    }
  }, [status, isSimulating]);

  const startSimulation = () => {
    setIsSimulating(true);
    setFrameCount(0);
    simulateCamera();
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  const simulateCamera = () => {
    if (!isSimulating || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);

    // Draw simulated camera feed
    const time = Date.now() * 0.001;
    
    // Animated background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#374151');
    gradient.addColorStop(1, '#1f2937');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw moving objects (simulating vehicles)
    const objectCount = 3;
    for (let i = 0; i < objectCount; i++) {
      const x = (time * 50 + i * 200) % (width + 100) - 50;
      const y = height / 2 + Math.sin(time + i) * 20;
      const size = 30 + Math.sin(time * 2 + i) * 10;

      // Draw vehicle-like shape
      ctx.fillStyle = `hsl(${200 + i * 60}, 70%, 60%)`;
      ctx.fillRect(x, y - size/2, size * 2, size);
      
      // Add some details
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + size * 0.2, y - size/3, size * 0.6, size/3);
    }

    // Draw camera info overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 60);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.fillText(`Camera ${cameraId === 'entry' ? 'Vào' : 'Ra'}`, 20, 30);
    ctx.fillText(`Detections: ${detectionCount}`, 20, 50);
    ctx.fillText(`Frame: ${frameCount}`, 20, 70);

    // Draw timestamp
    const timestamp = new Date().toLocaleTimeString();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width - 150, height - 30, 140, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText(timestamp, width - 140, height - 15);

    // Draw live indicator
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(width - 20, 20, 6, 0, 2 * Math.PI);
    ctx.fill();

    setFrameCount(prev => prev + 1);
    
    // Continue animation
    if (isSimulating) {
      requestAnimationFrame(simulateCamera);
    }
  };

  const renderErrorState = () => (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden h-64 flex items-center justify-center">
      <div className="text-center text-white">
        <FaExclamationTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-medium mb-2">Lỗi Camera</h3>
        <p className="text-sm text-gray-300 mb-4">Không thể kết nối camera</p>
        <button
          onClick={() => onError && onError('retry')}
          className="btn btn-primary"
        >
          Thử lại
        </button>
      </div>
    </div>
  );

  const renderStoppedState = () => (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden h-64 flex items-center justify-center">
      <div className="text-center text-white">
        <FaVideoSlash className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">Camera đã dừng</h3>
        <p className="text-sm text-gray-300">
          Camera {cameraId === 'entry' ? 'vào' : 'ra'} hiện không hoạt động
        </p>
      </div>
    </div>
  );

  const renderLiveStream = () => (
    <div className="relative bg-black rounded-lg overflow-hidden h-64">
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="w-full h-full object-cover"
      />
      
      {/* Camera overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        Camera {cameraId === 'entry' ? 'Vào' : 'Ra'}
      </div>
      
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        {detectionCount} detections
      </div>
      
      <div className="absolute top-4 right-4">
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
          LIVE
        </span>
      </div>
    </div>
  );

  if (status === 'error') {
    return renderErrorState();
  }

  if (status === 'stopped') {
    return renderStoppedState();
  }

  return renderLiveStream();
};

export default CameraSimulator; 