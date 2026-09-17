import api from './api';

export const hospitalService = {
  getAll: (params) => api.get('/hospitals', { params }),
  getNearby: (params) => api.get('/hospitals/nearby', { params }),
  getById: (id) => api.get(`/hospitals/${id}`),
  create: (data) => api.post('/hospitals', data),
  update: (id, data) => api.put(`/hospitals/${id}`, data),
  remove: (id) => api.delete(`/hospitals/${id}`),
  getCapacity: (id) => api.get(`/hospitals/${id}/capacity`),
  updateCapacity: (id, data) => api.put(`/hospitals/${id}/capacity`, data)
};
