import { useState, useEffect } from 'react';
import { fdsAPI } from '../../services/api';

const SchemeMaster = () => {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        minAmount: '',
        interestCalculationDays: '',
        interestTransferType: [], // ['SCHEME', 'MAIN', 'INCOME']
        interestDivision: { scheme: 0, mainWallet: 0, incomeWallet: 0 },
        transferScheduleDays: '',
        maturityDays: '',
        maturityTransferDivision: { mainWallet: 0, incomeWallet: 0 },
        taxDeductionPercent: ''
    });

    useEffect(() => {
        loadSchemes();
    }, []);

    const loadSchemes = async () => {
        try {
            setLoading(true);
            const res = await fdsAPI.getSchemes();
            setSchemes(res.data.schemes || []);
        } catch (error) {
            console.error('Failed to load schemes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDivisionChange = (type, field, value) => {
        setFormData(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: parseFloat(value) || 0
            }
        }));
    };

    const handleCheckboxChange = (value) => {
        setFormData(prev => {
            const current = [...prev.interestTransferType];
            if (current.includes(value)) {
                return { ...prev, interestTransferType: current.filter(i => i !== value) };
            } else {
                return { ...prev, interestTransferType: [...current, value] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Interest Division Total
        const intDivTotal = formData.interestDivision.scheme + formData.interestDivision.mainWallet + formData.interestDivision.incomeWallet;
        if (Math.abs(intDivTotal - 100) > 0.1) {
            alert(`Interest Division total must be 100% (Current: ${intDivTotal}%)`);
            return;
        }

        // Validation: Maturity Division Total
        const matDivTotal = formData.maturityTransferDivision.mainWallet + formData.maturityTransferDivision.incomeWallet;
        if (Math.abs(matDivTotal - 100) > 0.1) {
            alert(`Maturity Transfer Division total must be 100% (Current: ${matDivTotal}%)`);
            return;
        }

        try {
            setSubmitting(true);
            await fdsAPI.createScheme({
                ...formData,
                minAmount: parseFloat(formData.minAmount),
                interestCalculationDays: parseInt(formData.interestCalculationDays),
                transferScheduleDays: parseInt(formData.transferScheduleDays),
                maturityDays: parseInt(formData.maturityDays),
                taxDeductionPercent: parseFloat(formData.taxDeductionPercent)
            });

            alert('Scheme created successfully!');
            loadSchemes();

            // Reset form
            setFormData({
                name: '',
                minAmount: '',
                interestCalculationDays: '',
                interestTransferType: [],
                interestDivision: { scheme: 0, mainWallet: 0, incomeWallet: 0 },
                transferScheduleDays: '',
                maturityDays: '',
                maturityTransferDivision: { mainWallet: 0, incomeWallet: 0 },
                taxDeductionPercent: ''
            });
        } catch (error) {
            console.error('Failed to create scheme', error);
            alert('Failed to create scheme: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (id, field, value) => {
        try {
            await fdsAPI.updateStatus(id, { [field]: value });
            loadSchemes(); // Reload to reflect changes
        } catch (error) {
            console.error(`Failed to update ${field}`, error);
            alert(`Failed to update ${field}`);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">FDS Scheme Master</h1>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Create Scheme Form */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Create New Scheme</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* 1. Scheme Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        {/* 2. Minimum Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Amount (₹)</label>
                            <input
                                type="number"
                                name="minAmount"
                                value={formData.minAmount}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* 3. Interest Calculation Days */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Int. Calc Days</label>
                                <input
                                    type="number"
                                    name="interestCalculationDays"
                                    value={formData.interestCalculationDays}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* 7. Transfer Schedules Day */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Schedule (Day)</label>
                                <input
                                    type="number"
                                    name="transferScheduleDays"
                                    value={formData.transferScheduleDays}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* 4. Interest Transfer Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Interest Transfer Type</label>
                            <div className="flex gap-4">
                                {['SCHEME', 'MAIN', 'INCOME'].map(type => (
                                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.interestTransferType.includes(type)}
                                            onChange={() => handleCheckboxChange(type)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-600">
                                            {type === 'SCHEME' ? 'Scheme' : type === 'MAIN' ? 'Main Wallet' : 'Income Wallet'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 5. Interest Division */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Interest Division (Total 100%)</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['scheme', 'mainWallet', 'incomeWallet'].map(field => (
                                    <div key={field}>
                                        <label className="block text-xs text-gray-500 mb-1 capitalize">
                                            {field === 'scheme' ? 'Scheme' : field === 'mainWallet' ? 'Main' : 'Income'} %
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.interestDivision[field]}
                                            onChange={(e) => handleDivisionChange('interestDivision', field, e.target.value)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 8. Maturity Days */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Maturity Days</label>
                            <input
                                type="number"
                                name="maturityDays"
                                value={formData.maturityDays}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        {/* 9. After Maturity Main Amount Transfer */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Maturity Transfer Division (Total 100%)</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['mainWallet', 'incomeWallet'].map(field => (
                                    <div key={field}>
                                        <label className="block text-xs text-gray-500 mb-1 capitalize">
                                            {field === 'mainWallet' ? 'Main Wallet' : 'Income Wallet'} %
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.maturityTransferDivision[field]}
                                            onChange={(e) => handleDivisionChange('maturityTransferDivision', field, e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 10. Tax Deduction */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Deduction (%)</label>
                            <input
                                type="number"
                                name="taxDeductionPercent"
                                value={formData.taxDeductionPercent}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            >
                                {submitting ? 'Creating Scheme...' : 'Create Scheme'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Schemes List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700">Existing Schemes</h2>
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading schemes...</div>
                    ) : schemes.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl shadow-md text-center text-gray-500">
                            No schemes found.
                        </div>
                    ) : (
                        schemes.map(scheme => (
                            <div key={scheme.schemeId} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{scheme.name}</h3>
                                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                                            ID: {scheme.schemeId}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Min Amount</p>
                                        <p className="font-bold text-gray-800">₹{scheme.minAmount.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-4">
                                    <div>Maturity: <span className="font-medium text-gray-800">{scheme.maturityDays} Days</span></div>
                                    <div>Tax Deduction: <span className="font-medium text-gray-800">{scheme.taxDeductionPercent}%</span></div>
                                    <div>Int. Calc: <span className="font-medium text-gray-800">{scheme.interestCalculationDays} Days</span></div>
                                    <div>Transfer Schedule: <span className="font-medium text-gray-800">Day {scheme.transferScheduleDays}</span></div>
                                </div>

                                <div className="border-t border-gray-100 pt-4 flex justify-between items-center bg-gray-50 -mx-6 -mb-6 px-6 py-3 mt-2 rounded-b-xl">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-500 uppercase">Status:</span>
                                        <button
                                            onClick={() => handleToggleStatus(scheme._id, 'isActive', !scheme.isActive)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${scheme.isActive
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                }`}
                                        >
                                            {scheme.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                                        </button>

                                        <button
                                            onClick={() => handleToggleStatus(scheme._id, 'isPublished', !scheme.isPublished)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${scheme.isPublished
                                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                }`}
                                        >
                                            {scheme.isPublished ? 'PUBLISHED' : 'UNPUBLISHED'}
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-400 italic">
                                        Cannot be Edited
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SchemeMaster;
