import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', imageUrl: '', linkUrl: '', position: 'HERO', isActive: true });

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getBanners();
            setBanners(res.data.banners || []);
        } catch (error) {
            console.error('Failed to load banners', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;
        try {
            await adminAPI.deleteBanner(id);
            alert('Banner deleted successfully');
            loadBanners();
        } catch (error) {
            alert('Failed to delete banner');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.createBanner(formData);
            alert('Banner created successfully');
            setShowModal(false);
            setFormData({ title: '', imageUrl: '', linkUrl: '', position: 'HERO', isActive: true });
            loadBanners();
        } catch (error) {
            alert('Failed to create banner');
        }
    };

    if (loading && banners.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Promotional Banners</h1>
                    <p className="text-gray-600">Manage promotional banners for mobile and web apps.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition"
                >
                    + Add New Banner
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                    <div key={banner._id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
                        <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                            <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL'; }} />
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg text-gray-800 mb-1">{banner.title}</h3>
                            <div className="flex gap-2 mb-4">
                                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">Position: {banner.position}</span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${banner.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {banner.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            {banner.linkUrl && (
                                <p className="text-sm text-gray-500 mb-4 truncate" title={banner.linkUrl}>
                                    Link: <a href={banner.linkUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{banner.linkUrl}</a>
                                </p>
                            )}
                            <div className="mt-auto">
                                <button
                                    onClick={() => handleDelete(banner._id)}
                                    className="w-full text-red-600 border border-red-200 hover:bg-red-50 py-2 rounded-lg transition font-medium"
                                >
                                    Delete Banner
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {banners.length === 0 && (
                    <div className="col-span-full bg-white p-8 rounded-xl shadow-md text-center text-gray-500">
                        No banners exist yet. Create one to display it on the platform!
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Add New Banner</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800 text-xl">&times;</button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text" required value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Summer Offer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="url" required value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (Optional)</label>
                                <input
                                    type="url" value={formData.linkUrl}
                                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                <select
                                    value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="HERO">Hero (Top)</option>
                                    <option value="SIDEBAR">Sidebar</option>
                                    <option value="FOOTER">Footer</option>
                                </select>
                            </div>
                            <div className="flex items-center mt-2">
                                <input
                                    type="checkbox" id="isActive" checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Make Active Now</label>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition">
                                    Save Banner
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Banners;
