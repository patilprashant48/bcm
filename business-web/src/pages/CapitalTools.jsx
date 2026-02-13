import { useState } from 'react';
import { capitalAPI } from '../services/api';

const CapitalTools = () => {
    const [activeTab, setActiveTab] = useState('shares');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    const tools = [
        { id: 'shares', name: 'Shares', icon: '📈', color: 'blue' },
        { id: 'loans', name: 'Loans', icon: '💵', color: 'green' },
        { id: 'fds', name: 'Fixed Deposits', icon: '🏦', color: 'purple' },
        { id: 'partnerships', name: 'Partnerships', icon: '🤝', color: 'orange' },
    ];

    const handleCreateShare = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await capitalAPI.createShare({
                ...formData,
                total_shares: parseInt(formData.total_shares),
                price_per_share: parseFloat(formData.price_per_share),
            });
            alert('Share offering created successfully!');
            setShowModal(false);
            setFormData({});
        } catch (error) {
            alert('Failed to create share offering. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLoan = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await capitalAPI.createLoan({
                ...formData,
                loan_amount: parseFloat(formData.loan_amount),
                interest_rate: parseFloat(formData.interest_rate),
                tenure_months: parseInt(formData.tenure_months),
            });
            alert('Loan scheme created successfully!');
            setShowModal(false);
            setFormData({});
        } catch (error) {
            alert('Failed to create loan scheme. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFD = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await capitalAPI.createFD({
                ...formData,
                fd_amount: parseFloat(formData.fd_amount),
                interest_rate: parseFloat(formData.interest_rate),
                tenure_months: parseInt(formData.tenure_months),
            });
            alert('FD scheme created successfully!');
            setShowModal(false);
            setFormData({});
        } catch (error) {
            console.error('FD Creation Error:', error);
            console.error('Error Response:', error.response?.data);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create FD scheme';
            alert(`Failed to create FD scheme: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePartnership = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await capitalAPI.createPartnership({
                ...formData,
                investment_amount: parseFloat(formData.investment_amount),
                profit_share_percentage: parseFloat(formData.profit_share_percentage),
            });
            alert('Partnership offering created successfully!');
            setShowModal(false);
            setFormData({});
        } catch (error) {
            alert('Failed to create partnership. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderForm = () => {
        switch (activeTab) {
            case 'shares':
                return (
                    <form onSubmit={handleCreateShare} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Share Name</label>
                            <input
                                type="text"
                                required
                                value={formData.share_name || ''}
                                onChange={(e) => setFormData({ ...formData, share_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Series A Shares"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Total Shares</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.total_shares || ''}
                                    onChange={(e) => setFormData({ ...formData, total_shares: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 10000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price per Share (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.price_per_share || ''}
                                    onChange={(e) => setFormData({ ...formData, price_per_share: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 100"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                required
                                rows="3"
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe the share offering..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Share Offering'}
                        </button>
                    </form>
                );

            case 'loans':
                return (
                    <form onSubmit={handleCreateLoan} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Loan Scheme Name</label>
                            <input
                                type="text"
                                required
                                value={formData.scheme_name || ''}
                                onChange={(e) => setFormData({ ...formData, scheme_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., Business Expansion Loan"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.loan_amount || ''}
                                    onChange={(e) => setFormData({ ...formData, loan_amount: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g., 500000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={formData.interest_rate || ''}
                                    onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g., 12"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tenure (Months)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.tenure_months || ''}
                                    onChange={(e) => setFormData({ ...formData, tenure_months: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g., 24"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Loan Scheme'}
                        </button>
                    </form>
                );

            case 'fds':
                return (
                    <form onSubmit={handleCreateFD} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">FD Scheme Name</label>
                            <input
                                type="text"
                                required
                                value={formData.scheme_name || ''}
                                onChange={(e) => setFormData({ ...formData, scheme_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g., High Return FD"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">FD Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.fd_amount || ''}
                                    onChange={(e) => setFormData({ ...formData, fd_amount: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g., 100000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={formData.interest_rate || ''}
                                    onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g., 8.5"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tenure (Months)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.tenure_months || ''}
                                    onChange={(e) => setFormData({ ...formData, tenure_months: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g., 12"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create FD Scheme'}
                        </button>
                    </form>
                );

            case 'partnerships':
                return (
                    <form onSubmit={handleCreatePartnership} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Partnership Name</label>
                            <input
                                type="text"
                                required
                                value={formData.partnership_name || ''}
                                onChange={(e) => setFormData({ ...formData, partnership_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="e.g., Strategic Partnership"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Investment Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.investment_amount || ''}
                                    onChange={(e) => setFormData({ ...formData, investment_amount: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    placeholder="e.g., 1000000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profit Share (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={formData.profit_share_percentage || ''}
                                    onChange={(e) => setFormData({ ...formData, profit_share_percentage: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    placeholder="e.g., 20"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                            <textarea
                                required
                                rows="3"
                                value={formData.terms || ''}
                                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="Describe partnership terms..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Partnership'}
                        </button>
                    </form>
                );
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Capital Raising Tools</h1>
                <p className="text-gray-600 mt-2">Create and manage different capital raising instruments</p>
            </div>

            {/* Tool Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => { setActiveTab(tool.id); setShowModal(true); setFormData({}); }}
                        className={`bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-200 border-2 ${activeTab === tool.id ? `border-${tool.color}-500` : 'border-transparent'
                            }`}
                    >
                        <div className="text-5xl mb-3">{tool.icon}</div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2">{tool.name}</h3>
                        <p className="text-sm text-gray-600">Create new offering</p>
                    </button>
                ))}
            </div>

            {/* Info Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">About Capital Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-bold text-blue-600 mb-2">📈 Shares</h3>
                        <p className="text-sm text-gray-600">Offer equity shares to investors. Set price and quantity.</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-green-600 mb-2">💵 Loans</h3>
                        <p className="text-sm text-gray-600">Create loan schemes with interest rates and EMI schedules.</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-purple-600 mb-2">🏦 Fixed Deposits</h3>
                        <p className="text-sm text-gray-600">Offer FD schemes with guaranteed returns.</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-orange-600 mb-2">🤝 Partnerships</h3>
                        <p className="text-sm text-gray-600">Create partnership opportunities with profit sharing.</p>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Create {tools.find(t => t.id === activeTab)?.name}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-600 hover:text-gray-800 text-2xl"
                            >
                                ✕
                            </button>
                        </div>
                        {renderForm()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CapitalTools;
