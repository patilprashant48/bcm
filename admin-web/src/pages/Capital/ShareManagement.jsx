import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const ShareDetailModal = ({ share, onClose, onAction }) => {
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleAction = async (action) => {
        if (action !== 'approve' && !comment.trim()) {
            alert('Please enter a reason/comment.');
            return;
        }
        setSubmitting(true);
        try {
            await onAction(share._id || share.id, action, comment);
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    const totalShares = share.total_shares || share.totalShares || 0;
    const ownerShares = Math.floor(totalShares * 0.5);
    const openShares = totalShares - ownerShares;
    const soldShares = share.sold_shares || share.soldShares || 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-white">{share.shareName || share.share_name || share.company_name}</h2>
                        <p className="text-indigo-100 text-sm">{share.projectName || share.business_name || share.businessEmail}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-indigo-200 text-2xl font-bold">×</button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Share Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            ['Company / Project', share.projectName || share.company_name || share.business_name || '—'],
                            ['Price Per Share', `₹${share.shareValue || share.currentPrice || share.pricePerShare || share.price_per_share || 0}`],
                            ['Total Shares', totalShares.toLocaleString()],
                            ['Market Cap', `₹${((totalShares * (share.price_per_share || share.pricePerShare || 0)) / 100000).toFixed(2)}L`],
                        ].map(([label, value]) => (
                            <div key={label} className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">{label}</p>
                                <p className="font-semibold text-gray-800">{value || '—'}</p>
                            </div>
                        ))}
                    </div>

                    {/* 50/50 Split Preview */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
                        <h3 className="font-semibold text-indigo-800 mb-4">📊 Share Distribution (After Approval)</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <span className="text-xl">🔒</span>
                                </div>
                                <p className="text-xs text-gray-500">Owner Reserved (50%)</p>
                                <p className="text-xl font-bold text-indigo-700">{ownerShares.toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <span className="text-xl">📈</span>
                                </div>
                                <p className="text-xs text-gray-500">Open for Sale (50%)</p>
                                <p className="text-xl font-bold text-green-700">{openShares.toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <span className="text-xl">💰</span>
                                </div>
                                <p className="text-xs text-gray-500">Already Sold</p>
                                <p className="text-xl font-bold text-orange-700">{soldShares.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Sold Progress</span>
                                <span>{openShares > 0 ? ((soldShares / openShares) * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                                    style={{ width: `${openShares > 0 ? Math.min((soldShares / openShares) * 100, 100) : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {share.description && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-2">Description</p>
                            <p className="text-gray-700 text-sm">{share.description}</p>
                        </div>
                    )}

                    {share.approvalStatus === 'PENDING' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Comment / Reason</label>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Enter comments (required for Recheck/Reject)..."
                                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                                rows={3}
                            />
                        </div>
                    )}

                    {share.approvalStatus === 'PENDING' && (
                        <div className="flex gap-3 justify-end border-t border-gray-200 pt-4">
                            <button onClick={() => handleAction('recheck')} disabled={submitting}
                                className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition disabled:opacity-50">
                                🔄 Recheck
                            </button>
                            <button onClick={() => handleAction('reject')} disabled={submitting}
                                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50">
                                ✗ Reject
                            </button>
                            <button onClick={() => handleAction('approve')} disabled={submitting}
                                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50">
                                ✓ Approve (50/50 Split)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ShareManagement = () => {
    const [shares, setShares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const [selectedShare, setSelectedShare] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => { loadShares(); }, [filter]);

    const loadShares = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getShares({ status: filter === 'ALL' ? null : filter });
            setShares(response.data.shares || []);
        } catch (err) {
            console.error('Failed to load shares:', err);
            setShares([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action, comment) => {
        try {
            if (action === 'approve') await adminAPI.approveShare(id);
            else if (action === 'reject') await adminAPI.rejectShare(id, { reason: comment });
            else if (action === 'recheck') await adminAPI.recheckShare(id, { comments: comment });
            alert(`Share ${action}d successfully!`);
            loadShares();
        } catch (err) {
            alert('Action failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const filtered = shares.filter(s =>
        !search ||
        (s.share_name || s.shareName || s.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.business_name || s.businessName || '').toLowerCase().includes(search.toLowerCase())
    );

    const statusTabs = ['PENDING', 'APPROVED', 'RECHECK', 'REJECTED', 'ALL'];

    return (
        <div>
            {selectedShare && (
                <ShareDetailModal
                    share={selectedShare}
                    onClose={() => setSelectedShare(null)}
                    onAction={handleAction}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Share Value Approval</h1>
                    <p className="text-gray-500 mt-1">Review and approve business share structures</p>
                </div>
                <span className={`px-4 py-2 rounded-xl font-bold text-lg shadow-sm ${filter === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                    {shares.length} {filter}
                </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {statusTabs.map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-5 py-2 rounded-xl font-medium text-sm transition-all shadow-sm ${filter === status
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Search by company or business name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-16 text-center">
                    <div className="text-7xl mb-4">📈</div>
                    <p className="text-xl text-gray-600 font-medium">No {filter} share offerings</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {['#', 'Company Name', 'Business', 'Total Shares', 'Owner Shares (50%)', 'Open Shares (50%)', 'Sold', 'Price/Share', 'Status', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((share, idx) => {
                                const total = share.total_shares || share.totalShares || 0;
                                const owner = Math.floor(total * 0.5);
                                const open = total - owner;
                                const sold = share.sold_shares || share.soldShares || 0;
                                return (
                                    <tr key={share._id || share.id} className="hover:bg-indigo-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{share.shareName || share.share_name || share.company_name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{share.projectName || share.business_name || share.businessName || '—'}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{total.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm text-indigo-600 font-medium">{owner.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm text-green-600 font-medium">{open.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm text-orange-600 font-medium">{sold.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800">₹{share.shareValue || share.currentPrice || share.pricePerShare || share.price_per_share}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${share.approvalStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                share.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    share.approvalStatus === 'RECHECK' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {share.approvalStatus || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setSelectedShare(share)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition shadow-sm"
                                            >
                                                View
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

export default ShareManagement;
