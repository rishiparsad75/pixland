import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Search, AlertCircle, Image as ImageIcon, Smartphone, QrCode, Wifi, WifiOff, CheckCircle } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import QRCode from "react-qr-code";
import { useSocket } from "../context/SocketContext";
import { v4 as uuidv4 } from "uuid";

const FaceScan = () => {
    const socket = useSocket();
    const fileInputRef = useRef(null); // Reference to file input for auto-triggering camera
    const [selfie, setSelfie] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [currentUrl, setCurrentUrl] = useState("");
    const [results, setResults] = useState(null);
    const [error, setError] = useState("");

    // Session state
    const [sessionId, setSessionId] = useState("");
    const [isMobileMode, setIsMobileMode] = useState(false);

    useEffect(() => {
        // Parse Query Params to check for existing session
        const searchParams = new URLSearchParams(window.location.search);
        const urlSessionId = searchParams.get("session");

        if (urlSessionId) {
            // MOBILE MODE: We are scanning for a desktop session
            setSessionId(urlSessionId);
            setIsMobileMode(true);
            console.log("[FaceScan] Mobile mode activated, session:", urlSessionId);
        } else {
            // DESKTOP MODE: Generate a new session and listen for results
            const newSessionId = uuidv4();
            setSessionId(newSessionId);

            // Construct the mobile URL (ensure it uses the network IP if possible, but window.location is best verification guess)
            const mobileUrl = `${window.location.origin}/face-scan?session=${newSessionId}`;
            setCurrentUrl(mobileUrl);
            console.log("[FaceScan] Desktop mode, QR URL:", mobileUrl);

            // Join the socket room for this session
            if (socket) {
                socket.emit("join_room", newSessionId);
                console.log("[FaceScan] Joined socket room:", newSessionId);

                const handleScanComplete = (data) => {
                    console.log("[FaceScan] Received scan_complete:", data);
                    setResults(data);
                };

                socket.on("scan_complete", handleScanComplete);

                return () => {
                    socket.off("scan_complete", handleScanComplete);
                };
            } else {
                console.warn("[FaceScan] Socket not available");
            }
        }

        const savedEvent = sessionStorage.getItem("currentEvent");
        if (savedEvent) {
            setCurrentEvent(JSON.parse(savedEvent));
        }
    }, [socket]); // Re-run if socket connects later

    // Auto-trigger camera on mobile when QR code is scanned
    useEffect(() => {
        if (isMobileMode && fileInputRef.current && !selfie) {
            // Small delay to ensure page is fully loaded
            const timer = setTimeout(() => {
                console.log("[FaceScan] Auto-triggering camera for mobile mode");
                fileInputRef.current?.click();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [isMobileMode, selfie]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelfie(file);
            setPreview(URL.createObjectURL(file));
            setResults(null);
            setError("");
        }
    };

    const handleIdentify = async (e) => {
        e.preventDefault();
        if (!selfie) return;

        const formData = new FormData();
        formData.append("selfie", selfie);
        if (currentEvent) {
            formData.append("eventId", currentEvent._id);
        }
        if (isMobileMode && sessionId) {
            formData.append("sessionId", sessionId);
        }

        setLoading(true);
        setError("");
        console.log("[FaceScan] Starting face identification...");

        try {
            const res = await api.post("/api/face/identify", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("[FaceScan] Identification successful:", res.data);

            // Only set results in mobile mode if not using socket sync
            if (!isMobileMode || !sessionId) {
                setResults(res.data);
            } else {
                // In mobile mode with session, show success message
                setResults({
                    message: "✓ Photos sent to desktop!",
                    images: res.data.images || [],
                    matchCount: res.data.matchCount || 0
                });
            }
        } catch (err) {
            console.error("[FaceScan] Identification error:", err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Identification failed. Please try a different photo.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-4 flex flex-col items-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl w-full relative z-10 text-center mb-12">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold text-white mb-4"
                >
                    {currentEvent ? `Find Your Photos for ${currentEvent.name}` : "Find My Photos"}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400 text-lg max-w-xl mx-auto"
                >
                    {isMobileMode
                        ? "Take a selfie to unlock your photos on the big screen."
                        : "Scan the QR code with your phone or upload a selfie here."}
                </motion.p>
            </div>

            {!results ? (
                <div className="w-full max-w-5xl flex flex-col items-center justify-center gap-8 relative z-10">
                    {/* Scanner Section - Visible on Mobile OR Desktop if no QR logic needed */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`flex-1 w-full max-w-md ${!isMobileMode ? "md:hidden" : ""}`}
                    >
                        <Card className="p-8 border-white/10 bg-white/5 backdrop-blur-xl">
                            <form onSubmit={handleIdentify} className="flex flex-col items-center">
                                <div
                                    className={`w-full aspect-square max-w-[300px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center mb-8 overflow-hidden relative group transition-all ${preview ? 'border-indigo-500/50' : 'border-white/10 hover:border-indigo-500/30'
                                        }`}
                                >
                                    {preview ? (
                                        <>
                                            <img src={preview} alt="Selfie Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <p className="text-white text-sm font-medium">Click to change photo</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400">
                                                <Camera size={32} />
                                            </div>
                                            <p className="text-gray-300 font-medium">Upload or Capture Selfie</p>
                                            <p className="text-xs text-gray-500 mt-2">Clear, front-facing photo works best</p>
                                        </>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        capture="user"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                {error && (
                                    <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 flex items-center gap-3">
                                        <AlertCircle size={18} />
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full py-4 gap-2 text-lg"
                                    isLoading={loading}
                                    disabled={!selfie}
                                >
                                    {loading ? "Identifying..." : "Get My Photos"}
                                    {!loading && <Search size={20} />}
                                </Button>
                            </form>
                        </Card>
                    </motion.div>

                    {/* QR Code Section - Only Visible on Desktop when NOT in mobile mode */}
                    {!isMobileMode && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="hidden md:flex flex-col items-center text-center max-w-md w-full"
                        >
                            <Card className="p-10 border-white/10 bg-white/5 backdrop-blur-xl flex flex-col items-center shadow-2xl hover:border-indigo-500/30 transition-all duration-300">
                                <div className="p-4 bg-white rounded-2xl mb-6 shadow-xl w-full aspect-square flex items-center justify-center">
                                    <QRCode
                                        value={currentUrl}
                                        size={256}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 256 256`}
                                    />
                                </div>

                                <div className="mt-4">
                                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                                        <Smartphone className="text-indigo-400" size={28} />
                                        Scan with Phone
                                    </h3>
                                    <p className="text-gray-400 text-lg leading-relaxed">
                                        Capture a selfie securely on your mobile device to access your private gallery.
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-6xl relative z-10"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-white mb-1">{results.message}</h2>
                            <p className="text-gray-400">
                                {currentEvent ? `Showing all matched images from ${currentEvent.name}.` : "Showing all matched images found from the event."}
                            </p>
                        </div>
                        <Button variant="secondary" onClick={() => setResults(null)}>
                            Try New Scan
                        </Button>
                    </div>

                    {results.images.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.images.map((img) => (
                                <motion.div
                                    key={img._id}
                                    whileHover={{ y: -5 }}
                                    className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5"
                                >
                                    <img
                                        src={img.url}
                                        alt="Matched result"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex items-end">
                                        <div className="w-full flex justify-between items-center text-white">
                                            <span className="text-sm truncate max-w-[150px]">{img.blobName}</span>
                                            <Button size="sm" onClick={() => window.open(img.url, '_blank')}>View Full</Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10 w-full text-center px-6">
                            <ImageIcon size={64} className="text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No photos found yet</h3>
                            <p className="text-gray-400 max-w-sm">
                                We couldn't find any photos matching your selfie. This might happen if your photos haven't been uploaded or processed yet.
                            </p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default FaceScan;
