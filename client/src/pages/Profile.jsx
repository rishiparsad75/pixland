import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { User, Mail, HardDrive, Key, Crown, Check, Share2, Download, Zap, X, Shield, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { useEffect } from "react";


const Profile = () => {
    const { user, login, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showSubscription, setShowSubscription] = useState(false);
    const [copied, setCopied] = useState(false);
    const [stats, setStats] = useState(null);
    const [systemStats, setSystemStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch latest user info (including usage)
                const userRes = await api.get("/api/users/me");
                setStats(userRes.data);

                // Update local storage and context while PRESERVING the token
                const currentUser = JSON.parse(localStorage.getItem("user"));
                login({ ...userRes.data, token: currentUser?.token });

                // If admin, fetch system-wide storage stats
                if (user.role === 'super-admin') {
                    const sysRes = await api.get("/api/analytics/system");
                    setSystemStats(sysRes.data);
                }
            } catch (err) {
                console.error("Failed to fetch profile stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const userData = stats || user;


    const shareLink = `${window.location.origin}/register?ref=${user._id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-black pt-28 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* User Info Card */}
                    <Card className="md:col-span-2">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-black shadow-lg">
                                {user.name[0]}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                                <p className="text-indigo-400 font-medium capitalize">{user.role.replace('-', ' ')} Account</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 text-white">
                                    <User size={18} className="text-gray-400" />
                                    {user.name}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Account Type</label>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 text-white">
                                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${user.role === 'photographer'
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                        : user.role === 'super-admin'
                                            ? 'bg-gradient-to-r from-red-500 to-orange-500'
                                            : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                        }`}>
                                        {user.role === 'super-admin' ? 'Super Admin' : user.role === 'photographer' ? 'Photographer' : 'User'}
                                    </div>
                                    <span className="text-gray-300 text-sm">
                                        {user.role === 'photographer'
                                            ? 'Upload and manage event photos'
                                            : user.role === 'super-admin'
                                                ? 'Full system access'
                                                : 'Download and view photos'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Email Address</label>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 text-white">
                                    <Mail size={18} className="text-gray-400" />
                                    {user.email}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                            <Button
                                variant="outline"
                                onClick={() => setShowSubscription(true)}
                                className="border-indigo-400/30 hover:bg-indigo-500/10 group gap-2"
                            >
                                <Crown size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                                View Subscription
                            </Button>
                            <Button variant="danger" onClick={logout}>Sign Out</Button>
                        </div>

                    </Card>

                    {/* Storage & Security */}
                    <div className="space-y-6">
                        {/* Storage logic based on role */}
                        <Card>
                            <div className="flex items-center gap-3 mb-4 text-white">
                                <HardDrive size={20} className="text-indigo-400" />
                                <h3 className="font-bold">
                                    {userData.role === 'super-admin' ? "System Storage" :
                                        userData.role === 'photographer' ? "Cloud Storage" : "Download Limit"}
                                </h3>
                            </div>

                            {userData.role === 'super-admin' ? (
                                <>
                                    <div className="mb-2 flex justify-between text-sm">
                                        <span className="text-gray-400">Total Photos</span>
                                        <span className="text-white font-medium">
                                            {systemStats?.totalPhotos?.toLocaleString() || '...'} / 100,000
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-2 mb-4 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((systemStats?.totalPhotos || 0) / 100000 * 100, 100)}%` }}
                                            className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter mb-4">Storage health: {100 - Math.min((systemStats?.totalPhotos || 0) / 100000 * 100, 100).toFixed(1)}% Free</p>
                                    <Button variant="outline" size="sm" className="w-full border-white/10 hover:bg-white/5 flex gap-2" onClick={() => navigate('/admin/dashboard')}>
                                        <BarChart3 size={14} /> Full Analytics
                                    </Button>
                                </>
                            ) : userData.role === 'photographer' ? (
                                <>
                                    <div className="mb-2 flex justify-between text-sm">
                                        <span className="text-gray-400">Used Assets</span>
                                        <span className="text-white font-medium">
                                            {userData.usage?.uploads?.count || 0} / {userData.usage?.uploads?.monthlyLimit || 500}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-2 mb-4 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((userData.usage?.uploads?.count || 0) / (userData.usage?.uploads?.monthlyLimit || 500) * 100, 100)}%` }}
                                            className="bg-indigo-500 h-full rounded-full"
                                        />
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full border-white/10 hover:bg-white/5 mb-3" onClick={() => navigate('/photographer/upload')}>Manage Storage</Button>
                                    {userData.usage?.uploads?.count >= (userData.usage?.uploads?.monthlyLimit || 500) && (
                                        <button
                                            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 mx-auto transition-colors"
                                            onClick={() => navigate('/pricing')}
                                        >
                                            <Zap size={12} /> Buy subscription to increase limit
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="mb-2 flex justify-between text-sm">
                                        <span className="text-gray-400">Photos Downloaded</span>
                                        <span className="text-white font-medium">
                                            {userData.subscription?.plan === 'premium' ? '∞' : `${userData.usage?.downloads?.count || 0} / ${userData.usage?.downloads?.monthlyLimit || 10}`}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-2 mb-4 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: userData.subscription?.plan === 'premium' ? '100%' : `${Math.min((userData.usage?.downloads?.count || 0) / (userData.usage?.downloads?.monthlyLimit || 10) * 100, 100)}%` }}
                                            className="bg-cyan-500 h-full rounded-full"
                                        />
                                    </div>
                                    {userData.subscription?.plan !== 'premium' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 flex gap-2 items-center justify-center font-bold"
                                            onClick={() => setShowSubscription(true)}
                                        >
                                            <Zap size={14} /> Get Unlimited
                                        </Button>
                                    )}
                                </>
                            )}
                        </Card>

                        <Card>
                            <div className="flex items-center gap-3 mb-4 text-white">
                                <Key size={20} className="text-purple-400" />
                                <h3 className="font-bold">Security</h3>
                            </div>
                            <p className="text-sm text-gray-400 mb-4">
                                Keep your {userData.role} credentials secure. Reset your password if you think it's compromised.
                            </p>
                            <Button variant="secondary" size="sm" className="w-full" onClick={() => navigate('/forgot-password')}>Reset Password</Button>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Premium Subscription Modal */}
            <AnimatePresence>
                {showSubscription && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
                            onClick={() => setShowSubscription(false)}
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header Gradient */}
                            <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-700 relative flex items-center justify-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                    className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center"
                                >
                                    <Crown size={32} className="text-white" />
                                </motion.div>
                                <button
                                    onClick={() => setShowSubscription(false)}
                                    className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/70 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-10 text-center">
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome to Premium</h2>
                                    <p className="text-indigo-400 font-bold mb-8 uppercase tracking-widest text-xs">Exclusively for {user.name}</p>
                                </motion.div>

                                <div className="space-y-4 mb-10">
                                    {[
                                        { icon: <Zap size={18} />, title: "Unlimited Downloads", desc: "No limits on your photo collections" },
                                        { icon: <Crown size={18} />, title: "HD & 4K Quality", desc: "Crystal clear resolution for every shot" },
                                        { icon: <Share2 size={18} />, title: "Add Friend via Link", desc: "Share your premium access with others" }
                                    ].map((feature, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 + (i * 0.1) }}
                                            className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl text-left"
                                        >
                                            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-sm tracking-tight">{feature.title}</h3>
                                                <p className="text-gray-500 text-xs">{feature.desc}</p>
                                            </div>
                                            <Check className="ml-auto text-indigo-400" size={16} />
                                        </motion.div>
                                    ))}
                                </div>

                                {user.role === 'user' && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                        className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6 mb-8"
                                    >
                                        <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest mb-4">Your Exclusive Referral Link</p>
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-400 text-xs font-mono truncate text-left">
                                                {shareLink}
                                            </div>
                                            <Button
                                                onClick={handleCopyLink}
                                                className={`min-w-[100px] rounded-xl text-xs font-bold transition-all ${copied ? 'bg-green-500 hover:bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                            >
                                                {copied ? "Copied!" : "Copy Link"}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                <Button
                                    onClick={() => {
                                        setShowSubscription(false);
                                        navigate("/gallery");
                                    }}
                                    className="w-full py-5 rounded-2xl bg-white text-black hover:bg-gray-200 font-black"
                                >
                                    Continue to Gallery
                                </Button>

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default Profile;
