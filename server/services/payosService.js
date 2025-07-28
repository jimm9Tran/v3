const axios = require('axios');
const crypto = require('crypto');

class PayOSService {
  constructor() {
    this.clientId = process.env.PAYOS_CLIENT_ID;
    this.apiKey = process.env.PAYOS_API_KEY;
    this.checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    this.baseUrl = process.env.PAYOS_BASE_URL || 'https://api-merchant.payos.vn';
  }

  /**
   * Tạo checksum cho request
   * @param {Object} data - Dữ liệu cần tạo checksum
   * @returns {string} - Checksum
   */
  createChecksum(data) {
    const dataStr = JSON.stringify(data);
    return crypto.createHmac('sha256', this.checksumKey).update(dataStr).digest('hex');
  }

  /**
   * Tạo URL thanh toán PayOS
   * @param {Object} paymentData - Dữ liệu thanh toán
   * @returns {Object} - Kết quả tạo URL
   */
  async createPaymentUrl(paymentData) {
    try {
      const {
        orderCode,
        amount,
        description,
        cancelUrl,
        returnUrl,
        signature,
        items = []
      } = paymentData;

      const requestData = {
        orderCode,
        amount,
        description,
        cancelUrl,
        returnUrl,
        signature,
        items,
        buyerName: paymentData.buyerName || '',
        buyerEmail: paymentData.buyerEmail || '',
        buyerPhone: paymentData.buyerPhone || '',
        buyerAddress: paymentData.buyerAddress || '',
        expiredAt: paymentData.expiredAt || Math.floor(Date.now() / 1000) + 3600 // 1 giờ
      };

      const checksum = this.createChecksum(requestData);

      const payload = {
        ...requestData,
        checksum
      };

      const response = await axios.post(`${this.baseUrl}/v2/payment-requests`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': this.clientId,
          'x-api-key': this.apiKey
        }
      });

      return {
        success: true,
        data: {
          paymentUrl: response.data.data.paymentUrl,
          orderCode: response.data.data.orderCode,
          qrCode: response.data.data.qrCode,
          deepLink: response.data.data.deepLink
        }
      };

    } catch (error) {
      console.error('PayOS createPaymentUrl error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Xác thực webhook từ PayOS
   * @param {Object} webhookData - Dữ liệu webhook
   * @returns {boolean} - Kết quả xác thực
   */
  verifyWebhook(webhookData) {
    try {
      const { checksum, ...data } = webhookData;
      const calculatedChecksum = this.createChecksum(data);
      return calculatedChecksum === checksum;
    } catch (error) {
      console.error('PayOS verifyWebhook error:', error);
      return false;
    }
  }

  /**
   * Lấy thông tin giao dịch
   * @param {string} orderCode - Mã đơn hàng
   * @returns {Object} - Thông tin giao dịch
   */
  async getTransactionInfo(orderCode) {
    try {
      const response = await axios.get(`${this.baseUrl}/v2/payment-requests/${orderCode}`, {
        headers: {
          'x-client-id': this.clientId,
          'x-api-key': this.apiKey
        }
      });

      return {
        success: true,
        data: response.data.data
      };

    } catch (error) {
      console.error('PayOS getTransactionInfo error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Hủy giao dịch
   * @param {string} orderCode - Mã đơn hàng
   * @returns {Object} - Kết quả hủy
   */
  async cancelTransaction(orderCode) {
    try {
      const response = await axios.delete(`${this.baseUrl}/v2/payment-requests/${orderCode}`, {
        headers: {
          'x-client-id': this.clientId,
          'x-api-key': this.apiKey
        }
      });

      return {
        success: true,
        data: response.data.data
      };

    } catch (error) {
      console.error('PayOS cancelTransaction error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Tạo dữ liệu thanh toán cho nạp tiền
   * @param {Object} depositData - Dữ liệu nạp tiền
   * @returns {Object} - Dữ liệu thanh toán
   */
  createDepositPaymentData(depositData) {
    const {
      userId,
      amount,
      description,
      returnUrl,
      cancelUrl
    } = depositData;

    const orderCode = `DEPOSIT_${userId}_${Date.now()}`;
    const signature = crypto.randomBytes(16).toString('hex');

    return {
      orderCode,
      amount,
      description: description || `Nạp tiền vào tài khoản - ${amount.toLocaleString('vi-VN')} VNĐ`,
      returnUrl,
      cancelUrl,
      signature,
      items: [{
        name: 'Nạp tiền vào tài khoản',
        quantity: 1,
        price: amount
      }]
    };
  }
}

module.exports = new PayOSService(); 