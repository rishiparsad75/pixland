import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, MapPin, Calendar, ChevronLeft, Download, User, FileImage, Loader2, Trash2 } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const EventPhotos = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingImageId, setDownloadingImageId] = useState(null);

    useEffect(() => {
        const fetchEventPhotos = async () => {
            try {
                const res = await api.get(`/api/images/event/${eventId}`);
                setEvent(res.data.event);
                setImages(res.data.images);
            } catch (error) {
                console.error("Error fetching event photos", error);
                alert("Failed to load event photos");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchEventPhotos();
    }, [eventId, navigate]);

    const handleDownload = async (img) => {
        try {
            setDownloadingImageId(img._id);
            const response = await fetch(img.url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `PixLand-${img._id}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed", error);
        } finally {
            setDownloadingImageId(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-black pt-28 pb-10 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                {/* Event Info Header */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -mr-20 -mt-20" />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">
                                <Camera size={14} />
                                Event Details
                            </div>
                            <h1 className="text-4xl font-black text-white mb-4">{event?.name}</h1>
                            <div className="flex flex-wrap gap-6 text-gray-400 text-sm">
                                <span className="flex items-center gap-2">
                                    <MapPin size={16} className="text-indigo-500" />
                                    {event?.location || "Global/Online"}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar size={16} className="text-indigo-500" />
                                    {new Date(event?.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                        <div className="bg-indigo-600/20 border border-indigo-500/30 px-6 py-4 rounded-2xl text-center">
                            <p className="text-3xl font-black text-white">{images.length}</p>
                            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Total Photos</p>
                        </div>
                    </div>
                </div>

                {/* Photos Grid */}
                {images.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {images.map((img) => (
                            <motion.div
                                key={img._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="p-0 group border-white/5 bg-gray-900/50 hover:border-indigo-500/50 transition-all overflow-hidden relative aspect-[4/3]">
                                    <img
                                        src={img.url}
                                        alt="Event Photo"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />

                                    {/* Actions Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-[10px] text-white/60 font-medium">
                                                <User size={12} />
                                                {img.metadata?.detectedFaces?.length || 0} Faces Detected
                                            </div>
                                            <button
                                                onClick={() => handleDownload(img)}
                                                disabled={downloadingImageId === img._id}
                                                className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-500 transition-colors"
                                            >
                                                {downloadingImageId === img._id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-white/10 text-center border-dashed">
                        <FileImage size={64} className="text-gray-700 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No photos in this event yet</h3>
                        <p className="text-gray-500 max-w-sm">Use the upload tool to add photos to this specific project.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventPhotos;
