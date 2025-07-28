#!/usr/bin/env node
/**
 * Test script để mô phỏng ESP32 gửi RFID + ALPR data
 */

const fs = require('fs');

// Configuration
const SERVER_URL = 'http://192.168.102.3:8080/api/iot/rfid-alpr-integration';
const TEST_IMAGE_PATH = './alpr_service_simple/test_plate.jpg';

// Test data
const testCases = [
  {
    reader_id: 1,
    card_id: 'E3803CFC',
    device_id: 'ESP32_RFID_ALPR_System',
    parking_lot_id: '6886f4dfb555296eb0714e5f',
    barrier_id: 'barrier-1'
  },
  {
    reader_id: 2,
    card_id: 'B2EBC905',
    device_id: 'ESP32_RFID_ALPR_System',
    parking_lot_id: '6886f4dfb555296eb0714e5f',
    barrier_id: 'barrier-2'
  }
];

async function readImageAsBase64(filePath) {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error('Error reading image:', error);
    return 'base64_image_data_simulation';
  }
}

async function testRFIDALPRIntegration(testCase) {
  try {
    console.log(`\n🚗 Testing RFID + ALPR Integration`);
    console.log(`📋 Test Case: Reader ${testCase.reader_id}, Card ${testCase.card_id}`);
    
    // Read test image
    const entryImage = await readImageAsBase64(TEST_IMAGE_PATH);
    
    // Prepare payload
    const payload = {
      reader_id: testCase.reader_id,
      card_id: testCase.card_id,
      device_id: testCase.device_id,
      parking_lot_id: testCase.parking_lot_id,
      entry_image: entryImage,
      barrier_id: testCase.barrier_id
    };
    
    console.log('📤 Sending data to server...');
    
    // Send request
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    console.log('📥 Server Response:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Integration successful!');
      console.log(`🚗 License Plate: ${result.data.alpr.license_plate}`);
      console.log(`🎯 Confidence: ${result.data.alpr.confidence}%`);
      console.log(`🔓 Should Open Barrier: ${result.data.parking.data.shouldOpenBarrier}`);
      console.log(`🎫 Session ID: ${result.data.parking.data.sessionId}`);
    } else {
      console.log('❌ Integration failed!');
      console.log(`Error: ${result.message}`);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Error during integration test:', error);
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 Starting RFID + ALPR Integration Tests');
  console.log('==========================================');
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📋 Test ${i + 1}/${testCases.length}`);
    
    const result = await testRFIDALPRIntegration(testCase);
    
    if (result && result.success) {
      console.log('✅ Test passed!');
    } else {
      console.log('❌ Test failed!');
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎉 All tests completed!');
}

// Run tests
runAllTests().catch(console.error); 