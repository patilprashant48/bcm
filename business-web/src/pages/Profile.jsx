import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { businessAPI } from '../services/api';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        business_name: '',
        owner_name: '',
        mobile: '',
        address: '',
        pan_number: '',
        gst_number: '',
        bank_account: '',
        ifsc_code: '',
        bank_name: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                business_name: user.business_name || '',
                owner_name: user.owner_name || '',
                mobile: user.mobile || '',
                address: user.address || '',
                pan_number: user.pan_number || '',
                gst_number: user.gst_number || '',
                bank_account: user.bank_account || '',
                ifsc_code: user.ifsc_code || '',
                bank_name: user.bank_name || '',
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await businessAPI.updateProfile(formData);
            updateUser(response.data.user);
            alert('Profile updated successfully!');
            setEditing(false);
        } catch (error) {
            alert('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Business Profile</h1>
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-medium"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-md p-8">
                <form onSubmit={handleSubmit}>
                    {/* Business Information */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Business Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                                <input
                                    type="text"
                                    disabled={!editing}
                                    value={formData.business_name}
                                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name</label>
                                <input
                                    type="text"
                                    disabled={!editing}
                                    value={formData.owner_name}
                                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                                <input
                                    type="tel"
                                    disabled={!editing}
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    disabled
                                    value={user?.email || ''}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <textarea
                                    disabled={!editing}
                                    rows="2"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tax Information */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Tax Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                                <input
                                    type="text"
                                    disabled={!editing}
                                    value={formData.pan_number}
                                    onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                                <input
                                    type="text"
                                    disabled={!editing}
                                    value={formData.gst_number}
                                    onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Banking Information */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Banking Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
                                <input
                                    type="text"
                                    disabled={!editing}
                                    value={formData.bank_account}
                                    onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                                <input
                                    type="text"
                                    disabled={!editing}
                                    value={formData.ifsc_code}
                                    onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                                <input
                                    type="text"
                                    disabled={!editing}
                                    value={formData.bank_name}
                                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {editing && (
                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditing(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Profile;
