import { useState, useEffect } from 'react';
import { walletAPI } from '../../services/api';

const PaymentRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('PENDING');

    useEffect(() => {
        loadRequests();
    }, [filter]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await walletAPI.getAllPaymentRequests(filter);
            setRequests(response.data.requests || []);
        } catch (error) {
            console.error('Failed to load payment requests:', error);
            setError('Failed to load payment requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!confirm('Approve this payment request?')) return;

        try {
            await walletAPI.approvePayment(id);
            alert('Payment approved successfully!');
            loadRequests(); // Reload list
        } catch (error) {
            console.error('Failed to approve payment:', error);
            const msg = error.response?.data?.message || 'Failed to approve payment. Please try again.';
            alert(msg);
        }
    };

    const handleReject = async (id) => {
        const comment = prompt('Enter rejection reason:');
        if (!comment) return;

        try {
            await walletAPI.rejectPayment(id, { comment });
            alert('Payment rejected successfully!');
            loadRequests(); // Reload list
        } catch (error) {
            console.error('Failed to reject payment:', error);
            alert('Failed to reject payment. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl text-gray-600">Loading payment requests...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Payment Requests</h1>
                <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-semibold shadow-sm">
                    {requests.length} {filter}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2">
                {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${filter === status
                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-xl text-gray-600">No {filter.toLowerCase()} payment requests</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {requests.map((request) => (
                        <div key={request.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Request #{request.id}</h3>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <span>📧</span> {request.users?.email || request.user_email}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-green-600">₹{request.amount.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                                        <span>📅</span> {new Date(request.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm text-gray-600">Payment Method:</span>
                                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${request.payment_method === 'UPI'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-purple-100 text-purple-800'
                                        }`}>
                                        {request.payment_method === 'UPI' ? '💳 UPI' : '🏦 Bank Transfer'}
                                    </span>
                                </div>
                                {request.payment_screenshot_url && (
                                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4 text-center border-2 border-dashed border-gray-300">
                                        <p className="text-sm text-gray-600 mb-2">Payment Screenshot</p>
                                        <div className="bg-white h-32 rounded flex items-center justify-center">
                                            <span className="text-4xl">📷</span>
                                        </div>
                                        <a
                                            href={request.payment_screenshot_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                                        >
                                            View Screenshot
                                        </a>
                                    </div>
                                )}
                            </div>

                            {filter === 'PENDING' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(request.id)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                                    >
                                        ✓ Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(request.id)}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                                    >
                                        ✗ Reject
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

export default PaymentRequests;
