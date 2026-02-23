import { useState, useEffect } from 'react';
import { adminAPI, fdsAPI } from '../../services/api';

const FDDetailModal = ({ scheme, onClose, onAction }) => {
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleAction = async (action) => {
        if (action !== 'approve' && !comment.trim()) {
            alert('Please enter a reason/comment.');
            return;
        }
        setSubmitting(true);
        try {
            await onAction(scheme._id || scheme.id, action, comment);
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    const isPending = scheme.approvalStatus === 'PENDING' || !scheme.approvalStatus;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-amber-600 to-orange-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-white">{scheme.name}</h2>
                        <p className="text-amber-100 text-sm">Scheme ID: {scheme.schemeId}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-amber-200 text-2xl font-bold">×</button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            ['Scheme Name', scheme.name],
                            ['Scheme ID', scheme.schemeId],
                            ['Interest Rate', `${scheme.interestPercent}% p.a.`],
                            ['Maturity Period', `${scheme.maturityDays} days`],
                            ['Minimum Amount', `₹${(scheme.minAmount || 0).toLocaleString()}`],
                            ['Maximum Amount', scheme.maxAmount ? `₹${scheme.maxAmount.toLocaleString()}` : 'No Limit'],
                            ['Created By', scheme.createdBy?.email || (typeof scheme.createdBy === 'string' ? scheme.createdBy : 'Admin')],
                            ['Created On', scheme.createdAt ? new Date(scheme.createdAt).toLocaleDateString() : 'N/A'],
                        ].map(([label, value]) => (
                            <div key={label} className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">{label}</p>
                                <p className="font-semibold text-gray-800">{value || '—'}</p>
                            </div>
                        ))}
                    </div>

                    {/* Returns Preview */}
                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                        <h3 className="font-semibold text-amber-800 mb-4">📊 Returns Preview</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {[10000, 50000, 100000].map(amount => {
                                const returns = amount * (scheme.interestPercent / 100) * (scheme.maturityDays / 365);
                                return (
                                    <div key={amount} className="text-center bg-white rounded-lg p-3 shadow-sm">
                                        <p className="text-xs text-gray-500">₹{(amount / 1000).toFixed(0)}K invested</p>
                                        <p className="text-lg font-bold text-amber-700">₹{returns.toFixed(0)}</p>
                                        <p className="text-xs text-green-600">returns</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {scheme.description && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-2">Description</p>
                            <p className="text-gray-700 text-sm">{scheme.description}</p>
                        </div>
                    )}

                    {isPending && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Comment / Reason</label>
                                <textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Enter comments (required for Recheck/Reject)..."
                                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                    rows={3}
                                />
                            </div>
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
                                    ✓ Approve & Publish
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const FixedDeposits = () => {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => { loadSchemes(); }, [filter]);

    const loadSchemes = async () => {
        try {
            setLoading(true);
            const response = await fdsAPI.getSchemes();
            let data = response.data.schemes || [];
            if (filter === 'PENDING') data = data.filter(s => s.approvalStatus === 'PENDING' || !s.approvalStatus);
            else if (filter === 'APPROVED') data = data.filter(s => s.approvalStatus === 'APPROVED');
            else if (filter === 'REJECTED') data = data.filter(s => s.approvalStatus === 'REJECTED');
            else if (filter === 'RECHECK') data = data.filter(s => s.approvalStatus === 'RECHECK');
            setSchemes(data);
        } catch (err) {
            console.error('Failed to load FD schemes:', err);
            setSchemes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action, comment) => {
        try {
            let newStatus;
            if (action === 'approve') newStatus = 'APPROVED';
            else if (action === 'reject') newStatus = 'REJECTED';
            else if (action === 'recheck') newStatus = 'RECHECK';

            // 1. Update Approval Status
            await fdsAPI.manageApproval(id, {
                status: newStatus,
                comments: comment
            });

            // 2. If Approved, Publish and Activate it
            if (action === 'approve') {
                await fdsAPI.updateStatus(id, {
                    isPublished: true,
                    isActive: true
                });
            } else if (action === 'reject') {
                // If rejected, ensure it is unpublished
                await fdsAPI.updateStatus(id, {
                    isPublished: false,
                    isActive: false
                });
            }
            alert(`FD Scheme ${action}d successfully!${action === 'approve' ? ' Now visible to investors.' : ''}`);
            loadSchemes();
        } catch (err) {
            alert('Action failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const filtered = schemes.filter(s =>
        !search ||
        (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.schemeId || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            {selectedScheme && (
                <FDDetailModal
                    scheme={selectedScheme}
                    onClose={() => setSelectedScheme(null)}
                    onAction={handleAction}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">FD & Bonds Approval</h1>
                    <p className="text-gray-500 mt-1">Review and approve Fixed Deposit schemes for investors</p>
                </div>
                <span className={`px-4 py-2 rounded-xl font-bold text-lg shadow-sm ${filter === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                    }`}>
                    {schemes.length} {filter}
                </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {['PENDING', 'APPROVED', 'RECHECK', 'REJECTED', 'ALL'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-5 py-2 rounded-xl font-medium text-sm transition-all shadow-sm ${filter === status
                            ? 'bg-amber-600 text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Search by scheme name or ID..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-16 text-center">
                    <div className="text-7xl mb-4">🏦</div>
                    <p className="text-xl text-gray-600 font-medium">No {filter} FD schemes</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {['#', 'Scheme Name', 'Scheme ID', 'Interest Rate', 'Maturity', 'Min Amount', 'Published', 'Status', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((scheme, idx) => (
                                <tr key={scheme._id || scheme.id} className="hover:bg-amber-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{scheme.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{scheme.schemeId}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-amber-600">{scheme.interestPercent}%</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{scheme.maturityDays} days</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">₹{(scheme.minAmount || 0).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${scheme.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {scheme.isPublished ? '✓ Published' : '○ Draft'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${scheme.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            scheme.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                scheme.approvalStatus === 'RECHECK' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {scheme.approvalStatus || 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setSelectedScheme(scheme)}
                                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition shadow-sm"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FixedDeposits;
