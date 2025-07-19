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

export const strategyService = {
  getAllStrategyCategories: async () => {
    try {
      const response = await api.get("/strategies/categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching strategy categories:", error);
      throw error;
    }
  },

  createStrategyCategory: async (categoryData) => {
    try {
      const response = await api.post("/admin/strategy-categories", categoryData);
      return response.data;
    } catch (error) {
      console.error("Error creating strategy category:", error);
      throw error;
    }
  },

  updateStrategyCategory: async (categoryId, categoryData) => {
    try {
      const response = await api.put(`/admin/strategy-categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      console.error("Error updating strategy category:", error);
      throw error;
    }
  },

  deleteStrategyCategory: async (categoryId) => {
    try {
      const response = await api.delete(`/admin/strategy-categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting strategy category:", error);
      throw error;
    }
  },

  createStrategy: async (strategyData) => {
    try {
      const response = await api.post(`/admin/strategies`, null, {
        params: {
          name: strategyData.name,
          categoryId: strategyData.categoryId
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating strategy:", error);
      throw error;
    }
  },

    updateStrategy: async (strategyId, strategyData) => {
    try {
      const response = await api.put(`/admin/strategies/${strategyId}`, null, {
        params: {
          name: strategyData.name,
          categoryId: strategyData.categoryId
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error updating strategy:", error);
      throw error;
    }
  },

  deleteStrategy: async (strategyId) => {
    try {
      const response = await api.delete(`/admin/strategies/${strategyId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting strategy:", error);
      throw error;
    }
  },
};