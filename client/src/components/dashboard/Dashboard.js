import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import Navigation from '../common/Navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FaCar,
  FaHistory,
  FaUser,
  FaCreditCard,
  FaParking,
  FaClock,
  FaMoneyBillWave,
  FaPlus,
  FaQrcode
} from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveSessions();
  }, []);

  const loadActiveSessions = async () => {
    try {
      const res = await axios.get('/api/parking/active');
      setActiveSessions(res.data.data);
    } catch (err) {
      console.error('Error loading active sessions:', err);
      toast.error('Không thể tải thông tin xe đang gửi');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng trở lại, {user?.fullName}!
          </h1>
          <p className="text-gray-600">
            Quản lý xe và theo dõi bãi gửi xe thông minh
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/vehicles"
            className="card hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <FaCar className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Quản lý xe
                </h3>
                <p className="text-sm text-gray-500">
                  Đăng ký và quản lý xe
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/history"
            className="card hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-success-100 rounded-lg flex items-center justify-center group-hover:bg-success-200 transition-colors">
                <FaHistory className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Lịch sử
                </h3>
                <p className="text-sm text-gray-500">
                  Xem lịch sử gửi xe
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/profile"
            className="card hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-warning-100 rounded-lg flex items-center justify-center group-hover:bg-warning-200 transition-colors">
                <FaUser className="h-6 w-6 text-warning-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Hồ sơ
                </h3>
                <p className="text-sm text-gray-500">
                  Cập nhật thông tin
                </p>
              </div>
            </div>
          </Link>

          <div className="card hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-danger-100 rounded-lg flex items-center justify-center group-hover:bg-danger-200 transition-colors">
                <FaCreditCard className="h-6 w-6 text-danger-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Nạp tiền
                </h3>
                <p className="text-sm text-gray-500">
                  Nạp tiền vào ví
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Xe đang gửi
            </h2>
            <button
              onClick={loadActiveSessions}
              className="btn btn-secondary"
              disabled={loading}
            >
              {loading ? 'Đang tải...' : 'Làm mới'}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : activeSessions.length === 0 ? (
            <div className="text-center py-12">
              <FaParking className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có xe nào đang gửi
              </h3>
              <p className="text-gray-500 mb-6">
                Bạn chưa có xe nào đang gửi trong bãi
              </p>
              <Link
                to="/vehicles"
                className="btn btn-primary inline-flex items-center space-x-2"
              >
                <FaPlus className="h-4 w-4" />
                <span>Đăng ký xe</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div
                  key={session._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FaCar className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {session.detectedLicensePlate}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {session.parkingLot?.name}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <FaClock className="h-4 w-4" />
                            <span>
                              {formatDuration(session.duration || 0)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm font-medium text-gray-900">
                            <FaMoneyBillWave className="h-4 w-4" />
                            <span>
                              {formatCurrency(session.fee || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/payment/${session.sessionId}`}
                        className="btn btn-primary flex items-center space-x-2"
                      >
                        <FaQrcode className="h-4 w-4" />
                        <span>Thanh toán</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 