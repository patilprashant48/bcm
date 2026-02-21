import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const LegalTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [formData, setFormData] = useState({ templateName: '', documentType: 'AGREEMENT', templateContent: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { loadTemplates(); }, []);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getLegalTemplates();
            setTemplates(response.data.templates || []);
        } catch (err) {
            console.error('Failed to load templates:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            if (editingTemplate) {
                await adminAPI.updateLegalTemplate(editingTemplate._id || editingTemplate.id, formData);
                alert('Template updated successfully!');
            } else {
                await adminAPI.createLegalTemplate(formData);
                alert('Template created successfully!');
            }
            setShowModal(false);
            setEditingTemplate(null);
            setFormData({ templateName: '', documentType: 'AGREEMENT', templateContent: '' });
            loadTemplates();
        } catch (err) {
            alert('Failed to save template: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            await adminAPI.deleteLegalTemplate(id);
            loadTemplates();
        } catch (err) {
            alert('Failed to delete: ' + err.message);
        }
    };

    const handleEdit = (tpl) => {
        setEditingTemplate(tpl);
        setFormData({
            templateName: tpl.templateName || tpl.title,
            documentType: tpl.documentType || tpl.type,
            templateContent: tpl.templateContent || tpl.content
        });
        setShowModal(true);
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'AGREEMENT': return '📄 Agreement';
            case 'NDA': return '🔒 NDA';
            case 'TERMS': return '📜 Terms';
            default: return '📁 Other';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Legal Documents</h1>
                    <p className="text-gray-500 mt-1">Manage standard legal templates and contracts</p>
                </div>
                <button
                    onClick={() => {
                        setEditingTemplate(null);
                        setFormData({ templateName: '', documentType: 'AGREEMENT', templateContent: '' });
                        setShowModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                    <span>➕</span> Add New Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(tpl => (
                    <div key={tpl._id || tpl.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all border border-gray-100 group">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${(tpl.documentType || tpl.type) === 'AGREEMENT' ? 'bg-blue-100 text-blue-800' :
                                        (tpl.documentType || tpl.type) === 'NDA' ? 'bg-purple-100 text-purple-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {getTypeLabel(tpl.documentType || tpl.type)}
                                </span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(tpl)} className="text-gray-400 hover:text-blue-600">✎</button>
                                    <button onClick={() => handleDelete(tpl._id || tpl.id)} className="text-gray-400 hover:text-red-600">🗑</button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{tpl.templateName || tpl.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-3 mb-4 font-mono bg-gray-50 p-3 rounded-lg border border-gray-100">
                                {tpl.templateContent || tpl.content}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                                <span>Last updated: {new Date(tpl.updatedAt || tpl.lastUpdated).toLocaleDateString()}</span>
                                <span className="text-green-600 font-medium">Active</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Placeholder */}
                {templates.length === 0 && (
                    <div className="col-span-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                        <div className="text-5xl text-gray-300 mb-4">📄</div>
                        <p className="text-gray-500 font-medium">No templates found. Create your first one!</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Template Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.templateName}
                                    onChange={e => setFormData({ ...formData, templateName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="e.g., Standard Service Agreement"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                                <select
                                    value={formData.documentType}
                                    onChange={e => setFormData({ ...formData, documentType: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                                >
                                    <option value="AGREEMENT">Agreement</option>
                                    <option value="NDA">Non-Disclosure Agreement (NDA)</option>
                                    <option value="TERMS">Terms & Conditions</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Template Content</label>
                                <textarea
                                    required
                                    value={formData.templateContent}
                                    onChange={e => setFormData({ ...formData, templateContent: e.target.value })}
                                    rows="10"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                                    placeholder="Paste your legal text here..."
                                />
                                <p className="text-xs text-gray-500 mt-1">Supports plain text for now.</p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : 'Save Template'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LegalTemplates;
