import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import api from "../api/axios";
import Button from "../components/ui/Button";
import { Camera, ShieldCheck, Loader2, Sparkles, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FaceScan = () => {
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const [status, setStatus] = useState("initializing"); // initializing, loading_models, ready, scanning, matching, success
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [matchedImages, setMatchedImages] = useState([]);
    const [event, setEvent] = useState(null);
    const [availableEvents, setAvailableEvents] = useState([]);
    const [fetchingEvents, setFetchingEvents] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            // 1. Check for specific event from QR/Session
            const sessionEvent = sessionStorage.getItem("currentEvent");
            if (sessionEvent) {
                setEvent(JSON.parse(sessionEvent));
            } else {
                // 2. Fetch all active events for selection
                await fetchEvents();
            }

            // 3. Load AI Models
            loadModels();
        };

        const fetchEvents = async () => {
            setFetchingEvents(true);
            try {
                const res = await api.get("/api/events/list");
                setAvailableEvents(res.data);
            } catch (err) {
                console.error("Failed to fetch events", err);
            } finally {
                setFetchingEvents(false);
            }
        };

        const loadModels = async () => {
            try {
                setStatus("loading_models");
                const MODEL_URL = "/models";
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                setStatus("ready");
            } catch (err) {
                console.error("Error loading models", err);
                setError("AI Models failed to load. Please check if model files are in /public/models");
            }
        };

        loadInitialData();
    }, []);



    const handleScan = async () => {
        if (!webcamRef.current) return;

        setStatus("scanning");
        setProgress(30);

        try {
            const video = webcamRef.current.video;
            const detection = await faceapi
                .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
                .withFaceLandmarks()
                .withFaceDescriptor();


            if (!detection) {
                setStatus("ready");
                setError("No face detected. Please ensure your face is clearly visible.");
                return;
            }

            setProgress(60);
            setStatus("matching");

            const descriptor = Array.from(detection.descriptor);
            const eventData = JSON.parse(sessionStorage.getItem("currentEvent") || "{}");

            const res = await api.post("/api/face/match", {
                descriptor,
                eventId: eventData?._id
            });

            setProgress(100);
            if (res.data.images && res.data.images.length > 0) {
                setMatchedImages(res.data.images);
                setStatus("success");
            } else {
                setStatus("ready");
                setError("No matching photos found in this event.");
            }
        } catch (err) {
            console.error("Analysis failed", err);
            setStatus("ready");
            setError("Analysis failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 pt-24">
            <div className="max-w-md w-full bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">

                {/* Header */}
                <div className="px-8 pt-8 pb-4 text-center bg-gradient-to-b from-indigo-600/20 to-transparent">
                    {event && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4"
                        >
                            <h2 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Scanning for Event</h2>
                            <div className="text-white text-lg font-black tracking-tight leading-tight">{event.name}</div>
                            {event.photographer?.name && (
                                <div className="text-white/40 text-[10px] mt-1 font-bold uppercase tracking-wider italic">
                                    Captured by {event.photographer.name}
                                </div>
                            )}
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4"
                    >
                        <ShieldCheck size={12} /> Biometric AI Analysis
                    </motion.div>
                    <h1 className="text-2xl font-black text-white leading-tight">Identify Your Photos</h1>
                    <p className="text-gray-400 text-sm mt-2">Position your face in the frame</p>
                </div>


                {/* Content Area */}
                <div className="px-8 pb-8">
                    {!event ? (
                        /* Event Selection List */
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="text-center mb-6">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Select an Event to Scan</p>
                            </div>
                            {availableEvents.length > 0 ? (
                                availableEvents.map((ev) => (
                                    <motion.button
                                        key={ev._id}
                                        whileHover={{ scale: 1.02, backgroundColor: "rgba(79, 70, 229, 0.1)" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setEvent(ev)}
                                        className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-left flex items-center justify-between group transition-all"
                                    >
                                        <div>
                                            <h3 className="text-white font-bold leading-tight">{ev.name}</h3>
                                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                                <span className="flex items-center gap-1"><Sparkles size={10} className="text-indigo-400" /> {ev.photographer?.name}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-700" />
                                                <span>{new Date(ev.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                            <ChevronRight size={16} />
                                        </div>
                                    </motion.button>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-500 italic text-sm">
                                    {fetchingEvents ? <Loader2 className="animate-spin mx-auto mb-2" /> : "No active events found."}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Camera View (Existing logic) */
                        <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-black border-2 border-white/5 group">
                            {status === "ready" || status === "scanning" || status === "matching" ? (
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    className="w-full h-full object-cover"
                                    videoConstraints={{ facingMode: "user" }}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                                    <p className="text-xs uppercase tracking-widest font-bold">Initializing Sensor...</p>
                                </div>
                            )}

                            {/* Scanner Animation Overlay */}
                            <AnimatePresence>
                                {(status === "scanning" || status === "matching") && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "100%", opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-gradient-to-t from-indigo-500/30 to-transparent pointer-events-none"
                                    >
                                        <div className="h-0.5 w-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)] animate-pulse" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Success Overlay */}
                            {status === "success" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-indigo-600/90 flex flex-col items-center justify-center text-center p-6 z-20"
                                >
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-indigo-600 mb-4 shadow-2xl">
                                        <Sparkles size={40} />
                                    </div>
                                    <h2 className="text-2xl font-black text-white">Photos Found!</h2>
                                    <p className="text-indigo-100 text-sm mt-2">
                                        We found {matchedImages.length} photos of you in {event?.name || "this event"}.
                                    </p>

                                    <Button
                                        variant="white"
                                        className="mt-8 w-full py-4 rounded-2xl gap-2 font-black"
                                        onClick={() => navigate("/gallery", { state: { matchedImages, event } })}
                                    >
                                        Go to Gallery <ChevronRight size={18} />
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>


                {/* Action Bar */}
                <div className="p-8 bg-black/40 border-t border-white/5">
                    <AnimatePresence mode="wait">
                        {error ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 mb-6"
                            >
                                <div className="p-1.5 bg-red-500 rounded-lg text-white">
                                    <X size={14} />
                                </div>
                                <p className="text-red-400 text-xs font-bold leading-relaxed flex-1">{error}</p>
                                <button onClick={() => setError(null)} className="text-gray-500 hover:text-white">
                                    <X size={16} />
                                </button>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    {event ? (
                        <div className="space-y-4">
                            <Button
                                size="lg"
                                disabled={status !== "ready" && !error}
                                className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 gap-3"
                                onClick={handleScan}
                            >
                                {status === "scanning" || status === "matching" ? (
                                    <>
                                        <Loader2 className="animate-spin" /> Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Camera size={22} /> Start Analysis
                                    </>
                                )}
                            </Button>

                            {status === "ready" && (
                                <button
                                    onClick={() => {
                                        setEvent(null);
                                        sessionStorage.removeItem("currentEvent");
                                    }}
                                    className="w-full text-indigo-400/60 hover:text-indigo-400 text-[10px] font-black uppercase tracking-widest transition-colors py-2"
                                >
                                    ← Change Selected Event
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-2 text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                            Please select an event to proceed
                        </div>
                    )}
                </div>


                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-indigo-500"
                    />
                </div>
            </div>

            <button
                onClick={() => navigate("/")}
                className="mt-8 text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
            >
                <X size={14} /> Cancel & Exit
            </button>
        </div>
    );
};

export default FaceScan;

