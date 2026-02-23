import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalBusinesses: 0,
        pendingApprovals: 0,
        activeProjects: 0,
        pendingPayments: 0,
        totalUsers: 0,
        liveProjects: 0,
        pendingBusinesses: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getDashboardStats();
            const data = response.data.stats || {};
            setStats({
                totalBusinesses: data.businesses?.total || 0,
                pendingApprovals: (data.businesses?.pending || 0) + (data.projects?.pending || 0),
                activeProjects: data.projects?.live || 0,
                pendingPayments: 0,
                totalUsers: data.users?.total || 0,
                liveProjects: data.projects?.live || 0,
                pendingBusinesses: data.businesses?.pending || 0,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
            setError('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Businesses',
            value: stats.totalBusinesses,
            icon: '🏢',
            color: 'bg-blue-500',
            link: '/businesses/active',
        },
        {
            title: 'Pending Approvals',
            value: stats.pendingBusinesses,
            icon: '⏳',
            color: 'bg-yellow-500',
            link: '/businesses/new',
        },
        {
            title: 'Live Projects',
            value: stats.liveProjects,
            icon: '🚀',
            color: 'bg-green-500',
            link: '/projects/live',
        },
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: '👥',
            color: 'bg-purple-500',
            link: '/customers',
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <div className="text-sm text-gray-600">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <a
                        key={index}
                        href={stat.link || '#'}
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 block"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">
                                    {stat.title}
                                </p>
                                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                            </div>
                            <div className={`${stat.color} w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg`}>
                                {stat.icon}
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/businesses/new"
                        className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 font-medium py-4 px-6 rounded-lg transition-all duration-300 text-center shadow-sm hover:shadow-md"
                    >
                        <div className="text-2xl mb-2">🏢</div>
                        <div>Review New Businesses</div>
                        <div className="text-sm mt-1 opacity-75">({stats.pendingApprovals} pending)</div>
                    </a>
                    <a
                        href="/projects"
                        className="bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 font-medium py-4 px-6 rounded-lg transition-all duration-300 text-center shadow-sm hover:shadow-md"
                    >
                        <div className="text-2xl mb-2">📊</div>
                        <div>Approve Projects</div>
                        <div className="text-sm mt-1 opacity-75">({stats.activeProjects} new)</div>
                    </a>
                    <a
                        href="/payments"
                        className="bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 font-medium py-4 px-6 rounded-lg transition-all duration-300 text-center shadow-sm hover:shadow-md"
                    >
                        <div className="text-2xl mb-2">💰</div>
                        <div>Process Payments</div>
                        <div className="text-sm mt-1 opacity-75">({stats.pendingPayments} pending)</div>
                    </a>
                </div>
            </div>

            {/* Empty State */}
            {stats.totalBusinesses === 0 && (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome to BCM Admin Panel</h3>
                    <p className="text-gray-600">
                        Connect to the backend API to start managing businesses, projects, and payments.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
