import { useState, useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ShieldAlert, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Bug fix: auto-dismiss error after 5 seconds
    useEffect(() => {
        if (!error) return;
        const timer = setTimeout(() => setError(""), 5000);
        return () => clearTimeout(timer);
    }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await api.post("/api/users/login", { email, password });
            login(res.data);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };
    // Note: Removed dead OTP/mobile login code (mobile, otp, loginMethod, step, handleSendOtp, handleVerifyOtp)
    // These were declared but never rendered — cleaned up.

    return (
        <div className="flex min-h-screen bg-[#2B2E33]">

            {/* Left Side — Hero Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1A1D20]">
                <img
                    src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2538&auto=format&fit=crop"
                    alt="Photographer at work"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1D20]/90 via-[#2B2E33]/50 to-transparent" />

                {/* Text content on top of image */}
                <div className="relative z-10 flex flex-col justify-end p-14 pb-16">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#F5F6F7] animate-pulse" />
                        <span className="text-[#7B7F85] text-xs uppercase font-bold tracking-widest">PixLand.ai Platform</span>
                    </div>
                    <h2 className="text-4xl font-black text-[#F5F6F7] leading-tight mb-4">
                        Your event photos,<br />
                        <span className="shimmer-text">found instantly.</span>
                    </h2>
                    <p className="text-[#7B7F85] leading-relaxed max-w-xs">
                        AI-powered face recognition delivers your photos the moment the shutter clicks.
                    </p>
                </div>
            </div>

            {/* Right Side — Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-16 justify-center relative overflow-hidden">
                {/* Subtle background orb */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#C1C4C8]/4 rounded-full blur-[80px] pointer-events-none" />

                {/* Logo */}
                <div className="flex items-center gap-2.5 mb-12">
                    <div className="w-9 h-9 bg-[#F5F6F7] rounded-xl flex items-center justify-center">
                        <span className="text-[#2B2E33] font-black text-base">P</span>
                    </div>
                    <div>
                        <div className="text-xl font-black text-[#F5F6F7]">
                            PixLand<span className="text-[#7B7F85]">.ai</span>
                        </div>
                        <div className="text-[9px] text-[#7B7F85] uppercase tracking-widest font-semibold">by Rishi Parsad</div>
                    </div>
                </div>

                <div className="max-w-md w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl font-black text-[#F5F6F7] mb-1">Welcome back</h1>
                        <p className="text-[#7B7F85] text-sm mb-8">Sign in to your PixLand account</p>
                    </motion.div>

                    {/* Error Toast */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                                className="mb-6 bg-red-950/50 border border-red-500/30 rounded-xl overflow-hidden"
                            >
                                <div className="p-4 flex items-start gap-3">
                                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <ShieldAlert className="text-red-400" size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-red-300">Authentication Error</p>
                                        <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
                                    </div>
                                    <button onClick={() => setError("")} className="text-red-500 hover:text-red-300">
                                        <X size={15} />
                                    </button>
                                </div>
                                {/* Auto-dismiss progress bar */}
                                <motion.div
                                    initial={{ width: "100%" }}
                                    animate={{ width: "0%" }}
                                    transition={{ duration: 5, ease: "linear" }}
                                    className="h-0.5 bg-red-500/40"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-[#1A1D20]/80 border border-[#C1C4C8]/15 text-[#F5F6F7] placeholder-[#7B7F85] focus:outline-none focus:ring-2 focus:ring-[#C1C4C8]/30 focus:border-[#C1C4C8]/30 transition-all text-sm"
                                placeholder="you@example.com"
                                required
                            />
                        </motion.div>

                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-2">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 rounded-xl bg-[#1A1D20]/80 border border-[#C1C4C8]/15 text-[#F5F6F7] placeholder-[#7B7F85] focus:outline-none focus:ring-2 focus:ring-[#C1C4C8]/30 focus:border-[#C1C4C8]/30 transition-all text-sm"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 bottom-3.5 text-[#7B7F85] hover:text-[#C1C4C8] transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </motion.div>

                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-xs text-[#7B7F85] hover:text-[#C1C4C8] font-semibold transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#F5F6F7] hover:bg-[#C1C4C8] text-[#2B2E33] font-black py-3.5 rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm tracking-wide mt-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-[#2B2E33]/30 border-t-[#2B2E33] rounded-full animate-spin" />
                                    Verifying...
                                </>
                            ) : "Sign In"}
                        </motion.button>
                    </form>

                    <motion.div
                        className="mt-8 space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <p className="text-center text-sm text-[#7B7F85]">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-[#C1C4C8] hover:text-[#F5F6F7] font-bold transition-colors">
                                Join Now
                            </Link>
                        </p>

                        <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-[#C1C4C8]/10" />
                            <span className="text-[9px] uppercase font-black tracking-widest text-[#7B7F85]/60">Professionals</span>
                            <div className="h-px flex-1 bg-[#C1C4C8]/10" />
                        </div>

                        <p className="text-center text-sm text-[#7B7F85] flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C1C4C8]/60" />
                            Are you a photographer?{" "}
                            <Link to="/photographer-signup" className="text-[#C1C4C8] hover:text-[#F5F6F7] font-bold transition-colors">
                                Studio Portal
                            </Link>
                        </p>
                    </motion.div>
                </div>

                <Footer />
            </div>
        </div>
    );
};

export default Login;
