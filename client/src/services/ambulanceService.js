import api from './api';

export const ambulanceService = {
  getAll: () => api.get('/ambulances'),
  getAvailable: () => api.get('/ambulances/available'),
  getNearby: (params) => api.get('/ambulances/nearby', { params }),
  updateLocation: (id, latitude, longitude) => api.put(`/ambulances/${id}/location`, { latitude, longitude }),
  updateStatus: (id, status) => api.put(`/ambulances/${id}/status`, { status }),

  requestAmbulance: (data) => api.post('/ambulance-requests', data),
  getRequests: (params) => api.get('/ambulance-requests', { params }),
  updateRequestStatus: (id, status) => api.put(`/ambulance-requests/${id}/status`, { status })
};
