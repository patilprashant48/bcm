import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

// v2 — uses getProjectsByStatus('LIVE') for correct field mapping
const LiveProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [closingId, setClosingId] = useState(null);
    const [closeReason, setCloseReason] = useState({});
    const [feedback, setFeedback] = useState({});

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getProjectsByStatus('LIVE');
            setProjects(response.data.projects || []);
        } catch (error) {
            console.error('Failed to load projects:', error);
            setError('Failed to load live projects');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseProject = async (id) => {
        const reason = closeReason[id]?.trim();
        if (!reason) {
            setFeedback(f => ({ ...f, [id]: { type: 'error', msg: 'Enter a reason first.' } }));
            return;
        }
        try {
            setClosingId(id);
            await adminAPI.closeProject(id, { reason });
            setFeedback(f => ({ ...f, [id]: { type: 'success', msg: 'Project closed.' } }));
            setTimeout(loadProjects, 900);
        } catch (error) {
            console.error('Failed to close project:', error);
            setFeedback(f => ({ ...f, [id]: { type: 'error', msg: 'Failed to close. Try again.' } }));
        } finally {
            setClosingId(null);
        }
    };

    const filteredProjects = projects.filter(project => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (project.project_name || '').toLowerCase().includes(term) ||
               (project.business_name || '').toLowerCase().includes(term);
    });

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="text-xl text-gray-600">Loading...</div></div>;
    }

    if (error) {
        return <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-800">{error}</p></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Live Projects</h1>
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold shadow-sm">
                    {filteredProjects.length} Live
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by project or business name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {filteredProjects.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <p className="text-xl text-gray-600">No live projects found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredProjects.map((project) => {
                        const pid = project._id || project.id;
                        return (
                        <div key={pid} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-gray-800">{project.project_name || project.projectName}</h3>
                                        <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                                            LIVE
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">🏢 {project.business_name || '—'}</p>
                                    <p className="text-xs text-gray-500 mb-3">{project.business_email || ''}</p>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-600">Total Capital</p>
                                            <p className="text-lg font-bold text-blue-600">
                                                ₹{((project.required_capital || project.requiredCapital || 0) / 100000).toFixed(1)}L
                                            </p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-600">Raised</p>
                                            <p className="text-lg font-bold text-green-600">
                                                ₹{((project.raised_amount || 0) / 100000).toFixed(1)}L
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-600">Investors</p>
                                            <p className="text-lg font-bold text-purple-600">
                                                {project.investor_count || 0}
                                            </p>
                                        </div>
                                        <div className="bg-orange-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-600">Progress</p>
                                            <p className="text-lg font-bold text-orange-600">
                                                {Math.round(((project.raised_amount || 0) / (project.required_capital || project.requiredCapital || 1)) * 100)}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${Math.min(((project.raised_amount || 0) / (project.required_capital || project.requiredCapital || 1)) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        <p>📍 {project.location || '—'}</p>
                                        {project.start_date && <p>📅 Started: {new Date(project.start_date).toLocaleDateString()}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Close section */}
                            <div className="mt-3 space-y-2">
                                <input
                                    type="text"
                                    placeholder="Reason for closing..."
                                    value={closeReason[pid] || ''}
                                    onChange={e => setCloseReason(r => ({ ...r, [pid]: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                />
                                {feedback[pid] && (
                                    <p className={`text-xs font-medium ${feedback[pid].type === 'success' ? 'text-green-700' : 'text-red-600'}`}>
                                        {feedback[pid].msg}
                                    </p>
                                )}
                                <button
                                    onClick={() => handleCloseProject(pid)}
                                    disabled={closingId === pid}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50"
                                >
                                    {closingId === pid ? 'Closing…' : '📦 Close Project'}
                                </button>
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LiveProjects;
