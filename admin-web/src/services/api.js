import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    updatePassword: (password, confirmPassword) =>
        api.post('/auth/update-password', { password, confirmPassword }),
    getProfile: () => api.get('/auth/profile'),
};

// Wallet APIs
export const walletAPI = {
    getWallets: () => api.get('/wallet'),
    getAllPaymentRequests: (status) =>
        api.get('/wallet/admin/payment-requests', { params: { status } }),
    approvePayment: (requestId) =>
        api.post(`/wallet/admin/payment-requests/${requestId}/approve`),
    rejectPayment: (requestId, data) =>
        api.post(`/wallet/admin/payment-requests/${requestId}/reject`, data),
    getAllTransactions: (filters) =>
        api.get('/wallet/admin/transactions', { params: filters }),
    getAdminWallet: () => api.get('/wallet/admin/wallet'),
    getAdminTransactions: () => api.get('/wallet/admin/wallet/transactions'),
    topUpAdminWallet: (data) => api.post('/wallet/admin/wallet/topup', data),
};

// Admin APIs
export const adminAPI = {
    // Dashboard
    getDashboardStats: () => api.get('/admin/dashboard/stats'),

    // Businesses
    getNewBusinesses: () => api.get('/admin/businesses', { params: { status: 'NEW' } }),
    getRecheckBusinesses: () => api.get('/admin/businesses', { params: { status: 'RECHECK' } }),
    getActiveBusinesses: () => api.get('/admin/businesses', { params: { status: 'ACTIVE' } }),
    getInactiveBusinesses: () => api.get('/admin/businesses', { params: { status: 'INACTIVE' } }),
    getBusinessDetails: (id) => api.get(`/admin/businesses/${id}`),
    approveBusinessActivation: (id, data) => api.post(`/admin/businesses/${id}/approve`, data),
    recheckBusinessActivation: (id, data) => api.post(`/admin/businesses/${id}/recheck`, data),
    rejectBusinessActivation: (id, data) => api.post(`/admin/businesses/${id}/reject`, data),
    deactivateBusiness: (id, data) => api.post(`/admin/businesses/${id}/deactivate`, data),
    reactivateBusiness: (id) => api.post(`/admin/businesses/${id}/reactivate`),

    // Customers
    getCustomers: (params) => api.get('/admin/customers', { params }),
    suspendCustomer: (id) => api.post(`/admin/customers/${id}/suspend`),
    activateCustomer: (id) => api.post(`/admin/customers/${id}/activate`),

    // KYC
    getKYCRequests: (params) => api.get('/admin/kyc', { params }),
    approveKYC: (id) => api.post(`/admin/kyc/${id}/approve`),
    rejectKYC: (id, data) => api.post(`/admin/kyc/${id}/reject`, data),

    // Projects
    getProjectsByStatus: (status) => api.get('/admin/projects', { params: { status } }),
    getLiveProjects: () => api.get('/admin/projects/live'),
    getClosedProjects: () => api.get('/admin/projects/closed'),
    approveProject: (id) => api.post(`/admin/projects/${id}/approve`),
    recheckProject: (id, data) => api.post(`/admin/projects/${id}/recheck`, data),
    rejectProject: (id, data) => api.post(`/admin/projects/${id}/reject`, data),
    closeProject: (id, data) => api.post(`/admin/projects/${id}/close`, data),

    // Plans
    getPlans: () => api.get('/admin/plans'),
    createPlan: (data) => api.post('/admin/plans', data),
    updatePlan: (id, data) => api.put(`/admin/plans/${id}`, data),
    deletePlan: (id) => api.delete(`/admin/plans/${id}`),

    // Settings
    getSettings: () => api.get('/admin/settings'),
    updateSettings: (data) => api.put('/admin/settings', data),

    // Capital Tools
    getShares: (params) => api.get('/admin/capital/shares', { params }),
    approveShare: (id) => api.post(`/admin/capital/shares/${id}/approve`),
    rejectShare: (id, data) => api.post(`/admin/capital/shares/${id}/reject`, data),
    recheckShare: (id, data) => api.post(`/admin/capital/shares/${id}/recheck`, data),

    getLoans: (params) => api.get('/admin/capital/loans', { params }),
    approveLoan: (id) => api.post(`/admin/capital/loans/${id}/approve`),
    rejectLoan: (id, data) => api.post(`/admin/capital/loans/${id}/reject`, data),
    recheckLoan: (id, data) => api.post(`/admin/capital/loans/${id}/recheck`, data),
    getFDs: () => api.get('/admin/capital/fds'),
    getPartnerships: (params) => api.get('/admin/capital/partnerships', { params }),
    approvePartnership: (id) => api.post(`/admin/capital/partnerships/${id}/approve`),
    rejectPartnership: (id, data) => api.post(`/admin/capital/partnerships/${id}/reject`, data),
    recheckPartnership: (id, data) => api.post(`/admin/capital/partnerships/${id}/recheck`, data),

    // Reports
    getTransactionReports: (params) => api.get('/admin/reports/transactions', { params }),
    exportTransactionReport: (params) => api.get('/admin/reports/transactions/export', { params, responseType: 'blob' }),

    // Notifications
    sendNotification: (data) => api.post('/admin/notifications/send', data),

    // Admin Management
    getAdmins: () => api.get('/admin/admins'),
    createAdmin: (data) => api.post('/admin/admins', data),
    updateAdminStatus: (id, data) => api.put(`/admin/admins/${id}/status`, data),

    // Audit Logs
    getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),

    // Legal Templates
    getLegalTemplates: () => api.get('/admin/documents/templates'),
    createLegalTemplate: (data) => api.post('/admin/documents/templates', data),
    updateLegalTemplate: (id, data) => api.put(`/admin/documents/templates/${id}`, data),
    deleteLegalTemplate: (id) => api.delete(`/admin/documents/templates/${id}`),
};

export const fdsAPI = {
    getSchemes: () => api.get('/fds/schemes'),
    createScheme: (data) => api.post('/fds/schemes', data),
    updateStatus: (id, data) => api.patch(`/fds/schemes/${id}/status`, data),
    manageApproval: (id, data) => api.post(`/fds/schemes/${id}/approval`, data),
};

export default api;
