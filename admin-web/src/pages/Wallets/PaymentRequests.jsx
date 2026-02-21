import { useState, useEffect } from 'react';
import { walletAPI } from '../../services/api';

const ScreenshotModal = ({ url, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute -top-10 right-0 text-white text-3xl font-bold hover:text-gray-300">×</button>
            <img src={url} alt="Payment Screenshot" className="w-full rounded-2xl shadow-2xl" />
        </div>
    </div>
);

const PaymentRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const [screenshotUrl, setScreenshotUrl] = useState(null);
    const [search, setSearch] = useState('');
    const [rejectModal, setRejectModal] = useState(null); // { id }
    const [rejectReason, setRejectReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { loadRequests(); }, [filter]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await walletAPI.getAllPaymentRequests(filter);
            setRequests(response.data.requests || []);
        } catch (err) {
            console.error('Failed to load payment requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!confirm('Approve this top-up request? Wallet will be credited.')) return;
        try {
            setSubmitting(true);
            await walletAPI.approvePayment(id);
            alert('✅ Payment approved! Wallet credited.');
            loadRequests();
        } catch (err) {
            alert('Failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) { alert('Please enter a reason.'); return; }
        try {
            setSubmitting(true);
            await walletAPI.rejectPayment(rejectModal.id, { comment: rejectReason });
            alert('✗ Payment rejected.');
            setRejectModal(null);
            setRejectReason('');
            loadRequests();
        } catch (err) {
            alert('Failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = requests.filter(r =>
        !search ||
        (r.users?.email || r.user_email || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.business_name || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalAmount = filtered.reduce((s, r) => s + (r.amount || 0), 0);

    return (
        <div>
            {screenshotUrl && <ScreenshotModal url={screenshotUrl} onClose={() => setScreenshotUrl(null)} />}

            {/* Reject Modal */}
            {rejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Reject Payment Request</h3>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                            rows={4}
                        />
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition">
                                Cancel
                            </button>
                            <button onClick={handleReject} disabled={submitting}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50">
                                {submitting ? 'Rejecting...' : '✗ Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Wallet Top-Up Requests</h1>
                    <p className="text-gray-500 mt-1">Review and approve wallet top-up payments</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">{filter} Requests</p>
                    <p className="text-2xl font-bold text-green-600">₹{totalAmount.toLocaleString()}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {[
                    { key: 'PENDING', label: '⏳ New / Pending', color: 'yellow' },
                    { key: 'APPROVED', label: '✓ Approved', color: 'green' },
                    { key: 'REJECTED', label: '✗ Rejected', color: 'red' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-5 py-2 rounded-xl font-medium text-sm transition-all shadow-sm ${filter === tab.key
                                ? tab.key === 'PENDING' ? 'bg-yellow-500 text-white shadow-md'
                                    : tab.key === 'APPROVED' ? 'bg-green-600 text-white shadow-md'
                                        : 'bg-red-600 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Search by email or business name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-16 text-center">
                    <div className="text-7xl mb-4">📭</div>
                    <p className="text-xl text-gray-600 font-medium">No {filter.toLowerCase()} payment requests</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {['#', 'Date', 'Time', 'User / Business', 'Amount', 'Payment Mode', 'Screenshot', 'Status', ...(filter === 'PENDING' ? ['Action'] : [])].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((req, idx) => {
                                const date = new Date(req.created_at || req.createdAt);
                                return (
                                    <tr key={req._id || req.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{date.toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-800">{req.business_name || req.users?.name || '—'}</p>
                                            <p className="text-xs text-gray-500">{req.users?.email || req.user_email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-lg font-bold text-green-600">₹{(req.amount || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${req.payment_method === 'UPI' ? 'bg-blue-100 text-blue-700' :
                                                    req.payment_method === 'BANK' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {req.payment_method === 'UPI' ? '💳 UPI' :
                                                    req.payment_method === 'BANK' ? '🏦 Bank' :
                                                        req.payment_method || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {req.payment_screenshot_url ? (
                                                <button
                                                    onClick={() => setScreenshotUrl(req.payment_screenshot_url)}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    <span>📷</span> View
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-xs">No screenshot</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        {filter === 'PENDING' && (
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(req._id || req.id)}
                                                        disabled={submitting}
                                                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded-lg font-medium transition shadow-sm disabled:opacity-50"
                                                    >
                                                        ✓ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectModal({ id: req._id || req.id })}
                                                        disabled={submitting}
                                                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-2 rounded-lg font-medium transition shadow-sm disabled:opacity-50"
                                                    >
                                                        ✗ Reject
                                                    </button>
                                                </div>
                                            </td>
                                        )}
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

export default PaymentRequests;
