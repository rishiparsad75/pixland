import { useState, useEffect } from "react";
import api from "../../api/axios";
import Card from "../../components/ui/Card";
import { Image as ImageIcon, Search, Trash2, User, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Photos = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await api.get("/api/images/all");
                setImages(res.data);
            } catch (error) {
                console.error("Failed to fetch images", error);
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, []);

    const handleDeleteClick = (img) => {
        setImageToDelete(img);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!imageToDelete) return;

        setDeleteLoading(imageToDelete._id);
        try {
            await api.delete(`/api/images/${imageToDelete._id}`);
            setImages(images.filter(i => i._id !== imageToDelete._id));
            setShowDeleteModal(false);
            setImageToDelete(null);
        } catch (error) {
            console.error("Failed to delete image", error);
            alert("Failed to delete image");
        } finally {
            setDeleteLoading(null);
        }
    };

    const filteredImages = images.filter(img =>
        (img.user?.name && img.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (img.event?.name && img.event.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        img.url.includes(searchTerm)
    );

    return (
        <div className="pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">System Photos</h1>
                    <p className="text-gray-400">View and manage all photos uploaded to the platform.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by user or event..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : filteredImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredImages.map((img) => (
                        <div key={img._id} className="relative group aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10">
                            <img
                                src={img.url}
                                alt="System Asset"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23111" width="400" height="400"/%3E%3Ctext fill="%23666" font-size="16" x="50%25" y="45%25" text-anchor="middle" dominant-baseline="middle"%3EImage Not Available%3C/text%3E%3Ctext fill="%23444" font-size="12" x="50%25" y="55%25" text-anchor="middle" dominant-baseline="middle"%3EAzure Blob Storage%3C/text%3E%3C/svg%3E';
                                }}
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleDeleteClick(img)}
                                        className="p-2 bg-red-500/20 hover:bg-red-500/80 text-red-400 hover:text-white rounded-lg transition-colors"
                                        disabled={deleteLoading === img._id}
                                    >
                                        {deleteLoading === img._id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </div>
                                <div className="text-xs text-gray-300 space-y-1">
                                    <p className="flex items-center gap-1.5 truncate">
                                        <User size={12} className="text-indigo-400" />
                                        {img.user?.name || "Unknown User"}
                                    </p>
                                    <p className="flex items-center gap-1.5 truncate">
                                        <Calendar size={12} className="text-purple-400" />
                                        {img.event?.name || "Global Event"}
                                    </p>
                                    <p className="opacity-50 text-[10px]">
                                        {new Date(img.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-white/10 text-center">
                    <ImageIcon size={64} className="text-gray-700 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No photos found</h3>
                    <p className="text-gray-500 max-w-sm">The system gallery is currently empty or no matches found.</p>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="bg-gray-900 border border-red-500/20 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-500/10 rounded-full">
                                    <Trash2 className="text-red-500" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Delete Photo?</h3>
                                    <p className="text-sm text-gray-400">This action cannot be undone</p>
                                </div>
                            </div>

                            {imageToDelete && (
                                <div className="bg-white/5 rounded-lg p-3 mb-4 border border-white/10">
                                    <p className="text-sm text-gray-300 flex items-center gap-2">
                                        <User size={14} className="text-indigo-400" />
                                        {imageToDelete.user?.name || "Unknown User"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(imageToDelete.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleteLoading}
                                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleteLoading ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Photos;
