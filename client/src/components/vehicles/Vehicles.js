import React, { useState, useEffect } from 'react';
import Navigation from '../common/Navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FaCar,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaSort
} from 'react-icons/fa';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState({
    licensePlate: '',
    brand: '',
    model: '',
    color: '',
    year: '',
    type: 'car'
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const res = await axios.get('/api/vehicles');
      setVehicles(res.data.data || []);
    } catch (err) {
      console.error('Error loading vehicles:', err);
      toast.error('Không thể tải danh sách xe');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showEditModal) {
        await axios.put(`/api/vehicles/${selectedVehicle._id}`, formData);
        toast.success('Cập nhật xe thành công');
      } else {
        await axios.post('/api/vehicles', formData);
        toast.success('Thêm xe thành công');
      }
      setShowAddModal(false);
      setShowEditModal(false);
      setFormData({
        licensePlate: '',
        brand: '',
        model: '',
        color: '',
        year: '',
        type: 'car'
      });
      loadVehicles();
    } catch (err) {
      console.error('Error saving vehicle:', err);
      toast.error('Có lỗi xảy ra khi lưu xe');
    }
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      year: vehicle.year,
      type: vehicle.type
    });
    setShowEditModal(true);
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa xe này?')) {
      try {
        await axios.delete(`/api/vehicles/${vehicleId}`);
        toast.success('Xóa xe thành công');
        loadVehicles();
      } catch (err) {
        console.error('Error deleting vehicle:', err);
        toast.error('Có lỗi xảy ra khi xóa xe');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || vehicle.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getVehicleTypeIcon = (type) => {
    switch (type) {
      case 'car':
        return '🚗';
      case 'motorcycle':
        return '🏍️';
      case 'truck':
        return '🚛';
      default:
        return '🚗';
    }
  };

  const getVehicleTypeName = (type) => {
    switch (type) {
      case 'car':
        return 'Ô tô';
      case 'motorcycle':
        return 'Xe máy';
      case 'truck':
        return 'Xe tải';
      default:
        return 'Ô tô';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý xe</h1>
            <p className="text-gray-600 mt-2">Đăng ký và quản lý các xe của bạn</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
          >
            <FaPlus className="h-4 w-4" />
            <span>Thêm xe</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo biển số, hãng xe..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input"
              >
                <option value="all">Tất cả loại xe</option>
                <option value="car">Ô tô</option>
                <option value="motorcycle">Xe máy</option>
                <option value="truck">Xe tải</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vehicles List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="card text-center py-12">
            <FaCar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {vehicles.length === 0 ? 'Chưa có xe nào' : 'Không tìm thấy xe'}
            </h3>
            <p className="text-gray-500 mb-6">
              {vehicles.length === 0 
                ? 'Bạn chưa đăng ký xe nào. Hãy thêm xe đầu tiên của bạn.'
                : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.'
              }
            </p>
            {vehicles.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary inline-flex items-center space-x-2"
              >
                <FaPlus className="h-4 w-4" />
                <span>Thêm xe đầu tiên</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="card hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getVehicleTypeIcon(vehicle.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {vehicle.licensePlate}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getVehicleTypeName(vehicle.type)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle._id)}
                      className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Hãng xe:</span>
                    <span className="font-medium">{vehicle.brand}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Dòng xe:</span>
                    <span className="font-medium">{vehicle.model}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Màu sắc:</span>
                    <span className="font-medium">{vehicle.color}</span>
                  </div>
                  {vehicle.year && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Năm sản xuất:</span>
                      <span className="font-medium">{vehicle.year}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thêm xe mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Biển số xe *</label>
                <input
                  type="text"
                  name="licensePlate"
                  required
                  className="input"
                  placeholder="Nhập biển số xe"
                  value={formData.licensePlate}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="label">Loại xe *</label>
                <select
                  name="type"
                  required
                  className="input"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="car">Ô tô</option>
                  <option value="motorcycle">Xe máy</option>
                  <option value="truck">Xe tải</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Hãng xe</label>
                  <input
                    type="text"
                    name="brand"
                    className="input"
                    placeholder="VD: Toyota"
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="label">Dòng xe</label>
                  <input
                    type="text"
                    name="model"
                    className="input"
                    placeholder="VD: Camry"
                    value={formData.model}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Màu sắc</label>
                  <input
                    type="text"
                    name="color"
                    className="input"
                    placeholder="VD: Trắng"
                    value={formData.color}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="label">Năm sản xuất</label>
                  <input
                    type="number"
                    name="year"
                    className="input"
                    placeholder="VD: 2020"
                    value={formData.year}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Thêm xe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Chỉnh sửa xe</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Biển số xe *</label>
                <input
                  type="text"
                  name="licensePlate"
                  required
                  className="input"
                  placeholder="Nhập biển số xe"
                  value={formData.licensePlate}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="label">Loại xe *</label>
                <select
                  name="type"
                  required
                  className="input"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="car">Ô tô</option>
                  <option value="motorcycle">Xe máy</option>
                  <option value="truck">Xe tải</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Hãng xe</label>
                  <input
                    type="text"
                    name="brand"
                    className="input"
                    placeholder="VD: Toyota"
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="label">Dòng xe</label>
                  <input
                    type="text"
                    name="model"
                    className="input"
                    placeholder="VD: Camry"
                    value={formData.model}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Màu sắc</label>
                  <input
                    type="text"
                    name="color"
                    className="input"
                    placeholder="VD: Trắng"
                    value={formData.color}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="label">Năm sản xuất</label>
                  <input
                    type="number"
                    name="year"
                    className="input"
                    placeholder="VD: 2020"
                    value={formData.year}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles; 