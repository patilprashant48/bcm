import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const STATUS_TABS = [
    { key: 'NEW',      label: 'New',      icon: '🆕', color: 'blue' },
    { key: 'RECHECK',  label: 'Recheck',  icon: '🔄', color: 'yellow' },
    { key: 'REJECTED', label: 'Rejected', icon: '✗',  color: 'red' },
    { key: 'LIVE',     label: 'Live',     icon: '🚀', color: 'emerald' },
    { key: 'CLOSED',   label: 'Closed',   icon: '📦', color: 'gray' },
];

const colorMap = {
    blue:    'bg-blue-600 text-white',
    yellow:  'bg-yellow-500 text-white',
    red:     'bg-red-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    gray:    'bg-gray-500 text-white',
};

const statusBadge = (status) => {
    const m = {
        NEW:      'bg-blue-100 text-blue-800',
        RECHECK:  'bg-yellow-100 text-yellow-800',
        APPROVED: 'bg-green-100 text-green-800',
        LIVE:     'bg-emerald-100 text-emerald-800',
        CLOSED:   'bg-gray-100 text-gray-800',
        REJECTED: 'bg-red-100 text-red-800',
    };
    return m[status] || 'bg-gray-100 text-gray-800';
};

const ProjectDetailModal = ({ project, onClose, onAction, activeTab }) => {
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const needsComment = (action) => action === 'recheck' || action === 'reject';

    const handleAction = async (action) => {
        if (needsComment(action) && !comment.trim()) {
            setFeedback({ type: 'error', msg: 'Please enter a comment / reason.' });
            return;
        }
        setSubmitting(true);
        setFeedback(null);
        try {
            await onAction(project._id || project.id, action, comment);
            setFeedback({
                type: 'success',
                msg: action === 'approve' ? '✓ Project accepted and is now LIVE!'
                   : action === 'recheck'  ? '🔄 Sent for recheck.'
                   : action === 'reject'   ? '✗ Project rejected.'
                   : action === 'close'    ? '📦 Project closed.'
                   : 'Done.'
            });
            setTimeout(onClose, 1200);
        } catch (err) {
            setFeedback({ type: 'error', msg: err.response?.data?.message || err.message });
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-white">{project.project_name || project.projectName}</h2>
                        <p className="text-blue-100 text-sm">{project.business_name || '—'} · {project.business_email || ''}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-blue-200 text-2xl font-bold leading-none">×</button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Status */}
                    <div className="flex justify-end">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusBadge(project.status)}`}>{project.status}</span>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            ['Project Name',     project.project_name || project.projectName],
                            ['Business Name',    project.business_name || '—'],
                            ['Category',         project.category],
                            ['Type',             project.project_type || project.projectType],
                            ['Location',         project.location],
                            ['Start Date',       project.start_date ? new Date(project.start_date).toLocaleDateString() : null],
                            ['Project Cost',     `₹${((project.project_cost || project.projectCost || 0) / 100000).toFixed(2)}L`],
                            ['Capital Required', `₹${((project.required_capital || project.requiredCapital || 0) / 100000).toFixed(2)}L`],
                            ['Expected ROI',     project.expected_roi ? `${project.expected_roi}%` : null],
                            ['Duration',         project.duration_months ? `${project.duration_months} months` : null],
                        ].map(([label, value]) => value ? (
                            <div key={label} className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-500 mb-1">{label}</p>
                                <p className="font-semibold text-gray-800">{value}</p>
                            </div>
                        ) : null)}
                    </div>

                    {project.description && (
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 mb-2">Description</p>
                            <p className="text-gray-700 text-sm leading-relaxed">{project.description}</p>
                        </div>
                    )}

                    {project.business_plan && (
                        <div className="bg-blue-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 mb-2">Business Plan</p>
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{project.business_plan}</p>
                        </div>
                    )}

                    {project.risk_factors && (
                        <div className="bg-red-50 rounded-xl p-4">
                            <p className="text-xs text-red-500 mb-2">⚠ Risk Factors</p>
                            <p className="text-red-700 text-sm leading-relaxed whitespace-pre-line">{project.risk_factors}</p>
                        </div>
                    )}

                    {/* Comment box — only for actions that need it */}
                    {activeTab === 'NEW' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comment / Reason <span className="text-gray-400 font-normal">(required for Recheck / Reject)</span>
                            </label>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Enter comment or reason..."
                                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                rows={3}
                            />
                        </div>
                    )}

                    {/* Feedback */}
                    {feedback && (
                        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
                            feedback.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                            {feedback.msg}
                        </div>
                    )}

                    {/* Action buttons */}
                    {!feedback?.type === 'success' && (
                        <div className="flex gap-3 justify-end border-t border-gray-100 pt-4">
                            {activeTab === 'NEW' && (
                                <>
                                    <button onClick={() => handleAction('recheck')} disabled={submitting}
                                        className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition disabled:opacity-50">
                                        🔄 Recheck
                                    </button>
                                    <button onClick={() => handleAction('reject')} disabled={submitting}
                                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition disabled:opacity-50">
                                        ✗ Reject
                                    </button>
                                    <button onClick={() => handleAction('approve')} disabled={submitting}
                                        className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition shadow-sm disabled:opacity-50">
                                        {submitting ? 'Processing…' : '✓ Accept → Live'}
                                    </button>
                                </>
                            )}
                            {activeTab === 'RECHECK' && (
                                <>
                                    <button onClick={() => handleAction('reject')} disabled={submitting}
                                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition disabled:opacity-50">
                                        ✗ Reject
                                    </button>
                                    <button onClick={() => handleAction('approve')} disabled={submitting}
                                        className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition shadow-sm disabled:opacity-50">
                                        {submitting ? 'Processing…' : '✓ Accept → Live'}
                                    </button>
                                </>
                            )}
                            {activeTab === 'LIVE' && (
                                <button onClick={() => handleAction('close')} disabled={submitting}
                                    className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition disabled:opacity-50">
                                    {submitting ? 'Closing…' : '📦 Close Project'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProjectApprovals = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('NEW');
    const [selectedProject, setSelectedProject] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => { loadProjects(); }, [activeTab]);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getProjectsByStatus(activeTab);
            setProjects(response.data.projects || []);
        } catch (err) {
            console.error('Failed to load projects:', err);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action, comment) => {
        if (action === 'approve') await adminAPI.approveProject(id);
        else if (action === 'recheck') await adminAPI.recheckProject(id, { comments: comment });
        else if (action === 'reject')  await adminAPI.rejectProject(id, { reason: comment });
        else if (action === 'close')   await adminAPI.closeProject(id, { reason: comment });
        loadProjects();
    };

    const filtered = projects.filter(p =>
        !search ||
        (p.project_name || p.projectName || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.business_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.business_email || '').toLowerCase().includes(search.toLowerCase())
    );

    const currentTab = STATUS_TABS.find(t => t.key === activeTab);

    return (
        <div>
            {selectedProject && (
                <ProjectDetailModal
                    project={selectedProject}
                    activeTab={activeTab}
                    onClose={() => setSelectedProject(null)}
                    onAction={handleAction}
                />
            )}

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Project Management</h1>
                <p className="text-gray-500 mt-1">Review, approve, and manage all projects</p>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all shadow-sm ${
                            activeTab === tab.key
                                ? colorMap[tab.color]
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Search by project name, business name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-16 text-center">
                    <div className="text-7xl mb-4">📂</div>
                    <p className="text-xl text-gray-600 font-medium">No {currentTab?.label} projects</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {['#', 'Date', 'Business Name', 'Email', 'Project Name', 'Project Cost', 'Capital Required', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((proj, idx) => {
                                const date = new Date(proj.created_at || proj.createdAt);
                                return (
                                    <tr key={proj._id || proj.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{date.toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">{proj.business_name || '—'}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{proj.business_email || '—'}</td>
                                        <td className="px-4 py-3 text-sm font-bold text-gray-900">{proj.project_name || proj.projectName}</td>
                                        <td className="px-4 py-3 text-sm text-blue-600 font-medium">
                                            ₹{((proj.project_cost || proj.projectCost || 0) / 100000).toFixed(1)}L
                                        </td>
                                        <td className="px-4 py-3 text-sm text-green-600 font-medium">
                                            ₹{((proj.required_capital || proj.requiredCapital || 0) / 100000).toFixed(1)}L
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setSelectedProject(proj)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition shadow-sm"
                                            >
                                                👁 View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProjectApprovals;

    { key: 'NEW', label: 'New', icon: '🆕', color: 'blue' },
    { key: 'RECHECK', label: 'Recheck', icon: '🔄', color: 'yellow' },
    { key: 'RESUBMIT', label: 'Resubmit', icon: '📤', color: 'purple' },
    { key: 'REJECTED', label: 'Rejected', icon: '✗', color: 'red' },
    { key: 'APPROVED', label: 'Approved', icon: '✓', color: 'green' },
    { key: 'LIVE', label: 'Live', icon: '🚀', color: 'emerald' },
    { key: 'CLOSED', label: 'Closed', icon: '📦', color: 'gray' },
];

const colorMap = {
    blue: 'bg-blue-600 text-white',
    yellow: 'bg-yellow-500 text-white',
    purple: 'bg-purple-600 text-white',
    red: 'bg-red-600 text-white',
    green: 'bg-green-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    gray: 'bg-gray-500 text-white',
};

const badgeMap = {
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    gray: 'bg-gray-100 text-gray-800',
};

const ProjectDetailModal = ({ project, onClose, onAction, activeTab }) => {
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleAction = async (action) => {
        if ((action === 'recheck' || action === 'reject') && !comment.trim()) {
            alert('Please enter a comment/reason.');
            return;
        }
        setSubmitting(true);
        try {
            await onAction(project._id || project.id, action, comment);
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-white">{project.project_name || project.projectName}</h2>
                        <p className="text-blue-100 text-sm">{project.business_name || project.businessName} · {project.category}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-blue-200 text-2xl font-bold">×</button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Project Details */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            ['Project Name', project.project_name || project.projectName],
                            ['Business Name', project.business_name || project.businessName],
                            ['Category', project.category],
                            ['Type', project.project_type || project.projectType],
                            ['Location', project.location],
                            ['Start Date', project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'],
                            ['Project Cost', `₹${((project.project_cost || project.projectCost || 0) / 100000).toFixed(2)}L`],
                            ['Capital Required', `₹${((project.required_capital || project.requiredCapital || 0) / 100000).toFixed(2)}L`],
                        ].map(([label, value]) => (
                            <div key={label} className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">{label}</p>
                                <p className="font-semibold text-gray-800">{value || '—'}</p>
                            </div>
                        ))}
                    </div>

                    {project.description && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-2">Description</p>
                            <p className="text-gray-700">{project.description}</p>
                        </div>
                    )}

                    {/* Comment Box */}
                    {activeTab === 'NEW' || activeTab === 'RESUBMIT' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comment / Reason (required for Recheck/Reject)
                            </label>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Enter comments or reason for action..."
                                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                rows={3}
                            />
                        </div>
                    ) : null}

                    {/* Actions */}
                    <div className="flex gap-3 justify-end border-t border-gray-200 pt-4">
                        {(activeTab === 'NEW' || activeTab === 'RESUBMIT') && (
                            <>
                                <button onClick={() => handleAction('recheck')} disabled={submitting}
                                    className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition disabled:opacity-50">
                                    🔄 Recheck
                                </button>
                                <button onClick={() => handleAction('reject')} disabled={submitting}
                                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50">
                                    ✗ Reject
                                </button>
                                <button onClick={() => handleAction('approve')} disabled={submitting}
                                    className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50">
                                    ✓ Accept & Approve
                                </button>
                            </>
                        )}
                        {activeTab === 'APPROVED' && (
                            <button onClick={() => handleAction('live')} disabled={submitting}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition disabled:opacity-50">
                                🚀 Make Live
                            </button>
                        )}
                        {activeTab === 'LIVE' && (
                            <button onClick={() => handleAction('close')} disabled={submitting}
                                className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition disabled:opacity-50">
                                📦 Close Project
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProjectApprovals = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('NEW');
    const [selectedProject, setSelectedProject] = useState(null);
    const [search, setSearch] = useState('');
    const [counts, setCounts] = useState({});

    useEffect(() => { loadProjects(); }, [activeTab]);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getProjectsByStatus(activeTab);
            setProjects(response.data.projects || []);
        } catch (err) {
            console.error('Failed to load projects:', err);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action, comment) => {
        try {
            if (action === 'approve') await adminAPI.approveProject(id);
            else if (action === 'recheck') await adminAPI.recheckProject(id, { comments: comment });
            else if (action === 'reject') await adminAPI.rejectProject(id, { reason: comment });
            else if (action === 'close') await adminAPI.closeProject(id, { reason: comment });
            else if (action === 'live') await adminAPI.makeProjectLive(id);
            alert(`Project ${action === 'live' ? 'made live' : action + 'd'} successfully!`);
            loadProjects();
        } catch (err) {
            alert('Action failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const filtered = projects.filter(p =>
        !search ||
        (p.project_name || p.projectName || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.business_name || p.businessName || '').toLowerCase().includes(search.toLowerCase())
    );

    const currentTabInfo = STATUS_TABS.find(t => t.key === activeTab);

    return (
        <div>
            {selectedProject && (
                <ProjectDetailModal
                    project={selectedProject}
                    activeTab={activeTab}
                    onClose={() => setSelectedProject(null)}
                    onAction={handleAction}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Project Management</h1>
                    <p className="text-gray-500 mt-1">Review, approve, and manage all projects</p>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all shadow-sm ${activeTab === tab.key
                                ? colorMap[tab.color]
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Search by project or business name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-16 text-center">
                    <div className="text-7xl mb-4">📂</div>
                    <p className="text-xl text-gray-600 font-medium">No {currentTabInfo?.label} projects</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {['#', 'Date', 'User Name', 'Business Name', 'Project Name', 'Project Cost', 'Capital Required', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((proj, idx) => {
                                const date = new Date(proj.created_at || proj.createdAt);
                                return (
                                    <tr key={proj._id || proj.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{date.toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{proj.business_email || proj.owner_name || '—'}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{proj.business_name || proj.businessName}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{proj.project_name || proj.projectName}</td>
                                        <td className="px-4 py-3 text-sm text-blue-600 font-medium">
                                            ₹{((proj.project_cost || proj.projectCost || 0) / 100000).toFixed(1)}L
                                        </td>
                                        <td className="px-4 py-3 text-sm text-green-600 font-medium">
                                            ₹{((proj.required_capital || proj.requiredCapital || 0) / 100000).toFixed(1)}L
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setSelectedProject(proj)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition shadow-sm"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProjectApprovals;
