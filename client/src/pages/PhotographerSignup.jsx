import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { Camera, Mail, Phone, User, Eye, EyeOff } from "lucide-react";

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
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (!formData.mobile.match(/^\+?\d{10,15}$/)) {
            setError("Please enter a valid mobile number with country code");
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
            setError(err.response?.data?.message || "Failed to send verification code");
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
                otp: otp
            });

            alert("Registration successful! Please wait for admin approval.");
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-black">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 text-white max-w-lg">
                    <Camera size={64} className="mb-6" />
                    <h1 className="text-5xl font-bold mb-4">Join PixLand</h1>
                    <p className="text-xl text-white/90 mb-8">
                        Become a professional photographer on our platform.
                    </p>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-black">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center md:text-left">
                        <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            PixLand
                        </Link>
                        <h2 className="text-3xl font-bold text-white mt-6 mb-2">
                            {step === 1 ? "Photographer Registration" : "Verify Your Email"}
                        </h2>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={step === 1 ? handleSendOtp : handleSubmit} className="space-y-5">
                        {step === 1 ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <input
                                            type="text"
                                            name="firstName"
                                            required
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500"
                                            placeholder="First Name"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            name="lastName"
                                            required
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500"
                                            placeholder="Last Name"
                                        />
                                    </div>
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500"
                                    placeholder="Email Address"
                                />
                                <input
                                    type="tel"
                                    name="mobile"
                                    required
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500"
                                    placeholder="Mobile (+91...)"
                                />
                                <input
                                    type="text"
                                    name="cameraModel"
                                    required
                                    value={formData.cameraModel}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500"
                                    placeholder="Camera Model"
                                />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500"
                                    placeholder="Password"
                                />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500"
                                    placeholder="Confirm Password"
                                />
                            </>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-gray-400 text-sm">We've sent a 6-digit code to {formData.email}.</p>
                                <input
                                    type="text"
                                    placeholder="6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength="6"
                                    className="w-full bg-white/5 border border-indigo-500 rounded-xl py-4 text-center text-3xl font-bold tracking-widest text-white"
                                    required
                                />
                                <button type="button" onClick={() => setStep(1)} className="text-xs text-indigo-400 hover:underline">Edit details</button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                        >
                            {loading ? "Processing..." : (step === 1 ? "Send Verification Code" : "Complete Registration")}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PhotographerSignup;
