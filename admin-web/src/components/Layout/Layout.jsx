import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [expandedSections, setExpandedSections] = useState(['business', 'wallet', 'capital']);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleSection = (section) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const menuSections = [
        {
            id: 'main',
            title: 'Main',
            items: [
                { name: 'Dashboard', path: '/', icon: '📊' },
            ]
        },
        {
            id: 'users',
            title: 'User Management',
            icon: '👥',
            items: [
                { name: 'New Applications', path: '/businesses/new', icon: '🆕', badge: 0 },
                { name: 'Recheck', path: '/businesses/recheck', icon: '🔄' },
                { name: 'Active Businesses', path: '/businesses/active', icon: '✅' },
                { name: 'Inactive', path: '/businesses/inactive', icon: '⏸️' },
                { name: 'Customers', path: '/customers', icon: '📱' },
                { name: 'KYC Verification', path: '/kyc', icon: '🆔' },
            ]
        },
        {
            id: 'projects',
            title: 'Projects',
            icon: '📁',
            items: [
                { name: 'Project Approvals', path: '/projects', icon: '📋', badge: 0 },
                { name: 'Live Projects', path: '/projects/live', icon: '🚀' },
                { name: 'Closed Projects', path: '/projects/closed', icon: '📦' },
            ]
        },
        {
            id: 'capital',
            title: 'Capital Tools',
            icon: '💼',
            items: [
                { name: 'Shares', path: '/capital/shares', icon: '📈' },
                { name: 'Loans', path: '/capital/loans', icon: '💵' },
                { name: 'Fixed Deposits', path: '/capital/fds', icon: '🏦' },
                { name: 'Scheme Master', path: '/fds/schemes', icon: '📋' },
                { name: 'Partnerships', path: '/capital/partnerships', icon: '🤝' },
            ]
        },
        {
            id: 'wallet',
            title: 'Wallet & Payments',
            icon: '💰',
            items: [
                { name: 'Payment Requests', path: '/payments', icon: '💳', badge: 0 },
                { name: 'Transaction History', path: '/transactions', icon: '📜' },
                { name: 'Admin Wallet', path: '/wallet', icon: '🏦' },
            ]
        },
        {
            id: 'documents',
            title: 'Documents',
            icon: '📄',
            items: [
                { name: 'Legal Templates', path: '/documents/templates', icon: '📝' },
                { name: 'Generated Docs', path: '/documents/generated', icon: '📋' },
            ]
        },
        {
            id: 'reports',
            title: 'Reports & Analytics',
            icon: '📊',
            items: [
                { name: 'Transaction Reports', path: '/reports/transactions', icon: '💹' },
                { name: 'User Activity', path: '/reports/activity', icon: '👤' },
                { name: 'Revenue Reports', path: '/reports/revenue', icon: '💰' },
            ]
        },
        {
            id: 'content',
            title: 'Content Management',
            icon: '📢',
            items: [
                { name: 'Notifications', path: '/content/notifications', icon: '🔔' },
                { name: 'Announcements', path: '/content/announcements', icon: '📰' },
                { name: 'Banners', path: '/content/banners', icon: '🎨' },
            ]
        },
        {
            id: 'settings',
            title: 'Settings',
            icon: '⚙️',
            items: [
                { name: 'Plans', path: '/plans', icon: '📋' },
                { name: 'Platform Settings', path: '/settings', icon: '🔧' },
                { name: 'Admin Management', path: '/settings/admins', icon: '👨‍💼' },
                { name: 'Audit Logs', path: '/settings/audit-logs', icon: '📝' },
            ]
        }
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out z-20 ${sidebarCollapsed ? 'w-20' : 'w-64'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo & Toggle */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        {!sidebarCollapsed && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
                                    B
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-800">BCM Admin</h1>
                                    <p className="text-xs text-gray-500">Capital Market</p>
                                </div>
                            </div>
                        )}
                        {sidebarCollapsed && (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md mx-auto">
                                B
                            </div>
                        )}
                    </div>

                    {/* Toggle Button */}
                    <div className="px-4 py-2 border-b border-gray-200">
                        <button
                            onClick={toggleSidebar}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200"
                            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                        >
                            <span className="text-lg">{sidebarCollapsed ? '→' : '←'}</span>
                            {!sidebarCollapsed && <span className="text-sm font-medium">Collapse</span>}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
                        {menuSections.map((section) => (
                            <div key={section.id}>
                                {section.id === 'main' ? (
                                    // Main section items (no collapsible)
                                    section.items.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-3 rounded-lg transition-all duration-200 ${isActive(item.path)
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                                }`}
                                            title={sidebarCollapsed ? item.name : ''}
                                        >
                                            <div className="flex items-center">
                                                <span className="text-xl">{item.icon}</span>
                                                {!sidebarCollapsed && <span className="ml-3 font-medium">{item.name}</span>}
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    // Collapsible sections
                                    <div className="mb-2">
                                        {!sidebarCollapsed && (
                                            <button
                                                onClick={() => toggleSection(section.id)}
                                                className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base">{section.icon}</span>
                                                    <span className="text-xs font-semibold uppercase tracking-wide">{section.title}</span>
                                                </div>
                                                <span className={`transform transition-transform duration-200 text-xs ${expandedSections.includes(section.id) ? 'rotate-180' : ''
                                                    }`}>
                                                    ▼
                                                </span>
                                            </button>
                                        )}

                                        {sidebarCollapsed ? (
                                            // Show only icons when collapsed
                                            <div className="flex flex-col items-center gap-1 mt-1">
                                                {section.items.map((item) => (
                                                    <Link
                                                        key={item.path}
                                                        to={item.path}
                                                        className={`w-full flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${isActive(item.path)
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                                            }`}
                                                        title={item.name}
                                                    >
                                                        <span className="text-lg">{item.icon}</span>
                                                        {item.badge !== undefined && item.badge > 0 && (
                                                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                                        )}
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            expandedSections.includes(section.id) && (
                                                <div className="mt-1 space-y-1">
                                                    {section.items.map((item) => (
                                                        <Link
                                                            key={item.path}
                                                            to={item.path}
                                                            className={`flex items-center justify-between px-3 py-2 ml-4 rounded-lg transition-all duration-200 ${isActive(item.path)
                                                                ? 'bg-blue-600 text-white shadow-md'
                                                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                                                }`}
                                                        >
                                                            <div className="flex items-center">
                                                                <span className="text-base">{item.icon}</span>
                                                                <span className="ml-2 text-sm">{item.name}</span>
                                                            </div>
                                                            {item.badge !== undefined && item.badge > 0 && (
                                                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                                                    {item.badge}
                                                                </span>
                                                            )}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* User Info */}
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                        {!sidebarCollapsed ? (
                            <>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                        {user?.email?.[0]?.toUpperCase() || 'A'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
                                        <p className="text-xs text-gray-500">Administrator</p>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md"
                                >
                                    <span>🚪</span>
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                    {user?.email?.[0]?.toUpperCase() || 'A'}
                                </div>
                                <button
                                    onClick={logout}
                                    className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center shadow-md"
                                    title="Logout"
                                >
                                    <span>🚪</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div
                className={`min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-20' : 'ml-64'
                    }`}
            >
                {/* Top Bar */}
                <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {menuSections
                                    .flatMap(s => s.items)
                                    .find(item => isActive(item.path))?.name || 'Dashboard'}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition">
                                <span className="text-2xl">🔔</span>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition">
                                <span className="text-2xl">⚙️</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
