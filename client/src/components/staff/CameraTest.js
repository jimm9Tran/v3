import React, { useState, useEffect } from 'react';
import SimpleCameraFeed from './SimpleCameraFeed';

const CameraTest = () => {
  const [cameras, setCameras] = useState({
    entry: { status: 'running', detectionCount: 15 },
    exit: { status: 'running', detectionCount: 12 }
  });

  const [testMode, setTestMode] = useState('running');

  useEffect(() => {
    // Auto-start cameras
    setCameras({
      entry: { status: 'running', detectionCount: 15 },
      exit: { status: 'running', detectionCount: 12 }
    });
  }, []);

  const toggleCameraStatus = (cameraId) => {
    setCameras(prev => ({
      ...prev,
      [cameraId]: {
        ...prev[cameraId],
        status: prev[cameraId].status === 'running' ? 'stopped' : 'running'
      }
    }));
  };

  const simulateError = (cameraId) => {
    setCameras(prev => ({
      ...prev,
      [cameraId]: {
        ...prev[cameraId],
        status: 'error'
      }
    }));
  };

  const resetCameras = () => {
    setCameras({
      entry: { status: 'running', detectionCount: 15 },
      exit: { status: 'running', detectionCount: 12 }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Camera Test Dashboard
          </h1>
          <p className="text-gray-600">
            Test camera streams và các trạng thái khác nhau
          </p>
        </div>

        {/* Control Panel */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Camera Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => toggleCameraStatus('entry')}
              className="btn btn-primary"
            >
              Toggle Entry Camera
            </button>
            <button
              onClick={() => toggleCameraStatus('exit')}
              className="btn btn-primary"
            >
              Toggle Exit Camera
            </button>
            <button
              onClick={() => simulateError('entry')}
              className="btn btn-warning"
            >
              Simulate Entry Error
            </button>
            <button
              onClick={resetCameras}
              className="btn btn-success"
            >
              Reset All Cameras
            </button>
          </div>
        </div>

        {/* Camera Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Entry Camera Status</h3>
            <p className="text-sm text-gray-600">
              Status: <span className={`font-medium ${
                cameras.entry.status === 'running' ? 'text-green-600' : 
                cameras.entry.status === 'error' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {cameras.entry.status.toUpperCase()}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Detections: {cameras.entry.detectionCount}
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Exit Camera Status</h3>
            <p className="text-sm text-gray-600">
              Status: <span className={`font-medium ${
                cameras.exit.status === 'running' ? 'text-green-600' : 
                cameras.exit.status === 'error' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {cameras.exit.status.toUpperCase()}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Detections: {cameras.exit.detectionCount}
            </p>
          </div>
        </div>

        {/* Camera Feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Entry Camera */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Entry Camera
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                cameras.entry.status === 'running' 
                  ? 'bg-green-100 text-green-800' 
                  : cameras.entry.status === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {cameras.entry.status.toUpperCase()}
              </span>
            </div>
            
            <SimpleCameraFeed
              cameraId="entry"
              status={cameras.entry.status}
              detectionCount={cameras.entry.detectionCount}
              onError={(action) => {
                if (action === 'retry') {
                  setCameras(prev => ({
                    ...prev,
                    entry: { ...prev.entry, status: 'running' }
                  }));
                }
              }}
            />
          </div>

          {/* Exit Camera */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Exit Camera
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                cameras.exit.status === 'running' 
                  ? 'bg-green-100 text-green-800' 
                  : cameras.exit.status === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {cameras.exit.status.toUpperCase()}
              </span>
            </div>
            
            <SimpleCameraFeed
              cameraId="exit"
              status={cameras.exit.status}
              detectionCount={cameras.exit.detectionCount}
              onError={(action) => {
                if (action === 'retry') {
                  setCameras(prev => ({
                    ...prev,
                    exit: { ...prev.exit, status: 'running' }
                  }));
                }
              }}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="card mt-8">
          <h3 className="text-lg font-semibold mb-4">Test Instructions</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <strong>Running:</strong> Camera đang hoạt động với animation</p>
            <p>• <strong>Stopped:</strong> Camera đã dừng, hiển thị thông báo</p>
            <p>• <strong>Error:</strong> Camera có lỗi, hiển thị nút retry</p>
            <p>• <strong>Animation:</strong> Moving vehicles với real-time timestamp</p>
            <p>• <strong>Overlay:</strong> Camera info, detection count, live indicator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraTest; 