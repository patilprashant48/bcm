import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navigation = [
        { name: 'Dashboard', path: '/', icon: '📊' },
        { name: 'Profile', path: '/profile', icon: '👤' },
        { name: 'Plan Activation', path: '/plans', icon: '📋' },
        { name: 'Create Project', path: '/projects/create', icon: '➕' },
        { name: 'My Projects', path: '/projects', icon: '📁' },
        { name: 'Capital Tools', path: '/capital', icon: '💼' },
        { name: 'Wallet Topup', path: '/wallet', icon: '💰' },
        { name: 'Legal Docs', path: '/legal', icon: '⚖️' },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 shadow-lg z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0'
                    }`}
            >
                <div className={`flex flex-col h-full ${!isSidebarOpen && 'hidden'}`}>
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                BCM Business
                            </h1>
                            <p className="text-sm text-gray-600 mt-1 truncate">{user?.business_name || 'Business Portal'}</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isLocked = user?.business_activation_status !== 'ACTIVE' &&
                                item.path !== '/' &&
                                item.path !== '/profile';

                            return (
                                <Link
                                    key={item.path}
                                    to={isLocked ? '#' : item.path}
                                    onClick={(e) => isLocked && e.preventDefault()}
                                    className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.path)
                                        ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        } ${isLocked ? 'opacity-60 cursor-not-allowed group' : ''}`}
                                    title={isLocked ? "Complete profile and wait for admin approval" : ""}
                                >
                                    <span className="text-xl mr-3">{item.icon}</span>
                                    <span className="flex-1">{item.name}</span>
                                    {isLocked && <span className="text-sm">🔒</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Info */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                {user?.business_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'B'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
                                <p className="text-xs text-gray-500">Business User</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                {/* Top Toggle Button */}
                <div className="p-4 pb-0">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-600 focus:outline-none"
                    >
                        {isSidebarOpen ? '◀ Close Menu' : '▶ Open Menu'}
                    </button>
                </div>

                <div className="p-8 pt-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
