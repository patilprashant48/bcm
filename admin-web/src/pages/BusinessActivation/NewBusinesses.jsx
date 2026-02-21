import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const VerificationModal = ({ business, onClose, onAction }) => {
    const [checks, setChecks] = useState({
        personalProfile: false,
        businessProfile: false,
        documents: false,
        bankingDetails: false,
    });
    const [comments, setComments] = useState({
        personalProfile: '',
        businessProfile: '',
        documents: '',
        bankingDetails: '',
    });
    const [activeTab, setActiveTab] = useState('personal');
    const [actionType, setActionType] = useState(null); // 'approve' | 'recheck' | 'reject'
    const [submitting, setSubmitting] = useState(false);

    const allChecked = Object.values(checks).every(Boolean);

    const handleSubmit = async () => {
        if (!actionType) return;
        setSubmitting(true);
        try {
            await onAction(business._id || business.id, actionType, { checks, comments });
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    const tabs = [
        { id: 'personal', label: 'Personal Profile', icon: '👤', key: 'personalProfile' },
        { id: 'business', label: 'Business Profile', icon: '🏢', key: 'businessProfile' },
        { id: 'documents', label: 'Documents', icon: '📄', key: 'documents' },
        { id: 'banking', label: 'Banking Details', icon: '🏦', key: 'bankingDetails' },
    ];

    const currentTab = tabs.find(t => t.id === activeTab);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">{business.business_name || business.businessName}</h2>
                        <p className="text-blue-100 text-sm">{business.owner_name || business.ownerName} · {business.email}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-blue-200 text-2xl font-bold">×</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                            {checks[tab.key] && <span className="text-green-500 text-xs">✓</span>}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'personal' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Profile Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    ['Full Name', business.owner_name || business.ownerName],
                                    ['Email', business.email],
                                    ['Mobile', business.mobile],
                                    ['PAN Number', business.pan_number || business.panNumber || 'N/A'],
                                    ['Aadhaar', business.aadhaar || 'N/A'],
                                    ['Date of Birth', business.dob ? new Date(business.dob).toLocaleDateString() : 'N/A'],
                                    ['Address', business.address || 'N/A'],
                                    ['City', business.city || 'N/A'],
                                ].map(([label, value]) => (
                                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                                        <p className="font-medium text-gray-800">{value || '—'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'business' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Profile Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    ['Business Name', business.business_name || business.businessName],
                                    ['Business Type', business.business_type || business.businessType],
                                    ['Business Model', business.business_model || business.businessModel],
                                    ['GST Number', business.gst_number || business.gstNumber || 'N/A'],
                                    ['Registration No.', business.registration_number || 'N/A'],
                                    ['Industry', business.industry || 'N/A'],
                                    ['Website', business.website || 'N/A'],
                                    ['Applied On', business.created_at ? new Date(business.created_at).toLocaleDateString() : 'N/A'],
                                ].map(([label, value]) => (
                                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                                        <p className="font-medium text-gray-800">{value || '—'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'documents' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Documents</h3>
                            {['PAN Card', 'Aadhaar Card', 'Business Registration', 'GST Certificate', 'Bank Statement'].map(doc => (
                                <div key={doc} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">📄</span>
                                        <div>
                                            <p className="font-medium text-gray-800">{doc}</p>
                                            <p className="text-xs text-gray-500">Uploaded document</p>
                                        </div>
                                    </div>
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 border border-blue-300 rounded-lg">
                                        View
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'banking' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Banking Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    ['Account Holder', business.account_holder || 'N/A'],
                                    ['Account Number', business.account_number || 'N/A'],
                                    ['IFSC Code', business.ifsc_code || 'N/A'],
                                    ['Bank Name', business.bank_name || 'N/A'],
                                    ['Branch', business.branch || 'N/A'],
                                    ['Account Type', business.account_type || 'N/A'],
                                ].map(([label, value]) => (
                                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                                        <p className="font-medium text-gray-800">{value || '—'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Verification Checkbox & Comment */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={checks[currentTab.key]}
                                onChange={e => setChecks(prev => ({ ...prev, [currentTab.key]: e.target.checked }))}
                                className="w-5 h-5 rounded text-blue-600"
                            />
                            <span className="font-medium text-blue-800">Mark {currentTab.label} as Verified</span>
                        </label>
                        <textarea
                            placeholder={`Comments on ${currentTab.label} (required if sending for recheck)...`}
                            value={comments[currentTab.key]}
                            onChange={e => setComments(prev => ({ ...prev, [currentTab.key]: e.target.value }))}
                            className="mt-3 w-full border border-blue-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Verified:</span>
                            {tabs.map(tab => (
                                <span key={tab.key} className={`px-2 py-0.5 rounded-full text-xs font-medium ${checks[tab.key] ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                    {tab.icon} {checks[tab.key] ? '✓' : '○'}
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setActionType('recheck'); handleSubmit(); }}
                                disabled={submitting}
                                className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                            >
                                🔄 Send for Recheck
                            </button>
                            <button
                                onClick={() => { setActionType('reject'); handleSubmit(); }}
                                disabled={submitting}
                                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                            >
                                ✗ Reject
                            </button>
                            <button
                                onClick={() => { setActionType('approve'); handleSubmit(); }}
                                disabled={!allChecked || submitting}
                                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title={!allChecked ? 'Verify all sections first' : 'Approve & Activate'}
                            >
                                ✓ Approve & Activate
                            </button>
                        </div>
                    </div>
                    {!allChecked && (
                        <p className="text-xs text-amber-600 mt-2 text-right">⚠ All 4 sections must be verified before approving</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const NewBusinesses = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => { loadBusinesses(); }, []);

    const loadBusinesses = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getNewBusinesses();
            setBusinesses(response.data.businesses || []);
        } catch (err) {
            setError('Failed to load business applications');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action, data) => {
        try {
            if (action === 'approve') {
                await adminAPI.approveBusinessActivation(id, data);
                alert('✅ Business approved! User ID generated and email sent.');
            } else if (action === 'recheck') {
                await adminAPI.recheckBusinessActivation(id, { comments: Object.values(data.comments).filter(Boolean).join('\n') });
                alert('🔄 Sent for recheck. Email notification sent to user.');
            } else if (action === 'reject') {
                await adminAPI.rejectBusinessActivation(id, { reason: Object.values(data.comments).filter(Boolean).join('\n') || 'Application rejected' });
                alert('✗ Business application rejected.');
            }
            loadBusinesses();
        } catch (err) {
            alert('Action failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const filtered = businesses.filter(b =>
        !search ||
        (b.business_name || b.businessName || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.owner_name || b.ownerName || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.email || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">Loading applications...</p>
            </div>
        </div>
    );

    return (
        <div>
            {selectedBusiness && (
                <VerificationModal
                    business={selectedBusiness}
                    onClose={() => setSelectedBusiness(null)}
                    onAction={handleAction}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">New Business Applications</h1>
                    <p className="text-gray-500 mt-1">Review and verify new business registrations</p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl font-bold text-lg shadow-sm">
                    {businesses.length} Pending
                </span>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Search by business name, owner, or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-16 text-center">
                    <div className="text-7xl mb-4">✅</div>
                    <p className="text-xl text-gray-600 font-medium">No new applications</p>
                    <p className="text-sm text-gray-400 mt-2">All applications have been reviewed.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {['Sr.', 'Date', 'Time', 'User Name', 'Business Name', 'Business Type', 'Email', 'Mobile', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((biz, idx) => {
                                const date = new Date(biz.created_at || biz.createdAt);
                                return (
                                    <tr key={biz._id || biz.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{date.toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{biz.owner_name || biz.ownerName}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{biz.business_name || biz.businessName}</td>
                                        <td className="px-4 py-3">
                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                                {biz.business_type || biz.businessType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{biz.email}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{biz.mobile}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setSelectedBusiness(biz)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition shadow-sm"
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

export default NewBusinesses;
