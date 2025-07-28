#!/usr/bin/env python3
"""
ALPR Service tích hợp với Smart Parking Server
Sử dụng PaddleOCR cho license plate recognition
Gửi dữ liệu trực tiếp đến server
"""

import os
import sys
import logging
import cv2
import numpy as np
import requests
import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ocr_service import SimpleOCRService
from cloudinary_service import CloudinaryService

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Global services
ocr_service = None
cloudinary_service = None

# Server configuration
SMART_PARKING_SERVER_URL = "http://192.168.102.3:8080"  # Server chính
ALPR_SERVICE_PORT = 5001  # Port cho ALPR service

def initialize_services():
    """Initialize OCR and Cloudinary services"""
    global ocr_service, cloudinary_service
    try:
        # Initialize OCR service
        ocr_service = SimpleOCRService()
        logger.info("✅ OCR service initialized successfully")
        
        # Initialize Cloudinary service
        cloudinary_service = CloudinaryService()
        logger.info("✅ Cloudinary service initialized successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'ALPR Service for Smart Parking',
        'models': {
            'license_plate_recognition': 'PaddleOCR'
        },
        'server_url': "http://192.168.102.3:8080",
        'port': ALPR_SERVICE_PORT
    })

@app.route('/api/detect', methods=['POST'])
def detect_license_plate():
    """Detect license plates in image and send to server"""
    try:
        # Check if image is provided
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image provided'
            }), 400
        
        # Get image file
        image_file = request.files['image']
        
        # Read and decode image
        image_bytes = image_file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({
                'success': False,
                'error': 'Invalid image format'
            }), 400
        
        # Process image with OCR service
        ocr_result = ocr_service.process_image(image)
        
        if not ocr_result.get('success'):
            # Clean error result
            clean_result = {
                'success': False,
                'error': ocr_result.get('error', 'Unknown error'),
                'timestamp': ocr_result.get('timestamp', datetime.now().isoformat())
            }
            return jsonify(clean_result), 400
        
        # Lấy biển số đầu tiên được detect
        license_plates = ocr_result.get('license_plates', [])
        if not license_plates:
            # Clean ocr_result để tránh JSON serialization error
            clean_ocr_result = {
                'license_plates': [],
                'all_texts': [],
                'processing_time': ocr_result.get('processing_time', 0)
            }
            
            # Chỉ lấy thông tin cần thiết từ license_plates
            for plate in ocr_result.get('license_plates', []):
                clean_plate = {
                    'text': plate.get('text', ''),
                    'normalized_text': plate.get('normalized_text', ''),
                    'confidence': plate.get('confidence', 0),
                    'is_valid': plate.get('is_valid', False)
                }
                clean_ocr_result['license_plates'].append(clean_plate)
            
            # Chỉ lấy thông tin cần thiết từ all_texts
            for text_info in ocr_result.get('all_texts', []):
                clean_text = {
                    'text': text_info.get('text', ''),
                    'confidence': text_info.get('confidence', 0)
                }
                clean_ocr_result['all_texts'].append(clean_text)
            
            return jsonify({
                'success': False,
                'error': 'No valid license plate detected',
                'ocr_result': clean_ocr_result
            }), 400
        
        # Lấy biển số đầu tiên
        first_plate = license_plates[0]
        license_plate = first_plate['normalized_text']
        confidence = first_plate['confidence']
        
        # Lấy thông tin từ request
        parking_lot_id = request.form.get('parkingLotId', 'default')
        barrier_id = request.form.get('barrierId', 'default')
        
        # Upload ảnh lên Cloudinary
        cloudinary_result = cloudinary_service.upload_parking_image(
            image_bytes=image_bytes,
            license_plate=license_plate,
            parking_lot_id=parking_lot_id,
            image_type="entry"
        )
        
        if not cloudinary_result['success']:
            logger.error(f"❌ Failed to upload image to Cloudinary: {cloudinary_result['error']}")
            return jsonify({
                'success': False,
                'error': 'Failed to upload image to Cloudinary'
            }), 500
        
        # Tạo payload cho server với URL Cloudinary
        server_payload = {
            'licensePlate': license_plate,
            'parkingLotId': parking_lot_id,
            'entryImageUrl': cloudinary_result['url'],
            'entryImagePublicId': cloudinary_result['public_id'],
            'barrierId': barrier_id,
            'detectionConfidence': confidence
        }
        
        # Gửi đến server chính
        try:
            response = requests.post(
                f"{SMART_PARKING_SERVER_URL}/api/parking/entry",
                json=server_payload,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                server_response = response.json()
                # Clean ocr_result để tránh JSON serialization error
                clean_ocr_result = {
                    'license_plates': [],
                    'all_texts': [],
                    'processing_time': ocr_result.get('processing_time', 0)
                }
                
                # Chỉ lấy thông tin cần thiết từ license_plates
                for plate in ocr_result.get('license_plates', []):
                    clean_plate = {
                        'text': plate.get('text', ''),
                        'normalized_text': plate.get('normalized_text', ''),
                        'confidence': plate.get('confidence', 0),
                        'is_valid': plate.get('is_valid', False)
                    }
                    clean_ocr_result['license_plates'].append(clean_plate)
                
                # Chỉ lấy thông tin cần thiết từ all_texts
                for text_info in ocr_result.get('all_texts', []):
                    clean_text = {
                        'text': text_info.get('text', ''),
                        'confidence': text_info.get('confidence', 0)
                    }
                    clean_ocr_result['all_texts'].append(clean_text)
                
                return jsonify({
                    'success': True,
                    'license_plate': license_plate,
                    'confidence': confidence,
                    'server_response': server_response,
                    'ocr_result': clean_ocr_result
                })
            else:
                logger.error(f"Server error: {response.status_code} - {response.text}")
                # Clean ocr_result để tránh JSON serialization error
                clean_ocr_result = {
                    'license_plates': [],
                    'all_texts': [],
                    'processing_time': ocr_result.get('processing_time', 0)
                }
                
                # Chỉ lấy thông tin cần thiết từ license_plates
                for plate in ocr_result.get('license_plates', []):
                    clean_plate = {
                        'text': plate.get('text', ''),
                        'normalized_text': plate.get('normalized_text', ''),
                        'confidence': plate.get('confidence', 0),
                        'is_valid': plate.get('is_valid', False)
                    }
                    clean_ocr_result['license_plates'].append(clean_plate)
                
                # Chỉ lấy thông tin cần thiết từ all_texts
                for text_info in ocr_result.get('all_texts', []):
                    clean_text = {
                        'text': text_info.get('text', ''),
                        'confidence': text_info.get('confidence', 0)
                    }
                    clean_ocr_result['all_texts'].append(clean_text)
                
                return jsonify({
                    'success': False,
                    'error': f'Server error: {response.status_code}',
                    'license_plate': license_plate,
                    'confidence': confidence,
                    'ocr_result': clean_ocr_result
                }), 500
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Connection error: {e}")
            return jsonify({
                'success': False,
                'error': f'Cannot connect to server: {str(e)}',
                'license_plate': license_plate,
                'confidence': confidence,
                'ocr_result': ocr_result
            }), 500
        
    except Exception as e:
        logger.error(f"Error in detect_license_plate: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/status', methods=['GET'])
def get_system_status():
    """Get system status"""
    return jsonify({
        'alpr_status': 'active' if ocr_service else 'inactive',
        'server_connection': check_server_connection(),
        'system_type': 'smart_parking_alpr',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Test endpoint"""
    return jsonify({
        'message': 'ALPR Service for Smart Parking is working',
        'features': [
            'License plate recognition with PaddleOCR',
            'Vietnamese plate validation',
            'Real-time processing',
            'Smart Parking Server integration',
            'Barrier control integration'
        ],
        'timestamp': datetime.now().isoformat()
    })

def check_server_connection():
    """Kiểm tra kết nối đến server chính"""
    try:
        response = requests.get(f"{SMART_PARKING_SERVER_URL}/api/health", timeout=5)
        return 'connected' if response.status_code == 200 else 'disconnected'
    except:
        return 'disconnected'

@app.route('/api/esp32/vehicle_detected', methods=['POST'])
def vehicle_detected():
    """Handle vehicle detection from ESP32"""
    try:
        data = request.get_json()
        logger.info(f"Vehicle detected from ESP32: {data}")
        
        # Forward to server
        try:
            response = requests.post(
                f"{SMART_PARKING_SERVER_URL}/api/iot/vehicle_detected",
                json=data,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            
            if response.status_code == 200:
                server_response = response.json()
                return jsonify({
                    'success': True,
                    'message': 'Vehicle detection forwarded to server',
                    'server_response': server_response,
                    'timestamp': datetime.now().isoformat()
                })
            else:
                return jsonify({
                    'success': False,
                    'error': f'Server error: {response.status_code}'
                }), 500
                
        except requests.exceptions.RequestException as e:
            return jsonify({
                'success': False,
                'error': f'Cannot connect to server: {str(e)}'
            }), 500
            
    except Exception as e:
        logger.error(f"Error handling vehicle detection: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/esp32/barrier_status', methods=['POST'])
def update_barrier_status():
    """Handle barrier status updates from ESP32"""
    try:
        data = request.get_json()
        logger.info(f"Barrier status update from ESP32: {data}")
        
        # Forward to server
        try:
            response = requests.post(
                f"{SMART_PARKING_SERVER_URL}/api/iot/barrier-control",
                json=data,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            
            if response.status_code == 200:
                server_response = response.json()
                return jsonify({
                    'success': True,
                    'message': 'Barrier status forwarded to server',
                    'server_response': server_response,
                    'timestamp': datetime.now().isoformat()
                })
            else:
                return jsonify({
                    'success': False,
                    'error': f'Server error: {response.status_code}'
                }), 500
                
        except requests.exceptions.RequestException as e:
            return jsonify({
                'success': False,
                'error': f'Cannot connect to server: {str(e)}'
            }), 500
            
    except Exception as e:
        logger.error(f"Error handling barrier status: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/esp32/heartbeat', methods=['POST'])
def esp32_heartbeat():
    """Handle ESP32 heartbeat"""
    try:
        data = request.get_json()
        logger.info(f"ESP32 heartbeat: {data}")
        
        return jsonify({
            'success': True,
            'message': 'Heartbeat received',
            'server_connection': check_server_connection(),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error handling heartbeat: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    try:
        initialize_services()
        print("🚗 ALPR Service for Smart Parking")
        print("=" * 50)
        print(f"📍 Port: {ALPR_SERVICE_PORT}")
        print(f"🔗 Smart Parking Server: {SMART_PARKING_SERVER_URL}")
        print(f"☁️  Cloudinary Integration: Enabled")
        print(f"📡 Health Check: http://localhost:{ALPR_SERVICE_PORT}/health")
        print(f"🔍 Detection API: http://localhost:{ALPR_SERVICE_PORT}/api/detect")
        print(f"🧪 Test API: http://localhost:{ALPR_SERVICE_PORT}/api/test")
        print("=" * 50)
        
        app.run(
            host='0.0.0.0',
            port=ALPR_SERVICE_PORT,
            debug=False
        )
    except Exception as e:
        logger.error(f"Failed to start ALPR service: {e}")
        sys.exit(1) 