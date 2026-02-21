import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', message: '', priority: 'MEDIUM', targetAudience: 'BUSINESS_USER', isActive: true });

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getAnnouncements();
            setAnnouncements(res.data.announcements || []);
        } catch (error) {
            console.error('Failed to load announcements', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await adminAPI.deleteAnnouncement(id);
            alert('Announcement deleted successfully');
            loadAnnouncements();
        } catch (error) {
            alert('Failed to delete announcement');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.createAnnouncement(formData);
            alert('Announcement created successfully');
            setShowModal(false);
            setFormData({ title: '', message: '', priority: 'MEDIUM', targetAudience: 'BUSINESS_USER', isActive: true });
            loadAnnouncements();
        } catch (error) {
            alert('Failed to create announcement');
        }
    };

    if (loading && announcements.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Announcements</h1>
                    <p className="text-gray-600">Broadcast important messages to users.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 font-medium transition"
                >
                    + New Announcement
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                                <th className="p-4 font-medium">Date Created</th>
                                <th className="p-4 font-medium">Details</th>
                                <th className="p-4 font-medium">Audience / Priority</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {announcements.map((ann) => (
                                <tr key={ann._id} className="hover:bg-gray-50">
                                    <td className="p-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(ann.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-800">{ann.title}</p>
                                        <p className="text-sm text-gray-500 line-clamp-2">{ann.message}</p>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium mr-2">
                                            {ann.targetAudience}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${ann.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                                ann.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {ann.priority}
                                        </span>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className={`text-xs font-bold ${ann.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                            {ann.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(ann._id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {announcements.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No announcements found. Push a new announcement!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">New Announcement</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800 text-xl">&times;</button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text" required value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                                    placeholder="e.g. Server Maintenance"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    required rows="4" value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                                    placeholder="Enter full details..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                        value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                                    <select
                                        value={formData.targetAudience} onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="BUSINESS_USER">Business Users</option>
                                        <option value="INVESTOR">Investors</option>
                                        <option value="ADMIN">Admins Only</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center mt-2">
                                <input
                                    type="checkbox" id="isActive" checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="h-4 w-4 text-yellow-600 border-gray-300 rounded"
                                />
                                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Publish Immediately</label>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-yellow-600 text-white font-medium py-3 rounded-lg hover:bg-yellow-700 transition">
                                    Broadcast Announcement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Announcements;
