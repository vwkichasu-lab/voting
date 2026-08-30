import client from '../api.js';

export const authService = {
  requestCode(studentId) {
    return client.post('/auth/request-code', { student_id: studentId });
  },
  verifyCode(studentId, code) {
    return client.post('/auth/verify-code', { student_id: studentId, code });
  },
  login(username, password) {
    return client.post('/auth/login', { username, password });
  }
};

export const votingService = {
  getStatus() {
    return client.get('/election/status');
  },
  getCandidates() {
    return client.get('/election/candidates');
  },
  getBallot() {
    return client.get('/election/ballot');
  },
  getReview() {
    return client.get('/election/review');
  },
  submitVote(votes) {
    return client.post('/election/vote', { votes });
  }
};

export const adminService = {
  login(email, password) {
    return client.post('/admin/login', { email, password });
  },
  getDashboard() {
    return client.get('/admin/dashboard');
  },
  createElection(payload) {
    return client.post('/admin/elections', payload);
  },
  updateStatus(id, status) {
    return client.patch(`/admin/elections/${id}/status`, { status });
  },
  pause(id, reason) {
    return client.post(`/admin/elections/${id}/pause`, { reason });
  },
  resume(id) {
    return client.post(`/admin/elections/${id}/resume`);
  },
  addPosition(id, payload) {
    return client.post(`/admin/elections/${id}/positions`, payload);
  },
  getStructure(id) {
    return client.get(`/admin/elections/${id}/structure`);
  },
  addCandidate(id, payload) {
    return client.post(`/admin/elections/${id}/candidates`, payload);
  },
  importVoters(id, file) {
    const form = new FormData();
    form.append('file', file);
    return client.post(`/admin/elections/${id}/import-voters`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getResults(id, format) {
    return client.get(`/admin/elections/${id}/results`, { params: { format } });
  },
  getAuditLogs(params) {
    return client.get('/admin/audit-logs', { params });
  },
  listElections() {
    return client.get('/admin/elections');
  },
  deleteElection(id) {
    return client.delete(`/admin/elections/${id}`);
  },
  listVoters(id) {
    return client.get(`/admin/elections/${id}/voters`);
  },
  updateCandidateStatus(id, status) {
    return client.patch(`/admin/candidates/${id}/status`, { status });
  },
  deleteCandidate(id) {
    return client.delete(`/admin/candidates/${id}`);
  },
  deletePosition(id) {
    return client.delete(`/admin/positions/${id}`);
  },
  updatePosition(id, payload) {
    return client.patch(`/admin/positions/${id}`, payload);
  },
  exportVoters(id) {
    return client.get(`/admin/elections/${id}/voters`, { responseType: 'json' });
  }
};
