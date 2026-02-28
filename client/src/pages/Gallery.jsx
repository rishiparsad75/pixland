import { useEffect, useState, useContext, useCallback } from "react";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, User, FileImage, Scan, AlertCircle, Download, DownloadCloud, Loader2, Camera, Plus, X } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import AuthContext from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Gallery = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [hasFaceVerification, setHasFaceVerification] = useState(false);
    const [isSearchResult, setIsSearchResult] = useState(false);
    const [scannedEvent, setScannedEvent] = useState(null);
    const [downloadingIds, setDownloadingIds] = useState(new Set()); // Bug fix: use Set to track per-image
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");                // Bug fix: search now has state
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState("");
    const [lightboxImg, setLightboxImg] = useState(null);

    const isPremium = user?.subscription?.plan === 'premium' ||
        (user?.subscription?.isOnTrial && new Date() < new Date(user?.subscription?.trialEndsAt));

    // ── Load images ──────────────────────────────────────────────
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

    // ── Search / filter ──────────────────────────────────────────
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredImages(images);
            return;
        }
        const q = searchQuery.toLowerCase();
        // Filter by date string or face count
        const filtered = images.filter(img => {
            const date = new Date(img.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric"
            }).toLowerCase();
            const faces = String(img.metadata?.detectedFaces?.length || 0);
            return date.includes(q) || faces.includes(q);
        });
        setFilteredImages(filtered);
    }, [searchQuery, images]);

    const checkFaceVerification = async () => {
        try {
            if (user?.role === 'super-admin' || user?.role === 'photographer') {
                setHasFaceVerification(true);
                fetchImages();
                return;
            }
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
            const res = await api.get("/api/images");
            setImages(res.data);
        } catch (error) {
            console.error("Error fetching images", error);
        } finally {
            setLoading(false);
        }
    };

    // ── Download fix: track-download first, then open URL ────────
    // Bug fix: Azure Blob URLs block fetch() cross-origin downloads.
    // Solution: call track-download, then use <a download> trick.
    const handleDownload = useCallback(async (img) => {
        if (downloadingIds.has(img._id)) return;
        try {
            setDownloadingIds(prev => new Set([...prev, img._id]));

            // 1. Track the download on backend (check limits)
            await api.post("/api/users/track-download");

            // 2. Attempt blob fetch with no-cors fallback
            try {
                const response = await fetch(img.url, { mode: 'cors' });
                if (!response.ok) throw new Error("CORS fetch failed");
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `PixLand-${img._id}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            } catch {
                // Fallback: open in new tab (works for public Azure Blob URLs)
                window.open(img.url, '_blank', 'noopener');
            }

        } catch (error) {
            const status = error.response?.status;
            if (status === 403) {
                setUpgradeReason("You've used all 10 free downloads this month.");
                setShowUpgradeModal(true);
            } else {
                console.error("Download failed", error);
            }
        } finally {
            setDownloadingIds(prev => {
                const next = new Set(prev);
                next.delete(img._id);
                return next;
            });
        }
    }, [downloadingIds]);

    // Bug fix: bulk download no longer reuses handleDownload's state updates unsafely
    const handleDownloadAll = async () => {
        if (!isPremium) {
            setUpgradeReason("Bulk Download is a premium feature — download all photos at once!");
            setShowUpgradeModal(true);
            return;
        }
        setIsDownloadingAll(true);
        try {
            for (const img of filteredImages) {
                await handleDownload(img);
                // Small delay to avoid browser blocking multiple downloads
                await new Promise(r => setTimeout(r, 600));
            }
        } catch (error) {
            console.error("Bulk download failed", error);
        } finally {
            setIsDownloadingAll(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.06 } }
    };
    const item = {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen bg-[#2B2E33] pt-28 pb-16 px-6">
            <div className="max-w-7xl mx-auto">

                {/* ── Header ───────────────────────────────── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-5">
                    <div>
                        <h1 className="text-3xl font-black text-[#F5F6F7] mb-1 tracking-tight">
                            {isSearchResult
                                ? (scannedEvent ? `Results for "${scannedEvent.name}"` : "Scan Results")
                                : "Photo Gallery"}
                        </h1>
                        <p className="text-[#7B7F85] text-sm">
                            {isSearchResult
                                ? `${filteredImages.length} photos matching your face`
                                : hasFaceVerification
                                    ? `${filteredImages.length} photos in your vault`
                                    : "Face verification required to access gallery"}
                        </p>

                        {isSearchResult && (
                            <button
                                onClick={() => { setIsSearchResult(false); fetchImages(); setSearchQuery(""); }}
                                className="text-[#C1C4C8] text-xs font-bold uppercase mt-2 hover:text-[#F5F6F7] transition-colors flex items-center gap-1"
                            >
                                <X size={12} /> Show All My Photos
                            </button>
                        )}
                    </div>

                    {hasFaceVerification && (
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* Functional search */}
                            <div className="relative group">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B7F85] group-focus-within:text-[#C1C4C8] transition-colors"
                                    size={16}
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by date or faces..."
                                    className="bg-[#1A1D20]/60 border border-[#C1C4C8]/15 rounded-xl pl-9 pr-4 py-2 text-[#F5F6F7] text-sm placeholder-[#7B7F85] focus:outline-none focus:ring-2 focus:ring-[#C1C4C8]/40 focus:border-[#C1C4C8]/30 transition-all w-56"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B7F85] hover:text-[#C1C4C8]"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={handleDownloadAll}
                                disabled={isDownloadingAll || filteredImages.length === 0}
                            >
                                {isDownloadingAll
                                    ? <><Loader2 size={15} className="animate-spin" /> Downloading...</>
                                    : <><DownloadCloud size={15} /> Download All</>
                                }
                                {!isPremium && (
                                    <span className="ml-1 text-[8px] bg-[#7B7F85] text-[#F5F6F7] px-1.5 py-0.5 rounded-sm font-bold">PRO</span>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {/* ── Loading Skeleton ──────────────────── */}
                {loading && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-square bg-[#C1C4C8]/8 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                )}

                {/* ── Gallery Grid ──────────────────────── */}
                {!loading && hasFaceVerification && filteredImages.length > 0 && (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
                    >
                        {filteredImages.map((img) => (
                            <motion.div key={img._id} variants={item}>
                                <div
                                    className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#1A1D20] border border-[#C1C4C8]/10 hover:border-[#C1C4C8]/25 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-black/30"
                                    onClick={() => setLightboxImg(img)}
                                >
                                    <img
                                        src={img.url}
                                        alt="Gallery photo"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%231A1D20" width="200" height="200"/%3E%3Ctext fill="%237B7F85" font-size="12" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                                        }}
                                    />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1D20]/95 via-[#2B2E33]/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-1.5 text-[#C1C4C8] text-[10px] font-bold uppercase tracking-widest bg-[#2B2E33]/80 px-2.5 py-1 rounded-full w-fit border border-[#C1C4C8]/15 backdrop-blur-sm">
                                                    <User size={9} />
                                                    {img.metadata?.detectedFaces?.length || 0} Faces
                                                </div>
                                                <p className="text-[10px] font-medium text-[#7B7F85]">
                                                    {new Date(img.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </p>
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => { e.stopPropagation(); handleDownload(img); }}
                                                disabled={downloadingIds.has(img._id)}
                                                className="w-10 h-10 bg-[#F5F6F7] text-[#2B2E33] rounded-xl flex items-center justify-center shadow-lg disabled:opacity-50 hover:bg-[#C1C4C8] transition-colors"
                                            >
                                                {downloadingIds.has(img._id)
                                                    ? <Loader2 size={17} className="animate-spin" />
                                                    : <Download size={17} />}
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* ── Search no results ─────────────────── */}
                {!loading && hasFaceVerification && images.length > 0 && filteredImages.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-[#7B7F85] text-lg mb-2">No photos match "{searchQuery}"</p>
                        <button onClick={() => setSearchQuery("")} className="text-[#C1C4C8] text-sm hover:text-[#F5F6F7] transition-colors">
                            Clear search
                        </button>
                    </div>
                )}

                {/* ── Empty State ───────────────────────── */}
                {!loading && hasFaceVerification && images.length === 0 && (
                    <div className="text-center py-20 bg-[#C1C4C8]/5 rounded-2xl border border-[#C1C4C8]/10 border-dashed">
                        {user?.role === 'photographer' ? (
                            <>
                                <div className="w-16 h-16 bg-[#C1C4C8]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#7B7F85]">
                                    <Camera size={30} />
                                </div>
                                <p className="text-[#C1C4C8] text-lg mb-2">No photos yet.</p>
                                <p className="text-[#7B7F85] text-sm mb-6">Create an event and upload photos to get started.</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button variant="primary" className="gap-2" onClick={() => navigate('/photographer/dashboard')}>
                                        <Plus size={17} /> Create Your First Event
                                    </Button>
                                    {user?.usage?.uploads?.count >= (user?.usage?.uploads?.monthlyLimit || 500) && (
                                        <Button variant="outline" onClick={() => navigate('/pricing')}>
                                            Upgrade Plan
                                        </Button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-[#C1C4C8]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#7B7F85]">
                                    <FileImage size={30} />
                                </div>
                                <p className="text-[#C1C4C8] text-lg mb-3">No photos in your gallery.</p>
                                <p className="text-[#7B7F85] text-sm mb-6">Photos where your face is detected will appear here.</p>
                                <Button variant="secondary" className="gap-2" onClick={() => navigate('/face-scan')}>
                                    <Scan size={17} /> Scan Face at Event
                                </Button>
                            </>
                        )}
                    </div>
                )}

                {/* ── Face Verification Modal ───────────── */}
                <AnimatePresence>
                    {showAccessModal && !hasFaceVerification && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-[#1A1D20]/92 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ scale: 0.92, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.92, opacity: 0 }}
                                className="relative z-10 bg-[#2B2E33] border border-[#C1C4C8]/20 w-full max-w-md p-8 rounded-3xl shadow-2xl text-center"
                            >
                                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle size={38} className="text-amber-400" />
                                </div>
                                <h2 className="text-2xl font-black text-[#F5F6F7] mb-3">Face Verification Required</h2>
                                <p className="text-[#7B7F85] mb-8 leading-relaxed text-sm">
                                    To access your personalized gallery, please complete face verification by scanning a QR code at an event.
                                </p>
                                <div className="space-y-3">
                                    <Button variant="primary" className="w-full gap-2" onClick={() => navigate("/face-scan")}>
                                        <Scan size={17} /> Scan Face at Event
                                    </Button>
                                    <Button variant="ghost" className="w-full" onClick={() => navigate("/")}>
                                        Go Back Home
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* ── Upgrade Modal ─────────────────────── */}
                <AnimatePresence>
                    {showUpgradeModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setShowUpgradeModal(false)}
                                className="absolute inset-0 bg-[#1A1D20]/85 backdrop-blur-md cursor-pointer"
                            />
                            <motion.div
                                initial={{ scale: 0.88, opacity: 0, y: 24 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.88, opacity: 0, y: 24 }}
                                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                                className="relative z-10 bg-[#2B2E33] border border-[#C1C4C8]/20 w-full max-w-sm p-8 rounded-3xl shadow-2xl text-center"
                            >
                                <div className="w-16 h-16 bg-[#C1C4C8]/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                    <DownloadCloud size={28} className="text-[#C1C4C8]" />
                                </div>
                                <h2 className="text-2xl font-black text-[#F5F6F7] mb-2">Upgrade to Premium</h2>
                                <p className="text-[#7B7F85] text-sm mb-2 leading-relaxed">{upgradeReason}</p>
                                <p className="text-[#C1C4C8] font-semibold text-sm mb-6">Unlimited downloads for ₹499/month</p>
                                <div className="space-y-3">
                                    <Button
                                        variant="primary"
                                        className="w-full h-12 font-bold"
                                        onClick={() => { setShowUpgradeModal(false); navigate('/pricing'); }}
                                    >
                                        Upgrade Now ✦
                                    </Button>
                                    <button
                                        onClick={() => setShowUpgradeModal(false)}
                                        className="text-[#7B7F85] text-sm hover:text-[#C1C4C8] transition-colors w-full"
                                    >
                                        Maybe later
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* ── Lightbox ──────────────────────────── */}
                <AnimatePresence>
                    {lightboxImg && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setLightboxImg(null)}
                                className="absolute inset-0 bg-[#1A1D20]/97 backdrop-blur-lg cursor-pointer"
                            />
                            <motion.div
                                initial={{ scale: 0.85, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.85, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                className="relative z-10 max-w-4xl w-full"
                            >
                                <img
                                    src={lightboxImg.url}
                                    alt="Full size"
                                    className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                                />
                                <div className="flex items-center justify-between mt-4 px-2">
                                    <div className="text-[#7B7F85] text-sm">
                                        {new Date(lightboxImg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                        {" · "}
                                        {lightboxImg.metadata?.detectedFaces?.length || 0} face(s) detected
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => { setLightboxImg(null); handleDownload(lightboxImg); }}
                                            disabled={downloadingIds.has(lightboxImg._id)}
                                        >
                                            {downloadingIds.has(lightboxImg._id) ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                                            Download
                                        </Button>
                                        <Button variant="secondary" size="sm" onClick={() => setLightboxImg(null)}>
                                            <X size={15} />
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
