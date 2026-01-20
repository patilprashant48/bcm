import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action_type: '',
        user_type: '',
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const response = await adminAPI.getAuditLogs(filters);
            setLogs(response.data.logs || []);
        } catch (error) {
            console.error('Failed to load audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action) => {
        if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
        if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
        if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
        if (action.includes('LOGIN')) return 'bg-purple-100 text-purple-800';
        return 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="text-xl">Loading...</div></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Audit Logs</h1>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                        <select
                            value={filters.action_type}
                            onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Actions</option>
                            <option value="CREATE">Create</option>
                            <option value="UPDATE">Update</option>
                            <option value="DELETE">Delete</option>
                            <option value="LOGIN">Login</option>
                            <option value="APPROVE">Approve</option>
                            <option value="REJECT">Reject</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                        <select
                            value={filters.user_type}
                            onChange={(e) => setFilters({ ...filters, user_type: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Users</option>
                            <option value="ADMIN">Admin</option>
                            <option value="BUSINESS">Business</option>
                            <option value="INVESTOR">Investor</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={loadLogs}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-800">{log.user_name || log.user_email}</div>
                                        <div className="text-xs text-gray-500">{log.user_type}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-800">{log.resource_type}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                        {log.details || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{log.ip_address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {logs.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-gray-600">No audit logs found</p>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600">Total Logs</p>
                    <p className="text-2xl font-bold text-gray-800">{logs.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600">Admin Actions</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {logs.filter(l => l.user_type === 'ADMIN').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600">Business Actions</p>
                    <p className="text-2xl font-bold text-green-600">
                        {logs.filter(l => l.user_type === 'BUSINESS').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600">Investor Actions</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {logs.filter(l => l.user_type === 'INVESTOR').length}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
