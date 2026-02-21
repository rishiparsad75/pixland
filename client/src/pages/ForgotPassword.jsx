import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ChevronLeft, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
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
            // Redirect to reset password page and pass email
            navigate("/reset-password", { state: { email } });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send reset code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop"
                    alt="Recovery"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
            </div>

            <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-20 justify-between relative">
                <div className="absolute top-8 left-8 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
                    <span className="text-xl font-bold text-gray-800">PixLand<span className="text-indigo-600">.ai</span></span>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                    <Link to="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-8 transition-colors">
                        <ChevronLeft size={16} />
                        Back to Login
                    </Link>

                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Forgot Password?</h2>
                    <p className="text-gray-500 mb-8 text-sm">Enter your email address and we'll send you a 6-digit code to reset your password.</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                            <ShieldCheck size={18} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 transition-all font-medium bg-gray-50/50"
                                    required
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? "Sending..." : "Send Reset Code"}
                        </motion.button>
                    </form>
                </div>
                <Footer variant="light" />
            </div>
        </div>
    );
};

export default ForgotPassword;
