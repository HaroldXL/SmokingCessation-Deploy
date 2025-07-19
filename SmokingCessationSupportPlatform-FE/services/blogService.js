import api from "../config/axios";

export const blogService = {
  // Lấy danh sách bài viết
  getPosts: async (params) => {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  // Lấy chi tiết bài viết
  getPostById: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // Tạo bài viết mới
  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  // Cập nhật bài viết
  updatePost: async (id, postData) => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },

  // Xóa bài viết
  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  // Cập nhật trạng thái bài viết
  updatePostStatus: async (id, status) => {
    const response = await api.patch(`/posts/${id}/status`, { status });
    return response.data;
  },
}; 