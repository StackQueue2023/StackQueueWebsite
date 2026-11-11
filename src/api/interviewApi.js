import api from './client';

export const interviewApi = {
  // Student endpoints
  getDomains: () => api.get('/interview/domains'),
  selectDomain: (data) => api.post('/interview/select-domain', data),
  getQuestions: (params) => api.get('/interview/questions', { params }),
  getQuestionById: (id) => api.get(`/interview/questions/${id}`),
  runCode: (data) => api.post('/interview/run', data),
  submitSolution: (data) => api.post('/interview/submit', data),
  getSubmissions: (params) => api.get('/interview/submissions', { params }),
  getDailyChallenge: () => api.get('/interview/daily-challenge'),
  refreshDailyChallenge: (data) => api.post('/interview/daily-challenge/refresh', data),
  getInterviewProgress: () => api.get('/interview/progress'),

  // Mock interview
  startMockInterview: (params) => api.get('/interview/mock-interview/start', { params }),
  submitMockInterview: (data) => api.post('/interview/mock-interview/submit', data),

  // Admin endpoints
  getAdminStats: () => api.get('/interview/admin/stats'),
  getAdminQuestions: (params) => api.get('/interview/admin/questions', { params }),
  getAdminQuestionById: (id) => api.get(`/interview/admin/questions/${id}`),
  createQuestion: (data) => api.post('/interview/admin/questions', data),
  updateQuestion: (id, data) => api.put(`/interview/admin/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/interview/admin/questions/${id}`),
  addTestCase: (questionId, data) => api.post(`/interview/admin/questions/${questionId}/test-cases`, data),
  updateTestCase: (testCaseId, data) => api.put(`/interview/admin/test-cases/${testCaseId}`, data),
  deleteTestCase: (testCaseId) => api.delete(`/interview/admin/test-cases/${testCaseId}`)
};

export default interviewApi;
