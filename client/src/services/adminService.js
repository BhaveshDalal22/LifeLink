import api from './api';

export const adminService = {
  getStatistics: () => api.get('/admin/statistics'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getHospitals: () => api.get('/admin/hospitals'),
  getEmergencies: (params) => api.get('/admin/emergencies', { params })
};
