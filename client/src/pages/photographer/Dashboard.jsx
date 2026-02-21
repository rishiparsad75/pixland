import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Plus, Camera, Image as ImageIcon, QrCode, TrendingUp, Calendar, MapPin, MoreVertical, Trash2, Upload as UploadIcon } from "lucide-react";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";

const PhotographerDashboard = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ name: "", location: "" });
    const [deleteLoading, setDeleteLoading] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [eventsRes, statsRes] = await Promise.all([
                api.get("/api/events/my-events"),
                api.get("/api/analytics/photographer")
            ]);
            setEvents(eventsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error("Error fetching photographer data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/api/events", newEvent);
            setEvents([res.data, ...events]);
            setShowCreateModal(false);
            setNewEvent({ name: "", location: "" });
        } catch (error) {
            alert("Error creating event");
        }
    };

    const handleDeleteEvent = async (id, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this event? All associated photos will also be deleted.")) return;
        setDeleteLoading(id);
        try {
            await api.delete(`/api/events/${id}`);
            setEvents(events.filter(e => e._id !== id));
        } catch (error) {
            alert("Failed to delete event");
        } finally {
            setDeleteLoading(null);
        }
    };

    if (loading) return <div className="p-10 text-white">Loading your events...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Photographer Hub</h1>
                    <p className="text-gray-400">Manage your events and track your uploads</p>
                </div>
                <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    Create New Event
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-indigo-600/10 border-indigo-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-lg">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Events</p>
                            <p className="text-2xl font-bold text-white">{stats?.eventCount || 0}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-purple-600/10 border-purple-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
                            <ImageIcon size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Uploads</p>
                            <p className="text-2xl font-bold text-white">{stats?.photoCount || 0}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-green-600/10 border-green-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 text-green-400 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Active Views</p>
                            <p className="text-2xl font-bold text-white">2.4k</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Event List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {events.map((event) => (
                    <Card
                        key={event._id}
                        onClick={() => navigate(`/photographer/event/${event._id}`)}
                        className="group hover:border-indigo-500/50 transition-all p-6 cursor-pointer"
                    >
                        <div className="flex gap-6">
                            <div className="p-4 bg-white rounded-xl shadow-lg border border-white/10 shrink-0">
                                <QRCode value={`http://localhost:5181/event/${event.qrToken}`} size={80} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                                        {event.name}
                                    </h3>
                                    <button
                                        onClick={(e) => handleDeleteEvent(event._id, e)}
                                        disabled={deleteLoading === event._id}
                                        className="text-gray-500 hover:text-red-500 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        {deleteLoading === event._id ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Trash2 size={18} />
                                        )}
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                    <span className="flex items-center gap-1"><MapPin size={14} /> {event.location || "N/A"}</span>
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(event.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex gap-3 mt-auto">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="gap-2 text-[12px] flex-1"
                                        onClick={() => window.location.href = '/photographer/upload'}
                                    >
                                        <UploadIcon size={14} /> Upload Photos
                                    </Button>
                                    <Button size="sm" variant="ghost" className="gap-2 text-[12px] flex-1 border border-white/5">
                                        <QrCode size={14} /> Share QR
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Create Event Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowCreateModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#111] border border-white/10 w-full max-w-md p-8 rounded-3xl relative z-110 shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Create New Event</h2>
                            <form onSubmit={handleCreateEvent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Event Name</label>
                                    <input
                                        type="text" required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                                        placeholder="e.g. Royal Wedding 2026"
                                        value={newEvent.name}
                                        onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                                        placeholder="e.g. Mumbai, India"
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                                    <Button type="submit" className="flex-1">Create Event</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PhotographerDashboard;
