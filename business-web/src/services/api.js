import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

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

export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register-simple', { ...data, role: 'BUSINESS_USER' }),
    getProfile: () => api.get('/auth/profile'),
    updatePassword: (password, confirmPassword) => api.post('/auth/update-password', { password, confirmPassword }),
};

export const businessAPI = {
    submitOnboarding: (data) => api.post('/business/onboarding', data),
    getProfile: () => api.get('/business/profile'),
    updateProfile: (data) => api.put('/business/profile', data),
    getDashboardStats: () => api.get('/business/dashboard/stats'),
};

export const projectAPI = {
    createProject: (data) => api.post('/business/projects', data),
    getMyProjects: () => api.get('/business/projects'),
    getProjectDetails: (id) => api.get(`/business/projects/${id}`),
    updateProject: (id, data) => api.put(`/business/projects/${id}`, data),
    deleteProject: (id) => api.delete(`/business/projects/${id}`),
};

export const walletAPI = {
    getWallet: () => api.get('/wallet'),
    requestTopUp: (data) => api.post('/wallet/topup-request', data),
    getTransactions: (params) => api.get('/wallet/transactions', { params }),
};

export const capitalAPI = {
    createShare: (data) => api.post('/business/capital/shares', data),
    createLoan: (data) => api.post('/business/capital/loans', data),
    createFD: (data) => api.post('/business/capital/fds', data),
    createPartnership: (data) => api.post('/business/capital/partnerships', data),
    getMyCapitalTools: () => api.get('/business/capital'),
};

export const planAPI = {
    getPlans: () => api.get('/plans'),
    activatePlan: (planId, data) => api.post(`/plans/${planId}/activate`, data),
    getActivePlan: () => api.get('/business/active-plan'),
};

export default api;
