import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../common/Navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FaCreditCard,
  FaQrcode,
  FaMoneyBillWave,
  FaClock,
  FaCar,
  FaPrint,
  FaDownload,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

const Payment = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const res = await axios.get(`/api/parking/session/${sessionId}`);
      setSession(res.data.data);
    } catch (err) {
      console.error('Error loading session:', err);
      toast.error('Không thể tải thông tin phiên gửi xe');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const res = await axios.post(`/api/payment/process`, {
        sessionId,
        method: paymentMethod
      });
      
      if (res.data.success) {
        toast.success('Thanh toán thành công!');
        navigate('/');
      } else {
        toast.error(res.data.message || 'Thanh toán thất bại');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      toast.error('Có lỗi xảy ra khi thanh toán');
    } finally {
      setProcessing(false);
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <FaTimesCircle className="h-16 w-16 text-danger-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy phiên gửi xe
            </h2>
            <p className="text-gray-500 mb-6">
              Phiên gửi xe này không tồn tại hoặc đã được thanh toán
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary inline-flex items-center space-x-2"
            >
              <FaArrowLeft className="h-4 w-4" />
              <span>Về trang chủ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
              <p className="text-gray-600">Hoàn tất thanh toán cho phiên gửi xe</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Details */}
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Thông tin phiên gửi xe
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FaCar className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {session.detectedLicensePlate}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {session.parkingLot?.name}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <FaClock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Thời gian gửi:</span>
                    <span className="font-medium">
                      {formatDateTime(session.startTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <FaClock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Thời gian gửi:</span>
                    <span className="font-medium">
                      {formatDuration(session.duration || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Phương thức thanh toán
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary-600"
                  />
                  <FaCreditCard className="h-5 w-5 text-primary-600" />
                  <div>
                    <span className="font-medium">Ví điện tử</span>
                    <p className="text-sm text-gray-500">Thanh toán từ số dư tài khoản</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="qr"
                    checked={paymentMethod === 'qr'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary-600"
                  />
                  <FaQrcode className="h-5 w-5 text-primary-600" />
                  <div>
                    <span className="font-medium">QR Code</span>
                    <p className="text-sm text-gray-500">Quét mã QR để thanh toán</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary-600"
                  />
                  <FaMoneyBillWave className="h-5 w-5 text-primary-600" />
                  <div>
                    <span className="font-medium">Tiền mặt</span>
                    <p className="text-sm text-gray-500">Thanh toán tại quầy</p>
                  </div>
                </label>
              </div>
            </div>

            {/* QR Code Section */}
            {paymentMethod === 'qr' && (
              <div className="card mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Mã QR thanh toán
                </h3>
                <div className="text-center">
                  <div className="bg-gray-100 p-8 rounded-lg inline-block">
                    <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                      <FaQrcode className="h-32 w-32 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Quét mã QR bằng ứng dụng ngân hàng để thanh toán
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tóm tắt thanh toán
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phí gửi xe:</span>
                  <span className="font-medium">
                    {formatCurrency(session.fee || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Thuế VAT:</span>
                  <span className="font-medium">
                    {formatCurrency((session.fee || 0) * 0.1)}
                  </span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Tổng cộng:</span>
                    <span className="text-primary-600">
                      {formatCurrency((session.fee || 0) * 1.1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="btn btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {processing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <FaCheckCircle className="h-4 w-4" />
                  )}
                  <span>
                    {processing ? 'Đang xử lý...' : 'Thanh toán ngay'}
                  </span>
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="btn btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <FaPrint className="h-4 w-4" />
                  <span>In hóa đơn</span>
                </button>
                
                <button
                  onClick={() => {
                    // Download receipt logic
                    toast.success('Đã tải xuống hóa đơn');
                  }}
                  className="btn btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <FaDownload className="h-4 w-4" />
                  <span>Tải hóa đơn</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment; 