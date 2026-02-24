import { useState, useEffect } from 'react';
import { fdsAPI } from '../../services/api';

const EMPTY_FORM = {
    name: '',
    minAmount: '',
    interestPercent: '',
    interestCalculationDays: '',
    interestTransferType: [],
    interestDivision: { scheme: 0, mainWallet: 0, incomeWallet: 0 },
    transferScheduleDays: '',
    maturityDays: '',
    maturityTransferDivision: { mainWallet: 50, incomeWallet: 50 },
    taxDeductionPercent: 0,
};

const TRANSFER_TYPES = [
    { key: 'SCHEME',  label: 'Scheme Wallet' },
    { key: 'MAIN',    label: 'Main Wallet'   },
    { key: 'INCOME',  label: 'Income Wallet' },
];

// â”€â”€ Detail/View Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ViewModal = ({ scheme, onClose }) => {
    if (!scheme) return null;
    const row = (label, value) => (
        <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-semibold text-gray-800">{value}</span>
        </div>
    );
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 rounded-t-2xl flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-white">{scheme.name}</h2>
                        <p className="text-blue-100 text-sm font-mono mt-1">ID: {scheme.schemeId}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-blue-200 text-2xl leading-none">Ã—</button>
                </div>
                <div className="p-6 space-y-1">
                    {row('Minimum Amount', `â‚¹${(scheme.minAmount || 0).toLocaleString()}`)}
                    {row('Interest Rate', `${scheme.interestPercent ?? 0}%`)}
                    {row('Interest Calc Days', `${scheme.interestCalculationDays} days`)}
                    {row('Transfer Schedule', `Day ${scheme.transferScheduleDays}`)}
                    {row('Maturity Days', `${scheme.maturityDays} days`)}
                    {row('Tax Deduction', `${scheme.taxDeductionPercent ?? 0}%`)}

                    <div className="pt-3">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Interest Transfer Type</p>
                        <div className="flex gap-2 flex-wrap">
                            {(scheme.interestTransferType || []).map(t => (
                                <span key={t} className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    {t === 'SCHEME' ? 'Scheme Wallet' : t === 'MAIN' ? 'Main Wallet' : 'Income Wallet'}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="pt-3">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Interest Division</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[['Scheme', scheme.interestDivision?.scheme], ['Main Wallet', scheme.interestDivision?.mainWallet], ['Income Wallet', scheme.interestDivision?.incomeWallet]].map(([l, v]) => (
                                <div key={l} className="bg-blue-50 rounded-lg p-2 text-center">
                                    <p className="text-xs text-gray-500">{l}</p>
                                    <p className="font-bold text-blue-700">{v ?? 0}%</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-3">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">After Maturity â€” Main Amount Transfer</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[['Main Wallet', scheme.maturityTransferDivision?.mainWallet], ['Income Wallet', scheme.maturityTransferDivision?.incomeWallet]].map(([l, v]) => (
                                <div key={l} className="bg-green-50 rounded-lg p-2 text-center">
                                    <p className="text-xs text-gray-500">{l}</p>
                                    <p className="font-bold text-green-700">{v ?? 0}%</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${scheme.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {scheme.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${scheme.isPublished ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
                            {scheme.isPublished ? 'PUBLISHED' : 'UNPUBLISHED'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// â”€â”€ Create Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CreateModal = ({ onClose, onCreated }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
    const setDiv = (group, field, raw) => {
        const val = parseFloat(raw) || 0;
        setForm(f => ({ ...f, [group]: { ...f[group], [field]: val } }));
    };
    const toggleType = (key) => {
        setForm(f => {
            const cur = [...f.interestTransferType];
            return { ...f, interestTransferType: cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key] };
        });
    };

    const intDivTotal = form.interestDivision.scheme + form.interestDivision.mainWallet + form.interestDivision.incomeWallet;
    const matDivTotal = form.maturityTransferDivision.mainWallet + form.maturityTransferDivision.incomeWallet;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback(null);
        if (form.interestTransferType.length === 0) {
            setFeedback({ type: 'error', msg: 'Select at least one Interest Transfer Type.' });
            return;
        }
        if (Math.abs(intDivTotal - 100) > 0.01) {
            setFeedback({ type: 'error', msg: `Interest Division must total 100% (currently ${intDivTotal.toFixed(1)}%).` });
            return;
        }
        if (Math.abs(matDivTotal - 100) > 0.01) {
            setFeedback({ type: 'error', msg: `Maturity Transfer Division must total 100% (currently ${matDivTotal.toFixed(1)}%).` });
            return;
        }
        try {
            setSubmitting(true);
            await fdsAPI.createScheme({
                name: form.name,
                minAmount: parseFloat(form.minAmount),
                interestPercent: parseFloat(form.interestPercent),
                interestCalculationDays: parseInt(form.interestCalculationDays),
                interestTransferType: form.interestTransferType,
                interestDivision: form.interestDivision,
                transferScheduleDays: parseInt(form.transferScheduleDays),
                maturityDays: parseInt(form.maturityDays),
                maturityTransferDivision: form.maturityTransferDivision,
                taxDeductionPercent: parseFloat(form.taxDeductionPercent) || 0,
            });
            setFeedback({ type: 'success', msg: 'âœ“ Scheme created successfully!' });
            onCreated();
            setTimeout(onClose, 1200);
        } catch (err) {
            setFeedback({ type: 'error', msg: err.response?.data?.message || err.message });
            setSubmitting(false);
        }
    };

    const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';
    const lbl = 'block text-sm font-medium text-gray-700 mb-1';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 rounded-t-2xl flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Create FDS Scheme</h2>
                        <p className="text-blue-100 text-sm">Scheme ID will be auto-generated</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-blue-200 text-2xl leading-none">Ã—</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* 1. Scheme Name */}
                    <div>
                        <label className={lbl}>1. Scheme Name</label>
                        <input type="text" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Gold FD Scheme" className={inp} />
                    </div>

                    {/* 2. Min Amount + Interest Rate */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={lbl}>2. Minimum Amount (â‚¹)</label>
                            <input type="number" min="0" required value={form.minAmount} onChange={e => set('minAmount', e.target.value)} placeholder="10000" className={inp} />
                        </div>
                        <div>
                            <label className={lbl}>Interest Rate (%)</label>
                            <input type="number" min="0" max="100" step="0.01" required value={form.interestPercent} onChange={e => set('interestPercent', e.target.value)} placeholder="12.5" className={inp} />
                        </div>
                    </div>

                    {/* 3. Calc Days + Schedule + Maturity */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className={lbl}>3. Interest Calc Days</label>
                            <input type="number" min="1" required value={form.interestCalculationDays} onChange={e => set('interestCalculationDays', e.target.value)} placeholder="30" className={inp} />
                        </div>
                        <div>
                            <label className={lbl}>7. Transfer Schedule Day</label>
                            <input type="number" min="1" required value={form.transferScheduleDays} onChange={e => set('transferScheduleDays', e.target.value)} placeholder="1" className={inp} />
                        </div>
                        <div>
                            <label className={lbl}>8. Maturity Days</label>
                            <input type="number" min="1" required value={form.maturityDays} onChange={e => set('maturityDays', e.target.value)} placeholder="365" className={inp} />
                        </div>
                    </div>

                    {/* 4. Interest Transfer Type */}
                    <div className="bg-blue-50 rounded-xl p-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">4. Interest Transfer Type</label>
                        <div className="flex flex-wrap gap-6">
                            {TRANSFER_TYPES.map(({ key, label }) => (
                                <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={form.interestTransferType.includes(key)}
                                        onChange={() => toggleType(key)}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 5. Interest Division */}
                    <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-semibold text-gray-700">5. Interest Division (%)</label>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${Math.abs(intDivTotal - 100) < 0.01 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                Total: {intDivTotal.toFixed(1)}% {Math.abs(intDivTotal - 100) < 0.01 ? 'âœ“' : 'â€” must be 100%'}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { field: 'scheme',      label: '% in Scheme Wallet'  },
                                { field: 'mainWallet',  label: '% Main Wallet'       },
                                { field: 'incomeWallet',label: '% Income Wallet'     },
                            ].map(({ field, label }) => (
                                <div key={field}>
                                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                                    <input type="number" min="0" max="100" step="0.01"
                                        value={form.interestDivision[field]}
                                        onChange={e => setDiv('interestDivision', field, e.target.value)}
                                        className={inp}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 9. After Maturity Transfer */}
                    <div className="bg-green-50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-semibold text-gray-700">9. After Maturity â€” Main Amount Transfer (%)</label>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${Math.abs(matDivTotal - 100) < 0.01 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                Total: {matDivTotal.toFixed(1)}% {Math.abs(matDivTotal - 100) < 0.01 ? 'âœ“' : 'â€” must be 100%'}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { field: 'mainWallet',  label: '% Main Wallet'   },
                                { field: 'incomeWallet',label: '% Income Wallet' },
                            ].map(({ field, label }) => (
                                <div key={field}>
                                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                                    <input type="number" min="0" max="100" step="0.01"
                                        value={form.maturityTransferDivision[field]}
                                        onChange={e => setDiv('maturityTransferDivision', field, e.target.value)}
                                        className={inp}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 10. Tax Deduction */}
                    <div>
                        <label className={lbl}>10. Tax Deduction on Interest Amount (%)</label>
                        <input type="number" min="0" max="100" step="0.01"
                            value={form.taxDeductionPercent}
                            onChange={e => set('taxDeductionPercent', e.target.value)}
                            placeholder="10"
                            className={inp}
                        />
                        <p className="text-xs text-gray-400 mt-1">This % will be deducted from the interest amount as tax</p>
                    </div>

                    {feedback && (
                        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${feedback.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                            {feedback.msg}
                        </div>
                    )}

                    <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:opacity-50 shadow-sm">
                            {submitting ? 'Creatingâ€¦' : 'âœ“ Create Scheme'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SchemeMaster = () => {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [viewScheme, setViewScheme] = useState(null);
    const [toggling, setToggling] = useState({});

    const [formData, setFormData] = useState({
        name: '',
        minAmount: '',
        interestPercent: '',
        interestCalculationDays: '',
        interestTransferType: [], // ['SCHEME', 'MAIN', 'INCOME']
        interestDivision: { scheme: 0, mainWallet: 0, incomeWallet: 0 },
        transferScheduleDays: '',
        maturityDays: '',
        maturityTransferDivision: { mainWallet: 0, incomeWallet: 0 },
        taxDeductionPercent: ''
    });

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

    useEffect(() => {
        loadSchemes();
    }, []);

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
                interestPercent: parseFloat(formData.interestPercent),
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
                interestPercent: '',
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

    const handleToggle = async (id, field, newValue) => {
        setToggling(t => ({ ...t, [`${id}_${field}`]: true }));
        try {
            await fdsAPI.updateStatus(id, { [field]: newValue });
            setSchemes(prev => prev.map(s => s._id === id ? { ...s, [field]: newValue } : s));
        } catch (err) {
            console.error('Toggle failed', err);
        } finally {
            setToggling(t => ({ ...t, [`${id}_${field}`]: false }));
        }
    };

    return (
        <div>
            {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={loadSchemes} />}
            {viewScheme && <ViewModal scheme={viewScheme} onClose={() => setViewScheme(null)} />}

            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">FDS â€” Scheme Master</h1>
                    <p className="text-gray-500 mt-1">Manage Fixed Deposit Schemes</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition flex items-center gap-2"
                >
                    <span className="text-lg">+</span> New Scheme
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : schemes.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-16 text-center">
                    <div className="text-7xl mb-4">ðŸ“‹</div>
                    <p className="text-xl text-gray-600 font-medium">No schemes yet</p>
                    <p className="text-gray-400 mt-1">Click "New Scheme" to create your first FDS scheme</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {['#', 'Scheme ID', 'Scheme Name', 'Min Amount', 'Interest %', 'Maturity Days', 'Tax %', 'Active', 'Published', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {schemes.map((s, idx) => (
                                <tr key={s._id || s.schemeId} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                                    <td className="px-4 py-3 text-xs font-mono text-blue-700 font-semibold whitespace-nowrap">{s.schemeId}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{s.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">â‚¹{(s.minAmount || 0).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-blue-600 font-semibold">{s.interestPercent ?? 0}%</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{s.maturityDays} days</td>
                                    <td className="px-4 py-3 text-sm text-orange-600 font-medium">{s.taxDeductionPercent ?? 0}%</td>

                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleToggle(s._id, 'isActive', !s.isActive)}
                                            disabled={!!toggling[`${s._id}_isActive`]}
                                            title={s.isActive ? 'Click to Deactivate' : 'Click to Activate'}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all disabled:opacity-60 ${s.isActive ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700'}`}
                                        >
                                            {toggling[`${s._id}_isActive`] ? 'â€¦' : s.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </button>
                                    </td>

                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleToggle(s._id, 'isPublished', !s.isPublished)}
                                            disabled={!!toggling[`${s._id}_isPublished`]}
                                            title={s.isPublished ? 'Click to Unpublish' : 'Click to Publish'}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all disabled:opacity-60 ${s.isPublished ? 'bg-blue-100 text-blue-700 hover:bg-gray-100 hover:text-gray-700' : 'bg-gray-200 text-gray-600 hover:bg-blue-100 hover:text-blue-700'}`}
                                        >
                                            {toggling[`${s._id}_isPublished`] ? 'â€¦' : s.isPublished ? 'PUBLISHED' : 'UNPUBLISHED'}
                                        </button>
                                    </td>

                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setViewScheme(s)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition shadow-sm"
                                        >
                                            ðŸ‘ View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
                âš  Schemes <strong>cannot be edited or deleted</strong> once created. Use Active / Published toggles to control visibility.
            </div>
        </div>
    );
};

export default SchemeMaster;
