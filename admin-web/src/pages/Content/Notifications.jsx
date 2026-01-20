import { useState } from 'react';
import { adminAPI } from '../../services/api';

const Notifications = () => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        target: 'ALL',
        priority: 'NORMAL',
    });
    const [sending, setSending] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);

        try {
            await adminAPI.sendNotification(formData);
            alert('Notification sent successfully!');
            setFormData({ title: '', message: '', target: 'ALL', priority: 'NORMAL' });
        } catch (error) {
            alert('Failed to send notification');
        } finally {
            setSending(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Send Notifications</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Send Form */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Broadcast Message</h2>

                    <form onSubmit={handleSend} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Notification title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                            <textarea
                                required
                                rows="4"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Notification message"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                            <select
                                value={formData.target}
                                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ALL">All Users</option>
                                <option value="INVESTORS">Investors Only</option>
                                <option value="BUSINESSES">Businesses Only</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="LOW">Low</option>
                                <option value="NORMAL">Normal</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50"
                        >
                            {sending ? 'Sending...' : 'Send Notification'}
                        </button>
                    </form>
                </div>

                {/* Preview */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Preview</h2>

                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                BCM
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800 mb-1">
                                    {formData.title || 'Notification Title'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {formData.message || 'Your notification message will appear here...'}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">Just now</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Target:</span>
                            <span className="font-medium text-gray-800">{formData.target}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Priority:</span>
                            <span className={`font-medium ${formData.priority === 'URGENT' ? 'text-red-600' :
                                    formData.priority === 'HIGH' ? 'text-orange-600' :
                                        'text-gray-800'
                                }`}>
                                {formData.priority}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Templates */}
            <div className="mt-8 bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => setFormData({
                            ...formData,
                            title: 'New Project Alert',
                            message: 'A new investment opportunity is now available. Check it out!',
                        })}
                        className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-left transition"
                    >
                        <p className="font-medium text-blue-800">New Project Alert</p>
                        <p className="text-sm text-blue-600 mt-1">Notify about new projects</p>
                    </button>
                    <button
                        onClick={() => setFormData({
                            ...formData,
                            title: 'Maintenance Notice',
                            message: 'The platform will undergo maintenance on [DATE]. Services may be temporarily unavailable.',
                        })}
                        className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg text-left transition"
                    >
                        <p className="font-medium text-yellow-800">Maintenance Notice</p>
                        <p className="text-sm text-yellow-600 mt-1">Scheduled maintenance</p>
                    </button>
                    <button
                        onClick={() => setFormData({
                            ...formData,
                            title: 'Payment Reminder',
                            message: 'You have pending payments. Please complete them to avoid service interruption.',
                        })}
                        className="bg-red-50 hover:bg-red-100 p-4 rounded-lg text-left transition"
                    >
                        <p className="font-medium text-red-800">Payment Reminder</p>
                        <p className="text-sm text-red-600 mt-1">Payment reminders</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
