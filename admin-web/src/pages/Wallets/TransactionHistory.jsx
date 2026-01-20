import { useState, useEffect } from 'react';
import { walletAPI } from '../../services/api';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        type: 'ALL',
        dateFrom: '',
        dateTo: '',
        searchTerm: ''
    });

    useEffect(() => {
        loadTransactions();
    }, [filters.type]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const response = await walletAPI.getAllTransactions(filters);
            setTransactions(response.data.transactions || []);
        } catch (error) {
            console.error('Failed to load transactions:', error);
            setError('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const exportTransactions = () => {
        // TODO: Implement export functionality
        alert('Export feature coming soon!');
    };

    const filteredTransactions = transactions.filter(txn => {
        const matchesSearch = !filters.searchTerm ||
            txn.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            txn.user_email?.toLowerCase().includes(filters.searchTerm.toLowerCase());

        const matchesDateFrom = !filters.dateFrom ||
            new Date(txn.created_at) >= new Date(filters.dateFrom);

        const matchesDateTo = !filters.dateTo ||
            new Date(txn.created_at) <= new Date(filters.dateTo);

        return matchesSearch && matchesDateFrom && matchesDateTo;
    });

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="text-xl text-gray-600">Loading transactions...</div></div>;
    }

    if (error) {
        return <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-800">{error}</p></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Transaction History</h1>
                <button
                    onClick={exportTransactions}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                >
                    <span>📥</span> Export
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={filters.searchTerm}
                            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">All Types</option>
                            <option value="CREDIT">Credits</option>
                            <option value="DEBIT">Debits</option>
                            <option value="PAYMENT">Payments</option>
                            <option value="INVESTMENT">Investments</option>
                            <option value="RETURN">Returns</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={loadTransactions}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={() => setFilters({ type: 'ALL', dateFrom: '', dateTo: '', searchTerm: '' })}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                    <p className="text-3xl font-bold text-gray-800">{filteredTransactions.length}</p>
                </div>
                <div className="bg-green-50 rounded-xl shadow-md p-6">
                    <p className="text-sm text-gray-600 mb-1">Total Credits</p>
                    <p className="text-3xl font-bold text-green-600">
                        ₹{filteredTransactions
                            .filter(t => t.type === 'CREDIT')
                            .reduce((sum, t) => sum + (t.amount || 0), 0)
                            .toLocaleString()}
                    </p>
                </div>
                <div className="bg-red-50 rounded-xl shadow-md p-6">
                    <p className="text-sm text-gray-600 mb-1">Total Debits</p>
                    <p className="text-3xl font-bold text-red-600">
                        ₹{filteredTransactions
                            .filter(t => t.type === 'DEBIT')
                            .reduce((sum, t) => sum + (t.amount || 0), 0)
                            .toLocaleString()}
                    </p>
                </div>
                <div className="bg-blue-50 rounded-xl shadow-md p-6">
                    <p className="text-sm text-gray-600 mb-1">Net Flow</p>
                    <p className="text-3xl font-bold text-blue-600">
                        ₹{(
                            filteredTransactions.filter(t => t.type === 'CREDIT').reduce((sum, t) => sum + (t.amount || 0), 0) -
                            filteredTransactions.filter(t => t.type === 'DEBIT').reduce((sum, t) => sum + (t.amount || 0), 0)
                        ).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Transaction List */}
            {filteredTransactions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📜</div>
                    <p className="text-xl text-gray-600">No transactions found</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTransactions.map((txn) => (
                                <tr key={txn.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(txn.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {txn.user_email || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {txn.description || 'No description'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${txn.type === 'CREDIT' ? 'bg-green-100 text-green-800' :
                                                txn.type === 'DEBIT' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'
                                            }`}>
                                            {txn.type}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${txn.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {txn.type === 'CREDIT' ? '+' : '-'}₹{(txn.amount || 0).toLocaleString()}
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

export default TransactionHistory;
