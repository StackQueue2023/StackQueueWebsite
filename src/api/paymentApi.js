import api from './client';

const paymentApi = {
  // ── Main Command Center: Category Operational Analytics ───────────────────
  getCommandCenterAnalytics: () => api.get('/payments/command-center-analytics'),

  // ── Category Operational View ──────────────────────────────────────────────
  getCategoryAnalytics: (category) => api.get(`/payments/category-analytics/${encodeURIComponent(category)}`),

  // ── Category Payments Section ──────────────────────────────────────────────
  getCategoryPayments: (category) => api.get(`/payments/category-payments/${encodeURIComponent(category)}`),

  // ── Student Payment Plan Detail ───────────────────────────────────────────
  getStudentPaymentDetail: (feePlanId) => api.get(`/payments/student-payment-detail/${feePlanId}`),

  // ── Record Payment (Admin or Tutor) ────────────────────────────────────────
  recordPayment: (data) => api.post('/payments/record-payment', data),

  // ── Verify Payment (Admin Action) ──────────────────────────────────────────
  verifyPayment: (transactionId) => api.post(`/payments/verify-payment/${transactionId}`),

  // ── Send Manual Reminder (Mock Sink Email) ─────────────────────────────────
  sendManualReminder: (installmentId) => api.post(`/payments/send-reminder/${installmentId}`),

  // ── Configure Student Fee Plan ─────────────────────────────────────────────
  configureFeePlan: (data) => api.post('/payments/configure-plan', data),

  // ── Tutor Payment Follow-ups ───────────────────────────────────────────────
  getTutorPaymentFollowups: () => api.get('/payments/tutor/assigned-followups'),

  // ── Student My Payments Dashboard ──────────────────────────────────────────
  getStudentMyPayments: () => api.get('/payments/student/my-payments'),

  // ── Receipt Detail ─────────────────────────────────────────────────────────
  getReceiptDetail: (receiptNumber) => api.get(`/payments/receipts/${receiptNumber}`),

  // ── Admin Fee Management Dashboard & Student History ───────────────────────
  getAdminFeeDashboard: () => api.get('/payments/admin-fee-dashboard'),
  getStudentFeeHistory: (studentId) => api.get(`/payments/student-history/${encodeURIComponent(studentId)}`),
  triggerFeeReminders: () => api.post('/payments/trigger-reminders')
};

export default paymentApi;
