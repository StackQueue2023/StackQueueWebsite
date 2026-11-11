import api from './client';

const projectApi = {
  // ── Public ───────────────────────────────────────────────────────────────
  getPublicApprovedProjects: () => api.get('/projects/public/approved'),
  getPublicProjectDetail: (id) => api.get(`/projects/public/${id}`),

  // ── Admin: Requirements CMS ──────────────────────────────────────────────
  createRequirement: (formData) => api.post('/projects/requirements', formData),
  getRequirements: (params = {}) => api.get('/projects/requirements', { params }),
  getRequirementById: (id) => api.get(`/projects/requirements/${id}`),
  updateRequirement: (id, formData) => api.put(`/projects/requirements/${id}`, formData),
  updateRequirementStatus: (id, status) => api.patch(`/projects/requirements/${id}/status`, { status }),

  // ── Admin: Final Approvals & Replication ──────────────────────────────────
  getPendingAdminApprovals: () => api.get('/projects/admin/pending-approvals'),
  handleAdminApproval: (assignmentId, data) => api.post(`/projects/admin/approvals/${assignmentId}`, data),
  retryGitHubSync: (assignmentId) => api.post(`/projects/admin/github-sync/${assignmentId}/retry`),
  toggleHomepagePublication: (assignmentId, isPublishedToHomepage) =>
    api.patch(`/projects/admin/publish-homepage/${assignmentId}`, { isPublishedToHomepage }),
  getAllProjectsLibrary: (params = {}) => api.get('/projects/admin/all', { params }),

  // ── Download Full Project ZIP ────────────────────────────────────────────
  downloadProjectZipUrl: (assignmentId) => `/api/projects/assignments/${assignmentId}/download`,

  // ── Tutor: Requirements & Assignments ────────────────────────────────────
  getAssignableStudents: () => api.get('/projects/tutor/students'),
  getTutorRequirements: () => api.get('/projects/tutor/requirements'),
  getTutorAssignments: () => api.get('/projects/tutor/assignments'),
  assignProjectToStudent: (data) => api.post('/projects/tutor/assign', data),
  getTutorReviewDetail: (assignmentId) => api.get(`/projects/tutor/reviews/${assignmentId}`),
  submitTutorReview: (assignmentId, data) => api.post(`/projects/tutor/review/${assignmentId}`, data),

  // ── Student: My Final Projects ───────────────────────────────────────────
  getStudentProjects: () => api.get('/projects/student/my-projects'),
  submitStudentProject: (assignmentId, formData) =>
    api.post(`/projects/student/submit/${assignmentId}`, formData)
};

export default projectApi;
