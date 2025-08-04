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
  },

  // Lấy câu hỏi của user
  getUserQuestions: async (userId) => {
    const response = await api.get(`/question-answer/questions?userId=${userId}`);
    return response.data;
  },

  // Lấy điểm nghiện của user
  getUserAddictionScore: async (userId) => {
    const response = await api.get(`/question-answer/scores/${userId}`);
    return response.data;
  },

  // Mentor gán task cho user pro
  assignTaskToUser: async (taskData) => {
    const response = await api.post('/plan-tasks-pro/assign', taskData);
    return response.data;
  },

  // Mentor lấy danh sách task của 1 user cụ thể do chính mình gán
  getMentorUserTasks: async (userId) => {
    const response = await api.get(`/plan-tasks-pro/mentor/${userId}`);
    return response.data;
  },

  // Mentor cập nhật nội dung task đã giao
  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/plan-tasks-pro/${taskId}`, taskData);
    return response.data;
  },

  // Mentor cập nhật trạng thái task
  updateTaskStatus: async (taskId, status) => {
    const response = await api.put(`/plan-tasks-pro/${taskId}/status`, status, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    return response.data;
  },

  // Mentor xóa task của client
  deleteTask: async (taskId) => {
    const response = await api.delete(`/plan-tasks-pro/mentor/${taskId}`);
    return response.data;
  },

  // Gửi thông báo cho user
  sendNotificationToUser: async (notificationData) => {
    const { mentorId, userId, title, message } = notificationData;
    const response = await api.post('/notifications/send', 
      {},
      { params: { mentorId, userId, title, message } }
    );
    return response.data;
  }
}