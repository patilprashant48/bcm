import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const PlanManagement = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        plan_name: '',
        price: '',
        validity_days: '',
        max_projects: '',
        features: ''
    });

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getPlans();
            setPlans(response.data.plans || []);
        } catch (error) {
            console.error('Failed to load plans:', error);
            setError('Failed to load plans');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const planData = {
                ...formData,
                price: parseFloat(formData.price),
                validity_days: parseInt(formData.validity_days),
                max_projects: parseInt(formData.max_projects),
                features: formData.features.split('\n').filter(f => f.trim())
            };

            if (editingPlan) {
                await adminAPI.updatePlan(editingPlan.id, planData);
                alert('Plan updated successfully!');
            } else {
                await adminAPI.createPlan(planData);
                alert('Plan created successfully!');
            }

            setShowModal(false);
            setEditingPlan(null);
            setFormData({ plan_name: '', price: '', validity_days: '', max_projects: '', features: '' });
            loadPlans();
        } catch (error) {
            console.error('Failed to save plan:', error);
            alert('Failed to save plan. Please try again.');
        }
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setFormData({
            plan_name: plan.plan_name,
            price: plan.price.toString(),
            validity_days: plan.validity_days.toString(),
            max_projects: plan.max_projects.toString(),
            features: Array.isArray(plan.features) ? plan.features.join('\n') : plan.features || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;

        try {
            await adminAPI.deletePlan(id);
            alert('Plan deleted successfully!');
            loadPlans();
        } catch (error) {
            console.error('Failed to delete plan:', error);
            alert('Failed to delete plan. Please try again.');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="text-xl text-gray-600">Loading plans...</div></div>;
    }

    if (error) {
        return <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-800">{error}</p></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Plan Management</h1>
                <button
                    onClick={() => {
                        setEditingPlan(null);
                        setFormData({ plan_name: '', price: '', validity_days: '', max_projects: '', features: '' });
                        setShowModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                >
                    <span>➕</span> Create New Plan
                </button>
            </div>

            {plans.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-xl text-gray-600">No plans created yet</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                    >
                        Create First Plan
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border-t-4 border-blue-500">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-bold text-gray-800">{plan.plan_name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {plan.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="mb-6">
                                    <p className="text-4xl font-bold text-blue-600">₹{plan.price.toLocaleString()}</p>
                                    <p className="text-sm text-gray-600 mt-1">{plan.validity_days} days validity</p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-green-600">✓</span>
                                        <span className="text-gray-700">Up to {plan.max_projects} projects</span>
                                    </div>
                                    {Array.isArray(plan.features) && plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm">
                                            <span className="text-green-600">✓</span>
                                            <span className="text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                    <p className="text-sm text-gray-600">Active Subscriptions</p>
                                    <p className="text-2xl font-bold text-gray-800">{plan.subscription_count || 0}</p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(plan)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(plan.id)}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-600 hover:text-gray-800 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.plan_name}
                                    onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Basic Plan"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 999"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Validity (Days) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.validity_days}
                                        onChange={(e) => setFormData({ ...formData, validity_days: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 30"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Max Projects *</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.max_projects}
                                    onChange={(e) => setFormData({ ...formData, max_projects: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Features (one per line)</label>
                                <textarea
                                    value={formData.features}
                                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                    rows="6"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
                                >
                                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanManagement;
