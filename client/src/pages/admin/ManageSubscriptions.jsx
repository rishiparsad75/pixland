import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Eye, Clock, Search, ExternalLink, Calendar, User, CreditCard } from 'lucide-react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ManageSubscriptions = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/subscription/admin/requests');
            setRequests(data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (requestId, status) => {
        const adminNotes = status === 'rejected' ? prompt("Enter reason for rejection:") : "Verified by Admin";
        if (status === 'rejected' && adminNotes === null) return;

        setProcessingId(requestId);
        try {
            await api.post('/subscription/admin/verify', { requestId, status, adminNotes });
            alert(`Request ${status} successfully!`);
            fetchRequests();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to process request");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredRequests = requests.filter(req =>
        req.utr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        }
    };

    if (loading) return <div className="text-white p-8">Loading requests...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Manual Subscriptions</h1>
                    <p className="text-gray-400">Verify UTRs and screenshots to activate premium plans.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search UTR, Name or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white w-full md:w-80 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>
            </div>

            <Card className="bg-black/40 border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">UTR Number</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Submitted</th>
                                <th className="px-6 py-4 font-semibold">Proof</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredRequests.map((req) => (
                                <tr key={req._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {req.user?.name?.[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{req.user?.name}</div>
                                                <div className="text-gray-500 text-xs">{req.user?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="bg-black/30 px-2 py-1 rounded text-indigo-300 text-sm">{req.utr}</code>
                                    </td>
                                    <td className="px-6 py-4 text-white font-semibold">₹{req.amount}</td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedImage(req.paymentScreenshot)}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-indigo-400 transition-all group-hover:scale-110"
                                            title="View Screenshot"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {req.status === 'pending' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    disabled={processingId === req._id}
                                                    onClick={() => handleVerify(req._id, 'approved')}
                                                    className="p-2 bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    disabled={processingId === req._id}
                                                    onClick={() => handleVerify(req._id, 'rejected')}
                                                    className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-600 text-xs italic">Processed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Screenshot Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                            onClick={() => setSelectedImage(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-4xl max-h-[90vh] overflow-auto rounded-2xl shadow-2xl border border-white/20 bg-black"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img src={selectedImage} alt="Payment Proof" className="w-full h-auto rounded-xl" />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageSubscriptions;
