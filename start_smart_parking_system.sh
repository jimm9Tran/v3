#!/bin/bash

# Smart Parking System Startup Script
# Khởi động toàn bộ hệ thống bãi gửi xe thông minh

echo "🚗 Smart Parking System Startup"
echo "================================"

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js không được cài đặt!"
    echo "💡 Vui lòng cài đặt Node.js trước"
    exit 1
fi

# Kiểm tra Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 không được cài đặt!"
    echo "💡 Vui lòng cài đặt Python3 trước"
    exit 1
fi

# Kiểm tra MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB không được cài đặt!"
    echo "💡 Vui lòng cài đặt MongoDB hoặc sử dụng MongoDB Atlas"
fi

echo "✅ Prerequisites check completed"

# Khởi động MongoDB (nếu có)
if command -v mongod &> /dev/null; then
    echo "🔄 Starting MongoDB..."
    mongod --fork --logpath /tmp/mongod.log
    sleep 2
    echo "✅ MongoDB started"
fi

# Khởi động Smart Parking Server
echo "🔄 Starting Smart Parking Server..."
cd server
npm install
npm start &
SERVER_PID=$!
cd ..

# Đợi server khởi động
echo "⏳ Waiting for server to start..."
sleep 5

# Kiểm tra server health
echo "🔍 Checking server health..."
for i in {1..10}; do
    if curl -s http://localhost:5000/api/health > /dev/null; then
        echo "✅ Smart Parking Server is running"
        break
    else
        echo "⏳ Waiting for server... ($i/10)"
        sleep 2
    fi
done

# Khởi động ALPR Service
echo "🔄 Starting ALPR Service..."
cd alpr_service_simple

# Cài đặt dependencies nếu cần
if [ ! -d "venv" ]; then
    echo "📦 Installing ALPR dependencies..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Khởi động ALPR service
python3 alpr_integration.py &
ALPR_PID=$!
cd ..

# Đợi ALPR service khởi động
echo "⏳ Waiting for ALPR service to start..."
sleep 3

# Kiểm tra ALPR service health
echo "🔍 Checking ALPR service health..."
for i in {1..5}; do
    if curl -s http://localhost:5001/health > /dev/null; then
        echo "✅ ALPR Service is running"
        break
    else
        echo "⏳ Waiting for ALPR service... ($i/5)"
        sleep 2
    fi
done

# Chạy test tích hợp
echo "🧪 Running integration test..."
cd alpr_service_simple
python3 test_integration.py
cd ..

echo ""
echo "🎉 Smart Parking System Started Successfully!"
echo "============================================="
echo "📍 Smart Parking Server: http://localhost:8080"
echo "🔍 ALPR Service: http://localhost:5001"
echo "📱 Health Checks:"
echo "   - Server: curl http://localhost:8080/api/health"
echo "   - ALPR: curl http://localhost:5001/health"
echo ""
echo "🛑 To stop the system, press Ctrl+C"

# Function để cleanup khi thoát
cleanup() {
    echo ""
    echo "🛑 Shutting down Smart Parking System..."
    
    # Kill ALPR service
    if [ ! -z "$ALPR_PID" ]; then
        kill $ALPR_PID 2>/dev/null
        echo "✅ ALPR Service stopped"
    fi
    
    # Kill server
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null
        echo "✅ Smart Parking Server stopped"
    fi
    
    # Stop MongoDB
    if command -v mongod &> /dev/null; then
        pkill mongod 2>/dev/null
        echo "✅ MongoDB stopped"
    fi
    
    echo "👋 Smart Parking System stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Giữ script chạy
echo "🔄 System is running... Press Ctrl+C to stop"
while true; do
    sleep 10
    
    # Kiểm tra health định kỳ
    if ! curl -s http://localhost:5000/api/health > /dev/null; then
        echo "⚠️  Smart Parking Server is down!"
    fi
    
    if ! curl -s http://localhost:5001/health > /dev/null; then
        echo "⚠️  ALPR Service is down!"
    fi
done 