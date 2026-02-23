import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

// ============================
// Plan Create/Edit Modal
// ============================
const PlanModal = ({ editingPlan, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        plan_name: editingPlan?.plan_name || editingPlan?.name || '',
        price: editingPlan?.price?.toString() || '',
        validity_days: editingPlan?.validity_days?.toString() || editingPlan?.durationDays?.toString() || '',
        max_projects: editingPlan?.max_projects?.toString() || editingPlan?.maxProjects?.toString() || '',
        features: Array.isArray(editingPlan?.features) ? editingPlan.features.join('\n') : editingPlan?.features || ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSave(formData, editingPlan);
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-800">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-800 text-2xl">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Plan Name *</label>
                        <input type="text" required value={formData.plan_name}
                            onChange={e => setFormData({ ...formData, plan_name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="e.g., Basic Plan" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                            <input type="number" required min="0" value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="999" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (Days) *</label>
                            <input type="number" required min="1" value={formData.validity_days}
                                onChange={e => setFormData({ ...formData, validity_days: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="30" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Max Projects *</label>
                            <input type="number" required min="0" value={formData.max_projects}
                                onChange={e => setFormData({ ...formData, max_projects: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="5" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Features (one per line)</label>
                        <textarea value={formData.features}
                            onChange={e => setFormData({ ...formData, features: e.target.value })}
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                            placeholder={'Share management\nLoan application\nFD & Bonds\nPriority support'} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={submitting}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50">
                            {submitting ? 'Saving...' : editingPlan ? '✓ Update Plan' : '+ Create Plan'}
                        </button>
                        <button type="button" onClick={onClose}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================
// User Plan Subscriptions Tab
// ============================
const UserPlanStatus = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    useEffect(() => { loadSubscriptions(); }, []);

    const loadSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getUserPlanSubscriptions();
            setSubscriptions(response.data.subscriptions || []);
        } catch (err) {
            console.error('Failed to load subscriptions:', err);
            setSubscriptions([]);
        } finally {
            setLoading(false);
        }
    };

    const now = new Date();
    const filtered = subscriptions.filter(s => {
        const isExpired = new Date(s.expires_at) < now;
        if (filter === 'ACTIVE' && (!s.is_active || isExpired)) return false;
        if (filter === 'EXPIRED' && (!isExpired && s.is_active)) return false;
        if (search && !(s.user_email || '').toLowerCase().includes(search.toLowerCase()) &&
            !(s.plan_name || '').toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const activeCount = subscriptions.filter(s => s.is_active && new Date(s.expires_at) >= now).length;
    const expiredCount = subscriptions.filter(s => !s.is_active || new Date(s.expires_at) < now).length;

    if (loading) return (
        <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Total Subscriptions', value: subscriptions.length, color: 'blue' },
                    { label: 'Active Plans', value: activeCount, color: 'green' },
                    { label: 'Expired Plans', value: expiredCount, color: 'red' },
                ].map(card => (
                    <div key={card.label} className={`bg-${card.color}-50 border border-${card.color}-200 rounded-xl p-4 text-center`}>
                        <p className={`text-2xl font-bold text-${card.color}-700`}>{card.value}</p>
                        <p className={`text-sm text-${card.color}-600 mt-1`}>{card.label}</p>
                    </div>
                ))}
            </div>
            <div className="flex gap-2 mb-4">
                {[
                    { key: 'ALL', label: 'All' },
                    { key: 'ACTIVE', label: '✓ Active' },
                    { key: 'EXPIRED', label: '⏱ Expired' },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setFilter(tab.key)}
                        className={`px-5 py-2 rounded-xl font-medium text-sm transition-all ${filter === tab.key ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="mb-4">
                <input type="text" placeholder="🔍 Search by email or plan name..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-xl text-gray-600">No {filter !== 'ALL' ? filter.toLowerCase() : ''} plan subscriptions</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {['#', 'User Email', 'Mobile', 'Plan Name', 'Price', 'Activated On', 'Expiry Date', 'Status'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((sub, idx) => {
                                const isExpired = new Date(sub.expires_at) < now;
                                const daysLeft = Math.ceil((new Date(sub.expires_at) - now) / (1000 * 60 * 60 * 24));
                                return (
                                    <tr key={sub.id || idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{sub.user_email}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{sub.user_mobile || '—'}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-blue-700">{sub.plan_name}</td>
                                        <td className="px-4 py-3 text-sm font-bold">₹{(sub.plan_price || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{sub.activated_at ? new Date(sub.activated_at).toLocaleDateString() : '—'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <p className={isExpired ? 'text-red-600 font-medium' : 'text-gray-700'}>{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : '—'}</p>
                                            {!isExpired && daysLeft <= 7 && daysLeft > 0 && <p className="text-xs text-orange-500">{daysLeft}d left</p>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${!isExpired && sub.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {!isExpired && sub.is_active ? 'ACTIVE' : 'EXPIRED'}
                                            </span>
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

// ============================
// Main Component
// ============================
const PlanManagement = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [activeTab, setActiveTab] = useState('plans');
    const [formData, setFormData] = useState({ plan_name: '', price: '', validity_days: '', max_projects: '', features: '' });

    useEffect(() => { loadPlans(); }, []);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getPlans();
            setPlans(response.data.plans || []);
        } catch (error) {
            console.error('Failed to load plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (fd, editing) => {
        if (editing) {
            await adminAPI.updatePlan(editing.id || editing._id, fd);
            alert('Plan updated successfully!');
        } else {
            await adminAPI.createPlan(fd);
            alert('Plan created successfully!');
        }
        loadPlans();
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this plan? Existing subscribers will not be affected.')) return;
        try {
            await adminAPI.deletePlan(id);
            loadPlans();
        } catch (error) {
            alert('Failed to delete plan: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div>
            {showModal && (
                <PlanModal
                    editingPlan={editingPlan}
                    onClose={() => { setShowModal(false); setEditingPlan(null); }}
                    onSave={handleSave}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Plan Management</h1>
                    <p className="text-gray-500 mt-1">Create subscription plans and monitor user activations</p>
                </div>
                {activeTab === 'plans' && (
                    <button onClick={() => { setEditingPlan(null); setShowModal(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
                        <span>➕</span> Create New Plan
                    </button>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
                <button onClick={() => setActiveTab('plans')}
                    className={`px-5 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === 'plans' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}>
                    📋 Plans ({plans.length})
                </button>
                <button onClick={() => setActiveTab('subscriptions')}
                    className={`px-5 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === 'subscriptions' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}>
                    👥 User Plan Status
                </button>
            </div>

            {/* Plans Tab */}
            {activeTab === 'plans' && (
                <>
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-md p-16 text-center">
                            <div className="text-7xl mb-4">📋</div>
                            <p className="text-xl text-gray-600">No plans created yet</p>
                            <button onClick={() => setShowModal(true)}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition">
                                Create First Plan
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {plans.map((plan) => (
                                <div key={plan.id || plan._id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-t-4 border-blue-500">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-bold text-gray-800">{plan.plan_name || plan.name}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${plan.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {plan.is_active !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="mb-5">
                                            <p className="text-4xl font-bold text-blue-600">₹{(plan.price || 0).toLocaleString()}</p>
                                            <p className="text-sm text-gray-500 mt-1">{plan.validity_days || plan.durationDays} days validity</p>
                                        </div>
                                        <div className="space-y-2 mb-5">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-blue-500">📁</span>
                                                <span className="text-gray-700">Up to {plan.max_projects || plan.maxProjects || 0} projects</span>
                                            </div>
                                            {Array.isArray(plan.features) && plan.features.slice(0, 4).map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm">
                                                    <span className="text-green-500">✓</span>
                                                    <span className="text-gray-700">{feature}</span>
                                                </div>
                                            ))}
                                            {Array.isArray(plan.features) && plan.features.length > 4 && (
                                                <p className="text-xs text-gray-400 ml-5">+{plan.features.length - 4} more features</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditingPlan(plan); setShowModal(true); }}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
                                                ✏️ Edit
                                            </button>
                                            <button onClick={() => handleDelete(plan.id || plan._id)}
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
                                                🗑 Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* User Plan Status Tab */}
            {activeTab === 'subscriptions' && <UserPlanStatus />}
        </div>
    );
};

export default PlanManagement;

