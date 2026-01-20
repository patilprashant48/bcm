import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const PlatformSettings = () => {
    const [settings, setSettings] = useState({
        commission_rate: '',
        admin_bank_account: '',
        admin_ifsc: '',
        admin_upi: '',
        admin_qr_code_url: '',
        smtp_host: '',
        smtp_port: '',
        smtp_user: '',
        smtp_pass: '',
        max_file_size: '',
        platform_email: '',
        platform_phone: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getPlatformSettings();
            setSettings(response.data.settings || settings);
        } catch (error) {
            console.error('Failed to load settings:', error);
            setError('Failed to load platform settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            await adminAPI.updatePlatformSettings(settings);
            alert('Settings updated successfully!');
        } catch (error) {
            console.error('Failed to update settings:', error);
            alert('Failed to update settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="text-xl text-gray-600">Loading settings...</div></div>;
    }

    if (error) {
        return <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-800">{error}</p></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Platform Settings</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Commission Settings */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>💰</span> Commission & Fees
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Default Commission Rate (%)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={settings.commission_rate}
                                onChange={(e) => setSettings({ ...settings, commission_rate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 2"
                            />
                            <p className="text-xs text-gray-500 mt-1">Applied to all transactions</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max File Size (MB)
                            </label>
                            <input
                                type="number"
                                value={settings.max_file_size}
                                onChange={(e) => setSettings({ ...settings, max_file_size: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 5"
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>🏦</span> Payment Methods
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Admin Bank Account Number
                                </label>
                                <input
                                    type="text"
                                    value={settings.admin_bank_account}
                                    onChange={(e) => setSettings({ ...settings, admin_bank_account: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter bank account number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    IFSC Code
                                </label>
                                <input
                                    type="text"
                                    value={settings.admin_ifsc}
                                    onChange={(e) => setSettings({ ...settings, admin_ifsc: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter IFSC code"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin UPI ID
                            </label>
                            <input
                                type="text"
                                value={settings.admin_upi}
                                onChange={(e) => setSettings({ ...settings, admin_upi: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., admin@upi"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                QR Code URL
                            </label>
                            <input
                                type="url"
                                value={settings.admin_qr_code_url}
                                onChange={(e) => setSettings({ ...settings, admin_qr_code_url: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="https://example.com/qr-code.png"
                            />
                            {settings.admin_qr_code_url && (
                                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">QR Code Preview:</p>
                                    <img
                                        src={settings.admin_qr_code_url}
                                        alt="QR Code"
                                        className="w-48 h-48 object-contain border border-gray-200 rounded"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Email Configuration */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>📧</span> Email Configuration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                SMTP Host
                            </label>
                            <input
                                type="text"
                                value={settings.smtp_host}
                                onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., smtp.gmail.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                SMTP Port
                            </label>
                            <input
                                type="number"
                                value={settings.smtp_port}
                                onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 587"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                SMTP Username
                            </label>
                            <input
                                type="text"
                                value={settings.smtp_user}
                                onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                SMTP Password
                            </label>
                            <input
                                type="password"
                                value={settings.smtp_pass}
                                onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>📞</span> Contact Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Platform Email
                            </label>
                            <input
                                type="email"
                                value={settings.platform_email}
                                onChange={(e) => setSettings({ ...settings, platform_email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="contact@bcm.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Platform Phone
                            </label>
                            <input
                                type="tel"
                                value={settings.platform_phone}
                                onChange={(e) => setSettings({ ...settings, platform_phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="+91 1234567890"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={loadSettings}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg transition-colors duration-200 font-medium"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PlatformSettings;
