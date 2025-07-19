import api from "../config/axios";

export const coachService = {
  // Lấy danh sách huấn luyện viên
  getCoaches: async (params) => {
    const response = await api.get('/coaches', { params });
    return response.data;
  },

  // Lấy thông tin chi tiết một huấn luyện viên
  getCoachById: async (id) => {
    const response = await api.get(`/coaches/${id}`);
    return response.data;
  },

  // Tạo huấn luyện viên mới
  createCoach: async (coachData) => {
    const response = await api.post('/coaches', coachData);
    return response.data;
  },

  // Cập nhật thông tin huấn luyện viên
  updateCoach: async (id, coachData) => {
    const response = await api.put(`/coaches/${id}`, coachData);
    return response.data;
  },

  // Xóa huấn luyện viên
  deleteCoach: async (id) => {
    const response = await api.delete(`/coaches/${id}`);
    return response.data;
  },
}; 