import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, MoreHorizontal, User, FileImage, Scan, AlertCircle } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Gallery = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [hasFaceVerification, setHasFaceVerification] = useState(false);

    useEffect(() => {
        checkFaceVerification();
    }, []);

    const checkFaceVerification = async () => {
        try {
            // Super admin and photographer have full access without face verification
            if (user?.role === 'super-admin' || user?.role === 'photographer') {
                setHasFaceVerification(true);
                fetchImages();
                return;
            }

            // Check if user has faceEmbedding (has scanned face)
            const res = await api.get("/api/users/me");
            const hasFace = res.data.faceEmbedding && res.data.faceEmbedding.length > 0;
            setHasFaceVerification(hasFace);

            if (hasFace) {
                fetchImages();
            } else {
                setLoading(false);
                setShowAccessModal(true);
            }
        } catch (error) {
            console.error("Error checking face verification", error);
            setLoading(false);
            setShowAccessModal(true);
        }
    };

    const fetchImages = async () => {
        try {
            // Fetch only images belonging to this user (filtered by user ID on backend)
            const res = await api.get("/api/images");
            setImages(res.data);
        } catch (error) {
            console.error("Error fetching images", error);
        } finally {
            setLoading(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-black pt-28 pb-10 px-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Photo Gallery</h1>
                        <p className="text-gray-400">
                            {hasFaceVerification ? `${images.length} photos secured in your vault` : "Face verification required"}
                        </p>
                    </div>

                    {hasFaceVerification && (
                        <div className="flex gap-3">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search faces..."
                                    className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-black/40 transition-all w-64"
                                />
                            </div>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Filter size={16} /> Filter
                            </Button>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Gallery Grid - Only show if face verified */}
                {!loading && hasFaceVerification && (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    >
                        {images.map((img) => (
                            <motion.div key={img._id} variants={item}>
                                <Card className="p-0 group cursor-pointer border-0" hoverEffect={false}>
                                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
                                        <img
                                            src={img.url}
                                            alt="Uploaded"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23111" width="200" height="200"/%3E%3Ctext fill="%23666" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                                            }}
                                        />

                                        {/* Overlay on Hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">

                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">
                                                        {new Date(img.createdAt).toLocaleDateString()}
                                                    </p>
                                                    {img.metadata?.detectedFaces?.length > 0 && (
                                                        <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-medium bg-indigo-500/20 px-2 py-1 rounded-full w-fit backdrop-blur-md">
                                                            <User size={12} />
                                                            {img.metadata.detectedFaces.length} Face(s)
                                                        </div>
                                                    )}
                                                </div>
                                                <button className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {!loading && hasFaceVerification && images.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                            <FileImage size={32} />
                        </div>
                        <p className="text-gray-400 text-lg mb-6">No photos found in your gallery.</p>
                        <p className="text-gray-500 text-sm mb-6">Photos where your face was detected will appear here</p>
                    </div>
                )}

                {/* Face Verification Required Modal */}
                <AnimatePresence>
                    {showAccessModal && !hasFaceVerification && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-gradient-to-b from-gray-900 to-black border border-yellow-500/30 w-full max-w-md p-8 rounded-3xl relative z-110 shadow-2xl"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                                        <AlertCircle size={40} className="text-yellow-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-4">Face Verification Required</h2>
                                    <p className="text-gray-400 mb-6 leading-relaxed">
                                        To access your personalized gallery and view photos where you appear, please complete face verification by scanning a QR code at an event.
                                    </p>
                                    <div className="w-full space-y-3">
                                        <Button
                                            className="w-full gap-2"
                                            onClick={() => navigate("/face-scan")}
                                        >
                                            <Scan size={18} />
                                            Scan Face at Event
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full"
                                            onClick={() => navigate("/")}
                                        >
                                            Go Back Home
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default Gallery;
