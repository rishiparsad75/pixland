import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, MoreHorizontal, User, FileImage, Scan, AlertCircle, Download, DownloadCloud, Check, Loader2, Camera, Plus } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import AuthContext from "../context/AuthContext";

import { useNavigate, useLocation } from "react-router-dom";

const Gallery = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [hasFaceVerification, setHasFaceVerification] = useState(false);
    const [isSearchResult, setIsSearchResult] = useState(false);
    const [scannedEvent, setScannedEvent] = useState(null);
    const [downloadingImageId, setDownloadingImageId] = useState(null);
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);

    useEffect(() => {
        if (location.state?.matchedImages) {
            setImages(location.state.matchedImages);
            setScannedEvent(location.state.event);
            setHasFaceVerification(true);
            setIsSearchResult(true);
            setLoading(false);
        } else {
            checkFaceVerification();
        }
    }, [location.state]);

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState("");

    const isPremium = user?.subscription?.plan === 'premium' || (user?.subscription?.isOnTrial && new Date() < new Date(user?.subscription?.trialEndsAt));

    const handleDownload = async (img) => {
        try {
            setDownloadingImageId(img._id);

            // 1. Check limit on backend
            const trackRes = await api.post("/api/users/track-download");

            // 2. Trigger actual browser download
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
            const status = error.response?.status;
            if (status === 403) {
                setUpgradeReason("You've used all 10 free downloads this month.");
                setShowUpgradeModal(true);
            }
        } finally {
            setDownloadingImageId(null);
        }
    };

    const handleDownloadAll = async () => {
        if (!isPremium) {
            setUpgradeReason("Bulk Download is a premium feature — download all photos at once!");
            setShowUpgradeModal(true);
            return;
        }
        try {
            setIsDownloadingAll(true);
            for (const img of images) {
                await handleDownload(img);
            }
        } catch (error) {
            console.error("Bulk download failed", error);
        } finally {
            setIsDownloadingAll(false);
        }
    };



    const checkFaceVerification = async () => {
        try {
            if (user?.role === 'super-admin' || user?.role === 'photographer') {
                setHasFaceVerification(true);
                fetchImages();
                return;
            }

            const res = await api.get("/api/users/me");
            // If user has a descriptor saved (future feature), we could use it
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
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {isSearchResult ? (scannedEvent ? `Scan results for ${scannedEvent.name}` : "Scan Results") : "Photo Gallery"}
                        </h1>
                        <p className="text-gray-400">
                            {isSearchResult
                                ? (scannedEvent
                                    ? `We found ${images.length} photos of you in ${scannedEvent.name}`
                                    : `We found ${images.length} photos matching your face`)
                                : (hasFaceVerification ? `${images.length} photos secured in your vault` : "Face verification required")}
                        </p>

                        {isSearchResult && (
                            <button
                                onClick={() => {
                                    setIsSearchResult(false);
                                    fetchImages();
                                }}
                                className="text-indigo-400 text-xs font-bold uppercase mt-2 hover:underline"
                            >
                                Show All My Photos
                            </button>
                        )}

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
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500 hover:text-white"
                                onClick={handleDownloadAll}
                                disabled={isDownloadingAll || images.length === 0}
                            >
                                {isDownloadingAll ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" /> Preparing...
                                    </>
                                ) : (
                                    <>
                                        <DownloadCloud size={16} /> Download All
                                    </>
                                )}
                                {!isPremium && (
                                    <span className="ml-1 text-[8px] bg-indigo-500 text-white px-1 rounded-sm">PRO</span>
                                )}
                            </Button>
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
                                    <div
                                        className="relative aspect-[4/3] overflow-hidden bg-gray-900"
                                        onClick={() => handleDownload(img)}
                                    >
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
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">

                                            <div className="flex justify-between items-end">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-1.5 text-indigo-300 text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 px-2.5 py-1 rounded-full w-fit backdrop-blur-md border border-indigo-500/30">
                                                        <User size={10} />
                                                        {img.metadata?.detectedFaces?.length || 0} Faces
                                                    </div>
                                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">
                                                        Captured {new Date(img.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <motion.button
                                                    whileHover={{ scale: 1.1, backgroundColor: "rgba(79, 70, 229, 0.9)" }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDownload(img);
                                                    }}
                                                    disabled={downloadingImageId === img._id}
                                                    className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/40 border border-indigo-400/30 disabled:opacity-50"
                                                >
                                                    {downloadingImageId === img._id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                                </motion.button>
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
                        {user?.role === 'photographer' ? (
                            <>
                                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
                                    <Camera size={32} />
                                </div>
                                <p className="text-gray-400 text-lg mb-2">No photos found in your dashboard.</p>
                                <p className="text-gray-500 text-sm mb-6">Create an event and upload photos to start building your gallery.</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        className="bg-indigo-600 hover:bg-indigo-500 gap-2"
                                        onClick={() => navigate('/photographer/dashboard')}
                                    >
                                        <Plus size={18} /> Create Your First Event
                                    </Button>
                                    {user?.usage?.uploads?.count >= (user?.usage?.uploads?.monthlyLimit || 500) && (
                                        <Button
                                            variant="outline"
                                            className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10"
                                            onClick={() => navigate('/pricing')}
                                        >
                                            Upgrade Plan
                                        </Button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                                    <FileImage size={32} />
                                </div>
                                <p className="text-gray-400 text-lg mb-6">No photos found in your gallery.</p>
                                <p className="text-gray-500 text-sm mb-6">Photos where your face was detected will appear here</p>
                            </>
                        )}
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

                {/* Upgrade Modal */}
                <AnimatePresence>
                    {showUpgradeModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowUpgradeModal(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
                            />
                            <motion.div
                                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.85, opacity: 0, y: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="relative z-10 bg-gradient-to-br from-[#1a1040] via-[#120d2e] to-black border border-indigo-500/40 w-full max-w-sm p-8 rounded-3xl shadow-2xl shadow-indigo-800/30 text-center"
                            >
                                {/* Glow ring */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-indigo-500 rounded-full blur-3xl opacity-30" />

                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/30">
                                    <DownloadCloud size={30} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-black text-white mb-2">Upgrade to Premium</h2>
                                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                    {upgradeReason}
                                    <br />
                                    <span className="text-indigo-300 font-semibold mt-1 block">Get unlimited downloads for ₹499/month</span>
                                </p>
                                <div className="space-y-3">
                                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-base h-12 shadow-lg shadow-indigo-600/30" onClick={() => { setShowUpgradeModal(false); navigate('/pricing'); }}>
                                        Upgrade Now ✨
                                    </Button>
                                    <button onClick={() => setShowUpgradeModal(false)} className="text-gray-500 text-sm hover:text-gray-300 transition-colors w-full">
                                        Maybe later
                                    </button>
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
