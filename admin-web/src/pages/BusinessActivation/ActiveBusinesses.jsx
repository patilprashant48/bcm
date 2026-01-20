import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const ActiveBusinesses = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadBusinesses();
    }, []);

    const loadBusinesses = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getActiveBusinesses();
            setBusinesses(response.data.businesses || []);
        } catch (error) {
            console.error('Failed to load businesses:', error);
            setError('Failed to load active businesses');
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async (id) => {
        const reason = prompt('Enter deactivation reason:');
        if (!reason) return;

        try {
            await adminAPI.deactivateBusiness(id, { reason });
            alert('Business deactivated successfully!');
            loadBusinesses();
        } catch (error) {
            console.error('Failed to deactivate business:', error);
            alert('Failed to deactivate business. Please try again.');
        }
    };

    const filteredBusinesses = businesses.filter(business =>
        business.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h1 className="text-3xl font-bold text-gray-800">Active Businesses</h1>
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold shadow-sm">
                    {filteredBusinesses.length} Active
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by business name, email, or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {filteredBusinesses.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">🏢</div>
                    <p className="text-xl text-gray-600">No active businesses found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBusinesses.map((business) => (
                        <div key={business.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-xl font-bold text-gray-800">{business.business_name}</h3>
                                        <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                                            ACTIVE
                                        </span>
                                        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                                            {business.business_type}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Owner:</span>
                                            <span className="ml-2 font-medium">{business.owner_name}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Email:</span>
                                            <span className="ml-2 font-medium">{business.email}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Mobile:</span>
                                            <span className="ml-2 font-medium">{business.mobile}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Activated:</span>
                                            <span className="ml-2 font-medium">
                                                {new Date(business.activated_at || business.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Projects:</span>
                                            <span className="ml-2 font-medium text-blue-600">{business.project_count || 0}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Plan:</span>
                                            <span className="ml-2 font-medium text-purple-600">{business.plan_name || 'None'}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeactivate(business.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium ml-4"
                                >
                                    Deactivate
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActiveBusinesses;
