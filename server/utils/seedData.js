const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const ParkingLot = require('../models/ParkingLot');
const ParkingSession = require('../models/ParkingSession');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('🌱 Bắt đầu tạo dữ liệu mẫu...');

    // Tạo admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.findOneAndUpdate(
      { email: 'admin@smartparking.com' },
      {
        username: 'admin',
        email: 'admin@smartparking.com',
        password: adminPassword,
        fullName: 'Quản trị viên',
        phone: '0901234567',
        role: 'admin',
        balance: 1000000
      },
      { upsert: true, new: true }
    );

    // Tạo staff user
    const staffPassword = await bcrypt.hash('staff123', 10);
    const staff = await User.findOneAndUpdate(
      { email: 'staff@smartparking.com' },
      {
        username: 'staff',
        email: 'staff@smartparking.com',
        password: staffPassword,
        fullName: 'Nhân viên bãi xe',
        phone: '0901234568',
        role: 'staff',
        balance: 500000
      },
      { upsert: true, new: true }
    );

    // Tạo customer user
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer = await User.findOneAndUpdate(
      { email: 'customer@smartparking.com' },
      {
        username: 'customer',
        email: 'customer@smartparking.com',
        password: customerPassword,
        fullName: 'Khách hàng mẫu',
        phone: '0901234569',
        role: 'customer',
        balance: 200000
      },
      { upsert: true, new: true }
    );

    // Tạo bãi xe mẫu
    const parkingLot = await ParkingLot.findOneAndUpdate(
      { name: 'Bãi xe Trung tâm' },
      {
        name: 'Bãi xe Trung tâm',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        totalSpaces: 100,
        availableSpaces: 85,
        hourlyRate: 10000,
        dailyRate: 200000,
        monthlyRate: 5000000,
        isActive: true,
        barriers: [
          {
            id: 'barrier-1',
            name: 'Barrier vào chính',
            type: 'entry',
            isActive: true,
            status: 'closed'
          },
          {
            id: 'barrier-2',
            name: 'Barrier ra chính',
            type: 'exit',
            isActive: true,
            status: 'closed'
          }
        ],
        cameras: [
          {
            id: 'camera-1',
            name: 'Camera vào',
            location: 'entrance',
            isActive: true,
            lastMaintenance: new Date()
          },
          {
            id: 'camera-2',
            name: 'Camera ra',
            location: 'exit',
            isActive: true,
            lastMaintenance: new Date()
          }
        ],
        operatingHours: {
          open: '06:00',
          close: '22:00',
          is24Hours: false
        },
        contactInfo: {
          phone: '0901234567',
          email: 'info@smartparking.com'
        },
        coordinates: {
          lat: 10.762622,
          lng: 106.660172
        },
        features: ['security', 'lighting', 'cctv', 'accessibility'],
        manager: admin._id,
        staff: [staff._id]
      },
      { upsert: true, new: true }
    );

    // Tạo xe mẫu cho customer
    const vehicle1 = await Vehicle.findOneAndUpdate(
      { licensePlate: '30A-12345' },
      {
        licensePlate: '30A-12345',
        brand: 'Toyota',
        model: 'Vios',
        color: 'Trắng',
        vehicleType: 'car',
        owner: customer._id,
        isRegistered: true,
        registrationDate: new Date(),
        totalParkingTime: 120,
        totalFees: 50000
      },
      { upsert: true, new: true }
    );

    const vehicle2 = await Vehicle.findOneAndUpdate(
      { licensePlate: '51F-67890' },
      {
        licensePlate: '51F-67890',
        brand: 'Honda',
        model: 'Wave Alpha',
        color: 'Đen',
        vehicleType: 'motorcycle',
        owner: customer._id,
        isRegistered: true,
        registrationDate: new Date(),
        totalParkingTime: 60,
        totalFees: 25000
      },
      { upsert: true, new: true }
    );

    // Tạo phiên gửi xe mẫu
    const sampleSessions = [
      {
        sessionId: 'PS' + Date.now() + '001',
        vehicle: vehicle1._id,
        user: customer._id,
        parkingLot: parkingLot._id,
        entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 giờ trước
        exitTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 giờ trước
        duration: 60,
        status: 'completed',
        entryImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        exitImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        detectedLicensePlate: '30A-12345',
        confirmedLicensePlate: '30A-12345',
        fee: 10000,
        totalAmount: 10000,
        paymentStatus: 'paid',
        paymentMethod: 'qr',
        barrierEntry: 'barrier-1',
        barrierExit: 'barrier-2',
        isRegisteredVehicle: true
      },
      {
        sessionId: 'PS' + Date.now() + '002',
        vehicle: vehicle2._id,
        user: customer._id,
        parkingLot: parkingLot._id,
        entryTime: new Date(Date.now() - 30 * 60 * 1000), // 30 phút trước
        status: 'active',
        entryImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        detectedLicensePlate: '51F-67890',
        confirmedLicensePlate: '51F-67890',
        fee: 0,
        totalAmount: 0,
        paymentStatus: 'pending',
        barrierEntry: 'barrier-1',
        isRegisteredVehicle: true
      }
    ];

    for (const sessionData of sampleSessions) {
      await ParkingSession.findOneAndUpdate(
        { sessionId: sessionData.sessionId },
        sessionData,
        { upsert: true }
      );
    }

    // Cập nhật user với vehicles
    await User.findByIdAndUpdate(customer._id, {
      $addToSet: { vehicles: { $each: [vehicle1._id, vehicle2._id] } }
    });

    console.log('✅ Dữ liệu mẫu đã được tạo thành công!');
    console.log('');
    console.log('📋 Thông tin đăng nhập:');
    console.log('👤 Admin: admin@smartparking.com / admin123');
    console.log('👷 Staff: staff@smartparking.com / staff123');
    console.log('👥 Customer: customer@smartparking.com / customer123');
    console.log('');
    console.log('🚗 Xe mẫu:');
    console.log('   - 30A-12345 (Toyota Vios - Trắng)');
    console.log('   - 51F-67890 (Honda Wave Alpha - Đen)');
    console.log('');
    console.log('🏢 Bãi xe: Bãi xe Trung tâm (100 chỗ)');

  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu mẫu:', error);
  }
};

module.exports = seedData; 