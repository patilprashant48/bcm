import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectAPI } from '../../services/api';

const statusColor = (status) => {
    switch (status) {
        case 'NEW':      return 'bg-blue-100 text-blue-800';
        case 'PENDING':  return 'bg-yellow-100 text-yellow-800';
        case 'RECHECK':  return 'bg-orange-100 text-orange-800';
        case 'APPROVED': return 'bg-green-100 text-green-800';
        case 'LIVE':     return 'bg-emerald-100 text-emerald-800';
        case 'CLOSED':   return 'bg-gray-100 text-gray-800';
        case 'REJECTED': return 'bg-red-100 text-red-800';
        default:         return 'bg-gray-100 text-gray-800';
    }
};

const InfoRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-100 last:border-0">
        <span className="text-sm text-gray-500 font-medium mb-1 sm:mb-0">{label}</span>
        <span className="text-sm text-gray-800 font-semibold sm:text-right max-w-xs break-words">{value ?? '—'}</span>
    </div>
);

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await projectAPI.getProjectDetails(id);
                setProject(res.data.project);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load project details.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-700 font-medium mb-4">{error}</p>
                <button onClick={() => navigate('/projects')} className="text-blue-600 underline text-sm">← Back to Projects</button>
            </div>
        );
    }

    if (!project) return null;

    const canEdit = ['NEW', 'RECHECK', 'DRAFT', 'REJECTED'].includes(project.status);
    const fundingPct = project.required_capital > 0
        ? Math.min(Math.round(((project.raised_amount || 0) / project.required_capital) * 100), 100)
        : 0;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Back */}
            <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-5 text-sm transition">
                ← Back to My Projects
            </button>

            {/* Header card */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{project.project_name}</h1>
                        {project.category && <p className="text-gray-500 text-sm mt-1">{project.category}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColor(project.status)}`}>
                            {project.status}
                        </span>
                        {canEdit && (
                            <Link to={`/projects/edit/${project.id}`}
                                className="text-xs px-4 py-1.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition">
                                ✏ Edit
                            </Link>
                        )}
                    </div>
                </div>

                {project.description && (
                    <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
                )}
            </div>

            {/* Capital cards */}
            <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-md">
                    <p className="text-xs opacity-80 mb-1">Target Capital</p>
                    <p className="text-2xl font-bold">₹{((project.required_capital || 0) / 100000).toFixed(1)}L</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-md">
                    <p className="text-xs opacity-80 mb-1">Raised</p>
                    <p className="text-2xl font-bold">₹{((project.raised_amount || 0) / 100000).toFixed(1)}L</p>
                </div>
            </div>

            {/* Funding progress */}
            {project.status === 'LIVE' && (
                <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span className="font-medium">Funding Progress</span>
                        <span className="font-bold text-green-600">{fundingPct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-green-500 h-3 rounded-full transition-all"
                            style={{ width: `${fundingPct}%` }} />
                    </div>
                </div>
            )}

            {/* Project Details */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-5">
                <h2 className="text-base font-bold text-gray-700 mb-2">Project Details</h2>
                <InfoRow label="Project Type" value={project.project_type} />
                <InfoRow label="Location" value={project.location} />
                <InfoRow label="Project Cost" value={project.project_cost ? `₹${project.project_cost.toLocaleString()}` : null} />
                <InfoRow label="Expected ROI" value={project.expected_roi ? `${project.expected_roi}%` : null} />
                <InfoRow label="Duration" value={project.duration_months ? `${project.duration_months} months` : null} />
                <InfoRow label="Start Date" value={project.start_date ? new Date(project.start_date).toLocaleDateString() : null} />
                <InfoRow label="Submitted On" value={project.created_at ? new Date(project.created_at).toLocaleDateString() : null} />
            </div>

            {/* Business Plan */}
            {project.business_plan && (
                <div className="bg-white rounded-2xl shadow-md p-6 mb-5">
                    <h2 className="text-base font-bold text-gray-700 mb-3">Business Plan</h2>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{project.business_plan}</p>
                </div>
            )}

            {/* Risk Factors */}
            {project.risk_factors && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-5">
                    <h2 className="text-base font-bold text-red-700 mb-3">⚠ Risk Factors</h2>
                    <p className="text-red-600 text-sm leading-relaxed whitespace-pre-line">{project.risk_factors}</p>
                </div>
            )}
        </div>
    );
};

export default ProjectDetail;
