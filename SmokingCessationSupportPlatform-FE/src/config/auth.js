import { jwtDecode } from 'jwt-decode';

// Lưu token vào localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Lấy token từ localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Xóa token khỏi localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Kiểm tra token có hết hạn chưa
export const isTokenExpired = () => {
  try {
    const token = getToken();
    if (!token) return true;
    
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

// Kiểm tra user đã đăng nhập chưa
export const isAuthenticated = () => {
  const token = getToken();
  return token && !isTokenExpired();
};