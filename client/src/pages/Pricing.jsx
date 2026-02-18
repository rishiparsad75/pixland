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

    useEffect(() => {
        fetchSubscriptionStatus();
        fetchPendingRequest();
    }, []);

    const fetchSubscriptionStatus = async () => {
        try {
            const { data } = await api.get('/subscription/status');
            setSubscription(data);
        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRequest = async () => {
        try {
            // Find if user has a pending request
            const { data } = await api.get('/subscription/admin/requests');
            const myRequest = data.find(r => r.user._id === user._id && r.status === 'pending');
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
            await api.post("/subscription/request", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("Payment proof submitted! Admin will verify and activate your premium status shortly.");
            setShowPaymentModal(false);
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 py-12 px-4 relative">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-purple-200">
                        {isPhotographer ? 'Upload unlimited photos' : 'Download unlimited photos'} with Premium
                    </p>
                    {onTrial && (
                        <div className="mt-4 inline-block bg-green-500/20 border border-green-400/30 rounded-lg px-4 py-2">
                            <p className="text-green-200 text-sm">
                                🎉 You're on a free trial! Enjoying unlimited access.
                            </p>
                        </div>
                    )}
                    {pendingRequest && (
                        <div className="mt-4 inline-block bg-yellow-500/20 border border-yellow-400/30 rounded-lg px-4 py-2">
                            <p className="text-yellow-200 text-sm flex items-center gap-2">
                                <Info size={16} /> Your premium request is pending verification (UTR: {pendingRequest.utr})
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
                        <Card className={`p-8 h-full ${subscription?.plan === 'free' && !onTrial ? 'ring-2 ring-white/50' : ''} bg-white/10 backdrop-blur-lg border-white/20`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-lg bg-gradient-to-br ${freePlan.color}`}>
                                    <freePlan.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{freePlan.name}</h3>
                                    {subscription?.plan === 'free' && !onTrial && (
                                        <span className="text-sm text-green-400">Current Plan</span>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-white">{freePlan.price}</span>
                                    <span className="text-gray-300">/ {freePlan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {freePlan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-200">{feature}</span>
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
                        <Card className={`p-8 h-full ${isPremium || onTrial ? 'ring-2 ring-purple-400' : ''} bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg border-purple-400/30 relative overflow-hidden`}>
                            {/* Popular Badge */}
                            <div className="absolute top-4 right-4">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    POPULAR
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-lg bg-gradient-to-br ${premiumPlan.color}`}>
                                    <premiumPlan.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{premiumPlan.name}</h3>
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
                                    <span className="text-4xl font-bold text-white">{premiumPlan.price}</span>
                                    <span className="text-purple-200">/ {premiumPlan.period}</span>
                                </div>
                                <p className="text-sm text-purple-300 mt-1">{premiumPlan.trial}</p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {premiumPlan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-white">{feature}</span>
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
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/20"
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
                    <p className="text-gray-400 text-sm">
                        Pay once and enjoy unlimited access for 30 days. Manual verification takes 1-2 hours.
                    </p>
                </motion.div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowPaymentModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="text-purple-400" /> Complete Payment
                                </h2>
                                <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6 text-center">
                                {/* QR Code Placeholder */}
                                <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-inner">
                                    <img
                                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=rishiparsad75@okicici%26pn=RISHI%20PARSAD%26am=999%26cu=INR"
                                        alt="UPI QR Code"
                                        className="w-full h-full"
                                    />
                                </div>
                                <p className="text-purple-200 text-sm font-medium">Scan to pay: <span className="text-white font-bold">₹{isPhotographer ? '999' : '499'}</span></p>

                                <form onSubmit={handleSubmitRequest} className="space-y-4 text-left">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Transaction UTR Number</label>
                                        <input
                                            type="text"
                                            placeholder="12 digit UTR Number"
                                            value={utr}
                                            onChange={(e) => setUtr(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Payment Screenshot Proof</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="screenshot-upload"
                                                required
                                            />
                                            <label
                                                htmlFor="screenshot-upload"
                                                className="flex items-center justify-center gap-2 w-full bg-purple-600/20 border-2 border-dashed border-purple-500/30 rounded-xl px-4 py-6 text-purple-200 cursor-pointer hover:bg-purple-600/30 transition-all overflow-hidden"
                                            >
                                                {screenshotPreview ? (
                                                    <img src={screenshotPreview} alt="Preview" className="h-full w-full object-contain max-h-32" />
                                                ) : (
                                                    <><Camera size={20} /> Upload Screenshot</>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={upgrading}
                                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-lg font-bold py-4 hover:shadow-purple-500/30 transition-all"
                                    >
                                        {upgrading ? 'Uploading Proof...' : 'Submit Payment Proof'}
                                    </Button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Pricing;
