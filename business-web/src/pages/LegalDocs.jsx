import { useState, useEffect } from 'react';
import { legalAPI } from '../services/api';

const LegalDocs = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const res = await legalAPI.getTemplates();
            if (res.data.success) {
                setTemplates(res.data.templates || []);
            }
        } catch (error) {
            console.error('Failed to load legal templates:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Legal Documents</h1>
                    <p className="text-gray-600 mt-2">Access standard legal templates and agreements</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((tpl) => (
                    <div
                        key={tpl._id}
                        className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => setSelectedTemplate(tpl)}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tpl.documentType === 'NDA' ? 'bg-purple-100 text-purple-700' :
                                        tpl.documentType === 'AGREEMENT' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {tpl.documentType || 'TEMPLATE'}
                                </span>
                                <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Details →
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{tpl.templateName}</h3>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                {tpl.templateContent}
                            </p>
                            <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
                                <span>Updated: {new Date(tpl.updatedAt).toLocaleDateString()}</span>
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">Verified</span>
                            </div>
                        </div>
                    </div>
                ))}

                {templates.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                        <div className="text-6xl mb-4">📄</div>
                        <h3 className="text-xl font-medium text-gray-800">No legal templates available</h3>
                        <p className="text-gray-500 mt-2">Standard legal documents will appear here once added by the administrator.</p>
                    </div>
                )}
            </div>

            {/* Template Preview Modal */}
            {selectedTemplate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{selectedTemplate.templateName}</h2>
                                <p className="text-sm text-gray-500">Type: {selectedTemplate.documentType}</p>
                            </div>
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-1 font-serif text-gray-800 leading-relaxed bg-gray-50">
                            <div className="bg-white p-12 shadow-sm rounded-lg whitespace-pre-wrap min-h-full">
                                {selectedTemplate.templateContent}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all active:scale-95"
                            >
                                Print / Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LegalDocs;
