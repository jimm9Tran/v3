#!/usr/bin/env python3
"""
Cloudinary Service - Upload và quản lý ảnh trên Cloudinary
"""

import cloudinary
import cloudinary.uploader
import cloudinary.api
import logging
from datetime import datetime
import os
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CloudinaryService:
    def __init__(self):
        """
        Khởi tạo Cloudinary service
        """
        try:
            # Load environment variables từ file .env
            load_dotenv()
            
            # Cấu hình Cloudinary từ environment variables
            cloudinary.config(
                cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME', 'your-cloud-name'),
                api_key=os.getenv('CLOUDINARY_API_KEY', 'your-api-key'),
                api_secret=os.getenv('CLOUDINARY_API_SECRET', 'your-api-secret')
            )
            
            logger.info("✅ Cloudinary service initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Error initializing Cloudinary service: {e}")
            raise
    
    def upload_image(self, image_bytes, folder="parking-system", public_id=None):
        """
        Upload ảnh lên Cloudinary
        
        Args:
            image_bytes: Bytes của ảnh
            folder: Thư mục trên Cloudinary
            public_id: ID công khai cho ảnh
            
        Returns:
            dict: Thông tin ảnh đã upload
        """
        try:
            # Tạo public_id nếu không có
            if not public_id:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                public_id = f"parking_entry_{timestamp}"
            
            # Upload ảnh lên Cloudinary
            result = cloudinary.uploader.upload(
                image_bytes,
                folder=folder,
                public_id=public_id,
                resource_type="image",
                transformation=[
                    {"width": 800, "height": 600, "crop": "limit"},  # Resize ảnh
                    {"quality": "auto:good"}  # Tối ưu chất lượng
                ]
            )
            
            logger.info(f"✅ Image uploaded successfully: {result['public_id']}")
            
            return {
                'success': True,
                'url': result['secure_url'],
                'public_id': result['public_id'],
                'width': result['width'],
                'height': result['height'],
                'format': result['format'],
                'bytes': result['bytes'],
                'created_at': result['created_at']
            }
            
        except Exception as e:
            logger.error(f"❌ Error uploading image to Cloudinary: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def upload_parking_image(self, image_bytes, license_plate, parking_lot_id, image_type="entry"):
        """
        Upload ảnh parking với metadata
        
        Args:
            image_bytes: Bytes của ảnh
            license_plate: Biển số xe
            parking_lot_id: ID bãi xe
            image_type: Loại ảnh (entry/exit)
            
        Returns:
            dict: Thông tin ảnh đã upload
        """
        try:
            # Tạo public_id với thông tin metadata
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            public_id = f"parking_{image_type}_{license_plate}_{parking_lot_id}_{timestamp}"
            
            # Upload với context metadata
            result = cloudinary.uploader.upload(
                image_bytes,
                folder=f"parking-system/{parking_lot_id}/{image_type}",
                public_id=public_id,
                resource_type="image",
                context={
                    "license_plate": license_plate,
                    "parking_lot_id": parking_lot_id,
                    "image_type": image_type,
                    "upload_time": timestamp
                },
                transformation=[
                    {"width": 800, "height": 600, "crop": "limit"},
                    {"quality": "auto:good"}
                ]
            )
            
            logger.info(f"✅ Parking image uploaded: {result['public_id']}")
            
            return {
                'success': True,
                'url': result['secure_url'],
                'public_id': result['public_id'],
                'license_plate': license_plate,
                'parking_lot_id': parking_lot_id,
                'image_type': image_type,
                'metadata': {
                    'width': result['width'],
                    'height': result['height'],
                    'format': result['format'],
                    'bytes': result['bytes'],
                    'created_at': result['created_at']
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Error uploading parking image: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def delete_image(self, public_id):
        """
        Xóa ảnh khỏi Cloudinary
        
        Args:
            public_id: ID công khai của ảnh
            
        Returns:
            dict: Kết quả xóa
        """
        try:
            result = cloudinary.uploader.destroy(public_id)
            
            if result['result'] == 'ok':
                logger.info(f"✅ Image deleted successfully: {public_id}")
                return {
                    'success': True,
                    'message': 'Image deleted successfully'
                }
            else:
                logger.error(f"❌ Error deleting image: {result}")
                return {
                    'success': False,
                    'error': 'Failed to delete image'
                }
                
        except Exception as e:
            logger.error(f"❌ Error deleting image from Cloudinary: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_image_info(self, public_id):
        """
        Lấy thông tin ảnh từ Cloudinary
        
        Args:
            public_id: ID công khai của ảnh
            
        Returns:
            dict: Thông tin ảnh
        """
        try:
            result = cloudinary.api.resource(public_id)
            
            return {
                'success': True,
                'url': result['secure_url'],
                'public_id': result['public_id'],
                'width': result['width'],
                'height': result['height'],
                'format': result['format'],
                'bytes': result['bytes'],
                'created_at': result['created_at'],
                'context': result.get('context', {})
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting image info: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def list_images(self, folder="parking-system", max_results=50):
        """
        Liệt kê ảnh trong folder
        
        Args:
            folder: Thư mục trên Cloudinary
            max_results: Số lượng kết quả tối đa
            
        Returns:
            dict: Danh sách ảnh
        """
        try:
            result = cloudinary.api.resources(
                type="upload",
                prefix=folder,
                max_results=max_results
            )
            
            return {
                'success': True,
                'images': result['resources'],
                'total_count': len(result['resources'])
            }
            
        except Exception as e:
            logger.error(f"❌ Error listing images: {e}")
            return {
                'success': False,
                'error': str(e)
            }

def test_cloudinary_service():
    """
    Test Cloudinary service
    """
    try:
        # Khởi tạo service
        cloudinary_service = CloudinaryService()
        
        # Test upload ảnh (cần có ảnh test)
        print("✅ Cloudinary service initialized successfully")
        
        # Test list images
        result = cloudinary_service.list_images(max_results=5)
        if result['success']:
            print(f"📸 Found {result['total_count']} images in Cloudinary")
        else:
            print(f"❌ Error listing images: {result['error']}")
            
    except Exception as e:
        print(f"❌ Error testing Cloudinary service: {e}")

if __name__ == "__main__":
    test_cloudinary_service() 