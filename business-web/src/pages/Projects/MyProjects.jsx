import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../../services/api';

const MyProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const response = await projectAPI.getMyProjects();
            setProjects(response.data.projects || []);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(p => {
        if (filter === 'ALL') return true;
        return p.status === filter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'LIVE': return 'bg-green-100 text-green-800';
            case 'CLOSED': return 'bg-gray-100 text-gray-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="text-xl">Loading...</div></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
                <Link
                    to="/projects/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-medium flex items-center gap-2"
                >
                    <span>➕</span> Create New Project
                </Link>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-2">
                {['ALL', 'PENDING', 'LIVE', 'CLOSED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filter === status
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {filteredProjects.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📁</div>
                    <p className="text-xl text-gray-600 mb-4">No projects found</p>
                    <Link
                        to="/projects/create"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-medium"
                    >
                        Create Your First Project
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{project.project_name}</h3>
                                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
                                        {project.status}
                                    </span>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600">Target Capital</p>
                                    <p className="text-lg font-bold text-blue-600">
                                        ₹{(project.required_capital / 100000).toFixed(1)}L
                                    </p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600">Raised</p>
                                    <p className="text-lg font-bold text-green-600">
                                        ₹{((project.raised_amount || 0) / 100000).toFixed(1)}L
                                    </p>
                                </div>
                            </div>

                            {project.status === 'LIVE' && (
                                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all"
                                            style={{ width: `${Math.min(((project.raised_amount || 0) / project.required_capital) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2">
                                        {Math.round(((project.raised_amount || 0) / project.required_capital) * 100)}% funded
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Link
                                    to={`/projects/${project.id}`}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-center font-medium"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyProjects;
