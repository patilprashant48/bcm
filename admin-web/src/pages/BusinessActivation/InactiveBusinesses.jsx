import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const InactiveBusinesses = () => {
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
            const response = await adminAPI.getInactiveBusinesses();
            setBusinesses(response.data.businesses || []);
        } catch (error) {
            console.error('Failed to load businesses:', error);
            setError('Failed to load inactive businesses');
        } finally {
            setLoading(false);
        }
    };

    const handleReactivate = async (id) => {
        if (!confirm('Reactivate this business?')) return;

        try {
            await adminAPI.reactivateBusiness(id);
            alert('Business reactivated successfully!');
            loadBusinesses();
        } catch (error) {
            console.error('Failed to reactivate business:', error);
            alert('Failed to reactivate business. Please try again.');
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
                <h1 className="text-3xl font-bold text-gray-800">Inactive Businesses</h1>
                <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-semibold shadow-sm">
                    {filteredBusinesses.length} Inactive
                </div>
            </div>

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
                    <div className="text-6xl mb-4">⏸️</div>
                    <p className="text-xl text-gray-600">No inactive businesses found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBusinesses.map((business) => (
                        <div key={business.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-red-500">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-xl font-bold text-gray-800">{business.business_name}</h3>
                                        <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-medium">
                                            INACTIVE
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                                        <div>
                                            <span className="text-gray-600">Owner:</span>
                                            <span className="ml-2 font-medium">{business.owner_name}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Email:</span>
                                            <span className="ml-2 font-medium">{business.email}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Deactivated:</span>
                                            <span className="ml-2 font-medium">
                                                {new Date(business.deactivated_at || business.updated_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    {business.deactivation_reason && (
                                        <div className="bg-red-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-1">Deactivation Reason:</p>
                                            <p className="text-sm font-medium text-red-800">{business.deactivation_reason}</p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleReactivate(business.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium ml-4"
                                >
                                    Reactivate
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InactiveBusinesses;
