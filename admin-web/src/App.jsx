import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import PasswordUpdate from './components/Auth/PasswordUpdate';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';

// Business Activation
import NewBusinesses from './pages/BusinessActivation/NewBusinesses';
import RecheckBusinesses from './pages/BusinessActivation/RecheckBusinesses';
import ActiveBusinesses from './pages/BusinessActivation/ActiveBusinesses';
import InactiveBusinesses from './pages/BusinessActivation/InactiveBusinesses';

// User Management
import Customers from './pages/Users/Customers';
import KYCVerification from './pages/Users/KYCVerification';

// Projects
import ProjectApprovals from './pages/Projects/ProjectApprovals';
import LiveProjects from './pages/Projects/LiveProjects';
import ClosedProjects from './pages/Projects/ClosedProjects';

// Wallets
import PaymentRequests from './pages/Wallets/PaymentRequests';
import TransactionHistory from './pages/Wallets/TransactionHistory';
import AdminWallet from './pages/Wallets/AdminWallet';

// Plans & Settings
import PlanManagement from './pages/Plans/PlanManagement';
import PlatformSettings from './pages/Settings/PlatformSettings';

// Capital Tools
import ShareManagement from './pages/Capital/ShareManagement';
import LoanManagement from './pages/Capital/LoanManagement';

// Reports
import TransactionReports from './pages/Reports/TransactionReports';

// Content
import Notifications from './pages/Content/Notifications';

// Settings & Security
import AdminManagement from './pages/Settings/AdminManagement';
import AuditLogs from './pages/Settings/AuditLogs';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, requiresPasswordUpdate } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiresPasswordUpdate) {
        return <Navigate to="/update-password" replace />;
    }

    return children;
};

// App Routes
const AppRoutes = () => {
    const { isAuthenticated, requiresPasswordUpdate } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    isAuthenticated ? <Navigate to="/" replace /> : <Login />
                }
            />
            <Route
                path="/update-password"
                element={
                    !isAuthenticated ? (
                        <Navigate to="/login" replace />
                    ) : requiresPasswordUpdate ? (
                        <PasswordUpdate />
                    ) : (
                        <Navigate to="/" replace />
                    )
                }
            />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Dashboard />} />

                {/* Business Activation */}
                <Route path="businesses/new" element={<NewBusinesses />} />
                <Route path="businesses/recheck" element={<RecheckBusinesses />} />
                <Route path="businesses/active" element={<ActiveBusinesses />} />
                <Route path="businesses/inactive" element={<InactiveBusinesses />} />

                {/* User Management */}
                <Route path="customers" element={<Customers />} />
                <Route path="kyc" element={<KYCVerification />} />

                {/* Projects */}
                <Route path="projects" element={<ProjectApprovals />} />
                <Route path="projects/live" element={<LiveProjects />} />
                <Route path="projects/closed" element={<ClosedProjects />} />

                {/* Wallets & Payments */}
                <Route path="payments" element={<PaymentRequests />} />
                <Route path="transactions" element={<TransactionHistory />} />
                <Route path="wallet" element={<AdminWallet />} />

                {/* Plans & Settings */}
                <Route path="plans" element={<PlanManagement />} />
                <Route path="settings" element={<PlatformSettings />} />

                {/* Capital Tools */}
                <Route path="capital/shares" element={<ShareManagement />} />
                <Route path="capital/loans" element={<LoanManagement />} />

                {/* Reports */}
                <Route path="reports/transactions" element={<TransactionReports />} />

                {/* Content */}
                <Route path="content/notifications" element={<Notifications />} />

                {/* Admin & Security */}
                <Route path="settings/admins" element={<AdminManagement />} />
                <Route path="settings/audit-logs" element={<AuditLogs />} />
            </Route>
        </Routes>
    );
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
