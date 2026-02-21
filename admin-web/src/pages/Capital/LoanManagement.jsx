import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const LoanDetailModal = ({ loan, onClose, onAction }) => {
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleAction = async (action) => {
        if (action !== 'approve' && !comment.trim()) {
            alert('Please enter a reason/comment.');
            return;
        }
        setSubmitting(true);
        try {
            await onAction(loan._id || loan.id, action, comment);
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    const isPending = loan.status === 'PENDING' || loan.status === 'NEW';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-green-600 to-teal-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-white">Loan Application</h2>
                        <p className="text-green-100 text-sm">{loan.business_name || loan.businessName}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-green-200 text-2xl font-bold">×</button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            ['Business Name', loan.business_name || loan.businessName],
                            ['Loan Amount', `₹${(loan.loan_amount || loan.loanAmount || 0).toLocaleString()}`],
                            ['Interest Rate', `${loan.interest_rate || loan.interestRate}% p.a.`],
                            ['Tenure', `${loan.tenure_months || loan.tenureMonths} months`],
                            ['EMI Amount', `₹${(loan.emi_amount || loan.emiAmount || 0).toLocaleString()}`],
                            ['Processing Fee', `₹${(loan.processing_fee || loan.processingFee || 0).toLocaleString()}`],
                            ['Total Repayable', `₹${((loan.emi_amount || loan.emiAmount || 0) * (loan.tenure_months || loan.tenureMonths || 0)).toLocaleString()}`],
                            ['Applied On', loan.created_at ? new Date(loan.created_at).toLocaleDateString() : 'N/A'],
                        ].map(([label, value]) => (
                            <div key={label} className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">{label}</p>
                                <p className="font-semibold text-gray-800">{value || '—'}</p>
                            </div>
                        ))}
                    </div>

                    {/* EMI Schedule Preview */}
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-3">💰 Loan Summary</h3>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                                <p className="text-xs text-gray-500">Monthly EMI</p>
                                <p className="text-lg font-bold text-green-700">₹{(loan.emi_amount || loan.emiAmount || 0).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Processing Fee</p>
                                <p className="text-lg font-bold text-orange-600">₹{(loan.processing_fee || loan.processingFee || 0).toLocaleString()}</p>
                                <p className="text-xs text-gray-400">Auto-deducted on approval</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Interest</p>
                                <p className="text-lg font-bold text-blue-600">
                                    ₹{(((loan.emi_amount || 0) * (loan.tenure_months || 0)) - (loan.loan_amount || 0)).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {isPending && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Comment / Reason</label>
                                <textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Enter comments (required for Recheck/Reject)..."
                                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
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
                                    ✓ Approve Loan
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const LoanManagement = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => { loadLoans(); }, [filter]);

    const loadLoans = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getLoans();
            let data = response.data.loans || [];
            if (filter !== 'ALL') data = data.filter(l => l.status === filter);
            setLoans(data);
        } catch (err) {
            console.error('Failed to load loans:', err);
            setLoans([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action, comment) => {
        try {
            if (action === 'approve') await adminAPI.approveLoan(id);
            else if (action === 'reject') await adminAPI.rejectLoan(id, { reason: comment });
            else if (action === 'recheck') await adminAPI.recheckLoan(id, { comments: comment });
            alert(`Loan ${action}d successfully!`);
            loadLoans();
        } catch (err) {
            alert('Action failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const filtered = loans.filter(l =>
        !search ||
        (l.business_name || l.businessName || '').toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: loans.length,
        active: loans.filter(l => l.status === 'ACTIVE').length,
        pending: loans.filter(l => l.status === 'PENDING' || l.status === 'NEW').length,
        overdue: loans.filter(l => l.is_overdue || l.isOverdue).length,
        totalDisbursed: loans.filter(l => l.status === 'ACTIVE').reduce((s, l) => s + (l.loan_amount || l.loanAmount || 0), 0),
    };

    return (
        <div>
            {selectedLoan && (
                <LoanDetailModal
                    loan={selectedLoan}
                    onClose={() => setSelectedLoan(null)}
                    onAction={handleAction}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Loan Approval Management</h1>
                    <p className="text-gray-500 mt-1">Review and approve business loan applications</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {[
                    { label: 'Total Loans', value: stats.total, color: 'blue', icon: '📋' },
                    { label: 'Active', value: stats.active, color: 'green', icon: '✅' },
                    { label: 'Pending', value: stats.pending, color: 'yellow', icon: '⏳' },
                    { label: 'Overdue', value: stats.overdue, color: 'red', icon: '⚠️' },
                    { label: 'Total Disbursed', value: `₹${(stats.totalDisbursed / 100000).toFixed(1)}L`, color: 'purple', icon: '💰' },
                ].map(stat => (
                    <div key={stat.label} className={`bg-white rounded-xl shadow-md p-4 border-l-4 border-${stat.color}-500`}>
                        <div className="flex items-center gap-2 mb-1">
                            <span>{stat.icon}</span>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                        <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {['ALL', 'PENDING', 'APPROVED', 'ACTIVE', 'RECHECK', 'REJECTED', 'CLOSED'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all shadow-sm ${filter === status
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Search by business name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {['#', 'Business', 'Loan Amount', 'Interest', 'Tenure', 'EMI', 'Processing Fee', 'Status', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-16 text-center text-gray-500">
                                        <div className="text-5xl mb-3">💵</div>
                                        <p>No {filter} loans found</p>
                                    </td>
                                </tr>
                            ) : filtered.map((loan, idx) => (
                                <tr key={loan._id || loan.id} className="hover:bg-green-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-800">{loan.business_name || loan.businessName}</p>
                                        <p className="text-xs text-gray-500">{loan.scheme_name || loan.schemeName}</p>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{(loan.loan_amount || loan.loanAmount || 0).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{loan.interest_rate || loan.interestRate}%</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{loan.tenure_months || loan.tenureMonths}m</td>
                                    <td className="px-4 py-3 text-sm text-green-600 font-medium">₹{(loan.emi_amount || loan.emiAmount || 0).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-orange-600">₹{(loan.processing_fee || loan.processingFee || 0).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${loan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                            loan.status === 'PENDING' || loan.status === 'NEW' ? 'bg-yellow-100 text-yellow-800' :
                                                loan.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {loan.status}
                                            {(loan.is_overdue || loan.isOverdue) && <span className="ml-1 text-red-600">⚠</span>}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setSelectedLoan(loan)}
                                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition shadow-sm"
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

export default LoanManagement;
