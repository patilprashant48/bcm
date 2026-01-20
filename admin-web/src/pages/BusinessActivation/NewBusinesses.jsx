import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const NewBusinesses = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadBusinesses();
    }, []);

    const loadBusinesses = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getNewBusinesses();
            setBusinesses(response.data.businesses || []);
        } catch (error) {
            console.error('Failed to load businesses:', error);
            setError('Failed to load business applications');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!confirm('Approve this business?')) return;

        try {
            await adminAPI.approveBusinessActivation(id);
            alert('Business approved successfully!');
            loadBusinesses(); // Reload list
        } catch (error) {
            console.error('Failed to approve business:', error);
            alert('Failed to approve business. Please try again.');
        }
    };

    const handleRecheck = async (id) => {
        const comments = prompt('Enter recheck comments:');
        if (!comments) return;

        try {
            await adminAPI.recheckBusinessActivation(id, { comments });
            alert('Recheck requested successfully!');
            loadBusinesses(); // Reload list
        } catch (error) {
            console.error('Failed to request recheck:', error);
            alert('Failed to request recheck. Please try again.');
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await adminAPI.rejectBusinessActivation(id, { reason });
            alert('Business rejected successfully!');
            loadBusinesses(); // Reload list
        } catch (error) {
            console.error('Failed to reject business:', error);
            alert('Failed to reject business. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl text-gray-600">Loading businesses...</div>
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
                <h1 className="text-3xl font-bold text-gray-800">New Business Applications</h1>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold shadow-sm">
                    {businesses.length} Pending
                </div>
            </div>

            {businesses.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <p className="text-xl text-gray-600">No new business applications</p>
                    <p className="text-sm text-gray-500 mt-2">All applications have been reviewed.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {businesses.map((business) => (
                        <div key={business.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-xl font-bold text-gray-800">{business.business_name}</h3>
                                        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                                            {business.business_type}
                                        </span>
                                        <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                                            {business.business_model}
                                        </span>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">👤 Owner:</span>
                                            <span className="font-medium text-gray-800">{business.owner_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">📧 Email:</span>
                                            <span className="font-medium text-gray-800">{business.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">📱 Mobile:</span>
                                            <span className="font-medium text-gray-800">{business.mobile}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">🆔 PAN:</span>
                                            <span className="font-medium text-gray-800">{business.pan_number}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">📋 GST:</span>
                                            <span className="font-medium text-gray-800">{business.gst_number}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">📅 Applied:</span>
                                            <span className="font-medium text-gray-800">
                                                {new Date(business.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 ml-6">
                                    <button
                                        onClick={() => handleApprove(business.id)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                                    >
                                        <span>✓</span> Approve
                                    </button>
                                    <button
                                        onClick={() => handleRecheck(business.id)}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                                    >
                                        <span>🔄</span> Recheck
                                    </button>
                                    <button
                                        onClick={() => handleReject(business.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                                    >
                                        <span>✗</span> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewBusinesses;
