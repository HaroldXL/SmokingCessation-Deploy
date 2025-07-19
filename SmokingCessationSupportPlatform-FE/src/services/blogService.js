import api from "../config/axios";

export const blogService = {
  // Lấy danh sách bài viết
  getPosts: async (params) => {
    const response = await api.get('/post/all', { params });
    return response.data;
  },

  // Lấy chi tiết bài viết
  getPostById: async (id) => {
    const response = await api.get(`/post/detail/${id}`);
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
    const response = await api.delete(`/admin/posts/${id}`);
    return response.data;
  },

  // Cập nhật trạng thái bài viết
  approvePost: async (postId) => {
    const response = await api.patch(`/admin/posts/${postId}/approve`);
    return response.data;
  } 
}; 