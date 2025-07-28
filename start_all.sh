#!/bin/bash

echo "🚀 Starting Smart Parking System..."
echo "=================================="

# Kiểm tra và dừng các process cũ
echo "🛑 Stopping existing processes..."
pkill -f "nodemon\|react-scripts\|python.*simple_app.py" 2>/dev/null

# Đợi một chút để các process dừng hoàn toàn
sleep 2

# Kiểm tra MongoDB
echo "🗄️  Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "📦 Starting MongoDB..."
    brew services start mongodb-community
    sleep 3
else
    echo "✅ MongoDB is already running"
fi

# Khởi động service nhận diện biển số (port 5000)
echo "🔍 Starting License Plate Detection Service (port 5000)..."
cd alpr_service_simple
python3 -m pip install -r requirements.txt > /dev/null 2>&1
python3 simple_app.py &
ALPR_PID=$!
cd ..

# Đợi service nhận diện khởi động
sleep 3

# Khởi động backend server (port 8080)
echo "⚙️  Starting Backend Server (port 8080)..."
npm run server &
SERVER_PID=$!

# Đợi server khởi động
sleep 5

# Khởi động frontend (port 3000)
echo "🌐 Starting Frontend (port 3000)..."
cd client
npm start &
CLIENT_PID=$!
cd ..

echo ""
echo "🎉 All services started successfully!"
echo "=================================="
echo "📱 Frontend:     http://localhost:3000"
echo "⚙️  Backend:      http://localhost:8080"
echo "🔍 ALPR Service: http://localhost:5001"
echo "🗄️  MongoDB:      mongodb://localhost:27017"
echo ""
echo "🔗 API Endpoints:"
echo "   - Health Check: http://localhost:5001/health"
echo "   - Detection:    http://localhost:5001/detect"
echo "   - Test:         http://localhost:5001/test"
echo ""
echo "🛑 To stop all services, press Ctrl+C"

# Đợi người dùng dừng
trap "echo '🛑 Stopping all services...'; kill $ALPR_PID $SERVER_PID $CLIENT_PID 2>/dev/null; exit" INT
wait 