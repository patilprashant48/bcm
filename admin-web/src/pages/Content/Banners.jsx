import { useState } from 'react';

const Banners = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Promotional Banners</h1>
            <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-gray-600">Manage promotional banners for mobile and web apps.</p>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                    🚧 Under Construction
                </div>
            </div>
        </div>
    );
};

export default Banners;
