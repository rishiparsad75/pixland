import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import Footer from "../components/Footer";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (!mobile.match(/^\+?\d{10,15}$/)) {
            setError("Please enter a valid mobile number with country code (e.g., +91...)");
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/users/send-registration-otp", { email, mobile });
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
            await api.post("/api/users/register", {
                name, email, mobile, password, otp
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side - Image */}
            <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2538&auto=format&fit=crop"
                    alt="Photography"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-20 left-10 text-white p-6 max-w-lg">
                    <h2 className="text-4xl font-bold mb-4">Capture & Share Moments Instantly</h2>
                    <p className="text-lg opacity-90">Join thousands of photographers managing their event photos with AI.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-20 justify-between relative">
                <div className="absolute top-8 left-8 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
                    <span className="text-xl font-bold text-gray-800">PixLand<span className="text-indigo-600">.ai</span></span>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">
                        {step === 1 ? "Create Account" : "Verify Email"}
                    </h2>
                    <p className="text-gray-500 mb-8 text-sm">
                        {step === 1 ? "Start your journey with PixLand today." : `We've sent a code to ${email}`}
                    </p>

                    {success ? (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-green-800 font-semibold mb-2">✓ Registration Successful!</h3>
                            <p className="text-green-700 text-sm mb-2">
                                Your account has been created. You can now login.
                            </p>
                            <Link to="/login" className="inline-block mt-3 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                                Go to Login →
                            </Link>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded border border-red-100 flex items-center gap-2 animate-shake">
                                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={step === 1 ? handleSendOtp : handleSubmit} className="space-y-4">
                                {step === 1 ? (
                                    <>
                                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm"
                                                required
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Mobile Number (e.g. +91...)"
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm"
                                                required
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm"
                                                required
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="password"
                                                    placeholder="Password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm"
                                                    required
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="Confirm"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex flex-col items-center">
                                            <p className="text-sm text-indigo-900 mb-4 font-medium">Verify your email address</p>
                                            <input
                                                type="text"
                                                placeholder="000000"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                maxLength="6"
                                                className="w-full px-4 py-4 rounded-xl border-2 border-indigo-200 text-center text-4xl font-bold tracking-[0.5em] text-indigo-900 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all bg-white"
                                                required
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="mt-6 text-xs text-indigo-600 hover:underline font-semibold"
                                            >
                                                Wrong details? Edit Details
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (step === 1 ? "Get Verification Code" : "Confirm & Sign Up")}
                                </button>
                            </form>
                        </>
                    )}

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link to="/login" className="text-indigo-600 hover:underline font-bold">
                            Log in
                        </Link>
                    </p>
                </div>
                <Footer variant="light" />
            </div>
        </div>
    );
};

export default Register;
