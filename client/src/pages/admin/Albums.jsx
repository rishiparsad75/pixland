import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Card from "../../components/ui/Card";
import { Image as ImageIcon, MapPin, Calendar, Camera, Globe, Search, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const EventMonitor = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(null);

    useEffect(() => {
        const fetchAllEvents = async () => {
            try {
                const res = await api.get("/api/events/all");
                setEvents(res.data);
            } catch (error) {
                console.error("Failed to fetch system events");
            } finally {
                setLoading(false);
            }
        };
        fetchAllEvents();
    }, []);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this event? This will also delete all associated photos.")) return;

        setDeleteLoading(id);
        try {
            await api.delete(`/api/events/${id}`);
            setEvents(events.filter(ev => ev._id !== id));
        } catch (error) {
            console.error("Failed to delete event", error);
            alert("Failed to delete event");
        } finally {
            setDeleteLoading(null);
        }
    };

    const filteredEvents = events.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Global Event Monitor</h1>
                    <p className="text-gray-400">Oversee all photography projects across the PixLand network.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search events or locations..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-white">
                    {filteredEvents.map((event) => (
                        <Card
                            key={event._id}
                            onClick={() => navigate(`/admin/event/${event._id}`)}
                            className="group hover:border-indigo-500/50 transition-all duration-300 bg-white/5 backdrop-blur-xl border-white/10 p-0 overflow-hidden flex flex-col h-full relative cursor-pointer"
                        >
                            {/* Delete Button Overlay */}
                            <div className="absolute top-4 right-4 z-20 flex gap-2">
                                <button
                                    onClick={(e) => handleDelete(event._id, e)}
                                    className="p-2 bg-black/60 hover:bg-red-500/80 rounded-lg backdrop-blur-md text-white/80 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                    disabled={deleteLoading === event._id}
                                >
                                    {deleteLoading === event._id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 size={14} />}
                                </button>
                            </div>

                            <div className="h-40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 relative flex items-center justify-center">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent" />
                                <Camera size={48} className="text-indigo-400/50 group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                                    Active Project
                                </div>
                            </div>

                            <div className="p-6 flex-grow">
                                <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-400 transition-colors">{event.name}</h3>
                                <div className="space-y-2 text-sm text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-indigo-400" />
                                        {event.location || "Online/Global"}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-indigo-400" />
                                        {new Date(event.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Globe size={14} className="text-emerald-400" />
                                    <span className="text-xs text-emerald-400 font-medium uppercase tracking-tighter">Event Scoped</span>
                                </div>
                                <span className="text-[10px] text-gray-500 font-mono">{event._id.substring(0, 8)}...</span>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-20 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-white/10 text-center">
                    <ImageIcon size={64} className="text-gray-700 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No active events found</h3>
                    <p className="text-gray-500 max-w-sm">No events have been created in the system yet or match your search.</p>
                </div>
            )}
        </div>
    );
};

export default EventMonitor;
