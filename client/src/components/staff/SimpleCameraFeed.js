import React, { useRef, useEffect, useState } from 'react';
import { FaVideo, FaVideoSlash, FaExclamationTriangle } from 'react-icons/fa';

const SimpleCameraFeed = ({ cameraId, status, detectionCount, onError }) => {
  const canvasRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (status === 'running' && !isAnimating) {
      startAnimation();
    } else if (status === 'stopped' && isAnimating) {
      stopAnimation();
    }
  }, [status, isAnimating]);

  const startAnimation = () => {
    setIsAnimating(true);
    animate();
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  const animate = () => {
    if (!isAnimating || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);

    // Draw animated background
    const time = Date.now() * 0.001;
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#374151');
    gradient.addColorStop(1, '#1f2937');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw moving vehicles
    for (let i = 0; i < 2; i++) {
      const x = (time * 30 + i * 150) % (width + 100) - 50;
      const y = height / 2 + Math.sin(time + i) * 15;
      const size = 25 + Math.sin(time * 2 + i) * 8;

      // Vehicle body
      ctx.fillStyle = `hsl(${200 + i * 60}, 70%, 60%)`;
      ctx.fillRect(x, y - size/2, size * 2, size);
      
      // Vehicle windows
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + size * 0.2, y - size/3, size * 0.6, size/3);
    }

    // Draw camera info
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 180, 50);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText(`Camera ${cameraId === 'entry' ? 'Vào' : 'Ra'}`, 20, 25);
    ctx.fillText(`Detections: ${detectionCount}`, 20, 40);
    ctx.fillText(`Frame: ${Math.floor(time * 60)}`, 20, 55);

    // Draw timestamp
    const timestamp = new Date().toLocaleTimeString();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(width - 140, height - 25, 130, 15);
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.fillText(timestamp, width - 130, height - 15);

    // Draw live indicator
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(width - 15, 15, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Continue animation
    if (isAnimating) {
      requestAnimationFrame(animate);
    }
  };

  if (status === 'error') {
    return (
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
  }

  if (status === 'stopped') {
    return (
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
  }

  return (
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
};

export default SimpleCameraFeed; 