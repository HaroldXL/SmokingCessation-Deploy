import api from "../config/axios.js";

export const badgeService = {
  // GET /admin/badges - Lấy tất cả huy hiệu
  getBadges: async () => {
    try {
      const response = await api.get("admin/badges");
      return response.data;
    } catch (error) {
      console.error("Error fetching badges:", error);
      throw error;
    }
  },

  // PUT /admin/badges/{badgeId} - Cập nhật huy hiệu cụ thể
  updateBadge: async (badgeId, badgeData) => {
    try {
      const response = await api.put(`admin/badges/${badgeId}`, badgeData);
      return response.data;
    } catch (error) {
      console.error(`Error updating badge ${badgeId}:`, error);
      throw error;
    }
  },

  // POST /admin/badges - Tạo huy hiệu mới (có thể cần trong tương lai)
  createBadge: async (badgeData) => {
    try {
      const response = await api.post("admin/badges", badgeData);
      return response.data;
    } catch (error) {
      console.error("Error creating badge:", error);
      throw error;
    }
  },

  // DELETE /admin/badges/{badgeId} - Xóa huy hiệu (có thể cần trong tương lai)
  deleteBadge: async (badgeId) => {
    try {
      const response = await api.delete(`admin/badges/${badgeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting badge ${badgeId}:`, error);
      throw error;
    }
  },

  // PATCH /admin/badges/{badgeId}/status - Toggle trạng thái huy hiệu
  toggleBadgeStatus: async (badgeId, isActive) => {
    try {
      const response = await api.patch(`admin/badges/${badgeId}/status`, {
        isActive: isActive
      });
      return response.data;
    } catch (error) {
      console.error(`Error toggling badge status ${badgeId}:`, error);
      throw error;
    }
  },

  // PATCH /admin/badges/bulk-status - Cập nhật trạng thái nhiều huy hiệu
  bulkUpdateBadgeStatus: async (badgeIds, isActive) => {
    try {
      const response = await api.patch("admin/badges/bulk-status", {
        badgeIds: badgeIds,
        isActive: isActive
      });
      return response.data;
    } catch (error) {
      console.error("Error bulk updating badge status:", error);
      throw error;
    }
  }
};
