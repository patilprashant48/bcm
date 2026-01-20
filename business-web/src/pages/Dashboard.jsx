import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { businessAPI, walletAPI, projectAPI } from '../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        wallet_balance: 0,
        total_projects: 0,
        active_projects: 0,
        total_raised: 0,
        pending_approval: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [statsRes, walletRes, projectsRes] = await Promise.all([
                businessAPI.getDashboardStats().catch(() => ({ data: {} })),
                walletAPI.getWallet().catch(() => ({ data: { balance: 0 } })),
                projectAPI.getMyProjects().catch(() => ({ data: { projects: [] } })),
            ]);

            const projects = projectsRes.data.projects || [];
            const totalRaised = projects.reduce((sum, p) => sum + (p.raised_amount || 0), 0);

            setStats({
                wallet_balance: walletRes.data.balance || 0,
                total_projects: projects.length,
                active_projects: projects.filter(p => p.status === 'LIVE').length,
                pending_approval: projects.filter(p => p.status === 'PENDING').length,
                total_raised: totalRaised,
            });
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl text-gray-600">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Welcome back, {user?.business_name || user?.owner_name || 'Business Owner'}!
                </h1>
                <p className="text-gray-600 mt-2">Here's what's happening with your business today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Wallet Balance</p>
                        <span className="text-2xl">💰</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">₹{stats.wallet_balance.toLocaleString()}</p>
                    <Link to="/wallet" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                        Manage Wallet →
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Projects</p>
                        <span className="text-2xl">📁</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{stats.total_projects}</p>
                    <Link to="/projects" className="text-sm text-green-600 hover:underline mt-2 inline-block">
                        View Projects →
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Active Projects</p>
                        <span className="text-2xl">🚀</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{stats.active_projects}</p>
                    <p className="text-sm text-gray-500 mt-2">Currently fundraising</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Raised</p>
                        <span className="text-2xl">📈</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">₹{(stats.total_raised / 100000).toFixed(1)}L</p>
                    <p className="text-sm text-gray-500 mt-2">Across all projects</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/projects/create"
                        className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-6 rounded-lg text-center transition-all duration-200 border border-blue-200"
                    >
                        <div className="text-4xl mb-2">➕</div>
                        <div className="font-medium text-blue-700">Create New Project</div>
                        <p className="text-sm text-blue-600 mt-1">Start raising capital</p>
                    </Link>

                    <Link
                        to="/wallet"
                        className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 p-6 rounded-lg text-center transition-all duration-200 border border-green-200"
                    >
                        <div className="text-4xl mb-2">💰</div>
                        <div className="font-medium text-green-700">Manage Wallet</div>
                        <p className="text-sm text-green-600 mt-1">View transactions</p>
                    </Link>

                    <Link
                        to="/capital"
                        className="bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 p-6 rounded-lg text-center transition-all duration-200 border border-purple-200"
                    >
                        <div className="text-4xl mb-2">💼</div>
                        <div className="font-medium text-purple-700">Capital Tools</div>
                        <p className="text-sm text-purple-600 mt-1">Shares, Loans, FDs</p>
                    </Link>
                </div>
            </div>

            {/* Pending Approvals Alert */}
            {stats.pending_approval > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <span className="text-3xl">⏳</span>
                        <div className="flex-1">
                            <h3 className="font-bold text-yellow-800 mb-1">Pending Approvals</h3>
                            <p className="text-yellow-700">
                                You have {stats.pending_approval} project{stats.pending_approval > 1 ? 's' : ''} waiting for admin approval.
                            </p>
                            <Link to="/projects" className="text-yellow-800 hover:underline font-medium mt-2 inline-block">
                                View Projects →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
