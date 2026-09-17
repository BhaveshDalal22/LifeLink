import api from './api';

export const emergencyService = {
  create: (data) => api.post('/emergencies', data),
  getAll: (params) => api.get('/emergencies', { params }),
  getById: (id) => api.get(`/emergencies/${id}`),
  updateStatus: (id, status) => api.put(`/emergencies/${id}/status`, { status }),

  // hospital requests (admission)
  requestHospital: (data) => api.post('/hospital-requests', data),
  getHospitalRequests: (params) => api.get('/hospital-requests', { params }),
  updateHospitalRequestStatus: (id, status) => api.put(`/hospital-requests/${id}/status`, { status })
};
