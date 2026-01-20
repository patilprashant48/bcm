import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'ADMIN',
        permissions: [],
    });

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        try {
            const response = await adminAPI.getAdmins();
            setAdmins(response.data.admins || []);
        } catch (error) {
            console.error('Failed to load admins:', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.createAdmin(formData);
            alert('Admin created successfully!');
            setShowModal(false);
            setFormData({ name: '', email: '', role: 'ADMIN', permissions: [] });
            loadAdmins();
        } catch (error) {
            alert('Failed to create admin');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await adminAPI.updateAdminStatus(id, { status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
            loadAdmins();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const permissions = [
        'MANAGE_USERS',
        'MANAGE_PROJECTS',
        'MANAGE_PAYMENTS',
        'MANAGE_PLANS',
        'VIEW_REPORTS',
        'MANAGE_ADMINS',
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Admin Management</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-medium"
                >
                    + Add Admin
                </button>
            </div>

            {/* Admins Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {admins.map((admin) => (
                            <tr key={admin.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-800">{admin.name}</td>
                                <td className="px-6 py-4 text-gray-600">{admin.email}</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                        {admin.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${admin.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {admin.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {new Date(admin.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleToggleStatus(admin.id, admin.status)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                                    >
                                        {admin.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Admin</h2>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ADMIN">Admin</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                    <option value="MODERATOR">Moderator</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                                <div className="space-y-2">
                                    {permissions.map((perm) => (
                                        <label key={perm} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.includes(perm)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({ ...formData, permissions: [...formData.permissions, perm] });
                                                    } else {
                                                        setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm) });
                                                    }
                                                }}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700">{perm.replace(/_/g, ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
                                >
                                    Create Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;
