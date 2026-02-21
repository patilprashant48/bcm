import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const ActiveBusinesses = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deactivateModal, setDeactivateModal] = useState(null);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { loadBusinesses(); }, []);

    const loadBusinesses = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getActiveBusinesses();
            setBusinesses(response.data.businesses || []);
        } catch (err) {
            console.error('Failed to load active businesses:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async () => {
        if (!reason.trim()) { alert('Please enter a reason.'); return; }
        try {
            setSubmitting(true);
            await adminAPI.deactivateBusiness(deactivateModal.id, { reason });
            alert('Business deactivated successfully.');
            setDeactivateModal(null);
            setReason('');
            loadBusinesses();
        } catch (err) {
            alert('Failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = businesses.filter(b =>
        !search ||
        (b.business_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.owner_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.email || '').toLowerCase().includes(search.toLowerCase())
    );

    const getPlanStatus = (business) => {
        if (!business.plan_expiry) return { label: 'No Plan', color: 'gray' };
        const expiry = new Date(business.plan_expiry);
        const now = new Date();
        if (expiry < now) return { label: 'Expired', color: 'red' };
        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 7) return { label: `${daysLeft}d left`, color: 'yellow' };
        return { label: 'Active', color: 'green' };
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div>
            {/* Deactivate Modal */}
            {deactivateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Deactivate Business</h3>
                        <p className="text-sm text-gray-500 mb-4">{deactivateModal.name}</p>
                        <textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Enter deactivation reason..."
                            className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                            rows={4}
                        />
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => { setDeactivateModal(null); setReason(''); }}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition">
                                Cancel
                            </button>
                            <button onClick={handleDeactivate} disabled={submitting}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50">
                                {submitting ? 'Deactivating...' : 'Deactivate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Active Businesses</h1>
                    <p className="text-gray-500 mt-1">All approved and active business accounts</p>
                </div>
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-xl font-bold text-lg shadow-sm">
                    {businesses.length} Active
                </span>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Search by business name, owner, or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-16 text-center">
                    <div className="text-7xl mb-4">🏢</div>
                    <p className="text-xl text-gray-600 font-medium">No active businesses found</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-green-50 border-b border-green-200">
                            <tr>
                                {['#', 'Business ID', 'Business Name', 'Owner', 'Email', 'Mobile', 'Plan', 'Plan Status', 'Projects', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((biz, idx) => {
                                const planStatus = getPlanStatus(biz);
                                return (
                                    <tr key={biz._id || biz.id} className="hover:bg-green-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{(biz.business_id || biz.id || '').toString().slice(-8).toUpperCase()}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{biz.business_name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{biz.owner_name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{biz.email}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{biz.mobile}</td>
                                        <td className="px-4 py-3 text-sm text-purple-600 font-medium">{biz.plan_name || 'No Plan'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${planStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                                                    planStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                                        planStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-600'
                                                }`}>
                                                {planStatus.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-blue-600 font-medium">{biz.project_count || 0}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setDeactivateModal({ id: biz._id || biz.id, name: biz.business_name })}
                                                className="bg-red-100 hover:bg-red-600 text-red-600 hover:text-white text-xs px-3 py-2 rounded-lg font-medium transition border border-red-200"
                                            >
                                                Deactivate
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ActiveBusinesses;
