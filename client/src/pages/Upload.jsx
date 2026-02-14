import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload as UploadIcon, X, CheckCircle, AlertCircle, FileImage, Files, Plus } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const Upload = () => {
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ name: "", location: "" });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get("/api/events/my-events");
                setEvents(res.data);
                if (res.data.length > 0) setSelectedEvent(res.data[0]._id);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };
        fetchEvents();
    }, []);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleFiles = (selectedFiles) => {
        setError("");
        const validFiles = selectedFiles.filter(file => {
            if (!file.type.startsWith("image/")) {
                setError("Some files were skipped because they are not valid images.");
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setFiles(prev => [...prev, ...validFiles]);
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index) => {
        const newFiles = [...files];
        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setFiles(newFiles);
        setPreviews(newPreviews);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (files.length === 0 || !selectedEvent) {
            setError("Please select an event and at least one image.");
            return;
        }

        const formData = new FormData();
        files.forEach((file) => {
            formData.append("images", file);
        });
        formData.append("eventId", selectedEvent);

        setLoading(true);
        try {
            await api.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            navigate("/photographer/dashboard");
        } catch (error) {
            setError(error.response?.data?.error || "Upload Failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/api/events", newEvent);
            setEvents([res.data, ...events]);
            setSelectedEvent(res.data._id);
            setShowCreateModal(false);
            setNewEvent({ name: "", location: "" });
        } catch (error) {
            alert("Error creating event");
        }
    };

    return (
        <div className="min-h-screen bg-black pt-28 px-4 flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">SaaS Upload Center</h1>
                    <p className="text-gray-400">Select an event and upload photos for AI processing.</p>
                </div>

                <Card className="p-8 border border-white/10 bg-white/5 backdrop-blur-xl">
                    <form onSubmit={handleUpload}>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Select Target Event</label>
                            <div className="flex gap-3">
                                <select
                                    value={selectedEvent}
                                    onChange={(e) => setSelectedEvent(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="" className="bg-black">Choose an event...</option>
                                    {events.map(event => (
                                        <option key={event._id} value={event._id} className="bg-black">{event.name}</option>
                                    ))}
                                </select>
                                <Button
                                    type="button"
                                    onClick={() => setShowCreateModal(true)}
                                    className="whitespace-nowrap gap-2 bg-white/10 hover:bg-white/20 border border-white/10"
                                >
                                    <Plus size={18} /> New Event
                                </Button>
                            </div>
                        </div>

                        <div
                            className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center ${dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-white/20'}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                            />

                            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400">
                                {files.length > 0 ? <Files size={32} /> : <UploadIcon size={32} />}
                            </div>

                            <p className="text-lg font-medium text-white mb-2 text-center">
                                {files.length > 0 ? `${files.length} images selected` : "Drag & Drop images here"}
                            </p>
                            <p className="text-sm text-gray-400 mb-6 text-center">
                                or click to browse from your computer
                            </p>

                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => document.getElementById('file-upload').click()}
                            >
                                {files.length > 0 ? "Add More Files" : "Browse Files"}
                            </Button>
                        </div>

                        {previews.length > 0 && (
                            <div className="mt-8 grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-60 overflow-y-auto p-2">
                                {previews.map((src, index) => (
                                    <div key={src} className="relative aspect-square rounded-lg overflow-hidden group border border-white/10">
                                        <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm mt-6 p-3 rounded bg-red-500/10 border border-red-500/20">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div className="mt-8 flex justify-end gap-4 border-t border-white/10 pt-6">
                            <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={loading}
                                disabled={files.length === 0}
                                className="min-w-[140px]"
                            >
                                {loading ? "Processing..." : `Upload ${files.length || ''} Photos`}
                            </Button>
                        </div>
                    </form>
                </Card>
            </motion.div>

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

export default Upload;
