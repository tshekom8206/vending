import axios, { AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '../types';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API methods
export const apiService = {
  // GET request
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await api.get(url, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  },

  // POST request
  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await api.post(url, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  },

  // PUT request
  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await api.put(url, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  },

  // DELETE request
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await api.delete(url);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  },

  // Error handler
  handleError(error: any): ApiError {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      error: error.message || 'Network error occurred'
    };
  }
};

// Authentication API
export const authAPI = {
  async login(email: string, password: string) {
    return apiService.post('/auth/login', { email, password });
  },

  async getProfile() {
    return apiService.get('/auth/me');
  },

  async updateProfile(data: any) {
    return apiService.put('/auth/profile', data);
  },

  async changePassword(data: any) {
    return apiService.put('/auth/password', data);
  }
};

// Users API
export const usersAPI = {
  async getUsers(params?: any) {
    return apiService.get('/users', params);
  },

  async getUser(id: string) {
    return apiService.get(`/users/${id}`);
  },

  async updateUser(id: string, data: any) {
    return apiService.put(`/users/${id}`, data);
  },

  async deactivateUser(id: string) {
    return apiService.delete(`/users/${id}`);
  },

  async getUserDashboard(id: string) {
    return apiService.get(`/users/${id}/dashboard`);
  },

  async getUserPurchases(id: string, params?: any) {
    return apiService.get(`/users/${id}/purchases`, params);
  },

  async getUserIncidents(id: string, params?: any) {
    return apiService.get(`/users/${id}/incidents`, params);
  },

  async getUserStats(params?: any) {
    return apiService.get('/users/stats/summary', params);
  }
};

// Estates API
export const estatesAPI = {
  async getEstates(params?: any) {
    return apiService.get('/estates', params);
  },

  async getEstate(id: string) {
    return apiService.get(`/estates/${id}`);
  },

  async createEstate(data: any) {
    return apiService.post('/estates', data);
  },

  async updateEstate(id: string, data: any) {
    return apiService.put(`/estates/${id}`, data);
  },

  async deleteEstate(id: string) {
    return apiService.delete(`/estates/${id}`);
  },

  async getEstateUnits(id: string, params?: any) {
    return apiService.get(`/estates/${id}/units`, params);
  },

  async getEstateStatistics(id: string, params?: any) {
    return apiService.get(`/estates/${id}/statistics`, params);
  },

  async addEstateAdministrator(id: string, data: any) {
    return apiService.post(`/estates/${id}/administrators`, data);
  },

  async removeEstateAdministrator(id: string, userId: string) {
    return apiService.delete(`/estates/${id}/administrators/${userId}`);
  }
};

// Units API
export const unitsAPI = {
  async getUnits(params?: any) {
    return apiService.get('/units', params);
  },

  async getUnit(id: string) {
    return apiService.get(`/units/${id}`);
  },

  async createUnit(data: any) {
    return apiService.post('/units', data);
  },

  async updateUnit(id: string, data: any) {
    return apiService.put(`/units/${id}`, data);
  },

  async deleteUnit(id: string) {
    return apiService.delete(`/units/${id}`);
  },

  async assignTenant(id: string, data: any) {
    return apiService.post(`/units/${id}/tenant`, data);
  },

  async removeTenant(id: string, data?: any) {
    return apiService.delete(`/units/${id}/tenant`);
  },

  async getUnitMeter(id: string) {
    return apiService.get(`/units/${id}/meter`);
  },

  async createUnitMeter(id: string, data: any) {
    return apiService.post(`/units/${id}/meter`, data);
  },

  async addMeterReading(id: string, data: any) {
    return apiService.post(`/units/${id}/meter/readings`, data);
  },

  async getUnitMaintenance(id: string) {
    return apiService.get(`/units/${id}/maintenance`);
  },

  async addMaintenanceRecord(id: string, data: any) {
    return apiService.post(`/units/${id}/maintenance`, data);
  }
};

// Purchases API
export const purchasesAPI = {
  async getPurchases(params?: any) {
    return apiService.get('/purchases', params);
  },

  async getPurchase(id: string) {
    return apiService.get(`/purchases/${id}`);
  },

  async createPurchase(data: any) {
    return apiService.post('/purchases', data);
  },

  async retryDelivery(id: string) {
    return apiService.post(`/purchases/${id}/retry-delivery`);
  },

  async processRefund(id: string, data: any) {
    return apiService.post(`/purchases/${id}/refund`, data);
  },

  async useToken(id: string) {
    return apiService.post(`/purchases/${id}/use-token`);
  },

  async getPurchaseStatistics(params?: any) {
    return apiService.get('/purchases/stats/summary', params);
  }
};

// Incidents API
export const incidentsAPI = {
  async getIncidents(params?: any) {
    return apiService.get('/incidents', params);
  },

  async getIncident(id: string) {
    return apiService.get(`/incidents/${id}`);
  },

  async createIncident(data: any) {
    return apiService.post('/incidents', data);
  },

  async updateIncident(id: string, data: any) {
    return apiService.put(`/incidents/${id}`, data);
  },

  async addCommunication(id: string, data: any) {
    return apiService.post(`/incidents/${id}/communications`, data);
  },

  async escalateIncident(id: string, data: any) {
    return apiService.post(`/incidents/${id}/escalate`, data);
  },

  async closeIncident(id: string, data?: any) {
    return apiService.post(`/incidents/${id}/close`, data);
  },

  async getIncidentStats() {
    return apiService.get('/incidents/stats/dashboard');
  },

  async getIncidentCategories() {
    return apiService.get('/incidents/categories');
  }
};

// Notifications API
export const notificationsAPI = {
  async getNotifications(params?: any) {
    return apiService.get('/notifications', params);
  },

  async getNotification(id: string) {
    return apiService.get(`/notifications/${id}`);
  },

  async markAsRead(id: string) {
    return apiService.put(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    return apiService.put('/notifications/read-all');
  },

  async createNotification(data: any) {
    return apiService.post('/notifications', data);
  },

  async sendBroadcast(data: any) {
    return apiService.post('/notifications/broadcast', data);
  },

  async createBalanceAlert(data: any) {
    return apiService.post('/notifications/balance-alert', data);
  },

  async getNotificationStats(params?: any) {
    return apiService.get('/notifications/stats/summary', params);
  },

  async getNotificationTemplates() {
    return apiService.get('/notifications/templates');
  }
};

export default api;