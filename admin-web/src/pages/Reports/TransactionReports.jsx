import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const TransactionReports = () => {
    const [dateRange, setDateRange] = useState({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
    });
    const [stats, setStats] = useState({
        total_transactions: 0,
        total_volume: 0,
        credits: 0,
        debits: 0,
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, [dateRange]);

    const loadReports = async () => {
        try {
            const response = await adminAPI.getTransactionReports(dateRange);
            setStats(response.data.stats || {});
            setChartData(response.data.chart_data || []);
        } catch (error) {
            console.error('Failed to load reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format) => {
        try {
            const response = await adminAPI.exportTransactionReport({ ...dateRange, format });
            // Handle file download
            const blob = new Blob([response.data], { type: format === 'pdf' ? 'application/pdf' : 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transaction-report-${Date.now()}.${format}`;
            a.click();
        } catch (error) {
            alert('Failed to export report');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="text-xl">Loading...</div></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Transaction Reports</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleExport('csv')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={() => handleExport('pdf')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={dateRange.start_date}
                            onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            value={dateRange.end_date}
                            onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={loadReports}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600">Total Transactions</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.total_transactions?.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                    <p className="text-sm text-gray-600">Total Volume</p>
                    <p className="text-3xl font-bold text-purple-600">₹{(stats.total_volume / 100000)?.toFixed(1)}L</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                    <p className="text-sm text-gray-600">Credits</p>
                    <p className="text-3xl font-bold text-green-600">₹{(stats.credits / 100000)?.toFixed(1)}L</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                    <p className="text-sm text-gray-600">Debits</p>
                    <p className="text-3xl font-bold text-red-600">₹{(stats.debits / 100000)?.toFixed(1)}L</p>
                </div>
            </div>

            {/* Transaction Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Transaction Breakdown</h2>
                <div className="space-y-3">
                    {chartData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">{item.icon || '💰'}</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{item.type}</p>
                                    <p className="text-sm text-gray-500">{item.count} transactions</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-800">₹{item.amount?.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">{item.percentage}%</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">Report Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm opacity-75">Period</p>
                        <p className="text-lg font-bold">{dateRange.start_date} to {dateRange.end_date}</p>
                    </div>
                    <div>
                        <p className="text-sm opacity-75">Net Flow</p>
                        <p className="text-lg font-bold">₹{((stats.credits - stats.debits) / 100000)?.toFixed(2)}L</p>
                    </div>
                    <div>
                        <p className="text-sm opacity-75">Avg Transaction</p>
                        <p className="text-lg font-bold">₹{(stats.total_volume / stats.total_transactions)?.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionReports;
