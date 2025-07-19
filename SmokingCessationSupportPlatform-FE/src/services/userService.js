import api from "../config/axios";

/**
 * Constants cho error messages
 */
const ERROR_MESSAGES = {
  INVALID_USER_DATA: 'Dữ liệu người dùng không hợp lệ',
  USER_ID_REQUIRED: 'User ID is required',
  USER_NOT_FOUND: 'Không tìm thấy người dùng',
  NO_PERMISSION: 'Không có quyền truy cập',
  EMAIL_EXISTS: 'Email hoặc tên người dùng đã tồn tại',
  SERVER_ERROR: 'Lỗi server, vui lòng thử lại sau',
  GENERIC_ERROR: 'Có lỗi xảy ra, vui lòng thử lại'
};

/**
 * Helper function để validate user data
 * @param {Object} userData - Dữ liệu người dùng
 * @returns {boolean} - true nếu valid
 */
const validateUserData = (userData) => {
  if (!userData || typeof userData !== 'object') {
    return false;
  }
  
  // Kiểm tra các trường bắt buộc
  const requiredFields = ['email'];
  for (const field of requiredFields) {
    if (!userData[field]) {
      return false;
    }
  }
  
  // Validate email format
  if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    return false;
  }
  
  return true;
};

/**
 * Helper function để xử lý lỗi API
 * @param {Error} error - Error object
 * @param {string} operation - Tên operation đang thực hiện
 * @returns {Error} - Formatted error
 */
const handleApiError = (error, operation) => {
  console.error(`${operation} error:`, error);
  
  if (error.message && Object.values(ERROR_MESSAGES).includes(error.message)) {
    return error;
  }
  
  const status = error.response?.status;
  
  switch (status) {
    case 400:
      return new Error(ERROR_MESSAGES.INVALID_USER_DATA);
    case 403:
      return new Error(ERROR_MESSAGES.NO_PERMISSION);
    case 404:
      return new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    case 409:
      return new Error(ERROR_MESSAGES.EMAIL_EXISTS);
    default:
      if (status >= 500) {
        return new Error(ERROR_MESSAGES.SERVER_ERROR);
      }
      return new Error(ERROR_MESSAGES.GENERIC_ERROR);
  }
};

/**
 * User Service để quản lý các API liên quan đến người dùng
 */
export const userService = {
  // Lấy danh sách tất cả users cho admin
  fetchAdminUsers: async () => {
    try {
      const response = await api.get('admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết một user
  getUserById: async (id) => {
    try {
      const response = await api.get(`admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  },

  // Tạo user mới
  createUser: async (userData) => {
    try {
      const response = await api.post('users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Cập nhật thông tin user
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
  // Tạo user mới bằng admin
  createUserByAdmin: async (userData) => {
    try {
      console.log('API call - sending data:', userData); // Debug log
      const response = await api.post('admin/users', userData);
      console.log('API response:', response.data); // Debug response
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      console.error('API Error details:', error.response?.data); // Chi tiết lỗi
      throw error;
    }
  },

  // Xóa user
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Lấy lịch sử hút thuốc của user
  getSmokingProgressId: async (userId) => {
    try {
      const response = await api.get(`admin/smoking-progress/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching smoking progress:', error);
      // Trả về array rỗng nếu không có data thay vì throw error
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }
};