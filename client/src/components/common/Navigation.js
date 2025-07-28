import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import {
  FaCar,
  FaHistory,
  FaUser,
  FaCreditCard,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaHome,
  FaCog
} from 'react-icons/fa';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const navigationItems = [
    { name: 'Trang chủ', href: '/', icon: FaHome },
    { name: 'Quản lý xe', href: '/vehicles', icon: FaCar },
    { name: 'Lịch sử', href: '/history', icon: FaHistory },
    { name: 'Hồ sơ', href: '/profile', icon: FaUser },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-sm border-b hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FaCar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Smart Parking
                  </h1>
                  <p className="text-xs text-gray-500">
                    {isConnected ? '🟢 Đã kết nối' : '🔴 Mất kết nối'}
                  </p>
                </div>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500">
                  Số dư: {formatCurrency(user?.balance || 0)}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <FaSignOutAlt className="h-4 w-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="bg-white shadow-sm border-b lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FaCar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Smart Parking
                </h1>
                <p className="text-xs text-gray-500">
                  {isConnected ? '🟢' : '🔴'}
                </p>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="py-4 border-t border-gray-200">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* User Info */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Số dư: {formatCurrency(user?.balance || 0)}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 btn btn-secondary flex items-center justify-center space-x-2"
                >
                  <FaSignOutAlt className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navigation; 