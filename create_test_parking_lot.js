const mongoose = require('mongoose');
const ParkingLot = require('./server/models/ParkingLot');

async function createTestParkingLot() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/smart-parking', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Create test parking lot
    const testParkingLot = new ParkingLot({
      name: 'Bãi xe Test ALPR',
      address: '123 Test Street',
      totalSpaces: 50,
      availableSpaces: 50,
      hourlyRate: 10000,
      dailyRate: 200000,
      monthlyRate: 5000000,
      isActive: true,
      barriers: [
        {
          id: 'barrier-1',
          name: 'Barrier 1',
          status: 'closed',
          type: 'entry'
        }
      ]
    });
    
    await testParkingLot.save();
    
    console.log('✅ Test parking lot created:');
    console.log(`ID: ${testParkingLot._id}`);
    console.log(`Name: ${testParkingLot.name}`);
    console.log(`Total Spaces: ${testParkingLot.totalSpaces}`);
    console.log(`Available Spaces: ${testParkingLot.availableSpaces}`);
    
    return testParkingLot._id;
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestParkingLot(); 