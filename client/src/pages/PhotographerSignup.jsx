import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { Camera, Eye, EyeOff, ShieldAlert, ArrowLeft, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";

const PhotographerSignup = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        cameraModel: "",
        password: "",
        confirmPassword: ""
    });
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (!formData.mobile.match(/^\+?\d{10,15}$/)) {
            setError("Enter a valid mobile number with country code (e.g. +91...).");
            return;
        }
        setLoading(true);
        try {
            await api.post("/api/users/send-registration-otp", {
                email: formData.email,
                mobile: formData.mobile
            });
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
            await api.post("/api/users/photographer-register", {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                password: formData.password,
                mobile: formData.mobile,
                cameraModel: formData.cameraModel,
                otp
            });
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

            {/* Left — Cinematic Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1A1D20]">
                <img
                    src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2538&auto=format&fit=crop"
                    alt="Photography Studio"
                    className="absolute inset-0 w-full h-full object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1D20]/95 via-[#2B2E33]/60 to-transparent" />
                <div className="relative z-10 flex flex-col justify-end p-14 pb-16">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#F5F6F7] animate-pulse" />
                        <span className="text-[#7B7F85] text-xs uppercase font-bold tracking-widest">Photographer Portal</span>
                    </div>
                    <Camera size={36} className="text-[#7B7F85] mb-5" />
                    <h2 className="text-4xl font-black text-[#F5F6F7] leading-tight mb-4">
                        Join PixLand<br />
                        <span className="shimmer-text">as a Photographer</span>
                    </h2>
                    <p className="text-[#7B7F85] leading-relaxed max-w-xs">
                        Become a verified professional photographer on our AI-powered platform. Admin approval required.
                    </p>
                </div>
            </div>

            {/* Right — Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-14 justify-center relative overflow-hidden">
                {/* Background orb */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#C1C4C8]/4 rounded-full blur-[80px] pointer-events-none" />

                {/* Logo */}
                <div className="flex items-center gap-2.5 mb-8">
                    <div className="w-9 h-9 bg-[#F5F6F7] rounded-xl flex items-center justify-center">
                        <span className="text-[#2B2E33] font-black text-base">P</span>
                    </div>
                    <div>
                        <div className="text-xl font-black text-[#F5F6F7]">PixLand<span className="text-[#7B7F85]">.ai</span></div>
                        <div className="text-[9px] text-[#7B7F85] uppercase tracking-widest font-semibold">by Rishi Parsad</div>
                    </div>
                </div>

                <div className="max-w-md w-full">
                    {/* Success State */}
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-5">
                                <CheckCircle size={32} className="text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-black text-[#F5F6F7] mb-2">Application Submitted!</h3>
                            <p className="text-[#7B7F85] text-sm mb-6 leading-relaxed">
                                Your photographer account is awaiting admin approval. You'll receive an email when approved.
                            </p>
                            <button
                                onClick={() => navigate("/login")}
                                className="bg-[#F5F6F7] hover:bg-[#C1C4C8] text-[#2B2E33] font-black px-8 py-3 rounded-xl transition-all text-sm"
                            >
                                Go to Sign In →
                            </button>
                        </motion.div>
                    ) : (
                        <>
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35 }}
                            >
                                <h1 className="text-2xl font-black text-[#F5F6F7] mb-1">
                                    {step === 1 ? "Photographer Registration" : "Verify Your Email"}
                                </h1>
                                <p className="text-[#7B7F85] text-sm mb-6">
                                    {step === 1 ? "Fill in your details to apply for a photographer account." : `We've sent a 6-digit code to ${formData.email}`}
                                </p>
                            </motion.div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mb-4 bg-red-950/50 border border-red-500/30 rounded-xl p-3.5 flex items-start gap-3"
                                    >
                                        <div className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <ShieldAlert className="text-red-400" size={13} />
                                        </div>
                                        <p className="text-sm text-red-300">{error}</p>
                                        <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-300 text-lg leading-none">×</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {step === 1 ? (
                                <motion.form
                                    onSubmit={handleSendOtp}
                                    className="space-y-3"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-1.5">First Name</label>
                                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} placeholder="Rishi" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-1.5">Last Name</label>
                                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} placeholder="Parsad" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-1.5">Email Address</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="you@example.com" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-1.5">Mobile Number</label>
                                        <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className={inputClass} placeholder="+91 9876543210" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-1.5">Camera Model</label>
                                        <input type="text" name="cameraModel" value={formData.cameraModel} onChange={handleChange} className={inputClass} placeholder="e.g. Sony A7 IV" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-1.5">Password</label>
                                            <div className="relative">
                                                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className={inputClass + " pr-10"} placeholder="••••••••" required />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 bottom-3 text-[#7B7F85] hover:text-[#C1C4C8]">
                                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-[#7B7F85] uppercase tracking-wider mb-1.5">Confirm</label>
                                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={inputClass} placeholder="••••••••" required />
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                        type="submit" disabled={loading}
                                        className="w-full bg-[#F5F6F7] hover:bg-[#C1C4C8] text-[#2B2E33] font-black py-3.5 rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-1"
                                    >
                                        {loading ? <><div className="w-4 h-4 border-2 border-[#2B2E33]/30 border-t-[#2B2E33] rounded-full animate-spin" /> Sending...</> : "Send Verification Code →"}
                                    </motion.button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <div className="bg-[#C1C4C8]/6 border border-[#C1C4C8]/12 rounded-2xl p-6 flex flex-col items-center gap-4">
                                        <p className="text-xs text-[#7B7F85] font-semibold uppercase tracking-widest">Enter 6-digit code</p>
                                        <input
                                            type="text" value={otp} onChange={e => setOtp(e.target.value)}
                                            maxLength="6" autoFocus required
                                            className="w-full px-4 py-4 rounded-xl bg-[#1A1D20]/80 border border-[#C1C4C8]/20 text-center text-3xl font-black tracking-[0.5em] text-[#F5F6F7] focus:outline-none focus:ring-2 focus:ring-[#C1C4C8]/40 transition-all"
                                            placeholder="------"
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                        type="submit" disabled={loading}
                                        className="w-full bg-[#F5F6F7] hover:bg-[#C1C4C8] text-[#2B2E33] font-black py-3.5 rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                    >
                                        {loading ? <><div className="w-4 h-4 border-2 border-[#2B2E33]/30 border-t-[#2B2E33] rounded-full animate-spin" /> Creating Account...</> : "Complete Registration ✓"}
                                    </motion.button>
                                    <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1.5 text-[#7B7F85] hover:text-[#C1C4C8] text-xs font-semibold transition-colors mx-auto">
                                        <ArrowLeft size={13} /> Edit Details
                                    </button>
                                </motion.form>
                            )}

                            <p className="mt-6 text-center text-sm text-[#7B7F85]">
                                Already have an account?{" "}
                                <Link to="/login" className="text-[#C1C4C8] hover:text-[#F5F6F7] font-bold transition-colors">Sign in</Link>
                            </p>
                        </>
                    )}
                </div>

                <Footer />
            </div>
        </div>
    );
};

export default PhotographerSignup;
