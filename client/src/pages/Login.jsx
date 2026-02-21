import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [loginMethod, setLoginMethod] = useState("email"); // 'email' or 'mobile'
    const [step, setStep] = useState(1); // 1 for mobile entry, 2 for OTP entry
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await api.post("/api/users/login", { email, password });
            login(res.data);

            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            // Validate mobile format (simple check)
            if (!mobile.startsWith("+")) {
                setError("Please include country code (e.g., +91)");
                setLoading(false);
                return;
            }
            await api.post("/api/users/send-otp", { mobile });
            setStep(2);

        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await api.post("/api/users/verify-otp", { mobile, otp });
            if (res.data.newUser) {

                // Redirect to a complete profile page or handle new user
                navigate("/register", { state: { mobile } });
            } else {
                login(res.data);
                navigate("/");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side - Image & Testimonial */}
            <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2538&auto=format&fit=crop"
                    alt="Photographer"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-20 justify-between relative">
                {/* Logo */}
                <div className="absolute top-8 left-8 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
                    <span className="text-xl font-bold text-gray-800">PixLand<span className="text-indigo-600">.ai</span> <span className="text-sm text-indigo-500 font-bold ml-2">by Rishi Parsad</span></span>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Sign in to PixLand.ai</h2>
                        <p className="text-gray-500 mb-8 text-sm">Choose your preferred login method</p>
                    </motion.div>

                    {/* Premium Error Popup */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                className="mb-6 overflow-hidden bg-red-50 border-l-4 border-red-500 rounded-xl shadow-lg shadow-red-200"
                            >
                                <div className="p-4 flex items-start gap-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <ShieldAlert className="text-red-600" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-red-800">Authentication Error</h3>
                                        <p className="text-xs text-red-600 mt-0.5 leading-relaxed">{error}</p>
                                    </div>
                                    <button
                                        onClick={() => setError("")}
                                        className="text-red-400 hover:text-red-600 p-1"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <motion.div
                                    initial={{ width: "100%" }}
                                    animate={{ width: "0%" }}
                                    transition={{ duration: 5, ease: "linear" }}
                                    className="h-1 bg-red-200"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-6">
                        {/* Email Login Section */}
                        <motion.form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                            animate={error ? {
                                x: [0, -10, 10, -10, 10, 0],
                                transition: { duration: 0.4 }
                            } : {}}
                        >
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 transition-all font-medium"
                                    required
                                />
                            </motion.div>
                            <motion.div
                                className="relative"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 transition-all pr-12 font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </motion.div>
                            <div className="flex justify-end mt-[-8px]">
                                <Link to="/forgot-password" size="sm" className="text-xs text-indigo-600 hover:underline font-bold">
                                    Forgot Password?
                                </Link>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Authenticating...</span>
                                    </>
                                ) : "Sign In"}
                            </motion.button>
                        </motion.form>
                    </div>



                    <motion.div
                        className="mt-10 space-y-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <p className="text-center text-sm text-gray-500">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-indigo-600 hover:underline font-black">
                                Join Now
                            </Link>
                        </p>
                        <div className="flex items-center gap-4 py-2">
                            <div className="h-px flex-1 bg-gray-100" />
                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Collaborators</span>
                            <div className="h-px flex-1 bg-gray-100" />
                        </div>
                        <p className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            Are you a photographer?{" "}
                            <Link to="/photographer-signup" className="text-purple-600 hover:underline font-black">
                                Studio Portal
                            </Link>
                        </p>
                    </motion.div>
                </div>

                {/* Footer with Branding */}
                <Footer variant="light" />
            </div>
        </div>
    );
};

export default Login;
