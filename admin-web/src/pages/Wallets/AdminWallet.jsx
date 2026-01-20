import { useState, useEffect } from 'react';
import { walletAPI } from '../../services/api';

const AdminWallet = () => {
    const [walletData, setWalletData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');

    useEffect(() => {
        loadWalletData();
    }, []);

    const loadWalletData = async () => {
        try {
            setLoading(true);
            const [walletResponse, txnResponse] = await Promise.all([
                walletAPI.getAdminWallet(),
                walletAPI.getAdminTransactions()
            ]);
            setWalletData(walletResponse.data);
            setTransactions(txnResponse.data.transactions || []);
        } catch (error) {
            console.error('Failed to load wallet data:', error);
            setError('Failed to load admin wallet');
        } finally {
            setLoading(false);
        }
    };

    const handleTopUp = async () => {
        if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        try {
            await walletAPI.topUpAdminWallet({ amount: parseFloat(topUpAmount) });
            alert('Admin wallet topped up successfully!');
            setShowTopUpModal(false);
            setTopUpAmount('');
            loadWalletData();
        } catch (error) {
            console.error('Failed to top up wallet:', error);
            alert('Failed to top up wallet. Please try again.');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="text-xl text-gray-600">Loading wallet...</div></div>;
    }

    if (error) {
        return <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-800">{error}</p></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Admin Wallet</h1>
                <button
                    onClick={() => setShowTopUpModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                >
                    <span>💰</span> Top Up Wallet
                </button>
            </div>

            {/* Wallet Balance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 text-white">
                    <p className="text-sm opacity-90 mb-2">Current Balance</p>
                    <p className="text-4xl font-bold">₹{(walletData?.balance || 0).toLocaleString()}</p>
                    <p className="text-sm opacity-75 mt-2">Available for payments</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-8 text-white">
                    <p className="text-sm opacity-90 mb-2">Total Received</p>
                    <p className="text-4xl font-bold">₹{(walletData?.total_received || 0).toLocaleString()}</p>
                    <p className="text-sm opacity-75 mt-2">All time credits</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
                    <p className="text-sm opacity-90 mb-2">Total Paid</p>
                    <p className="text-4xl font-bold">₹{(walletData?.total_paid || 0).toLocaleString()}</p>
                    <p className="text-sm opacity-75 mt-2">All time debits</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
                            <p className="text-2xl font-bold text-yellow-600">{walletData?.pending_payments || 0}</p>
                        </div>
                        <span className="text-3xl">⏳</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Approved Today</p>
                            <p className="text-2xl font-bold text-green-600">{walletData?.approved_today || 0}</p>
                        </div>
                        <span className="text-3xl">✅</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Commission Earned</p>
                            <p className="text-2xl font-bold text-blue-600">₹{(walletData?.commission_earned || 0).toLocaleString()}</p>
                        </div>
                        <span className="text-3xl">💵</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">This Month</p>
                            <p className="text-2xl font-bold text-purple-600">₹{(walletData?.month_total || 0).toLocaleString()}</p>
                        </div>
                        <span className="text-3xl">📊</span>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
                {transactions.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No transactions yet</p>
                ) : (
                    <div className="space-y-3">
                        {transactions.slice(0, 10).map((txn) => (
                            <div key={txn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${txn.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {txn.type === 'CREDIT' ? '↓' : '↑'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{txn.description}</p>
                                        <p className="text-sm text-gray-500">{new Date(txn.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-bold ${txn.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {txn.type === 'CREDIT' ? '+' : '-'}₹{(txn.amount || 0).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500">{txn.type}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Top Up Modal */}
            {showTopUpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Top Up Admin Wallet</h2>
                            <button
                                onClick={() => setShowTopUpModal(false)}
                                className="text-gray-600 hover:text-gray-800 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                            <input
                                type="number"
                                value={topUpAmount}
                                onChange={(e) => setTopUpAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleTopUp}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
                            >
                                Confirm Top Up
                            </button>
                            <button
                                onClick={() => setShowTopUpModal(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWallet;
