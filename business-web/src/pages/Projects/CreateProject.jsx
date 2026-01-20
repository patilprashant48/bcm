import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../../services/api';

const CreateProject = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        project_name: '',
        description: '',
        required_capital: '',
        expected_roi: '',
        duration_months: '',
        location: '',
        project_type: 'BUSINESS_EXPANSION',
        start_date: '',
        business_plan: '',
        risk_factors: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const projectData = {
                ...formData,
                required_capital: parseFloat(formData.required_capital),
                expected_roi: parseFloat(formData.expected_roi),
                duration_months: parseInt(formData.duration_months),
            };

            await projectAPI.createProject(projectData);
            alert('Project created successfully! Awaiting admin approval.');
            navigate('/projects');
        } catch (error) {
            console.error('Failed to create project:', error);
            alert(error.response?.data?.message || 'Failed to create project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Create New Project</h1>
                <p className="text-gray-600 mt-2">Fill in the details to create a capital raising project</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
                <div className="space-y-6">
                    {/* Project Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.project_name}
                            onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Retail Store Expansion"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Description *
                        </label>
                        <textarea
                            required
                            rows="4"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe your project in detail..."
                        />
                    </div>

                    {/* Project Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Type *
                        </label>
                        <select
                            required
                            value={formData.project_type}
                            onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="BUSINESS_EXPANSION">Business Expansion</option>
                            <option value="NEW_VENTURE">New Venture</option>
                            <option value="PRODUCT_LAUNCH">Product Launch</option>
                            <option value="INFRASTRUCTURE">Infrastructure</option>
                            <option value="TECHNOLOGY">Technology</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    {/* Financial Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Required Capital (₹) *
                            </label>
                            <input
                                type="number"
                                required
                                value={formData.required_capital}
                                onChange={(e) => setFormData({ ...formData, required_capital: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., 1000000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expected ROI (%) *
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={formData.expected_roi}
                                onChange={(e) => setFormData({ ...formData, expected_roi: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., 15"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (Months) *
                            </label>
                            <input
                                type="number"
                                required
                                value={formData.duration_months}
                                onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., 12"
                            />
                        </div>
                    </div>

                    {/* Location and Start Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Mumbai, Maharashtra"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Business Plan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Plan *
                        </label>
                        <textarea
                            required
                            rows="4"
                            value={formData.business_plan}
                            onChange={(e) => setFormData({ ...formData, business_plan: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe your business plan, market analysis, and execution strategy..."
                        />
                    </div>

                    {/* Risk Factors */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Risk Factors
                        </label>
                        <textarea
                            rows="3"
                            value={formData.risk_factors}
                            onChange={(e) => setFormData({ ...formData, risk_factors: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe potential risks and mitigation strategies..."
                        />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/projects')}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateProject;
