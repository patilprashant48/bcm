import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const PlatformSettings = () => {
    const [settings, setSettings] = useState({
        commission_rate: '',
        transaction_charge: '',
        processing_fee_percent: '',
        share_fluctuation_percent: '',
        auto_return_days: '',
        wallet_min_topup: '',
        wallet_max_topup: '',
        admin_bank_account: '',
        admin_ifsc: '',
        admin_upi: '',
        admin_qr_code_url: '',
        smtp_host: '',
        smtp_port: '',
        smtp_user: '',
        smtp_pass: '',
        platform_email: '',
        platform_phone: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('charges');
    const [saved, setSaved] = useState(false);

    useEffect(() => { loadSettings(); }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getSettings();
            if (response.data.settings) {
                setSettings(prev => ({ ...prev, ...response.data.settings }));
            }
        } catch (err) {
            console.error('Failed to load settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await adminAPI.updateSettings(settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            alert('Failed to save settings: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

    const sections = [
        { id: 'charges', label: 'Commission & Charges', icon: '💰' },
        { id: 'wallet', label: 'Wallet Rules', icon: '👛' },
        { id: 'payment', label: 'Payment Methods', icon: '🏦' },
        { id: 'email', label: 'Email Config', icon: '📧' },
        { id: 'contact', label: 'Contact Info', icon: '📞' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Settings & Charges Control</h1>
                    <p className="text-gray-500 mt-1">Global platform configuration — applied to all users</p>
                </div>
                {saved && (
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2">
                        ✓ Settings saved successfully!
                    </div>
                )}
            </div>

            <div className="flex gap-6">
                {/* Sidebar */}
                <div className="w-56 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-md p-3 space-y-1 sticky top-24">
                        {sections.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSection(s.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeSection === s.id
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <span>{s.icon}</span>
                                <span>{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <form onSubmit={handleSave}>
                        {/* Commission & Charges */}
                        {activeSection === 'charges' && (
                            <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    💰 Commission & Charges
                                </h2>
                                <p className="text-sm text-gray-500">These rates are applied globally to all users and transactions.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        {
                                            key: 'commission_rate',
                                            label: 'Commission Rate (%)',
                                            desc: 'Applied to all investment transactions',
                                            placeholder: 'e.g., 2',
                                            icon: '📊',
                                        },
                                        {
                                            key: 'transaction_charge',
                                            label: 'Transaction Charge (%)',
                                            desc: 'Fee charged per wallet transaction',
                                            placeholder: 'e.g., 0.5',
                                            icon: '💳',
                                        },
                                        {
                                            key: 'processing_fee_percent',
                                            label: 'Loan Processing Fee (%)',
                                            desc: 'Auto-deducted on loan approval',
                                            placeholder: 'e.g., 1',
                                            icon: '🏦',
                                        },
                                        {
                                            key: 'share_fluctuation_percent',
                                            label: 'Share Fluctuation Limit (%)',
                                            desc: 'Max daily price change allowed',
                                            placeholder: 'e.g., 5',
                                            icon: '📈',
                                        },
                                        {
                                            key: 'auto_return_days',
                                            label: 'Auto-Return Days',
                                            desc: 'Days before auto-return is triggered',
                                            placeholder: 'e.g., 30',
                                            icon: '🔄',
                                        },
                                    ].map(field => (
                                        <div key={field.key} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xl">{field.icon}</span>
                                                <label className="text-sm font-semibold text-gray-700">{field.label}</label>
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={settings[field.key]}
                                                onChange={e => update(field.key, e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                                                placeholder={field.placeholder}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">{field.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Preview */}
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                    <h3 className="font-semibold text-blue-800 mb-3">📊 Charges Preview (on ₹1,00,000 transaction)</h3>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-xs text-gray-500">Commission</p>
                                            <p className="text-lg font-bold text-blue-700">
                                                ₹{((settings.commission_rate || 0) * 1000).toFixed(0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Transaction Fee</p>
                                            <p className="text-lg font-bold text-purple-700">
                                                ₹{((settings.transaction_charge || 0) * 1000).toFixed(0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Total Deducted</p>
                                            <p className="text-lg font-bold text-red-600">
                                                ₹{(((Number(settings.commission_rate) || 0) + (Number(settings.transaction_charge) || 0)) * 1000).toFixed(0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Wallet Rules */}
                        {activeSection === 'wallet' && (
                            <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    👛 Wallet Rules
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { key: 'wallet_min_topup', label: 'Minimum Top-Up Amount (₹)', placeholder: 'e.g., 500' },
                                        { key: 'wallet_max_topup', label: 'Maximum Top-Up Amount (₹)', placeholder: 'e.g., 500000' },
                                    ].map(field => (
                                        <div key={field.key}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                                            <input
                                                type="number"
                                                value={settings[field.key]}
                                                onChange={e => update(field.key, e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                placeholder={field.placeholder}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Payment Methods */}
                        {activeSection === 'payment' && (
                            <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    🏦 Payment Methods
                                </h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { key: 'admin_bank_account', label: 'Bank Account Number', type: 'text', placeholder: 'Enter account number' },
                                            { key: 'admin_ifsc', label: 'IFSC Code', type: 'text', placeholder: 'e.g., HDFC0001234' },
                                        ].map(field => (
                                            <div key={field.key}>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                                                <input
                                                    type={field.type}
                                                    value={settings[field.key]}
                                                    onChange={e => update(field.key, e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    placeholder={field.placeholder}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Admin UPI ID</label>
                                        <input
                                            type="text"
                                            value={settings.admin_upi}
                                            onChange={e => update('admin_upi', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="e.g., admin@upi"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">QR Code URL</label>
                                        <input
                                            type="url"
                                            value={settings.admin_qr_code_url}
                                            onChange={e => update('admin_qr_code_url', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="https://example.com/qr.png"
                                        />
                                        {settings.admin_qr_code_url && (
                                            <div className="mt-3 p-4 bg-gray-50 rounded-lg inline-block">
                                                <p className="text-sm text-gray-600 mb-2">QR Preview:</p>
                                                <img src={settings.admin_qr_code_url} alt="QR" className="w-40 h-40 object-contain border rounded" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Email Config */}
                        {activeSection === 'email' && (
                            <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    📧 Email Configuration
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { key: 'smtp_host', label: 'SMTP Host', type: 'text', placeholder: 'smtp.gmail.com' },
                                        { key: 'smtp_port', label: 'SMTP Port', type: 'number', placeholder: '587' },
                                        { key: 'smtp_user', label: 'SMTP Username', type: 'text', placeholder: 'your@email.com' },
                                        { key: 'smtp_pass', label: 'SMTP Password', type: 'password', placeholder: '••••••••' },
                                    ].map(field => (
                                        <div key={field.key}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                                            <input
                                                type={field.type}
                                                value={settings[field.key]}
                                                onChange={e => update(field.key, e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                placeholder={field.placeholder}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contact Info */}
                        {activeSection === 'contact' && (
                            <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    📞 Contact Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Platform Email</label>
                                        <input
                                            type="email"
                                            value={settings.platform_email}
                                            onChange={e => update('platform_email', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="contact@bcm.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Platform Phone</label>
                                        <input
                                            type="tel"
                                            value={settings.platform_phone}
                                            onChange={e => update('platform_phone', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                type="button"
                                onClick={loadSettings}
                                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition disabled:opacity-50 shadow-md"
                            >
                                {saving ? '⏳ Saving...' : '💾 Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PlatformSettings;
