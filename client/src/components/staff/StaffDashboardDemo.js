import React, { useState, useEffect } from 'react';
import StaffDashboard from './StaffDashboard';

const StaffDashboardDemo = () => {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [demoData, setDemoData] = useState({
    cameras: {
      entry: { status: 'running', detectionCount: 15, error: null },
      exit: { status: 'running', detectionCount: 12, error: null }
    },
    detections: [
      {
        license_plate: '51A1234',
        confidence: 0.85,
        vehicle_type: 'car',
        case: 'VALID_LICENSE_PLATE',
        timestamp: new Date().toISOString(),
        camera: 'Entry Camera'
      },
      {
        license_plate: '30B5678',
        confidence: 0.72,
        vehicle_type: 'motorcycle',
        case: 'VALID_LICENSE_PLATE',
        timestamp: new Date(Date.now() - 30000).toISOString(),
        camera: 'Exit Camera'
      },
      {
        license_plate: '51C9012',
        confidence: 0.45,
        vehicle_type: 'car',
        case: 'LOW_CONFIDENCE_PLATE',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        camera: 'Entry Camera'
      }
    ],
    systemStatus: {
      alprService: 'connected',
      totalDetections: 27
    }
  });

  useEffect(() => {
    if (isDemoMode) {
      // Simulate real-time updates
      const interval = setInterval(() => {
        setDemoData(prev => ({
          ...prev,
          cameras: {
            entry: {
              ...prev.cameras.entry,
              detectionCount: prev.cameras.entry.detectionCount + Math.floor(Math.random() * 3)
            },
            exit: {
              ...prev.cameras.exit,
              detectionCount: prev.cameras.exit.detectionCount + Math.floor(Math.random() * 2)
            }
          },
          systemStatus: {
            ...prev.systemStatus,
            totalDetections: prev.systemStatus.totalDetections + Math.floor(Math.random() * 5)
          }
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isDemoMode]);

  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-blue-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-lg">🎬</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold">
                  Staff Dashboard Demo
                </h1>
                <p className="text-sm text-blue-100">
                  Mô phỏng camera streams và ALPR detections
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isDemoMode 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isDemoMode ? 'DEMO MODE' : 'LIVE MODE'}
              </span>
              
              <button
                onClick={toggleDemoMode}
                className="px-4 py-2 bg-white bg-opacity-20 rounded-lg text-sm font-medium hover:bg-opacity-30 transition-colors"
              >
                {isDemoMode ? 'Chuyển sang Live' : 'Chuyển sang Demo'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Info */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 text-yellow-800">
            <span className="text-sm">💡</span>
            <span className="text-sm">
              <strong>Demo Mode:</strong> Camera streams được mô phỏng với Canvas animation. 
              Trong môi trường thực tế, đây sẽ là video streams từ camera thật.
            </span>
          </div>
        </div>
      </div>

      {/* Staff Dashboard */}
      <StaffDashboard demoData={isDemoMode ? demoData : null} />
    </div>
  );
};

export default StaffDashboardDemo; 