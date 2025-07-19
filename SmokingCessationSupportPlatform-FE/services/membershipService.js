import api from "../config/axios";

export const membershipService = {
  // Lấy danh sách giao dịch thanh toán
  getPayments: async (params) => {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  // Lấy chi tiết giao dịch
  getPaymentById: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Cập nhật trạng thái giao dịch
  updatePaymentStatus: async (id, status) => {
    const response = await api.patch(`/payments/${id}/status`, { status });
    return response.data;
  },

  // Xử lý hoàn tiền
  processRefund: async (id, refundData) => {
    const response = await api.post(`/payments/${id}/refund`, refundData);
    return response.data;
  },

  // Lấy danh sách gói thành viên
  getPlans: async (params) => {
    const response = await api.get('/plans', { params });
    return response.data;
  },

  // Tạo gói thành viên mới
  createPlan: async (planData) => {
    const response = await api.post('/plans', planData);
    return response.data;
  },

  // Cập nhật gói thành viên
  updatePlan: async (id, planData) => {
    const response = await api.put(`/plans/${id}`, planData);
    return response.data;
  },

  // Cập nhật trạng thái gói thành viên
  updatePlanStatus: async (id, status) => {
    const response = await api.patch(`/plans/${id}/status`, { status });
    return response.data;
  },

  // Lấy thống kê
  getStatistics: async () => {
    const response = await api.get('/membership/statistics');
    return response.data;
  },
}; 