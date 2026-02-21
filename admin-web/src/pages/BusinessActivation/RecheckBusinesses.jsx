import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const RecheckBusinesses = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { loadBusinesses(); }, []);

    const loadBusinesses = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getRecheckBusinesses();
            setBusinesses(response.data.businesses || []);
        } catch (err) {
            console.error('Failed to load recheck businesses:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = businesses.filter(b =>
        !search ||
        (b.business_name || b.businessName || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.owner_name || b.ownerName || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">Loading recheck list...</p>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Businesses Under Recheck</h1>
                    <p className="text-gray-500 mt-1">Users who need to correct their information</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl font-bold text-lg shadow-sm">
                    {businesses.length} Pending Correction
                </span>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Search businesses..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-16 text-center">
                    <div className="text-7xl mb-4">🔄</div>
                    <p className="text-xl text-gray-600 font-medium">No businesses under recheck</p>
                    <p className="text-sm text-gray-400 mt-2">All users have been notified and are correcting their information.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-yellow-50 border-b border-yellow-200">
                            <tr>
                                {['Sr.', 'Date', 'Time', 'User Name', 'Business Name', 'Business Type', 'Email', 'Mobile', 'Recheck Reason', 'Status'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((biz, idx) => {
                                const date = new Date(biz.created_at || biz.createdAt);
                                return (
                                    <tr key={biz._id || biz.id} className="hover:bg-yellow-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{date.toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{biz.owner_name || biz.ownerName}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{biz.business_name || biz.businessName}</td>
                                        <td className="px-4 py-3">
                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                                {biz.business_type || biz.businessType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{biz.email}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{biz.mobile}</td>
                                        <td className="px-4 py-3 text-sm text-red-600 max-w-xs">
                                            <p className="truncate" title={biz.recheck_comments || biz.recheckComments}>
                                                {biz.recheck_comments || biz.recheckComments || 'Corrections required'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-semibold">
                                                Awaiting User
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                    <strong>ℹ Note:</strong> When a user resubmits their corrected information, they will automatically move back to the <strong>New Applications</strong> tab for re-review.
                </p>
            </div>
        </div>
    );
};

export default RecheckBusinesses;
