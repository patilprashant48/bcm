import { useState, useEffect } from 'react';
import { walletAPI } from '../services/api';

const Wallet = () => {
    const [wallet, setWallet] = useState({ balance: 0 });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [topUpScreenshot, setTopUpScreenshot] = useState(null);

    const [paymentDetails, setPaymentDetails] = useState(null);

    useEffect(() => {
        loadWalletData();
        loadPaymentDetails();
    }, []);

    const loadPaymentDetails = async () => {
        try {
            const response = await walletAPI.getPaymentDetails();
            if (response.data.success) {
                setPaymentDetails(response.data.paymentDetails);
            }
        } catch (error) {
            console.error('Failed to load payment details:', error);
        }
    };

    const loadWalletData = async () => {
        try {
            const [walletRes, txnRes] = await Promise.all([
                walletAPI.getWallet(),
                walletAPI.getTransactions(),
            ]);
            setWallet(walletRes.data);
            setTransactions(txnRes.data.transactions || []);
        } catch (error) {
            console.error('Failed to load wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTopUpRequest = async (e) => {
        e.preventDefault();
        if (!topUpAmount || !topUpScreenshot) {
            alert('Please enter amount and upload payment screenshot');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('amount', topUpAmount);
            formData.append('screenshot', topUpScreenshot);
            // Also need paymentMethod? Backend requires it!
            formData.append('paymentMethod', 'BANK_TRANSFER'); // Default or add selector

            await walletAPI.requestTopUp(formData);
            alert('Top-up request submitted successfully! Awaiting admin approval.');
            setShowTopUpModal(false);
            setTopUpAmount('');
            setTopUpScreenshot(null);
            loadWalletData();
        } catch (error) {
            console.error('Failed to request top-up:', error);
            alert('Failed to submit top-up request. Please try again.');
        }
    };

    {/* Wallet Balance Card */ }
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-8 text-white mb-8">
        <p className="text-sm opacity-90 mb-2">Available Balance</p>
        <p className="text-5xl font-bold mb-4">₹{wallet.balance.toLocaleString()}</p>
        <div className="flex gap-4">
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <p className="text-xs opacity-75">Total Received</p>
                <p className="font-bold">₹{(wallet.total_received || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <p className="text-xs opacity-75">Total Spent</p>
                <p className="font-bold">₹{(wallet.total_spent || 0).toLocaleString()}</p>
            </div>
        </div>
    </div>

    {/* Transaction History */ }
    <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Transaction History</h2>

        {transactions.length === 0 ? (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">📜</div>
                <p className="text-gray-600">No transactions yet</p>
            </div>
        ) : (
            <div className="space-y-3">
                {transactions.map((txn) => (
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
                                {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">{txn.type}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>

    {/* Top Up Modal */ }
    {
        showTopUpModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Top Up Wallet</h2>
                        <button
                            onClick={() => setShowTopUpModal(false)}
                            className="text-gray-600 hover:text-gray-800 text-2xl"
                        >
                            ✕
                        </button>
                    </div>

                    {paymentDetails && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm">
                            <h3 className="font-bold text-gray-700 mb-2">Bank Details for Transfer:</h3>
                            <div className="space-y-1 text-gray-600">
                                <p><span className="font-medium">Bank:</span> {paymentDetails.company_bank_name || 'N/A'}</p>
                                <p><span className="font-medium">A/C No:</span> {paymentDetails.company_account_number || 'N/A'}</p>
                                <p><span className="font-medium">IFSC:</span> {paymentDetails.company_ifsc || 'N/A'}</p>
                                <p><span className="font-medium">UPI:</span> {paymentDetails.company_upi_id || 'N/A'}</p>
                            </div>
                            {paymentDetails.company_qr_code_url && (
                                <div className="mt-3 text-center">
                                    <p className="font-medium mb-1">Scan to Pay</p>
                                    <img
                                        src={paymentDetails.company_qr_code_url}
                                        alt="Payment QR"
                                        className="w-32 h-32 mx-auto border border-gray-200 rounded"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleTopUpRequest} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount (₹)
                            </label>
                            <input
                                type="number"
                                required
                                value={topUpAmount}
                                onChange={(e) => setTopUpAmount(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter amount"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Screenshot
                            </label>
                            <input
                                type="file"
                                required
                                accept="image/*"
                                onChange={(e) => setTopUpScreenshot(e.target.files[0])}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-medium"
                            >
                                Submit Request
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowTopUpModal(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg transition font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
        </div >
    );
};

export default Wallet;
