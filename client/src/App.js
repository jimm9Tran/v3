import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Profile from './components/profile/Profile';
import Vehicles from './components/vehicles/Vehicles';
import ParkingHistory from './components/history/ParkingHistory';
import Payment from './components/payment/Payment';
import AdminDashboard from './components/admin/AdminDashboard';
import StaffDashboard from './components/staff/StaffDashboard';
import CameraTest from './components/staff/CameraTest';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/vehicles" element={
                <ProtectedRoute>
                  <Vehicles />
                </ProtectedRoute>
              } />
              
              <Route path="/history" element={
                <ProtectedRoute>
                  <ParkingHistory />
                </ProtectedRoute>
              } />
              
              <Route path="/payment/:sessionId" element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              {/* Staff Routes */}
              <Route path="/staff" element={
                <ProtectedRoute staffOnly>
                  <StaffDashboard />
                </ProtectedRoute>
              } />
              
              {/* Camera Test Route */}
              <Route path="/camera-test" element={
                <ProtectedRoute staffOnly>
                  <CameraTest />
                </ProtectedRoute>
              } />
              
              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '14px',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App; 