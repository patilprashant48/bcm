import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const RevenueReports = () => {
    const [transactions, setTransactions] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRevenue();
    }, []);

    const loadRevenue = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getRevenueReports();
            setTransactions(res.data.revenueTransactions || []);
            setTotalRevenue(res.data.totalRevenue || 0);
        } catch (error) {
            console.error('Failed to load revenue reports', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Platform Revenue</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                    <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Total Revenue Generated</p>
                    <h2 className="text-4xl font-bold mt-2">₹{totalRevenue.toLocaleString()}</h2>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Recent Revenue Events</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">User</th>
                                <th className="p-4 font-medium">Type</th>
                                <th className="p-4 font-medium">Description</th>
                                <th className="p-4 font-medium text-right">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map((tx) => (
                                <tr key={tx._id} className="hover:bg-gray-50">
                                    <td className="p-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(tx.createdAt).toLocaleString()}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <p className="font-semibold text-gray-800">{tx.userId?.name || 'Unknown'}</p>
                                        <p className="text-xs text-gray-500">{tx.userId?.email}</p>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                                            {tx.referenceType}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-700">
                                        {tx.description}
                                    </td>
                                    <td className="p-4 whitespace-nowrap font-bold text-green-600 text-right">
                                        +₹{parseFloat(tx.amount.toString()).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No revenue transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RevenueReports;
