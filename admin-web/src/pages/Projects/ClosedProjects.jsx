import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const ClosedProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getClosedProjects();
            setProjects(response.data.projects || []);
        } catch (error) {
            console.error('Failed to load projects:', error);
            setError('Failed to load closed projects');
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(project =>
        project.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="text-xl text-gray-600">Loading...</div></div>;
    }

    if (error) {
        return <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-800">{error}</p></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Closed Projects</h1>
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-semibold shadow-sm">
                    {filteredProjects.length} Closed
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
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-xl text-gray-600">No closed projects found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border-l-4 border-gray-400">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-gray-800">{project.project_name}</h3>
                                        <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium">
                                            CLOSED
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">🏢 {project.business_name}</p>

                                    <div className="grid grid-cols-4 gap-3 mb-4">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-600">Total Capital</p>
                                            <p className="text-lg font-bold text-gray-800">
                                                ₹{(project.required_capital / 100000).toFixed(1)}L
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-600">Raised</p>
                                            <p className="text-lg font-bold text-gray-800">
                                                ₹{((project.raised_amount || 0) / 100000).toFixed(1)}L
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-600">Investors</p>
                                            <p className="text-lg font-bold text-gray-800">
                                                {project.investor_count || 0}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-600">ROI</p>
                                            <p className="text-lg font-bold text-gray-800">
                                                {project.roi_percentage || 0}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                                        <div>
                                            <p>📅 Started: {new Date(project.start_date).toLocaleDateString()}</p>
                                            <p>🏁 Closed: {new Date(project.closed_at || project.updated_at).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p>📍 {project.location}</p>
                                            <p>⏱️ Duration: {Math.round((new Date(project.closed_at || project.updated_at) - new Date(project.start_date)) / (1000 * 60 * 60 * 24))} days</p>
                                        </div>
                                    </div>

                                    {project.closure_reason && (
                                        <div className="mt-4 bg-yellow-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-1">Closure Reason:</p>
                                            <p className="text-sm font-medium text-gray-800">{project.closure_reason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClosedProjects;
