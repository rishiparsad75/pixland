import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { User, Mail, HardDrive, Key, Crown, Check, Share2, Zap, X, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";


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
                const userRes = await api.get("/api/users/me");
                setStats(userRes.data);

                // Bug fix: safely read token before overwriting to prevent token loss
                let existingToken = null;
                try {
                    const stored = localStorage.getItem("user");
                    if (stored) existingToken = JSON.parse(stored)?.token;
                } catch { }
                login({ ...userRes.data, token: userRes.data.token || existingToken });

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


    // Bug fix: guard against user._id being undefined
    const shareLink = user?._id ? `${window.location.origin}/register?ref=${user._id}` : '';

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#2B2E33] pt-28 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black text-[#F5F6F7] mb-8 tracking-tight">Account Settings</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* User Info Card */}
                    <Card className="md:col-span-2 bg-[#1A1D20]/60 border-[#C1C4C8]/12 backdrop-blur-xl">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-20 h-20 rounded-2xl bg-[#7B7F85]/30 border-2 border-[#C1C4C8]/20 flex items-center justify-center text-3xl font-black text-[#F5F6F7] shadow-lg">
                                {user.name[0]}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-[#F5F6F7] tracking-tight">{user.name}</h2>
                                <p className="text-[#7B7F85] text-sm font-medium capitalize mt-0.5">{user.role.replace('-', ' ')} Account</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-[#7B7F85] uppercase tracking-wider font-semibold mb-1.5">Full Name</label>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#2B2E33]/80 border border-[#C1C4C8]/10 text-[#F5F6F7] text-sm">
                                    <User size={16} className="text-[#7B7F85]" />
                                    {user.name}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-[#7B7F85] uppercase tracking-wider font-semibold mb-1.5">Account Type</label>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#2B2E33]/80 border border-[#C1C4C8]/10">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold text-[#2B2E33] ${user.role === 'photographer' ? 'bg-[#C1C4C8]'
                                            : user.role === 'super-admin' ? 'bg-[#F5F6F7]'
                                                : 'bg-[#7B7F85] text-[#F5F6F7]'
                                        }`}>
                                        {user.role === 'super-admin' ? 'Super Admin' : user.role === 'photographer' ? 'Photographer' : 'User'}
                                    </span>
                                    <span className="text-[#7B7F85] text-xs">
                                        {user.role === 'photographer' ? 'Upload and manage event photos'
                                            : user.role === 'super-admin' ? 'Full system access'
                                                : 'Download and view photos'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-[#7B7F85] uppercase tracking-wider font-semibold mb-1.5">Email Address</label>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#2B2E33]/80 border border-[#C1C4C8]/10 text-[#F5F6F7] text-sm">
                                    <Mail size={16} className="text-[#7B7F85]" />
                                    {user.email}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-[#C1C4C8]/10 flex justify-between items-center">
                            <Button
                                variant="outline"
                                onClick={() => setShowSubscription(true)}
                                className="gap-2 border-[#C1C4C8]/20 text-[#C1C4C8] hover:bg-[#C1C4C8]/10"
                            >
                                <Crown size={15} /> View Subscription
                            </Button>
                            <Button variant="danger" onClick={logout}>Sign Out</Button>
                        </div>
                    </Card>

                    {/* Storage & Security */}
                    <div className="space-y-5">
                        <Card className="bg-[#1A1D20]/60 border-[#C1C4C8]/12 backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-5 text-[#F5F6F7]">
                                <HardDrive size={18} className="text-[#C1C4C8]" />
                                <h3 className="font-bold text-sm tracking-tight">
                                    {userData.role === 'super-admin' ? "System Storage" :
                                        userData.role === 'photographer' ? "Cloud Storage" : "Download Limit"}
                                </h3>
                            </div>

                            {userData.role === 'super-admin' ? (
                                <>
                                    <div className="mb-2 flex justify-between text-xs text-[#7B7F85]">
                                        <span>Total Photos</span>
                                        <span className="text-[#C1C4C8] font-semibold">
                                            {systemStats?.totalPhotos?.toLocaleString() || '...'} / 100,000
                                        </span>
                                    </div>
                                    <div className="w-full bg-[#2B2E33] rounded-full h-1.5 mb-4 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((systemStats?.totalPhotos || 0) / 100000 * 100, 100)}%` }}
                                            className="bg-[#F5F6F7] h-full rounded-full"
                                        />
                                    </div>
                                    <p className="text-[10px] text-[#7B7F85] uppercase font-bold tracking-tighter mb-4">{100 - Math.min((systemStats?.totalPhotos || 0) / 100000 * 100, 100).toFixed(1)}% free</p>
                                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => navigate('/admin/dashboard')}>
                                        <BarChart3 size={13} /> Full Analytics
                                    </Button>
                                </>
                            ) : userData.role === 'photographer' ? (
                                <>
                                    <div className="mb-2 flex justify-between text-xs text-[#7B7F85]">
                                        <span>Used Assets</span>
                                        <span className="text-[#C1C4C8] font-semibold">
                                            {userData.usage?.uploads?.count || 0} / {userData.usage?.uploads?.monthlyLimit || 500}
                                        </span>
                                    </div>
                                    <div className="w-full bg-[#2B2E33] rounded-full h-1.5 mb-4 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((userData.usage?.uploads?.count || 0) / (userData.usage?.uploads?.monthlyLimit || 500) * 100, 100)}%` }}
                                            className="bg-[#C1C4C8] h-full rounded-full"
                                        />
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full mb-3" onClick={() => navigate('/photographer/upload')}>Manage Storage</Button>
                                    {userData.usage?.uploads?.count >= (userData.usage?.uploads?.monthlyLimit || 500) && (
                                        <button className="text-xs text-[#C1C4C8] hover:text-[#F5F6F7] font-bold flex items-center gap-1 mx-auto transition-colors" onClick={() => navigate('/pricing')}>
                                            <Zap size={12} /> Increase Limit
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="mb-2 flex justify-between text-xs text-[#7B7F85]">
                                        <span>Photos Downloaded</span>
                                        <span className="text-[#C1C4C8] font-semibold">
                                            {userData.subscription?.plan === 'premium' ? '∞' : `${userData.usage?.downloads?.count || 0} / ${userData.usage?.downloads?.monthlyLimit || 10}`}
                                        </span>
                                    </div>
                                    <div className="w-full bg-[#2B2E33] rounded-full h-1.5 mb-4 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: userData.subscription?.plan === 'premium' ? '100%' : `${Math.min((userData.usage?.downloads?.count || 0) / (userData.usage?.downloads?.monthlyLimit || 10) * 100, 100)}%` }}
                                            className="bg-[#F5F6F7] h-full rounded-full"
                                        />
                                    </div>
                                    {userData.subscription?.plan !== 'premium' && (
                                        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setShowSubscription(true)}>
                                            <Zap size={13} /> Get Unlimited
                                        </Button>
                                    )}
                                </>
                            )}
                        </Card>

                        <Card className="bg-[#1A1D20]/60 border-[#C1C4C8]/12 backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-4 text-[#F5F6F7]">
                                <Key size={18} className="text-[#C1C4C8]" />
                                <h3 className="font-bold text-sm">Security</h3>
                            </div>
                            <p className="text-xs text-[#7B7F85] mb-4 leading-relaxed">
                                Keep your {userData.role} credentials secure. Reset your password if you suspect it's compromised.
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
                            className="relative w-full max-w-lg bg-[#2B2E33] border border-[#C1C4C8]/20 rounded-3xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header Gradient */}
                            <div className="h-28 bg-[#1A1D20] border-b border-[#C1C4C8]/10 relative flex items-center justify-center">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", delay: 0.15 }}
                                    className="w-14 h-14 bg-[#F5F6F7]/10 border border-[#C1C4C8]/20 rounded-2xl flex items-center justify-center"
                                >
                                    <Crown size={28} className="text-[#F5F6F7]" />
                                </motion.div>
                                <button
                                    onClick={() => setShowSubscription(false)}
                                    className="absolute top-5 right-5 p-2 bg-[#C1C4C8]/5 hover:bg-[#C1C4C8]/15 rounded-full text-[#7B7F85] hover:text-[#F5F6F7] transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-8 text-center">
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.25 }}
                                >
                                    <h2 className="text-2xl font-black text-[#F5F6F7] mb-1 tracking-tight">Welcome to Premium</h2>
                                    <p className="text-[#7B7F85] text-xs font-semibold mb-7 uppercase tracking-widest">Exclusively for {user.name}</p>
                                </motion.div>

                                <div className="space-y-3 mb-7">
                                    {[
                                        { icon: <Zap size={16} />, title: "Unlimited Downloads", desc: "No limits on your photo collections" },
                                        { icon: <Crown size={16} />, title: "HD & 4K Quality", desc: "Crystal clear resolution for every shot" },
                                        { icon: <Share2 size={16} />, title: "Add Friend via Link", desc: "Share your premium access with others" }
                                    ].map((feature, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ x: -16, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 + (i * 0.08) }}
                                            className="flex items-center gap-3 p-3.5 bg-[#C1C4C8]/6 border border-[#C1C4C8]/10 rounded-xl text-left"
                                        >
                                            <div className="w-9 h-9 bg-[#C1C4C8]/12 rounded-xl flex items-center justify-center text-[#C1C4C8] flex-shrink-0">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-[#F5F6F7] font-bold text-sm">{feature.title}</h3>
                                                <p className="text-[#7B7F85] text-xs">{feature.desc}</p>
                                            </div>
                                            <Check className="ml-auto text-[#C1C4C8] flex-shrink-0" size={15} />
                                        </motion.div>
                                    ))}
                                </div>

                                {user.role === 'user' && shareLink && (
                                    <motion.div
                                        initial={{ y: 16, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.55 }}
                                        className="bg-[#C1C4C8]/6 border border-[#C1C4C8]/12 rounded-2xl p-5 mb-6"
                                    >
                                        <p className="text-[10px] text-[#7B7F85] font-bold uppercase tracking-widest mb-3">Your Referral Link</p>
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-[#1A1D20]/80 border border-[#C1C4C8]/10 rounded-xl px-3 py-2.5 text-[#7B7F85] text-[10px] font-mono truncate text-left">
                                                {shareLink}
                                            </div>
                                            <Button
                                                onClick={handleCopyLink}
                                                size="sm"
                                                className={copied ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                                                variant={copied ? undefined : 'outline'}
                                            >
                                                {copied ? "Copied!" : "Copy"}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                <Button
                                    onClick={() => { setShowSubscription(false); navigate("/gallery"); }}
                                    variant="primary"
                                    className="w-full py-3.5 font-black"
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
