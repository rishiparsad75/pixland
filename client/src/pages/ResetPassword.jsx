import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, ChevronLeft, CheckCircle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email] = useState(location.state?.email || "");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!email) navigate("/forgot-password");
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (password !== confirmPassword) { setError("Passwords do not match."); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
        setLoading(true);
        try {
            await api.post("/api/users/reset-password", { email, otp, password });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl bg-[#1A1D20]/80 border border-[#C1C4C8]/15 text-[#F5F6F7] placeholder-[#7B7F85] focus:outline-none focus:ring-2 focus:ring-[#C1C4C8]/30 focus:border-[#C1C4C8]/30 transition-all text-sm";

    return (
        <div className="flex min-h-screen bg-[#2B2E33]">

            {/* Left — Cinematic */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1A1D20]">
                <img
                    src="https://images.unsplash.com/photo-1633265486064-086b219458ec?q=80&w=2070&auto=format&fit=crop"
                    alt="Reset Password"
                    className="absolute inset-0 w-full h-full object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1D20]/95 via-[#2B2E33]/60 to-transparent" />
                <div className="relative z-10 flex flex-col justify-end p-14 pb-16">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#F5F6F7] animate-pulse" />
                        <span className="text-[#7B7F85] text-xs uppercase font-bold tracking-widest">Password Reset</span>
                    </div>
                    <h2 className="text-4xl font-black text-[#F5F6F7] leading-tight mb-4">
                        Set a new<br />
                        <span className="shimmer-text">secure password.</span>
                    </h2>
                    <p className="text-[#7B7F85] leading-relaxed max-w-xs">
                        Enter the 6-digit code we sent you, then choose a strong new password.
                    </p>
                </div>
            </div>

            {/* Right — Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-16 justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#C1C4C8]/4 rounded-full blur-[80px] pointer-events-none" />

                {/* Logo */}
                <div className="flex items-center gap-2.5 mb-12">
                    <div className="w-9 h-9 bg-[#F5F6F7] rounded-xl flex items-center justify-center">
                        <span className="text-[#2B2E33] font-black text-base">P</span>
                    </div>
                    <div>
                        <div className="text-xl font-black text-[#F5F6F7]">PixLand<span className="text-[#7B7F85]">.ai</span></div>
                        <div className="text-[9px] text-[#7B7F85] uppercase tracking-widest font-semibold">by Rishi Parsad</div>
                    </div>
                </div>

                <div className="max-w-md w-full">
                    {success ? (
                        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                            <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-5">
                                <CheckCircle size={32} className="text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-black text-[#F5F6F7] mb-2">Password Updated!</h3>
                            <p className="text-[#7B7F85] text-sm mb-2">Your password has been reset successfully.</p>
                            <p className="text-[#7B7F85] text-xs mb-6">Redirecting to login...</p>
                            <Link to="/login" className="text-[#C1C4C8] hover:text-[#F5F6F7] font-bold text-sm transition-colors">
                                Go to Sign In →
                            </Link>
                        </motion.div>
                    ) : (
                        <>
                            <Link to="/forgot-password" className="flex items-center gap-1.5 text-[#7B7F85] hover:text-[#C1C4C8] text-xs font-semibold uppercase tracking-wider transition-colors mb-8">
                                <ChevronLeft size={14} /> Change Email
                            </Link>

                            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                                <h1 className="text-3xl font-black text-[#F5F6F7] mb-1">Create New Password</h1>
                                <p className="text-[#7B7F85] text-sm mb-8">
                                    Code sent to <span className="text-[#C1C4C8] font-semibold">{email}</span>
                                </p>
                            </motion.div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="mb-5 bg-red-950/50 border border-red-500/30 rounded-xl p-4 flex items-start gap-3"
                                    >
                                        <div className="w-7 h-7 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <ShieldAlert className="text-red-400" size={14} />
                                        </div>
                                        <p className="text-sm text-red-300">{error}</p>
                                        <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-300 text-lg leading-none">×</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-2">Verification Code</label>
                                    <input
                                        type="text" value={otp} onChange={e => setOtp(e.target.value)}
                                        maxLength="6" placeholder="6-digit code" required
                                        className="w-full px-4 py-3 rounded-xl bg-[#1A1D20]/80 border border-[#C1C4C8]/15 text-center text-xl font-black tracking-[0.3em] text-[#F5F6F7] placeholder-[#7B7F85]/40 focus:outline-none focus:ring-2 focus:ring-[#C1C4C8]/30 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-2">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7B7F85]" size={15} />
                                        <input type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} required className={inputClass + " pl-11"} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-2">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7B7F85]" size={15} />
                                        <input type="password" placeholder="Repeat new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={inputClass + " pl-11"} />
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                    type="submit" disabled={loading}
                                    className="w-full bg-[#F5F6F7] hover:bg-[#C1C4C8] text-[#2B2E33] font-black py-3.5 rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                >
                                    {loading ? <><div className="w-4 h-4 border-2 border-[#2B2E33]/30 border-t-[#2B2E33] rounded-full animate-spin" /> Updating...</> : "Reset Password"}
                                </motion.button>
                            </form>
                        </>
                    )}
                </div>

                <Footer />
            </div>
        </div>
    );
};

export default ResetPassword;
