import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaCar, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phone: formData.phone
    });

    if (result.success) {
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <FaCar className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Đăng ký tài khoản
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Tạo tài khoản mới cho hệ thống bãi gửi xe thông minh
          </p>
        </div>

        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="label">
                <FaUser className="inline h-4 w-4 mr-2" />
                Họ và tên
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="input"
                placeholder="Nhập họ và tên"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="username" className="label">
                <FaUser className="inline h-4 w-4 mr-2" />
                Tên đăng nhập
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="label">
                <FaEnvelope className="inline h-4 w-4 mr-2" />
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="Nhập email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phone" className="label">
                <FaPhone className="inline h-4 w-4 mr-2" />
                Số điện thoại
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="input"
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input pr-10"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="input pr-10"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex justify-center items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Đăng ký'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Hệ thống bãi gửi xe thông minh - IoT Parking System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 