#!/usr/bin/env python3
"""
Test tích hợp ALPR Service với Smart Parking Server
"""

import requests
import json
import cv2
import numpy as np
import base64
from datetime import datetime

# Configuration
ALPR_SERVICE_URL = "http://localhost:5001"
SMART_PARKING_SERVER_URL = "http://192.168.102.3:8080"

def test_alpr_service_health():
    """Test health check của ALPR service"""
    print("🔍 Testing ALPR Service Health...")
    try:
        response = requests.get(f"{ALPR_SERVICE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ ALPR Service Health Check:")
            print(f"   Status: {data.get('status')}")
            print(f"   Service: {data.get('service')}")
            print(f"   Server URL: {data.get('server_url')}")
            print(f"   Port: {data.get('port')}")
            return True
        else:
            print(f"❌ ALPR Service Health Check Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ALPR Service Health Check Error: {e}")
        return False

def test_smart_parking_server_health():
    """Test health check của Smart Parking Server"""
    print("\n🔍 Testing Smart Parking Server Health...")
    try:
        response = requests.get(f"{SMART_PARKING_SERVER_URL}/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Smart Parking Server Health Check:")
            print(f"   Status: {data.get('status')}")
            print(f"   Service: {data.get('service')}")
            return True
        else:
            print(f"❌ Smart Parking Server Health Check Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Smart Parking Server Health Check Error: {e}")
        return False

def create_test_image():
    """Tạo ảnh test với biển số"""
    # Tạo ảnh trắng
    img = np.ones((400, 600, 3), dtype=np.uint8) * 255
    
    # Vẽ biển số test
    plate_text = "51A123"
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 2
    thickness = 3
    color = (0, 0, 0)
    
    text_size = cv2.getTextSize(plate_text, font, font_scale, thickness)[0]
    text_x = 300 - text_size[0] // 2
    text_y = 200 + text_size[1] // 2
    
    cv2.putText(img, plate_text, (text_x, text_y), font, font_scale, color, thickness)
    
    # Chuyển thành bytes
    _, buffer = cv2.imencode('.jpg', img)
    return buffer.tobytes()

def test_license_plate_detection():
    """Test license plate detection và tích hợp với server"""
    print("\n🔍 Testing License Plate Detection...")
    
    try:
        # Tạo ảnh test
        image_bytes = create_test_image()
        
        # Tạo form data
        files = {
            'image': ('test_plate.jpg', image_bytes, 'image/jpeg')
        }
        data = {
            'parkingLotId': 'test_parking_lot',
            'barrierId': 'test_barrier'
        }
        
        # Gửi request đến ALPR service
        response = requests.post(
            f"{ALPR_SERVICE_URL}/api/detect",
            files=files,
            data=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ License Plate Detection Success:")
            print(f"   License Plate: {result.get('license_plate')}")
            print(f"   Confidence: {result.get('confidence')}")
            print(f"   Success: {result.get('success')}")
            
            # Kiểm tra server response
            if 'server_response' in result:
                server_resp = result['server_response']
                print(f"   Server Response: {server_resp.get('success')}")
                if server_resp.get('success'):
                    print(f"   Session ID: {server_resp.get('data', {}).get('sessionId')}")
            
            return True
        else:
            print(f"❌ License Plate Detection Failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ License Plate Detection Error: {e}")
        return False

def test_esp32_integration():
    """Test ESP32 integration"""
    print("\n🔍 Testing ESP32 Integration...")
    
    # Test vehicle detected
    try:
        vehicle_data = {
            'rfid_tag': 'TEST_CAR_001',
            'vehicle_type': 'car',
            'timestamp': datetime.now().isoformat()
        }
        
        response = requests.post(
            f"{ALPR_SERVICE_URL}/api/esp32/vehicle_detected",
            json=vehicle_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ ESP32 Vehicle Detection Success:")
            print(f"   Success: {result.get('success')}")
            print(f"   Message: {result.get('message')}")
        else:
            print(f"❌ ESP32 Vehicle Detection Failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ ESP32 Vehicle Detection Error: {e}")
    
    # Test barrier status
    try:
        barrier_data = {
            'status': 'open',
            'barrier_id': 'test_barrier'
        }
        
        response = requests.post(
            f"{ALPR_SERVICE_URL}/api/esp32/barrier_status",
            json=barrier_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ ESP32 Barrier Status Success:")
            print(f"   Success: {result.get('success')}")
            print(f"   Message: {result.get('message')}")
        else:
            print(f"❌ ESP32 Barrier Status Failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ ESP32 Barrier Status Error: {e}")

def test_alpr_status():
    """Test ALPR service status"""
    print("\n🔍 Testing ALPR Service Status...")
    try:
        response = requests.get(f"{ALPR_SERVICE_URL}/api/status", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ ALPR Service Status:")
            print(f"   ALPR Status: {data.get('alpr_status')}")
            print(f"   Server Connection: {data.get('server_connection')}")
            print(f"   System Type: {data.get('system_type')}")
            return True
        else:
            print(f"❌ ALPR Service Status Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ALPR Service Status Error: {e}")
        return False

def main():
    """Main test function"""
    print("🚗 ALPR Service Integration Test")
    print("=" * 50)
    
    # Test health checks
    alpr_healthy = test_alpr_service_health()
    server_healthy = test_smart_parking_server_health()
    
    if not alpr_healthy:
        print("\n❌ ALPR Service không khả dụng!")
        print("💡 Hãy chạy: python3 alpr_integration.py")
        return
    
    if not server_healthy:
        print("\n❌ Smart Parking Server không khả dụng!")
        print("💡 Hãy chạy: npm start trong thư mục server")
        return
    
    # Test ALPR status
    test_alpr_status()
    
    # Test license plate detection
    detection_success = test_license_plate_detection()
    
    # Test ESP32 integration
    test_esp32_integration()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 INTEGRATION TEST SUMMARY")
    print("=" * 50)
    print(f"✅ ALPR Service: {'Healthy' if alpr_healthy else 'Unhealthy'}")
    print(f"✅ Smart Parking Server: {'Healthy' if server_healthy else 'Unhealthy'}")
    print(f"✅ License Plate Detection: {'Success' if detection_success else 'Failed'}")
    
    if alpr_healthy and server_healthy and detection_success:
        print("\n🎉 TẤT CẢ TESTS THÀNH CÔNG!")
        print("✅ ALPR Service đã tích hợp thành công với Smart Parking Server")
    else:
        print("\n⚠️  MỘT SỐ TESTS THẤT BẠI!")
        print("🔧 Vui lòng kiểm tra lại cấu hình")

if __name__ == "__main__":
    main() 