import { useState, useEffect } from 'react';
import { walletAPI } from '../../services/api';

// ─── Detail / Action Modal ────────────────────────────────────────────────────
const DetailModal = ({ request, onClose, onRefresh }) => {
    const [rejectMode, setRejectMode] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type:'success'|'error', msg }

    if (!request) return null;

    const date = new Date(request.created_at || request.createdAt);
    const isPending = request.status === 'PENDING';
    const screenshotSrc = request.payment_screenshot_url || request.paymentScreenshotUrl;

    const handleApprove = async () => {
        try {
            setSubmitting(true);
            setFeedback(null);
            await walletAPI.approvePayment(request._id || request.id);
            setFeedback({ type: 'success', msg: 'Payment approved — wallet credited successfully.' });
            setTimeout(() => { onRefresh(); onClose(); }, 1500);
        } catch (err) {
            setFeedback({ type: 'error', msg: err.response?.data?.message || err.message });
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) { setFeedback({ type: 'error', msg: 'Please enter a rejection reason.' }); return; }
        try {
            setSubmitting(true);
            setFeedback(null);
            await walletAPI.rejectPayment(request._id || request.id, { comment: rejectReason });
            setFeedback({ type: 'success', msg: 'Request rejected and business notified.' });
            setTimeout(() => { onRefresh(); onClose(); }, 1500);
        } catch (err) {
            setFeedback({ type: 'error', msg: err.response?.data?.message || err.message });
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Top-Up Request Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Status badge */}
                    <div className="flex justify-end">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            request.status === 'PENDING'  ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'APPROVED' ? 'bg-green-100 text-green-800'   :
                                                            'bg-red-100 text-red-800'
                        }`}>{request.status}</span>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-gray-500 text-xs mb-1">Business Name</p>
                            <p className="font-semibold text-gray-800">{request.business_name || '—'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-gray-500 text-xs mb-1">Email</p>
                            <p className="font-semibold text-gray-800 break-all text-xs">{request.user_email || request.users?.email || '—'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-gray-500 text-xs mb-1">Amount</p>
                            <p className="font-bold text-green-600 text-lg">₹{(request.amount || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-gray-500 text-xs mb-1">Payment Method</p>
                            <p className="font-semibold text-gray-800">
                                {request.payment_method === 'UPI' ? '💳 UPI' :
                                 (request.payment_method === 'BANK_TRANSFER' || request.payment_method === 'BANK') ? '🏦 Bank Transfer' :
                                 request.payment_method || 'N/A'}
                            </p>
                        </div>
                        {request.transactionId && (
                            <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                                <p className="text-gray-500 text-xs mb-1">Transaction / UTR ID</p>
                                <p className="font-semibold text-gray-800 font-mono text-xs">{request.transactionId}</p>
                            </div>
                        )}
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-gray-500 text-xs mb-1">Date</p>
                            <p className="font-semibold text-gray-800">{date.toLocaleDateString()}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-gray-500 text-xs mb-1">Time</p>
                            <p className="font-semibold text-gray-800">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {request.adminComment && (
                            <div className="bg-red-50 rounded-xl p-3 col-span-2">
                                <p className="text-gray-500 text-xs mb-1">Admin Comment</p>
                                <p className="text-red-700 font-medium">{request.adminComment}</p>
                            </div>
                        )}
                    </div>

                    {/* Screenshot */}
                    <div>
                        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Payment Screenshot</p>
                        {screenshotSrc ? (
                            screenshotSrc.startsWith('data:') || screenshotSrc.startsWith('http') ? (
                                <img src={screenshotSrc} alt="Payment screenshot"
                                    className="w-full rounded-xl border border-gray-200 object-contain max-h-64" />
                            ) : (
                                <div className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center h-20 text-gray-400 text-sm">
                                    Screenshot unavailable
                                </div>
                            )
                        ) : (
                            <div className="w-full rounded-xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center h-16 text-gray-400 text-sm">
                                No screenshot uploaded
                            </div>
                        )}
                    </div>

                    {/* Feedback */}
                    {feedback && (
                        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
                            feedback.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                            {feedback.msg}
                        </div>
                    )}

                    {/* Action buttons — only for PENDING */}
                    {isPending && feedback?.type !== 'success' && (
                        !rejectMode ? (
                            <div className="flex gap-3 pt-1">
                                <button onClick={() => setRejectMode(true)} disabled={submitting}
                                    className="flex-1 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl transition disabled:opacity-50">
                                    ✗ Reject
                                </button>
                                <button onClick={handleApprove} disabled={submitting}
                                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-50">
                                    {submitting ? 'Processing…' : '✓ Approve'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3 pt-1">
                                <textarea
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    placeholder="Enter rejection reason (required)…"
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                                />
                                <div className="flex gap-3">
                                    <button onClick={() => { setRejectMode(false); setRejectReason(''); setFeedback(null); }}
                                        disabled={submitting}
                                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition disabled:opacity-50">
                                        Cancel
                                    </button>
                                    <button onClick={handleReject} disabled={submitting}
                                        className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-50">
                                        {submitting ? 'Rejecting…' : 'Confirm Reject'}
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PaymentRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const [search, setSearch] = useState('');
    const [viewRequest, setViewRequest] = useState(null); // request being shown in modal

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

    const filtered = requests.filter(r =>
        !search ||
        (r.user_email || r.users?.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.business_name || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalAmount = filtered.reduce((s, r) => s + (r.amount || 0), 0);

    const TABS = [
        { key: 'PENDING',  label: '⏳ New / Pending' },
        { key: 'APPROVED', label: '✓ Approved' },
        { key: 'REJECTED', label: '✗ Rejected' },
    ];

    return (
        <div>
            {/* Detail / Action Modal */}
            {viewRequest && (
                <DetailModal
                    request={viewRequest}
                    onClose={() => setViewRequest(null)}
                    onRefresh={loadRequests}
                />
            )}

            {/* Page Header */}
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
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-5 py-2 rounded-xl font-medium text-sm transition-all shadow-sm ${
                            filter === tab.key
                                ? tab.key === 'PENDING'  ? 'bg-yellow-500 text-white shadow-md'
                                : tab.key === 'APPROVED' ? 'bg-green-600  text-white shadow-md'
                                :                          'bg-red-600    text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Search by email or business name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {/* Table */}
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
                                {['#', 'Date', 'Time', 'Business Name', 'Amount', 'Action'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((req, idx) => {
                                const d = new Date(req.created_at || req.createdAt);
                                return (
                                    <tr key={req._id || req.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                                        <td className="px-5 py-3 text-sm text-gray-700">{d.toLocaleDateString()}</td>
                                        <td className="px-5 py-3 text-sm text-gray-700">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="px-5 py-3">
                                            <p className="font-semibold text-gray-800">{req.business_name || '—'}</p>
                                            <p className="text-xs text-gray-400">{req.user_email || req.users?.email || ''}</p>
                                        </td>
                                        <td className="px-5 py-3 text-base font-bold text-green-600">₹{(req.amount || 0).toLocaleString()}</td>
                                        <td className="px-5 py-3">
                                            <button
                                                onClick={() => setViewRequest(req)}
                                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                                            >
                                                👁 View
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

export default PaymentRequests;
