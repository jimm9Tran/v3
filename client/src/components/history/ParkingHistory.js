import React, { useState, useEffect } from 'react';
import Navigation from '../common/Navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FaHistory,
  FaCar,
  FaClock,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaPrint,
  FaTimes
} from 'react-icons/fa';

const ParkingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await axios.get('/api/parking/history');
      setHistory(res.data.data || []);
    } catch (err) {
      console.error('Error loading history:', err);
      toast.error('Không thể tải lịch sử gửi xe');
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-800 rounded-full">Hoàn thành</span>;
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">Đang gửi</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium bg-danger-100 text-danger-800 rounded-full">Đã hủy</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Không xác định</span>;
    }
  };

  const getStatusName = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'active':
        return 'Đang gửi';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const filteredHistory = history.filter(record => {
    const matchesSearch = record.detectedLicensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.parkingLot?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    
    let matchesDate = true;
    if (filterDate !== 'all') {
      const recordDate = new Date(record.startTime);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      switch (filterDate) {
        case 'today':
          matchesDate = recordDate.toDateString() === today.toDateString();
          break;
        case 'yesterday':
          matchesDate = recordDate.toDateString() === yesterday.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = recordDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          matchesDate = recordDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const handlePrintReceipt = (record) => {
    // Print receipt logic
    toast.success('Đang in hóa đơn...');
  };

  const handleDownloadReceipt = (record) => {
    // Download receipt logic
    toast.success('Đã tải xuống hóa đơn');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lịch sử gửi xe</h1>
          <p className="text-gray-600 mt-2">Xem lại các phiên gửi xe đã thực hiện</p>
        </div>

        {/* Search and Filter */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo biển số, bãi xe..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="completed">Hoàn thành</option>
                <option value="active">Đang gửi</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
            
            <div>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="input"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="yesterday">Hôm qua</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
              </select>
            </div>
          </div>
        </div>

        {/* History List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="card text-center py-12">
            <FaHistory className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {history.length === 0 ? 'Chưa có lịch sử gửi xe' : 'Không tìm thấy kết quả'}
            </h3>
            <p className="text-gray-500">
              {history.length === 0 
                ? 'Bạn chưa có phiên gửi xe nào. Hãy bắt đầu sử dụng dịch vụ để xem lịch sử.'
                : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((record) => (
              <div
                key={record._id}
                className="card hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FaCar className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {record.detectedLicensePlate}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {record.parkingLot?.name}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <FaClock className="h-3 w-3" />
                          <span>{formatDateTime(record.startTime)}</span>
                        </div>
                        {record.duration && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <FaClock className="h-3 w-3" />
                            <span>{formatDuration(record.duration)}</span>
                          </div>
                        )}
                        {record.fee && (
                          <div className="flex items-center space-x-1 text-xs font-medium text-gray-900">
                            <FaMoneyBillWave className="h-3 w-3" />
                            <span>{formatCurrency(record.fee)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(record.status)}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetail(record)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Xem chi tiết"
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                      
                      {record.status === 'completed' && (
                        <>
                          <button
                            onClick={() => handlePrintReceipt(record)}
                            className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                            title="In hóa đơn"
                          >
                            <FaPrint className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDownloadReceipt(record)}
                            className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                            title="Tải hóa đơn"
                          >
                            <FaDownload className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Chi tiết phiên gửi xe
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Vehicle Info */}
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FaCar className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedRecord.detectedLicensePlate}
                  </h3>
                  <p className="text-gray-500">Biển số xe</p>
                </div>
              </div>
              
              {/* Parking Lot Info */}
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-success-100 rounded-lg flex items-center justify-center">
                  <FaMapMarkerAlt className="h-6 w-6 text-success-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedRecord.parkingLot?.name}
                  </h3>
                  <p className="text-gray-500">Bãi gửi xe</p>
                </div>
              </div>
              
              {/* Time Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <FaClock className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-500">Thời gian vào</p>
                    <p className="font-medium">{formatDateTime(selectedRecord.startTime)}</p>
                  </div>
                </div>
                
                {selectedRecord.endTime && (
                  <div className="flex items-center space-x-3">
                    <FaClock className="h-5 w-5 text-success-600" />
                    <div>
                      <p className="text-sm text-gray-500">Thời gian ra</p>
                      <p className="font-medium">{formatDateTime(selectedRecord.endTime)}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Duration and Fee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRecord.duration && (
                  <div className="flex items-center space-x-3">
                    <FaClock className="h-5 w-5 text-warning-600" />
                    <div>
                      <p className="text-sm text-gray-500">Thời gian gửi</p>
                      <p className="font-medium">{formatDuration(selectedRecord.duration)}</p>
                    </div>
                  </div>
                )}
                
                {selectedRecord.fee && (
                  <div className="flex items-center space-x-3">
                    <FaMoneyBillWave className="h-5 w-5 text-danger-600" />
                    <div>
                      <p className="text-sm text-gray-500">Phí gửi xe</p>
                      <p className="font-medium">{formatCurrency(selectedRecord.fee)}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Status */}
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-primary-600 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <p className="font-medium">{getStatusName(selectedRecord.status)}</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="btn btn-secondary flex-1"
              >
                Đóng
              </button>
              
              {selectedRecord.status === 'completed' && (
                <>
                  <button
                    onClick={() => handlePrintReceipt(selectedRecord)}
                    className="btn btn-primary flex items-center justify-center space-x-2"
                  >
                    <FaPrint className="h-4 w-4" />
                    <span>In hóa đơn</span>
                  </button>
                  
                  <button
                    onClick={() => handleDownloadReceipt(selectedRecord)}
                    className="btn btn-primary flex items-center justify-center space-x-2"
                  >
                    <FaDownload className="h-4 w-4" />
                    <span>Tải hóa đơn</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingHistory; 