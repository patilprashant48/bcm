import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import MyProjects from './pages/Projects/MyProjects';
import CreateProject from './pages/Projects/CreateProject';
import CapitalTools from './pages/CapitalTools';
import Plans from './pages/Plans';
import Profile from './pages/Profile';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

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

    return children;
};

// App Routes
const AppRoutes = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    isAuthenticated ? <Navigate to="/" replace /> : <Login />
                }
            />
            <Route
                path="/register"
                element={
                    isAuthenticated ? <Navigate to="/" replace /> : <Register />
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
                <Route path="wallet" element={<Wallet />} />
                <Route path="projects" element={<MyProjects />} />
                <Route path="projects/create" element={<CreateProject />} />
                <Route path="capital" element={<CapitalTools />} />
                <Route path="plans" element={<Plans />} />
                <Route path="profile" element={<Profile />} />
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
