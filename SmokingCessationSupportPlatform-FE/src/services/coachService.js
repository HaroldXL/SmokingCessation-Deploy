import api from "../config/axios";

export const coachService = {
  // Tổng quan dashboard huấn luyện viên
  getDashboardOverview: async () => {
    const response = await api.get("mentor-dashboard/overview");
    return response.data;
  },
  // Lấy danh sách consultations của mentor
  getMentorConsultations: async () => {
    const response = await api.get("consultations/mentor");
    return response.data;
  },

  getClientConsultations: async () => {
    const response = await api.get("mentor-dashboard/consultations/users");
    return response.data;
  },

  getAllMentorConsultations: async () => {
    const response = await api.get("consultations/mentor/slots/all");
    return response.data;
  },

  // Lấy chi tiết lịch tư vấn theo consultationId
  getConsultationDetails: async (consultationId) => {
    const response = await api.get(`mentor-dashboard/consultations/${consultationId}`);
    return response.data;
  },

  // Lấy tiến trình cai thuốc của user theo userId
  getUserSmokingProgress: async (userId) => {
    const response = await api.get(`mentor-dashboard/smoking-progress/user/${userId}`);
    return response.data;
  },
  // Thêm ghi chú cho consultation
  addConsultationNote: async (consultationId, notes) => {
    const response = await api.post(`mentor-dashboard/consultations/${consultationId}/add-note`, {
      notes: notes
    });
    return response.data;
  },
  
  // Lấy reasons của user
  getUserReasons: async (userId) => {
    const response = await api.get(`reasons/user/${userId}`);
    return response.data;
  },
  
  // Lấy triggers của user
  getUserTriggers: async (userId) => {
    const response = await api.get(`user-triggers/by-user/${userId}`);
    return response.data;
  },
  
  // Lấy strategies của user
  getUserStrategies: async (userId) => {
    const response = await api.get(`user-strategies/by-user/${userId}`);
    return response.data;
  },

  // Lấy huy hiệu của user
  getUserBadges: async (userId) => {
    const response = await api.get(`achievements/badges/${userId}`);
    return response.data;
  }
}