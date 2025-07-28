const mongoose = require('mongoose');
const seedData = require('./server/utils/seedData');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/smart-parking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  await seedData();
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
}); 