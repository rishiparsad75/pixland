import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload as UploadIcon, X, AlertCircle, FileImage, Files, Plus, CheckCircle } from "lucide-react";
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
    const [createError, setCreateError] = useState(""); // Bug fix: replaces alert()
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
        if (e.target.files) handleFiles(Array.from(e.target.files));
    };

    const handleFiles = (selectedFiles) => {
        setError("");
        const validFiles = selectedFiles.filter(file => {
            if (!file.type.startsWith("image/")) {
                setError("Some files were skipped — only images are accepted.");
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
        files.forEach(file => formData.append("images", file));
        formData.append("eventId", selectedEvent);
        setLoading(true);
        try {
            await api.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            navigate("/photographer/dashboard");
        } catch (error) {
            setError(error.response?.data?.error || "Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Bug fix: replaced alert() with proper setCreateError state
    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setCreateError("");
        try {
            const res = await api.post("/api/events", newEvent);
            setEvents([res.data, ...events]);
            setSelectedEvent(res.data._id);
            setShowCreateModal(false);
            setNewEvent({ name: "", location: "" });
        } catch (error) {
            setCreateError(error.response?.data?.message || "Failed to create event. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-[#2B2E33] pt-28 px-4 flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7B7F85]/6 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-[#F5F6F7] mb-2 tracking-tight">Upload Center</h1>
                    <p className="text-[#7B7F85] text-sm">Select an event and upload photos for AI face processing.</p>
                </div>

                <div className="bg-[#1A1D20]/60 border border-[#C1C4C8]/12 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleUpload}>

                        {/* Event Selector */}
                        <div className="mb-7">
                            <label className="block text-xs font-bold text-[#7B7F85] mb-2 uppercase tracking-widest">Target Event</label>
                            <div className="flex gap-3">
                                <select
                                    value={selectedEvent}
                                    onChange={(e) => setSelectedEvent(e.target.value)}
                                    className="w-full bg-[#2B2E33]/80 border border-[#C1C4C8]/15 rounded-xl px-4 py-3 text-[#F5F6F7] text-sm focus:outline-none focus:ring-2 focus:ring-[#C1C4C8]/30 focus:border-[#C1C4C8]/25 appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="" className="bg-[#2B2E33]">Choose an event...</option>
                                    {events.map(event => (
                                        <option key={event._id} value={event._id} className="bg-[#2B2E33]">{event.name}</option>
                                    ))}
                                </select>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowCreateModal(true)}
                                    className="whitespace-nowrap gap-2"
                                >
                                    <Plus size={17} /> New Event
                                </Button>
                            </div>
                        </div>

                        {/* Drop Zone */}
                        <div
                            className={`relative border-2 border-dashed rounded-2xl p-10 transition-all flex flex-col items-center justify-center min-h-[200px] ${dragActive
                                    ? 'border-[#F5F6F7]/50 bg-[#C1C4C8]/8'
                                    : 'border-[#C1C4C8]/15 hover:border-[#C1C4C8]/30 hover:bg-[#C1C4C8]/4'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file" id="file-upload"
                                className="hidden" accept="image/*" multiple
                                onChange={handleFileChange}
                            />
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${files.length > 0 ? 'bg-[#C1C4C8]/20 text-[#F5F6F7]' : 'bg-[#C1C4C8]/10 text-[#7B7F85]'
                                }`}>
                                {files.length > 0 ? <Files size={28} /> : <UploadIcon size={28} />}
                            </div>
                            <p className="text-base font-bold text-[#F5F6F7] mb-1 text-center">
                                {files.length > 0 ? `${files.length} image${files.length > 1 ? 's' : ''} selected` : "Drag & Drop images here"}
                            </p>
                            <p className="text-sm text-[#7B7F85] mb-5 text-center">or browse from your computer</p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('file-upload').click()}
                            >
                                {files.length > 0 ? "Add More Files" : "Browse Files"}
                            </Button>
                        </div>

                        {/* Previews */}
                        {previews.length > 0 && (
                            <div className="mt-6 grid grid-cols-5 sm:grid-cols-7 gap-2.5 max-h-52 overflow-y-auto p-1">
                                {previews.map((src, index) => (
                                    <div key={src} className="relative aspect-square rounded-xl overflow-hidden group border border-[#C1C4C8]/10">
                                        <img src={src} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="absolute inset-0 bg-[#1A1D20]/70 text-[#F5F6F7] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm mt-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                <AlertCircle size={15} />
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-7 flex justify-end gap-3 border-t border-[#C1C4C8]/10 pt-6">
                            <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={loading}
                                disabled={files.length === 0}
                                className="min-w-[150px]"
                            >
                                {loading ? "Processing..." : `Upload ${files.length || ''} Photo${files.length !== 1 ? 's' : ''}`}
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>

            {/* Create Event Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#1A1D20]/85 backdrop-blur-sm"
                            onClick={() => { setShowCreateModal(false); setCreateError(""); }}
                        />
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            className="bg-[#2B2E33] border border-[#C1C4C8]/15 w-full max-w-md p-8 rounded-3xl relative z-10 shadow-2xl"
                        >
                            <h2 className="text-2xl font-black text-[#F5F6F7] mb-6">Create New Event</h2>
                            <form onSubmit={handleCreateEvent} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#7B7F85] mb-2 uppercase tracking-widest">Event Name</label>
                                    <input
                                        type="text" required
                                        className="w-full bg-[#1A1D20]/80 border border-[#C1C4C8]/15 rounded-xl px-4 py-3 text-[#F5F6F7] text-sm focus:outline-none focus:ring-2 focus:ring-[#C1C4C8]/30"
                                        placeholder="e.g. Royal Wedding 2026"
                                        value={newEvent.name}
                                        onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#7B7F85] mb-2 uppercase tracking-widest">Location</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#1A1D20]/80 border border-[#C1C4C8]/15 rounded-xl px-4 py-3 text-[#F5F6F7] text-sm focus:outline-none focus:ring-2 focus:ring-[#C1C4C8]/30"
                                        placeholder="e.g. Mumbai, India"
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                    />
                                </div>

                                {/* Bug fix: proper inline error instead of alert() */}
                                {createError && (
                                    <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <AlertCircle size={14} />
                                        {createError}
                                    </div>
                                )}

                                <div className="pt-3 flex gap-3">
                                    <Button type="button" variant="ghost" className="flex-1" onClick={() => { setShowCreateModal(false); setCreateError(""); }}>
                                        Cancel
                                    </Button>
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
