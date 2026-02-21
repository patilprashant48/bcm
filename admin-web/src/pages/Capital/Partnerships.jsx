import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const PartnershipDetailModal = ({ partnership, onClose, onAction }) => {
    const [actionComment, setActionComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!partnership) return null;

    const handleAction = async (action) => {
        if ((action === 'reject' || action === 'recheck') && !actionComment.trim()) {
            alert('Please provide a comment/reason.');
            return;
        }

        if (!confirm(`Are you sure you want to ${action} this partnership offer?`)) return;

        try {
            setSubmitting(true);
            await onAction(partnership._id || partnership.id, action, actionComment);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="text-2xl font-bold text-gray-800">Partnership Offer Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Header Info */}
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <h3 className="text-lg font-bold text-purple-900">{partnership.title || 'Untitled Partnership'}</h3>
                        <p className="text-sm text-purple-700 mt-1">{partnership.businessId?.businessName || 'Unknown Business'}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase">Investment Amount</p>
                            <p className="font-semibold text-gray-800">₹{(partnership.investment_amount || partnership.investmentAmount || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase">Equity Offered</p>
                            <p className="font-semibold text-gray-800">{partnership.equity_offered || partnership.equityOffered}%</p>
                        </div>
                        <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase">Description</p>
                            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{partnership.description || 'No description provided.'}</p>
                        </div>
                    </div>

                    {/* Documents */}
                    {partnership.documents && (
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Supporting Documents</h4>
                            <div className="flex gap-2 flex-wrap">
                                {Array.isArray(partnership.documents) ? partnership.documents.map((doc, idx) => (
                                    <a key={idx} href={doc} target="_blank" rel="noopener noreferrer"
                                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm border border-blue-200 hover:bg-blue-100">
                                        📄 Document {idx + 1}
                                    </a>
                                )) : <span className="text-gray-400 text-sm">No documents attached</span>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    {(partnership.status === 'PENDING' || partnership.status === 'RECHECK') ? (
                        <div className="space-y-4">
                            <textarea
                                value={actionComment}
                                onChange={e => setActionComment(e.target.value)}
                                placeholder="Enter comments for Recheck or Rejection..."
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                rows="2"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleAction('recheck')}
                                    disabled={submitting}
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-medium transition disabled:opacity-50"
                                >
                                    🔄 Request Recheck
                                </button>
                                <button
                                    onClick={() => handleAction('reject')}
                                    disabled={submitting}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition disabled:opacity-50"
                                >
                                    ✗ Reject
                                </button>
                                <button
                                    onClick={() => handleAction('approve')}
                                    disabled={submitting}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition disabled:opacity-50 shadow-lg shadow-green-200"
                                >
                                    ✓ Approve & Publish
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <span className={`px-4 py-2 rounded-full font-bold ${partnership.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                Currently {partnership.status}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Partnerships = () => {
    const [partnerships, setPartnerships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('PENDING');
    const [selectedPartnership, setSelectedPartnership] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => { loadPartnerships(); }, []);

    const loadPartnerships = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getPartnerships();
            setPartnerships(response.data.partnerships || []);
        } catch (err) {
            console.error('Failed to load partnerships:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action, comment) => {
        try {
            if (action === 'approve') await adminAPI.approvePartnership(id);
            else if (action === 'reject') await adminAPI.rejectPartnership(id, { reason: comment });
            else if (action === 'recheck') await adminAPI.recheckPartnership(id, { comments: comment });

            alert(`Partnership ${action}d successfully!`);
            loadPartnerships();
        } catch (err) {
            alert('Action failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const filtered = partnerships.filter(p => {
        const matchesTab = activeTab === 'ALL' || (p.status || 'PENDING') === activeTab;
        const matchesSearch = !search ||
            (p.businessId?.businessName || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.title || '').toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div>
            {selectedPartnership && (
                <PartnershipDetailModal
                    partnership={selectedPartnership}
                    onClose={() => setSelectedPartnership(null)}
                    onAction={handleAction}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Partnership Approvals</h1>
                    <p className="text-gray-500 mt-1">Review and manage partnership opportunities</p>
                </div>
                <div className="flex gap-2">
                    {['PENDING', 'APPROVED', 'RECHECK', 'REJECTED', 'ALL'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {tab === 'PENDING' ? 'New Requests' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Search partnerships..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
            </div>

            {loading ? (
                <div className="flex justify-center h-64 items-center">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-16 text-center">
                    <div className="text-6xl mb-4">🤝</div>
                    <p className="text-xl text-gray-600">No {activeTab.toLowerCase()} partnership requests found</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Business</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Offer Title</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Investment</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Equity</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(p => (
                                <tr key={p._id || p.id} className="hover:bg-purple-50 transition-colors cursor-pointer" onClick={() => setSelectedPartnership(p)}>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(p.created_at || p.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{p.businessId?.businessName}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{p.title}</td>
                                    <td className="px-6 py-4 font-mono font-medium text-gray-700">₹{(p.investment_amount || p.investmentAmount || 0).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{p.equity_offered || p.equityOffered}%</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${p.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                p.status === 'RECHECK' ? 'bg-yellow-100 text-yellow-800' :
                                                    p.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                            }`}>
                                            {p.status || 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                                            View Details →
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

export default Partnerships;
