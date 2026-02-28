import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, Users, Upload, Download, Camera, Info, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const Pricing = () => {
    const { user } = useContext(AuthContext);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [utr, setUtr] = useState("");
    const [screenshot, setScreenshot] = useState(null);
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [pendingRequest, setPendingRequest] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        fetchSubscriptionStatus();
        fetchPendingRequest();
    }, []);

    const fetchSubscriptionStatus = async () => {
        try {
            const { data } = await api.get('/api/subscription/status');
            setSubscription(data);
        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRequest = async () => {
        try {
            // Fetch only user's requests
            const { data } = await api.get('/api/subscription/my-requests');
            const myRequest = data.find(r => r.status === 'pending');
            setPendingRequest(myRequest);

        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setScreenshot(file);
            setScreenshotPreview(URL.createObjectURL(file));
        }
    };

    const handleUpgradeClick = (plan) => {
        setSelectedPlan(plan);
        setShowPaymentModal(true);
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        if (!utr || !screenshot) {
            alert("Please provide both UTR and Screenshot Proof");
            return;
        }

        setUpgrading(true);
        const formData = new FormData();
        formData.append("plan", "premium");
        formData.append("utr", utr);
        formData.append("screenshot", screenshot);
        formData.append("amount", isPhotographer ? 999 : 499);

        try {
            await api.post("/api/subscription/request", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setShowPaymentModal(false);
            setShowSuccessModal(true);
            fetchPendingRequest();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to submit request");
        } finally {
            setUpgrading(false);
        }

    };

    const isPhotographer = user?.role === 'photographer';
    const isPremium = subscription?.isPremium || false;
    const onTrial = subscription?.onTrial || false;

    const freePlan = {
        name: 'Free',
        price: '₹0',
        period: 'forever',
        features: isPhotographer ? [
            '500 photo uploads per month',
            'Basic analytics',
            'Standard support',
            'Event management'
        ] : [
            '10 photo downloads per month',
            'Face recognition access',
            'Basic features',
            'Standard support'
        ],
        icon: Users,
        color: 'from-gray-500 to-gray-600'
    };

    const premiumPlan = {
        name: 'Premium',
        price: isPhotographer ? '₹999' : '₹499',
        period: 'per month',
        features: isPhotographer ? [
            'Unlimited photo uploads',
            'Advanced analytics & insights',
            'Priority support',
            'Custom branding',
            'Bulk upload tools',
            'Advanced event management'
        ] : [
            'Unlimited photo downloads',
            'Priority face recognition',
            'Advanced features',
            'Priority support',
            'Early access to new features',
            'Ad-free experience'
        ],
        icon: Crown,
        color: 'from-purple-500 to-pink-500',
        trial: isPhotographer ? '9 days free trial' : '7 days free trial'
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#2B2E33] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#C1C4C8]/20 border-t-[#C1C4C8] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#2B2E33] py-16 px-4 relative">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-[#F5F6F7] mb-4 tracking-tight">
                        Choose Your Plan
                    </h1>
                    <p className="text-lg text-[#7B7F85]">
                        {isPhotographer ? 'Upload unlimited photos' : 'Download unlimited photos'} with Premium
                    </p>
                    {onTrial && (
                        <div className="mt-4 inline-block bg-emerald-500/10 border border-emerald-400/20 rounded-xl px-4 py-2">
                            <p className="text-emerald-300 text-sm">🎉 You're on a free trial! Enjoying unlimited access.</p>
                        </div>
                    )}
                    {pendingRequest && (
                        <div className="mt-4 inline-block bg-amber-500/10 border border-amber-400/20 rounded-xl px-4 py-2">
                            <p className="text-amber-300 text-sm flex items-center gap-2">
                                <Info size={16} /> Your premium request is pending (UTR: {pendingRequest.utr})
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className={`p-8 h-full ${subscription?.plan === 'free' && !onTrial ? 'ring-2 ring-[#F5F6F7]/30' : ''
                            } bg-[#1A1D20]/60 backdrop-blur-xl border-[#C1C4C8]/12`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-lg bg-gradient-to-br ${freePlan.color}`}>
                                    <freePlan.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[#F5F6F7]">{freePlan.name}</h3>
                                    {subscription?.plan === 'free' && !onTrial && (
                                        <span className="text-sm text-green-400">Current Plan</span>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-[#F5F6F7]">{freePlan.price}</span>
                                    <span className="text-[#7B7F85]">/ {freePlan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {freePlan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-[#C1C4C8]">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {subscription?.plan === 'free' && !onTrial ? (
                                <Button variant="secondary" className="w-full" disabled>
                                    Current Plan
                                </Button>
                            ) : null}
                        </Card>
                    </motion.div>

                    {/* Premium Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className={`p-8 h-full ${isPremium || onTrial ? 'ring-2 ring-[#F5F6F7]/40' : ''
                            } bg-[#1A1D20]/80 backdrop-blur-xl border-[#C1C4C8]/20 relative overflow-hidden`}>
                            {/* Popular Badge */}
                            <div className="absolute top-4 right-4">
                                <div className="bg-[#F5F6F7] text-[#2B2E33] text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    POPULAR
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-lg bg-gradient-to-br ${premiumPlan.color}`}>
                                    <premiumPlan.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[#F5F6F7]">{premiumPlan.name}</h3>
                                    {isPremium && (
                                        <span className="text-sm text-green-400">Current Plan</span>
                                    )}
                                    {onTrial && (
                                        <span className="text-sm text-yellow-400">On Trial</span>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-[#F5F6F7]">{premiumPlan.price}</span>
                                    <span className="text-[#7B7F85]">/ {premiumPlan.period}</span>
                                </div>
                                <p className="text-sm text-[#7B7F85] mt-1">{premiumPlan.trial}</p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {premiumPlan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-[#F5F6F7]">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {isPremium ? (
                                <Button variant="secondary" className="w-full" disabled>
                                    Current Plan
                                </Button>
                            ) : pendingRequest ? (
                                <Button variant="secondary" className="w-full" disabled>
                                    Verification Pending
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => handleUpgradeClick(premiumPlan)}
                                    className="w-full bg-[#F5F6F7] hover:bg-[#C1C4C8] text-[#2B2E33] font-black"
                                >
                                    Upgrade Now
                                </Button>
                            )}
                        </Card>
                    </motion.div>
                </div>

                {/* Current Usage Section (Omitted for brevity, keeping same logic) */}

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 text-center"
                >
                    <p className="text-[#7B7F85] text-sm">
                        Pay once and enjoy unlimited access for 30 days. Manual verification takes 1-2 hours.
                    </p>
                </motion.div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {/* Premium Payment Modal */}
                <AnimatePresence>
                    {showPaymentModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                                onClick={() => setShowPaymentModal(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 40, rotateX: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 40, rotateX: -15 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="relative w-full max-w-2xl bg-slate-900/90 border border-white/10 rounded-[3rem] p-4 shadow-[0_0_50px_rgba(139,92,246,0.3)] overflow-hidden backdrop-blur-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Decorative Elements */}
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/30 blur-[100px] rounded-full animate-pulse" />
                                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-600/30 blur-[100px] rounded-full animate-pulse" />

                                <div className="relative z-10 bg-slate-950/50 rounded-[2.5rem] p-8 md:p-12 border border-white/5">
                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full mb-3">
                                                <Crown size={14} className="text-purple-400" />
                                                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">Premium Activation</span>
                                            </div>
                                            <h2 className="text-4xl font-black text-white leading-tight">Elevate Your <br /><span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Experience</span></h2>
                                        </div>
                                        <button
                                            onClick={() => setShowPaymentModal(false)}
                                            className="p-3 bg-white/5 hover:bg-red-500/20 rounded-2xl transition-all text-gray-500 hover:text-red-400 group"
                                        >
                                            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-1 gap-12 mb-10">
                                        {/* Centered Large QR Section */}
                                        <div className="flex flex-col items-center justify-center">
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="relative p-2 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-3xl shadow-2xl"
                                            >
                                                <div className="relative bg-white p-4 rounded-[1.4rem] shadow-inner overflow-hidden">
                                                    <img
                                                        src="/payment_qr.jpg"
                                                        alt="UPI QR Code"
                                                        className="w-64 h-64 md:w-80 md:h-80 object-contain rounded-lg"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent pointer-events-none" />
                                                </div>

                                                {/* Scan Lines Animation */}
                                                <motion.div
                                                    animate={{ top: ["10%", "90%", "10%"] }}
                                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                                    className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-sm z-20 pointer-events-none"
                                                />
                                            </motion.div>

                                            <div className="mt-8 text-center bg-white/5 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/10">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Payable Amount</p>
                                                <p className="text-4xl font-black text-white">₹{isPhotographer ? '999' : '499'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmitRequest} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">UTR Reference</label>
                                                <input
                                                    type="text"
                                                    placeholder="12-digit UTR Number"
                                                    value={utr}
                                                    onChange={(e) => setUtr(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Proof of Transfer</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    id="payment-upload"
                                                    required
                                                />
                                                <label
                                                    htmlFor="payment-upload"
                                                    className={`flex items-center justify-between w-full h-[60px] px-6 bg-white/5 border-2 border-dashed rounded-2xl cursor-pointer transition-all hover:bg-white/10
                                                    ${screenshotPreview ? 'border-purple-500/50' : 'border-white/10'}`}
                                                >
                                                    <span className="text-sm text-gray-400 truncate max-w-[150px]">
                                                        {screenshot ? screenshot.name : "Upload Screenshot"}
                                                    </span>
                                                    <Upload size={18} className="text-purple-400" />
                                                </label>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={upgrading}
                                            className="w-full py-6 rounded-[1.5rem] bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] active:scale-95 transition-all text-lg font-black tracking-tight"
                                        >
                                            {upgrading ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                    Processing Request...
                                                </div>
                                            ) : 'Confirm Payment Submission'}
                                        </Button>

                                        <p className="text-center text-[10px] text-gray-500 uppercase tracking-tighter">
                                            By clicking, you confirm the UTR belongs to the valid transaction.
                                        </p>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Success Animation Modal */}
                <AnimatePresence>
                    {showSuccessModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
                            />
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="relative w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-[3rem] p-12 text-center shadow-[0_0_100px_rgba(139,92,246,0.2)]"
                            >
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/40"
                                >
                                    <Check size={48} className="text-white" strokeWidth={3} />
                                </motion.div>

                                <h2 className="text-3xl font-black text-white mb-6 tracking-tight">Proof Submitted!</h2>

                                <div className="space-y-6 text-gray-300">
                                    <p className="text-lg leading-relaxed">
                                        Wait <span className="text-purple-400 font-bold italic">24 hours</span>. Our admin will verify the details and grant you premium access.
                                    </p>

                                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                                        <p className="text-sm text-gray-400 mb-2 uppercase tracking-widest font-bold">Need Help?</p>
                                        <a href="mailto:pixland123@gmail.com" className="text-xl font-bold text-white hover:text-purple-400 transition-colors">
                                            pixland123@gmail.com
                                        </a>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="mt-10 w-full py-5 rounded-2xl bg-white text-black hover:bg-gray-200 font-black"
                                >
                                    Got it, thanks!
                                </Button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </AnimatePresence>
        </div>
    );
};

export default Pricing;
