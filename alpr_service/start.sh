#!/bin/bash

# ALPR Service Startup Script
echo "🚗 Starting ALPR Service for Smart Parking"
echo "=========================================="

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

# Check if requirements are installed
echo "📦 Checking dependencies..."
if ! python3 -c "import flask, paddleocr, cv2, numpy" &> /dev/null; then
    echo "📦 Installing dependencies..."
    pip3 install -r requirements.txt
fi

# Check if port 5001 is available
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5001 is already in use"
    echo "   Stopping existing process..."
    lsof -ti:5001 | xargs kill -9
fi

# Start the service
echo "🚀 Starting ALPR Service on port 5001..."
echo "📡 Health Check: http://localhost:5001/health"
echo "🔍 Detection API: http://localhost:5001/api/detect"
echo "🧪 Test API: http://localhost:5001/api/test"
echo ""
echo "Press Ctrl+C to stop the service"
echo "=========================================="

python3 main.py 