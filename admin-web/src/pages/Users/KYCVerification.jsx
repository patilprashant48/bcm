import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const KYCVerification = () => {
    const [kycRequests, setKycRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('PENDING');
    const [selectedKYC, setSelectedKYC] = useState(null);

    useEffect(() => {
        loadKYCRequests();
    }, [filter]);

    const loadKYCRequests = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getKYCRequests({ status: filter });
            setKycRequests(response.data.requests || []);
        } catch (error) {
            console.error('Failed to load KYC requests:', error);
            setError('Failed to load KYC requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!confirm('Approve this KYC verification?')) return;

        try {
            await adminAPI.approveKYC(id);
            alert('KYC approved successfully!');
            loadKYCRequests();
            setSelectedKYC(null);
        } catch (error) {
            console.error('Failed to approve KYC:', error);
            alert('Failed to approve KYC. Please try again.');
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await adminAPI.rejectKYC(id, { reason });
            alert('KYC rejected successfully!');
            loadKYCRequests();
            setSelectedKYC(null);
        } catch (error) {
            console.error('Failed to reject KYC:', error);
            alert('Failed to reject KYC. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl text-gray-600">Loading KYC requests...</div>
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
                <h1 className="text-3xl font-bold text-gray-800">KYC Verification</h1>
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-semibold shadow-sm">
                    {kycRequests.length} {filter}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2">
                {['PENDING', 'VERIFIED', 'REJECTED'].map((status) => (
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

            {kycRequests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">🆔</div>
                    <p className="text-xl text-gray-600">No {filter.toLowerCase()} KYC requests</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {kycRequests.map((kyc) => (
                        <div key={kyc.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{kyc.user_name || kyc.email}</h3>
                                    <p className="text-sm text-gray-600">{kyc.email}</p>
                                    <p className="text-sm text-gray-600">{kyc.mobile}</p>
                                </div>
                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${kyc.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                                        kyc.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {kyc.status}
                                </span>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Aadhaar Number</p>
                                    <p className="font-medium text-gray-800">{kyc.aadhaar_number || 'Not provided'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">PAN Number</p>
                                    <p className="font-medium text-gray-800">{kyc.pan_number || 'Not provided'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Bank Account</p>
                                    <p className="font-medium text-gray-800">{kyc.bank_account || 'Not provided'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Submitted</p>
                                    <p className="font-medium text-gray-800">
                                        {new Date(kyc.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedKYC(kyc)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                                >
                                    View Documents
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* KYC Details Modal */}
            {selectedKYC && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-2xl font-bold text-gray-800">KYC Documents - {selectedKYC.user_name}</h2>
                            <button
                                onClick={() => setSelectedKYC(null)}
                                className="text-gray-600 hover:text-gray-800 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Personal Info */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Full Name</p>
                                        <p className="font-medium text-lg">{selectedKYC.user_name || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium text-lg">{selectedKYC.email}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Mobile</p>
                                        <p className="font-medium text-lg">{selectedKYC.mobile}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Address</p>
                                        <p className="font-medium text-lg">{selectedKYC.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* KYC Documents */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3">KYC Documents</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Aadhaar */}
                                    <div className="border-2 border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-bold text-gray-800">Aadhaar Card</h4>
                                            <span className="text-2xl">🆔</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">Number: {selectedKYC.aadhaar_number}</p>
                                        <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center mb-3">
                                            {selectedKYC.aadhaar_document_url ? (
                                                <img
                                                    src={selectedKYC.aadhaar_document_url}
                                                    alt="Aadhaar"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            ) : (
                                                <span className="text-gray-400 text-4xl">📄</span>
                                            )}
                                        </div>
                                        {selectedKYC.aadhaar_document_url && (
                                            <a
                                                href={selectedKYC.aadhaar_document_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                View Full Size
                                            </a>
                                        )}
                                    </div>

                                    {/* PAN */}
                                    <div className="border-2 border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-bold text-gray-800">PAN Card</h4>
                                            <span className="text-2xl">💳</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">Number: {selectedKYC.pan_number}</p>
                                        <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center mb-3">
                                            {selectedKYC.pan_document_url ? (
                                                <img
                                                    src={selectedKYC.pan_document_url}
                                                    alt="PAN"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            ) : (
                                                <span className="text-gray-400 text-4xl">📄</span>
                                            )}
                                        </div>
                                        {selectedKYC.pan_document_url && (
                                            <a
                                                href={selectedKYC.pan_document_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                View Full Size
                                            </a>
                                        )}
                                    </div>

                                    {/* Bank Details */}
                                    <div className="border-2 border-gray-200 rounded-lg p-4 col-span-2">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-2xl">🏦</span>
                                            <h4 className="font-bold text-gray-800">Bank Details</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-sm text-gray-600">Account Number</p>
                                                <p className="font-medium">{selectedKYC.bank_account || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">IFSC Code</p>
                                                <p className="font-medium">{selectedKYC.ifsc_code || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Bank Name</p>
                                                <p className="font-medium">{selectedKYC.bank_name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">UPI ID</p>
                                                <p className="font-medium">{selectedKYC.upi_id || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Photo */}
                                    <div className="border-2 border-gray-200 rounded-lg p-4 col-span-2">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-2xl">📸</span>
                                            <h4 className="font-bold text-gray-800">Profile Photo</h4>
                                        </div>
                                        <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                                            {selectedKYC.profile_photo_url ? (
                                                <img
                                                    src={selectedKYC.profile_photo_url}
                                                    alt="Profile"
                                                    className="max-h-full max-w-full object-contain rounded-lg"
                                                />
                                            ) : (
                                                <span className="text-gray-400 text-6xl">👤</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {selectedKYC.status === 'PENDING' && (
                                <div className="flex gap-4 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleApprove(selectedKYC.id)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium text-lg"
                                    >
                                        ✓ Approve KYC
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedKYC.id)}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium text-lg"
                                    >
                                        ✗ Reject KYC
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KYCVerification;
