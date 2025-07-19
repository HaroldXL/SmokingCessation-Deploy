import api from "../config/axios";

export const userService = {
  // Lấy danh sách người dùng
  getUsers: async (params) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Lấy thông tin chi tiết một người dùng
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Tạo người dùng mới
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Cập nhật thông tin người dùng
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Xóa người dùng
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
}; 