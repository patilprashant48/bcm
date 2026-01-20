import { useState, useEffect } from 'react';
import { planAPI } from '../services/api';

const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [activePlan, setActivePlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const [plansRes, activePlanRes] = await Promise.all([
                planAPI.getPlans(),
                planAPI.getActivePlan().catch(() => ({ data: null })),
            ]);
            setPlans(plansRes.data.plans || []);
            setActivePlan(activePlanRes.data);
        } catch (error) {
            console.error('Failed to load plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleActivatePlan = async (planId) => {
        try {
            await planAPI.activatePlan(planId, {});
            alert('Plan activated successfully!');
            setShowModal(false);
            loadPlans();
        } catch (error) {
            alert('Failed to activate plan. Please try again.');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="text-xl">Loading...</div></div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Subscription Plans</h1>
                <p className="text-gray-600 mt-2">Choose a plan that fits your business needs</p>
            </div>

            {/* Active Plan Banner */}
            {activePlan && (
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90 mb-1">Current Plan</p>
                            <h2 className="text-3xl font-bold">{activePlan.plan_name}</h2>
                            <p className="mt-2">Valid until: {new Date(activePlan.expiry_date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm opacity-90">Projects Remaining</p>
                            <p className="text-4xl font-bold">{activePlan.projects_remaining || 0}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 ${activePlan?.plan_id === plan.id ? 'ring-4 ring-green-500' : ''
                            }`}
                    >
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                            <h3 className="text-2xl font-bold mb-2">{plan.plan_name}</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold">₹{plan.price.toLocaleString()}</span>
                                <span className="text-sm opacity-75">/ {plan.validity_days} days</span>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-green-600">✓</span>
                                    <span>Up to {plan.max_projects} projects</span>
                                </div>
                                {Array.isArray(plan.features) && plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                        <span className="text-green-600">✓</span>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {activePlan?.plan_id === plan.id ? (
                                <button
                                    disabled
                                    className="w-full bg-green-100 text-green-800 font-medium py-3 px-4 rounded-lg cursor-not-allowed"
                                >
                                    Current Plan
                                </button>
                            ) : (
                                <button
                                    onClick={() => { setSelectedPlan(plan); setShowModal(true); }}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
                                >
                                    Activate Plan
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Activation Modal */}
            {showModal && selectedPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Activate Plan</h2>
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="font-bold text-lg mb-2">{selectedPlan.plan_name}</h3>
                            <p className="text-3xl font-bold text-blue-600 mb-2">₹{selectedPlan.price.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Valid for {selectedPlan.validity_days} days</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            By activating this plan, you'll be able to create up to {selectedPlan.max_projects} projects.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleActivatePlan(selectedPlan.id)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition font-medium"
                            >
                                Confirm & Pay
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg transition font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Plans;
