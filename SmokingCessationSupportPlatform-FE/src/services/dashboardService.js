import api from '../config/axios.js';

export const dashboardService = {
  // Fetch member distribution for Overall Members Distribution chart
  getMemberDistribution: async () => {
    try {
      const response = await api.get('/admin/users');
      const users = response.data;

      // Đếm user hợp lệ (userId khác null/undefined)
      const validUsers = users.filter(user => user.userId !== undefined && user.userId !== null);

      // Đếm số lượng premium và free
      const premiumMembers = validUsers.filter(user => user.hasActive === 1 || user.hasActive === true).length;
      const freeMembers = validUsers.filter(user => user.hasActive === 0 || user.hasActive === false).length;

      return [
        { name: "Premium Members", value: premiumMembers },
        { name: "Free Members", value: freeMembers }
      ];
    } catch (error) {
      console.error('Failed to fetch member distribution:', error);
      return [
        { name: "Premium Members", value: 0 },
        { name: "Free Members", value: 0 }
      ];
    }
  },

  // API: /api/dashboard/user-growth/7-days
  getUserGrowth7Days: async () => {
    try {
      const response = await api.get('/dashboard/user-growth/7-days');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch 7-day user growth data:', error);
      return [];
    }
  },

  // API: /api/dashboard/user-growth/30-days
  getUserGrowth30Days: async () => {
    try {
      const response = await api.get('/dashboard/user-growth/30-days');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch 30-day user growth data:', error);
      return [];
    }
  },

  // API: /api/dashboard/plan-stats
  getPlanStats: async () => {
    try {
      const response = await api.get('/dashboard/plan-stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch plan statistics:', error);
      return {};
    }
  },
  // API: /api/dashboard/total-revenue
  getTotalRevenue: async () => {
    try {
      const response = await api.get('/dashboard/dashboard/total-revenue');
      return response.data; 
    } catch (error) {
      console.error('Failed to fetch total revenue data:', error);
      return 0;
    }
  },
  // API: /api/dashboard/revenue
  getRevenue: async () => {
    try {
      const response = await api.get('/dashboard/dashboard/revenue');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
      return [];
    }
  },
};