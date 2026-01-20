import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        loadCustomers();
    }, [filterStatus]);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getCustomers({ status: filterStatus });
            setCustomers(response.data.customers || []);
        } catch (error) {
            console.error('Failed to load customers:', error);
            setError('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async (id) => {
        if (!confirm('Suspend this customer account?')) return;

        try {
            await adminAPI.suspendCustomer(id);
            alert('Customer account suspended successfully!');
            loadCustomers();
        } catch (error) {
            console.error('Failed to suspend customer:', error);
            alert('Failed to suspend customer. Please try again.');
        }
    };

    const handleActivate = async (id) => {
        if (!confirm('Activate this customer account?')) return;

        try {
            await adminAPI.activateCustomer(id);
            alert('Customer account activated successfully!');
            loadCustomers();
        } catch (error) {
            console.error('Failed to activate customer:', error);
            alert('Failed to activate customer. Please try again.');
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.mobile?.includes(searchTerm) ||
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl text-gray-600">Loading customers...</div>
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
                <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold shadow-sm">
                    {filteredCustomers.length} Customers
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by email, mobile, or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['ALL', 'ACTIVE', 'SUSPENDED', 'KYC_PENDING'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filterStatus === status
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {filteredCustomers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-xl text-gray-600">No customers found</p>
                    <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredCustomers.map((customer) => (
                        <div key={customer.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {customer.name?.[0]?.toUpperCase() || customer.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{customer.name || 'N/A'}</h3>
                                        <p className="text-sm text-gray-600">{customer.email}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${customer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                        customer.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {customer.status}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-600">📱 Mobile:</span>
                                    <span className="font-medium text-gray-800">{customer.mobile || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-600">🆔 KYC:</span>
                                    <span className={`font-medium ${customer.kyc_status === 'VERIFIED' ? 'text-green-600' :
                                            customer.kyc_status === 'PENDING' ? 'text-yellow-600' :
                                                'text-red-600'
                                        }`}>
                                        {customer.kyc_status || 'NOT_SUBMITTED'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-600">💰 Total Invested:</span>
                                    <span className="font-medium text-blue-600">
                                        ₹{(customer.total_invested || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-600">📅 Joined:</span>
                                    <span className="font-medium text-gray-800">
                                        {new Date(customer.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedCustomer(customer)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                                >
                                    View Details
                                </button>
                                {customer.status === 'ACTIVE' ? (
                                    <button
                                        onClick={() => handleSuspend(customer.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                                    >
                                        Suspend
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleActivate(customer.id)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                                    >
                                        Activate
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Customer Details Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-2xl font-bold text-gray-800">Customer Details</h2>
                            <button
                                onClick={() => setSelectedCustomer(null)}
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
                                    <div>
                                        <p className="text-sm text-gray-600">Name</p>
                                        <p className="font-medium">{selectedCustomer.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium">{selectedCustomer.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Mobile</p>
                                        <p className="font-medium">{selectedCustomer.mobile || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <p className="font-medium">{selectedCustomer.status}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Investment Summary */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3">Investment Summary</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Total Invested</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            ₹{(selectedCustomer.total_invested || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Total Returns</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            ₹{(selectedCustomer.total_returns || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Active Investments</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {selectedCustomer.active_investments || 0}
                                        </p>
                                    </div>
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Wallet Balance</p>
                                        <p className="text-2xl font-bold text-orange-600">
                                            ₹{(selectedCustomer.wallet_balance || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* KYC Status */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3">KYC Information</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">KYC Status</p>
                                    <p className={`font-bold text-lg ${selectedCustomer.kyc_status === 'VERIFIED' ? 'text-green-600' :
                                            selectedCustomer.kyc_status === 'PENDING' ? 'text-yellow-600' :
                                                'text-red-600'
                                        }`}>
                                        {selectedCustomer.kyc_status || 'NOT_SUBMITTED'}
                                    </p>
                                    {selectedCustomer.kyc_status === 'PENDING' && (
                                        <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                                            Review KYC Documents
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
