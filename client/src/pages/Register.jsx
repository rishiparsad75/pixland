import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, CheckCircle, ShieldAlert, ArrowLeft } from "lucide-react";
import Footer from "../components/Footer";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (!mobile.match(/^\+?\d{10,15}$/)) {
            setError("Enter a valid mobile number with country code (e.g. +91...).");
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/users/send-registration-otp", { email, mobile });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send verification code.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await api.post("/api/users/register", { name, email, mobile, password, otp });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl bg-[#1A1D20]/80 border border-[#C1C4C8]/15 text-[#F5F6F7] placeholder-[#7B7F85] focus:outline-none focus:ring-2 focus:ring-[#C1C4C8]/30 focus:border-[#C1C4C8]/30 transition-all text-sm";

    return (
        <div className="flex min-h-screen bg-[#2B2E33]">

            {/* Left Side — Cinematic Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1A1D20]">
                <img
                    src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2538&auto=format&fit=crop"
                    alt="Photography"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1D20]/90 via-[#2B2E33]/50 to-transparent" />
                <div className="relative z-10 flex flex-col justify-end p-14 pb-16">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#F5F6F7] animate-pulse" />
                        <span className="text-[#7B7F85] text-xs uppercase font-bold tracking-widest">Join PixLand.ai</span>
                    </div>
                    <h2 className="text-4xl font-black text-[#F5F6F7] leading-tight mb-4">
                        Capture & Share<br />
                        <span className="shimmer-text">Moments Instantly</span>
                    </h2>
                    <p className="text-[#7B7F85] leading-relaxed max-w-xs">
                        Join thousands of photographers managing their event photos with AI.
                    </p>
                </div>
            </div>

            {/* Right Side — Register Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-16 justify-center relative overflow-hidden">
                {/* Background orb */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#C1C4C8]/4 rounded-full blur-[80px] pointer-events-none" />

                {/* Logo */}
                <div className="flex items-center gap-2.5 mb-10">
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
                        key={step}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-3xl font-black text-[#F5F6F7] mb-1">
                            {step === 1 ? "Create Account" : "Verify Email"}
                        </h1>
                        <p className="text-[#7B7F85] text-sm mb-8">
                            {step === 1 ? "Start your journey with PixLand.ai today." : `We've sent a 6-digit code to ${email}`}
                        </p>
                    </motion.div>

                    {/* Success State */}
                    <AnimatePresence>
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-10"
                            >
                                <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <CheckCircle size={32} className="text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-black text-[#F5F6F7] mb-2">Account Created!</h3>
                                <p className="text-[#7B7F85] text-sm mb-6">
                                    Your PixLand account is ready. Sign in to get started.
                                </p>
                                <button
                                    onClick={() => navigate("/login")}
                                    className="bg-[#F5F6F7] hover:bg-[#C1C4C8] text-[#2B2E33] font-black px-8 py-3 rounded-xl transition-all text-sm"
                                >
                                    Go to Sign In →
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!success && (
                        <>
                            {/* Error */}
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

                            {/* Step 1 — Details Form */}
                            {step === 1 && (
                                <motion.form
                                    onSubmit={handleSendOtp}
                                    className="space-y-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div>
                                        <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-2">Full Name</label>
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Rishi Parsad" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-2">Mobile Number</label>
                                        <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} className={inputClass} placeholder="+91 9876543210" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-2">Email Address</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-2">Password</label>
                                            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className={inputClass + " pr-10"} placeholder="••••••••" required />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 bottom-3 text-[#7B7F85] hover:text-[#C1C4C8]">
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-2">Confirm</label>
                                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} placeholder="••••••••" required />
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#F5F6F7] hover:bg-[#C1C4C8] text-[#2B2E33] font-black py-3.5 rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-2"
                                    >
                                        {loading ? (
                                            <><div className="w-4 h-4 border-2 border-[#2B2E33]/30 border-t-[#2B2E33] rounded-full animate-spin" /> Sending Code...</>
                                        ) : "Get Verification Code →"}
                                    </motion.button>
                                </motion.form>
                            )}

                            {/* Step 2 — OTP Verification */}
                            {step === 2 && (
                                <motion.form
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.35 }}
                                >
                                    <div className="bg-[#C1C4C8]/6 border border-[#C1C4C8]/12 rounded-2xl p-6 flex flex-col items-center gap-4">
                                        <p className="text-xs text-[#7B7F85] font-semibold uppercase tracking-widest">Enter 6-digit code</p>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value)}
                                            maxLength="6"
                                            autoFocus
                                            required
                                            className="w-full px-4 py-4 rounded-xl bg-[#1A1D20]/80 border border-[#C1C4C8]/20 text-center text-3xl font-black tracking-[0.5em] text-[#F5F6F7] focus:outline-none focus:ring-2 focus:ring-[#C1C4C8]/40 focus:border-[#C1C4C8]/30 transition-all"
                                            placeholder="------"
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#F5F6F7] hover:bg-[#C1C4C8] text-[#2B2E33] font-black py-3.5 rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                    >
                                        {loading ? (
                                            <><div className="w-4 h-4 border-2 border-[#2B2E33]/30 border-t-[#2B2E33] rounded-full animate-spin" /> Creating Account...</>
                                        ) : "Confirm & Sign Up ✓"}
                                    </motion.button>

                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex items-center gap-1.5 text-[#7B7F85] hover:text-[#C1C4C8] text-xs font-semibold transition-colors mx-auto"
                                    >
                                        <ArrowLeft size={13} /> Edit Details
                                    </button>
                                </motion.form>
                            )}

                            <motion.p
                                className="mt-8 text-center text-sm text-[#7B7F85]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                Already have an account?{" "}
                                <Link to="/login" className="text-[#C1C4C8] hover:text-[#F5F6F7] font-bold transition-colors">
                                    Log in
                                </Link>
                            </motion.p>
                        </>
                    )}
                </div>

                <Footer />
            </div>
        </div>
    );
};

export default Register;
