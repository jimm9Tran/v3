#!/usr/bin/env python3
"""
Simple OCR Service - Chỉ tập trung vào nhận diện biển số xe
Bỏ vehicle detection, chỉ dùng PaddleOCR
"""

import cv2
import numpy as np
import re
import logging
from datetime import datetime
from paddleocr import PaddleOCR

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleOCRService:
    def __init__(self):
        """
        Khởi tạo OCR service
        """
        try:
            # Khởi tạo PaddleOCR
            logger.info("🔄 Initializing PaddleOCR...")
            self.ocr = PaddleOCR(lang='en')
            logger.info("✅ PaddleOCR initialized successfully")
            
            # Vietnamese license plate patterns
            self.license_plate_patterns = [
                r'^\d{2}[A-Z]\d{4,5}$',      # 51A1234, 51A12345
                r'^\d{2}[A-Z]\d{3}[A-Z]\d{2}$',  # 51A123A12
                r'^\d{2}[A-Z]\d{2}[A-Z]\d{3}$',  # 51A12A123
                r'^\d{2}[A-Z]\d{4}$',        # 51A1234
                r'^\d{2}[A-Z]\d{3}[A-Z]\d{2}$',  # 51A123A12
                r'^\d{2}[A-Z]\d{2}[A-Z]\d{3}$',  # 51A12A123
                r'^\d{2}[A-Z]\d{3}$',        # 51A123 (thêm pattern này)
            ]
            
            logger.info("✅ Simple OCR Service initialized for license plate recognition")
            
        except Exception as e:
            logger.error(f"❌ Error initializing OCR service: {e}")
            raise
    
    def process_image(self, image: np.ndarray) -> dict:
        """
        Xử lý ảnh và tìm biển số xe
        """
        try:
            start_time = datetime.now()
            
            # Chạy OCR trên toàn bộ ảnh
            ocr_results = self.ocr.ocr(image)
            
            # Tìm biển số xe
            license_plates = []
            all_texts = []
            
            # Xử lý format mới của PaddleOCR
            if ocr_results and len(ocr_results) > 0:
                result = ocr_results[0]  # Lấy kết quả đầu tiên
                
                # Lấy text và confidence từ format mới
                if 'rec_texts' in result and 'rec_scores' in result:
                    texts = result['rec_texts']
                    scores = result['rec_scores']
                    polys = result.get('rec_polys', [])
                    
                    for i, (text, confidence) in enumerate(zip(texts, scores)):
                        # Lấy bounding box nếu có
                        bbox = polys[i] if i < len(polys) else []
                        
                        # Convert bbox to list nếu là numpy array
                        bbox_list = bbox.tolist() if hasattr(bbox, 'tolist') else bbox
                        
                        # Lưu tất cả text
                        all_texts.append({
                            'text': text,
                            'confidence': float(confidence),
                            'bbox': bbox_list
                        })
                        
                        # Kiểm tra có phải biển số không
                        if self._validate_license_plate(text):
                            license_plates.append({
                                'text': text,
                                'normalized_text': self._normalize_license_plate(text),
                                'confidence': float(confidence),
                                'bbox': bbox_list,
                                'is_valid': True
                            })
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return {
                'success': True,
                'timestamp': datetime.now().isoformat(),
                'processing_time': processing_time,
                'license_plates': license_plates,
                'all_texts': all_texts,
                'total_texts_found': len(all_texts),
                'valid_plates_found': len(license_plates)
            }
            
        except Exception as e:
            logger.error(f"Error processing image: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _validate_license_plate(self, text: str) -> bool:
        """
        Validate Vietnamese license plate format
        """
        if not text:
            return False
        
        # Clean text - chỉ giữ lại chữ và số
        cleaned_text = re.sub(r'[^A-Z0-9]', '', text.upper())
        
        # Kiểm tra độ dài tối thiểu
        if len(cleaned_text) < 6:
            return False
        
        # Check against patterns
        for pattern in self.license_plate_patterns:
            if re.match(pattern, cleaned_text):
                return True
        
        return False
    
    def _normalize_license_plate(self, text: str) -> str:
        """
        Normalize license plate text
        """
        # Clean text
        cleaned_text = re.sub(r'[^A-Z0-9]', '', text.upper())
        return cleaned_text
    
    def get_detection_summary(self, results: dict) -> dict:
        """
        Tạo summary từ kết quả detection
        """
        if not results.get('success'):
            return {
                'success': False,
                'error': results.get('error', 'Unknown error')
            }
        
        license_plates = results.get('license_plates', [])
        all_texts = results.get('all_texts', [])
        
        return {
            'success': True,
            'total_texts_found': len(all_texts),
            'valid_plates_found': len(license_plates),
            'license_plates': license_plates,
            'processing_time': results.get('processing_time', 0),
            'timestamp': results.get('timestamp')
        }

# Test function
def test_ocr_service():
    """
    Test OCR service với ảnh mẫu
    """
    print("🧪 Testing Simple OCR Service")
    print("=" * 40)
    
    # Khởi tạo service
    service = SimpleOCRService()
    
    # Tạo ảnh mẫu với biển số
    img = np.ones((300, 500, 3), dtype=np.uint8) * 255  # White background
    
    # Vẽ biển số mẫu
    plate_text = "51A123"
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 2
    thickness = 3
    color = (0, 0, 0)
    
    text_size = cv2.getTextSize(plate_text, font, font_scale, thickness)[0]
    text_x = 250 - text_size[0] // 2
    text_y = 150 + text_size[1] // 2
    
    cv2.putText(img, plate_text, (text_x, text_y), font, font_scale, color, thickness)
    
    # Lưu ảnh test
    cv2.imwrite("test_plate.jpg", img)
    print("📸 Created test image with license plate")
    
    # Test OCR
    result = service.process_image(img)
    
    print("\n📊 OCR Results:")
    print(f"Success: {result.get('success')}")
    print(f"Processing Time: {result.get('processing_time', 0):.3f}s")
    print(f"Total Texts Found: {result.get('total_texts_found', 0)}")
    print(f"Valid Plates Found: {result.get('valid_plates_found', 0)}")
    
    if result.get('license_plates'):
        print("\n🎯 License Plates Detected:")
        for plate in result['license_plates']:
            print(f"   - {plate['normalized_text']} (Confidence: {plate['confidence']:.2f})")
    
    if result.get('all_texts'):
        print("\n📝 All Texts Found:")
        for text_info in result['all_texts']:
            print(f"   - '{text_info['text']}' (Confidence: {text_info['confidence']:.2f})")
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    test_ocr_service() 