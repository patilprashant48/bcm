import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const ShareManagement = () => {
    const [shares, setShares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        loadShares();
    }, [filter]);

    const loadShares = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getShares({ status: filter === 'ALL' ? null : filter });
            setShares(response.data.shares || []);
        } catch (error) {
            console.error('Failed to load shares:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!confirm('Approve this share offering?')) return;
        try {
            await adminAPI.approveShare(id);
            alert('Share offering approved!');
            loadShares();
        } catch (error) {
            alert('Failed to approve share offering');
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        try {
            await adminAPI.rejectShare(id, { reason });
            alert('Share offering rejected!');
            loadShares();
        } catch (error) {
            alert('Failed to reject share offering');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="text-xl">Loading...</div></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Share Management</h1>
                <div className="flex gap-2">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {shares.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📈</div>
                    <p className="text-xl text-gray-600">No share offerings found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {shares.map((share) => (
                        <div key={share.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{share.share_name}</h3>
                                    <p className="text-sm text-gray-600">{share.business_name}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${share.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        share.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                    }`}>
                                    {share.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600">Total Shares</p>
                                    <p className="text-lg font-bold text-blue-600">{share.total_shares?.toLocaleString()}</p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600">Price/Share</p>
                                    <p className="text-lg font-bold text-green-600">₹{share.price_per_share}</p>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600">Sold</p>
                                    <p className="text-lg font-bold text-purple-600">{share.sold_shares || 0}</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-4">{share.description}</p>

                            {share.status === 'PENDING' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(share.id)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(share.id)}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShareManagement;
