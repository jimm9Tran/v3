import React, { useState, useEffect } from 'react';
import Navigation from '../common/Navigation';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaKey,
  FaCreditCard,
  FaHistory,
  FaShieldAlt
} from 'react-icons/fa';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showTopUpForm, setShowTopUpForm] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [topUpData, setTopUpData] = useState({
    amount: '',
    method: 'bank'
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.put('/api/users/profile', profileData);
      updateUser(res.data.data);
      toast.success('Cập nhật hồ sơ thành công');
      setShowEditForm(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.put('/api/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Đổi mật khẩu thành công');
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error('Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('/api/users/topup', {
        amount: parseFloat(topUpData.amount),
        method: topUpData.method
      });
      toast.success('Nạp tiền thành công');
      setShowTopUpForm(false);
      setTopUpData({ amount: '', method: 'bank' });
      // Refresh user data
      window.location.reload();
    } catch (err) {
      console.error('Error topping up:', err);
      toast.error('Có lỗi xảy ra khi nạp tiền');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin tài khoản và cài đặt</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Thông tin cá nhân
                </h2>
                <button
                  onClick={() => setShowEditForm(!showEditForm)}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <FaEdit className="h-4 w-4" />
                  <span>Chỉnh sửa</span>
                </button>
              </div>

              {!showEditForm ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FaUser className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user?.fullName || 'Chưa cập nhật'}
                      </h3>
                      <p className="text-sm text-gray-500">Họ và tên</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-success-100 rounded-lg flex items-center justify-center">
                      <FaEnvelope className="h-5 w-5 text-success-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user?.email || 'Chưa cập nhật'}
                      </h3>
                      <p className="text-sm text-gray-500">Email</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-warning-100 rounded-lg flex items-center justify-center">
                      <FaPhone className="h-5 w-5 text-warning-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user?.phone || 'Chưa cập nhật'}
                      </h3>
                      <p className="text-sm text-gray-500">Số điện thoại</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-danger-100 rounded-lg flex items-center justify-center">
                      <FaMapMarkerAlt className="h-5 w-5 text-danger-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user?.address || 'Chưa cập nhật'}
                      </h3>
                      <p className="text-sm text-gray-500">Địa chỉ</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label className="label">Họ và tên</label>
                    <input
                      type="text"
                      name="fullName"
                      className="input"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="input"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="label">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      className="input"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="label">Địa chỉ</label>
                    <textarea
                      name="address"
                      className="input"
                      rows="3"
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditForm(false)}
                      className="btn btn-secondary flex-1"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <FaSave className="h-4 w-4" />
                      )}
                      <span>Lưu thay đổi</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Security Settings */}
            <div className="card mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Bảo mật
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FaKey className="h-5 w-5 text-primary-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Mật khẩu</h3>
                      <p className="text-sm text-gray-500">Thay đổi mật khẩu tài khoản</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="btn btn-secondary"
                  >
                    Đổi mật khẩu
                  </button>
                </div>

                {showPasswordForm && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <label className="label">Mật khẩu hiện tại</label>
                        <input
                          type="password"
                          className="input"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="label">Mật khẩu mới</label>
                        <input
                          type="password"
                          className="input"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="label">Xác nhận mật khẩu mới</label>
                        <input
                          type="password"
                          className="input"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowPasswordForm(false)}
                          className="btn btn-secondary flex-1"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn btn-primary flex-1"
                        >
                          {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Account Balance */}
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Số dư tài khoản
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {formatCurrency(user?.balance || 0)}
                </div>
                <button
                  onClick={() => setShowTopUpForm(!showTopUpForm)}
                  className="btn btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <FaCreditCard className="h-4 w-4" />
                  <span>Nạp tiền</span>
                </button>
              </div>
            </div>

            {/* Account Stats */}
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thống kê tài khoản
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ngày tham gia:</span>
                  <span className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Vai trò:</span>
                  <span className="font-medium capitalize">
                    {user?.role || 'user'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Trạng thái:</span>
                  <span className="font-medium text-success-600">
                    Hoạt động
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thao tác nhanh
              </h3>
              <div className="space-y-3">
                <button className="w-full btn btn-secondary flex items-center justify-center space-x-2">
                  <FaHistory className="h-4 w-4" />
                  <span>Lịch sử giao dịch</span>
                </button>
                <button className="w-full btn btn-secondary flex items-center justify-center space-x-2">
                  <FaShieldAlt className="h-4 w-4" />
                  <span>Cài đặt bảo mật</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Top Up Modal */}
        {showTopUpForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Nạp tiền</h2>
              <form onSubmit={handleTopUpSubmit} className="space-y-4">
                <div>
                  <label className="label">Số tiền (VND)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="Nhập số tiền"
                    value={topUpData.amount}
                    onChange={(e) => setTopUpData({...topUpData, amount: e.target.value})}
                    required
                    min="10000"
                    step="10000"
                  />
                </div>
                
                <div>
                  <label className="label">Phương thức thanh toán</label>
                  <select
                    className="input"
                    value={topUpData.method}
                    onChange={(e) => setTopUpData({...topUpData, method: e.target.value})}
                  >
                    <option value="bank">Chuyển khoản ngân hàng</option>
                    <option value="momo">Ví MoMo</option>
                    <option value="zalopay">Ví ZaloPay</option>
                    <option value="vnpay">VNPay</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTopUpForm(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex-1"
                  >
                    {loading ? 'Đang xử lý...' : 'Nạp tiền'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile; 