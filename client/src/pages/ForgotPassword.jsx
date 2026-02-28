import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ChevronLeft, ShieldAlert, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await api.post("/api/users/forgot-password", { email });
            navigate("/reset-password", { state: { email } });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send reset code.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#2B2E33]">

            {/* Left — Cinematic Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1A1D20]">
                <img
                    src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop"
                    alt="Recovery"
                    className="absolute inset-0 w-full h-full object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1D20]/95 via-[#2B2E33]/60 to-transparent" />
                <div className="relative z-10 flex flex-col justify-end p-14 pb-16">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#F5F6F7] animate-pulse" />
                        <span className="text-[#7B7F85] text-xs uppercase font-bold tracking-widest">Account Recovery</span>
                    </div>
                    <h2 className="text-4xl font-black text-[#F5F6F7] leading-tight mb-4">
                        Reset your<br />
                        <span className="shimmer-text">access securely.</span>
                    </h2>
                    <p className="text-[#7B7F85] leading-relaxed max-w-xs">
                        We'll send a 6-digit code to your email so you can regain access to your account.
                    </p>
                </div>
            </div>

            {/* Right — Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-16 justify-center relative overflow-hidden">
                {/* Background orb */}
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
                    <Link
                        to="/login"
                        className="flex items-center gap-1.5 text-[#7B7F85] hover:text-[#C1C4C8] text-xs font-semibold uppercase tracking-wider transition-colors mb-8"
                    >
                        <ChevronLeft size={14} /> Back to Login
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        <h1 className="text-3xl font-black text-[#F5F6F7] mb-1">Forgot Password?</h1>
                        <p className="text-[#7B7F85] text-sm mb-8">
                            Enter your email and we'll send a 6-digit reset code.
                        </p>
                    </motion.div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
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
                            <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7B7F85]" size={16} />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#1A1D20]/80 border border-[#C1C4C8]/15 text-[#F5F6F7] placeholder-[#7B7F85] focus:outline-none focus:ring-2 focus:ring-[#C1C4C8]/30 focus:border-[#C1C4C8]/30 transition-all text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#F5F6F7] hover:bg-[#C1C4C8] text-[#2B2E33] font-black py-3.5 rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-[#2B2E33]/30 border-t-[#2B2E33] rounded-full animate-spin" /> Sending...</>
                            ) : (
                                <><Send size={15} /> Send Reset Code</>
                            )}
                        </motion.button>
                    </form>
                </div>

                <Footer />
            </div>
        </div>
    );
};

export default ForgotPassword;
