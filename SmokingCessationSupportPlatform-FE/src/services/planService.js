import api from "../config/axios";

export const reasonService = {
  getAllReasons: async () => {
    try {
      const response = await api.get("/reasons");
      return response.data;
    } catch (error) {
      console.error("Error fetching reasons:", error);
      throw error;
    }
  },

  createReason: async (reasonData) => {
    try {
      const response = await api.post("/admin/reasons", reasonData);
      return response.data;
    } catch (error) {
      console.error("Error creating reason:", error);
      throw error;
    }
  },

  updateReason: async (reasonId, reasonData) => {
    try {
      const response = await api.put(`/admin/reasons/${reasonId}`, reasonData);
      return response.data;
    } catch (error) {
      console.error("Error updating reason:", error);
      throw error;
    }
  },

  deleteReason: async (reasonId) => {
    try {
      const response = await api.delete(`/admin/reasons/${reasonId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting reason:", error);
      throw error;
    }
  },
};

export const triggerService = {
  getAllTriggerCategories: async () => {
    try {
      const response = await api.get("/triggers/categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching trigger categories:", error);
      throw error;
    }
  },

  createTriggerCategory: async (categoryData) => {
    try {
      const response = await api.post("/admin/trigger-categories", categoryData);
      return response.data;
    } catch (error) {
      console.error("Error creating trigger category:", error);
      throw error;
    }
  },

  updateTriggerCategory: async (categoryId, categoryData) => {
    try {
      const response = await api.put(`/admin/trigger-categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      console.error("Error updating trigger category:", error);
      throw error;
    }
  },

  deleteTriggerCategory: async (categoryId) => {
    try {
      const response = await api.delete(`/admin/trigger-categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting trigger category:", error);
      throw error;
    }
  },

  createTrigger: async (triggerData) => {
    try {
      const response = await api.post(`/admin/triggers`, null, {
        params: {
          name: triggerData.name,
          categoryId: triggerData.categoryId
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating trigger:", error);
      throw error;
    }
  },

  updateTrigger: async (triggerId, triggerData) => {
    try {
      const response = await api.put(`/admin/triggers/${triggerId}`, null, {
        params: {
          name: triggerData.name,
          categoryId: triggerData.categoryId
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error updating trigger:", error);
      throw error;
    }
  },

  deleteTrigger: async (triggerId) => {
    try {
      const response = await api.delete(`/admin/triggers/${triggerId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting trigger:", error);
      throw error;
    }
  },
};

export const questionService = {
  getAllQuestions: async () => {
    try {
      const response = await api.get("/admin/questions");
      return response.data;
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
  },

  getQuestionAnswers: async (questionId) => {
    try {
      const response = await api.get(`/admin/questions/${questionId}/answers`);
      return response.data;
    } catch (error) {
      console.error("Error fetching question answers:", error);
      throw error;
    }
  },

  createQuestion: async (questionData) => {
    try {
      const response = await api.post("/admin/questions", null, {
        params: {
          questionText: questionData.questionText
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating question:", error);
      throw error;
    }
  },

  updateQuestion: async (questionId, questionData) => {
    try {
      const response = await api.put(`/admin/questions/${questionId}`, null, {
        params: {
          newText: questionData.questionText
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error updating question:", error);
      throw error;
    }
  },

  deleteQuestion: async (questionId) => {
    try {
      const response = await api.delete(`/admin/questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting question:", error);
      throw error;
    }
  },

  createAnswer: async (questionId, answerData) => {
    try {
      const response = await api.post(`/admin/questions/${questionId}/answers`, answerData);
      return response.data;
    } catch (error) {
      console.error("Error creating answer:", error);
      throw error;
    }
  },

  updateAnswer: async (answerId, answerData) => {
    try {
      const response = await api.put(`/admin/answers/${answerId}`, answerData);
      return response.data;
    } catch (error) {
      console.error("Error updating answer:", error);
      throw error;
    }
  },

  deleteAnswer: async (answerId) => {
    try {
      const response = await api.delete(`/admin/answers/${answerId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting answer:", error);
      throw error;
    }
  },
};

export const supportMeasureService = {
  getAllSupportMeasures: async () => {
    try {
      const response = await api.get("/support-measures");
      return response.data;
    } catch (error) {
      console.error("Error fetching support measures:", error);
      throw error;
    }
  },

  createSupportMeasure: async (supportMeasureData) => {
    try {
      const response = await api.post("/support-measures", supportMeasureData);
      return response.data;
    } catch (error) {
      console.error("Error creating support measure:", error);
      throw error;
    }
  },

  updateSupportMeasure: async (supportMeasureId, supportMeasureData) => {
    try {
      const response = await api.put(`/support-measures/${supportMeasureId}`, supportMeasureData);
      return response.data;
    } catch (error) {
      console.error("Error updating support measure:", error);
      throw error;
    }
  },

  deleteSupportMeasure: async (supportMeasureId) => {
    try {
      const response = await api.delete(`/support-measures/${supportMeasureId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting support measure:", error);
      throw error;
    }
  },
};