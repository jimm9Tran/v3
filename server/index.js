const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-parking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Socket.IO middleware
const socketMiddleware = require('./middleware/socket');
socketMiddleware.setIO(io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/parking', require('./routes/parking'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/deposits', require('./routes/deposits'));
app.use('/api/test-payos', require('./routes/test-payos'));
app.use('/api/iot', require('./routes/iot'));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  // Join parking lot room
  socket.on('join-parking-lot', (parkingLotId) => {
    socket.join(`parking-lot-${parkingLotId}`);
    console.log(`Client ${socket.id} joined parking lot ${parkingLotId}`);
  });
  
  // Handle vehicle entry
  socket.on('vehicle-entry', (data) => {
    io.to(`parking-lot-${data.parkingLotId}`).emit('vehicle-entered', data);
  });
  
  // Handle vehicle exit
  socket.on('vehicle-exit', (data) => {
    io.to(`parking-lot-${data.parkingLotId}`).emit('vehicle-exited', data);
  });
  
  // Handle barrier control
  socket.on('barrier-control', (data) => {
    io.to(`parking-lot-${data.parkingLotId}`).emit('barrier-updated', data);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Có lỗi xảy ra trong hệ thống',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint không tồn tại' 
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, io }; 