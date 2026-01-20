import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const LoanManagement = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total_loans: 0,
        active_loans: 0,
        overdue_loans: 0,
        total_disbursed: 0,
    });

    useEffect(() => {
        loadLoans();
    }, []);

    const loadLoans = async () => {
        try {
            const response = await adminAPI.getLoans();
            setLoans(response.data.loans || []);

            const totalLoans = response.data.loans.length;
            const activeLoans = response.data.loans.filter(l => l.status === 'ACTIVE').length;
            const overdueLoans = response.data.loans.filter(l => l.is_overdue).length;
            const totalDisbursed = response.data.loans.reduce((sum, l) => sum + (l.loan_amount || 0), 0);

            setStats({ total_loans: totalLoans, active_loans: activeLoans, overdue_loans: overdueLoans, total_disbursed: totalDisbursed });
        } catch (error) {
            console.error('Failed to load loans:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="text-xl">Loading...</div></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Loan Management</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600">Total Loans</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.total_loans}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                    <p className="text-sm text-gray-600">Active Loans</p>
                    <p className="text-3xl font-bold text-green-600">{stats.active_loans}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                    <p className="text-sm text-gray-600">Overdue</p>
                    <p className="text-3xl font-bold text-red-600">{stats.overdue_loans}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                    <p className="text-sm text-gray-600">Total Disbursed</p>
                    <p className="text-3xl font-bold text-purple-600">₹{(stats.total_disbursed / 100000).toFixed(1)}L</p>
                </div>
            </div>

            {/* Loans Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenure</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EMI</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loans.map((loan) => (
                            <tr key={loan.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-800">{loan.business_name}</div>
                                    <div className="text-sm text-gray-500">{loan.scheme_name}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-800">₹{loan.loan_amount?.toLocaleString()}</td>
                                <td className="px-6 py-4 text-gray-800">{loan.interest_rate}%</td>
                                <td className="px-6 py-4 text-gray-800">{loan.tenure_months} months</td>
                                <td className="px-6 py-4 text-gray-800">₹{loan.emi_amount?.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${loan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                            loan.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {loan.status}
                                    </span>
                                    {loan.is_overdue && (
                                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                            Overdue
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LoanManagement;
