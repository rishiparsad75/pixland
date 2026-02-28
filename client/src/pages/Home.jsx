import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Users, Sparkles } from "lucide-react";
import Button from "../components/ui/Button";
import Footer from "../components/Footer";

const Home = () => {
    const { user } = useContext(AuthContext);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.18 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const features = [
        {
            icon: Zap,
            title: "Lightning Fast",
            desc: "Process thousands of images in seconds using our distributed AI pipeline."
        },
        {
            icon: ShieldCheck,
            title: "Bank-Grade Security",
            desc: "Your biometric data is encrypted and stored in secure, compliance-ready silos."
        },
        {
            icon: Users,
            title: "Smart Grouping",
            desc: "Automatically cluster faces to create personalized albums for every individual."
        }
    ];

    return (
        <div className="min-h-screen bg-[#2B2E33] pt-20 overflow-hidden relative flex flex-col">

            {/* Subtle background gradient orbs */}
            <div className="absolute top-10 left-1/3 w-[500px] h-[500px] bg-[#7B7F85]/8 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-[#C1C4C8]/5 rounded-full blur-[100px] pointer-events-none" />

            {/* ── Hero Section ────────────────────────── */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 text-center flex-1">
                <motion.div initial="hidden" animate="visible" variants={containerVariants}>

                    {/* Pill badge */}
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C1C4C8]/8 border border-[#C1C4C8]/15 text-xs font-semibold text-[#C1C4C8] mb-8 tracking-wide"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C1C4C8] opacity-50" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5F6F7]" />
                        </span>
                        <Sparkles size={13} />
                        PixLand.ai by Rishi Parsad · SaaS Event Photography v1.0
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-7xl font-black text-[#F5F6F7] mb-6 tracking-tight leading-none"
                    >
                        Revolutionize Your<br />
                        <span className="shimmer-text">Event Photography</span>
                    </motion.h1>

                    {/* Sub */}
                    <motion.p
                        variants={itemVariants}
                        className="text-base md:text-lg text-[#7B7F85] max-w-xl mx-auto mb-12 leading-relaxed"
                    >
                        The ultimate AI platform for photographers. Deliver photos to guests instantly with
                        QR-triggered face recognition and personalized galleries.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        {user ? (
                            <>
                                {user.role === 'super-admin' && (
                                    <Link to="/admin/dashboard">
                                        <Button variant="primary" size="lg" className="gap-2">
                                            Manage Platform <ArrowRight size={18} />
                                        </Button>
                                    </Link>
                                )}
                                {user.role === 'photographer' && (
                                    <Link to="/photographer/dashboard">
                                        <Button variant="primary" size="lg" className="gap-2">
                                            Go to Workspace <ArrowRight size={18} />
                                        </Button>
                                    </Link>
                                )}
                                {user.role === 'user' && (
                                    <Link to="/face-scan">
                                        <Button variant="primary" size="lg" className="gap-2">
                                            Find My Photos <ArrowRight size={18} />
                                        </Button>
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <Link to="/register">
                                    <Button variant="primary" size="lg" className="gap-2 min-w-[200px]">
                                        Start Your Studio <ArrowRight size={18} />
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="secondary" size="lg" className="min-w-[180px]">
                                        Photographer Login
                                    </Button>
                                </Link>
                            </>
                        )}
                    </motion.div>

                    {/* Social proof nudge */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-10 flex items-center justify-center gap-3 text-xs text-[#7B7F85]"
                    >
                        <div className="flex -space-x-1">
                            {['#F5F6F7', '#C1C4C8', '#7B7F85', '#2B2E33'].map((c, i) => (
                                <div key={i} style={{ backgroundColor: c }} className="w-6 h-6 rounded-full border-2 border-[#2B2E33]" />
                            ))}
                        </div>
                        <span>Trusted by photographers across India</span>
                    </motion.div>
                </motion.div>
            </div>

            {/* ── Features Grid ──────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 pb-24">
                <div className="grid md:grid-cols-3 gap-5">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                            className="p-6 rounded-2xl bg-[#C1C4C8]/6 border border-[#C1C4C8]/10 hover:border-[#C1C4C8]/22 hover:bg-[#C1C4C8]/10 transition-all duration-300 group"
                        >
                            <div className="w-11 h-11 rounded-xl bg-[#C1C4C8]/12 flex items-center justify-center text-[#C1C4C8] mb-4 group-hover:bg-[#C1C4C8]/20 transition-colors">
                                <feature.icon size={22} />
                            </div>
                            <h3 className="text-lg font-bold text-[#F5F6F7] mb-2">{feature.title}</h3>
                            <p className="text-sm text-[#7B7F85] leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Home;
