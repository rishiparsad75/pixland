import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Camera, MapPin, Calendar, Users, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const EventLanding = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await api.get(`/api/events/scan/${token}`);
                setEvent(res.data);
                // Store event context in session for the face scan
                sessionStorage.setItem("currentEvent", JSON.stringify(res.data));
            } catch (error) {
                console.error("Event not found");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [token]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Verifying Event Access...</div>;

    if (!event) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
            <h1 className="text-2xl font-bold mb-4">Invalid Event QR</h1>
            <p className="text-gray-400 mb-8">This QR code is either expired or invalid.</p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-black pt-20 px-6 relative overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <ShieldCheck size={14} /> Secure Event Access
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">{event.name}</h1>
                    <div className="flex flex-wrap justify-center gap-6 text-gray-400">
                        <span className="flex items-center gap-2"><MapPin size={18} className="text-indigo-400" /> {event.location || "Private Location"}</span>
                        <span className="flex items-center gap-2"><Calendar size={18} className="text-indigo-400" /> {new Date(event.createdAt).toLocaleDateString()}</span>
                    </div>
                </motion.div>

                <Card className="p-8 border border-white/10 bg-white/5 backdrop-blur-2xl rounded-3xl text-center shadow-2xl">
                    <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-indigo-600/30">
                        <Camera size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Find Your Photos</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        To protect your privacy, we use AI to scan your face and match it with photos from this event only. No photos are shared without a match.
                    </p>

                    <Button
                        size="lg"
                        className="w-full h-16 text-lg font-bold gap-3 shadow-xl shadow-indigo-600/20"
                        onClick={() => navigate("/face-scan")}
                    >
                        Start Face Identity
                    </Button>

                    <p className="mt-6 text-xs text-gray-500 uppercase tracking-widest flex items-center justify-center gap-2">
                        <Users size={12} /> Powered by PixLand AI
                    </p>
                </Card>

                {/* Event Photographer Info */}
                <div className="mt-8 flex items-center justify-center gap-3 text-sm text-gray-400">
                    <span className="w-1 h-1 rounded-full bg-indigo-500" />
                    Captured by <span className="text-white font-medium">{event.photographer?.name}</span>
                    <span className="w-1 h-1 rounded-full bg-indigo-500" />
                </div>
            </div>
        </div>
    );
};

export default EventLanding;
