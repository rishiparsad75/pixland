import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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
                    <span className="text-xl font-bold text-gray-800">PixLand<span className="text-indigo-600">.ai</span></span>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Sign in to PixLand</h2>
                    <p className="text-gray-500 mb-8 text-sm">Choose your preferred login method</p>

                    <div className="space-y-6">
                        {/* Email Login Section */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                                required
                            />
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded transition-colors duration-200 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </form>
                    </div>



                    <p className="mt-8 text-center text-sm text-gray-500">

                        Don't have an account?{" "}
                        <Link to="/register" className="text-indigo-600 hover:underline font-medium">
                            Sign up
                        </Link>
                    </p>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Are you a photographer?{" "}
                        <Link to="/photographer-signup" className="text-purple-600 hover:underline font-medium">
                            Register here
                        </Link>
                    </p>
                </div>

                {/* Footer with Branding */}
                <Footer variant="light" />
            </div>
        </div>
    );
};

export default Login;
