import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const UserActivity = () => {
    const [recentLogins, setRecentLogins] = useState([]);
    const [newSignups, setNewSignups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivity();
    }, []);

    const loadActivity = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getUserActivity();
            setRecentLogins(res.data.recentLogins || []);
            setNewSignups(res.data.newSignups || []);
        } catch (error) {
            console.error('Failed to load user activity', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">User Activity</h1>
            <p className="text-gray-600 mb-6">Track user logins, signups, and engagement.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                        <h2 className="text-lg font-bold text-blue-900">Recent Logins (Active Users)</h2>
                    </div>
                    <ul className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
                        {recentLogins.map(user => (
                            <li key={user._id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{user.name || 'Unknown'}</p>
                                    <p className="text-xs text-gray-500">{user.email} &bull; {user.role}</p>
                                </div>
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                    {new Date(user.updatedAt).toLocaleString()}
                                </span>
                            </li>
                        ))}
                        {recentLogins.length === 0 && <li className="p-6 text-center text-gray-500">No recent logins.</li>}
                    </ul>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                        <h2 className="text-lg font-bold text-green-900">New Signups</h2>
                    </div>
                    <ul className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
                        {newSignups.map(user => (
                            <li key={user._id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{user.name || 'Unknown'}</p>
                                    <p className="text-xs text-gray-500">{user.email} &bull; {user.role}</p>
                                </div>
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </li>
                        ))}
                        {newSignups.length === 0 && <li className="p-6 text-center text-gray-500">No new signups yet.</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UserActivity;
