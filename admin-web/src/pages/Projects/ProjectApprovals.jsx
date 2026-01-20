import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const ProjectApprovals = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('NEW');

    useEffect(() => {
        loadProjects();
    }, [filter]);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getProjectsByStatus(filter);
            setProjects(response.data.projects || []);
        } catch (error) {
            console.error('Failed to load projects:', error);
            setError('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!confirm('Approve this project?')) return;

        try {
            await adminAPI.approveProject(id);
            alert('Project approved successfully!');
            loadProjects(); // Reload list
        } catch (error) {
            console.error('Failed to approve project:', error);
            alert('Failed to approve project. Please try again.');
        }
    };

    const handleRecheck = async (id) => {
        const comments = prompt('Enter recheck comments:');
        if (!comments) return;

        try {
            await adminAPI.recheckProject(id, { comments });
            alert('Recheck requested successfully!');
            loadProjects(); // Reload list
        } catch (error) {
            console.error('Failed to request recheck:', error);
            alert('Failed to request recheck. Please try again.');
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await adminAPI.rejectProject(id, { reason });
            alert('Project rejected successfully!');
            loadProjects(); // Reload list
        } catch (error) {
            console.error('Failed to reject project:', error);
            alert('Failed to reject project. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl text-gray-600">Loading projects...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Project Approvals</h1>
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold shadow-sm">
                    {projects.length} {filter}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2">
                {['NEW', 'APPROVED', 'RECHECK', 'REJECTED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${filter === status
                                ? 'bg-blue-600 text-white shadow-lg scale-105'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {projects.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📂</div>
                    <p className="text-xl text-gray-600">No {filter.toLowerCase()} projects</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-xl font-bold text-gray-800">{project.project_name}</h3>
                                        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                                            {project.category}
                                        </span>
                                        <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                                            {project.project_type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
                                        <span>🏢</span> {project.business_name}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">📍 Location:</span>
                                            <span className="font-medium text-gray-800">{project.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">📅 Start Date:</span>
                                            <span className="font-medium text-gray-800">
                                                {new Date(project.start_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">💰 Project Cost:</span>
                                            <span className="font-medium text-blue-600">
                                                ₹{(project.project_cost / 100000).toFixed(1)}L
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">💵 Required Capital:</span>
                                            <span className="font-medium text-green-600">
                                                ₹{(project.required_capital / 100000).toFixed(1)}L
                                            </span>
                                        </div>
                                    </div>

                                    {project.description && (
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                                            <p className="text-sm font-medium text-gray-700 mb-1">📝 Description:</p>
                                            <p className="text-sm text-gray-600">{project.description}</p>
                                        </div>
                                    )}
                                </div>

                                {filter === 'NEW' && (
                                    <div className="flex flex-col gap-2 ml-6">
                                        <button
                                            onClick={() => handleApprove(project.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            onClick={() => handleRecheck(project.id)}
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                                        >
                                            🔄 Recheck
                                        </button>
                                        <button
                                            onClick={() => handleReject(project.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                                        >
                                            ✗ Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectApprovals;
