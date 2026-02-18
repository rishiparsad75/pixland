import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";
import Button from "../components/ui/Button";
import Footer from "../components/Footer";

const Home = () => {
    const { user } = useContext(AuthContext);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen bg-black pt-20 overflow-hidden relative">
            {/* Background Gradient Orbs */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        PixLand.ai by Rishi Parsad: SaaS Event Photography v1.0
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                        Revolutionize Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                            Event Photography
                        </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        The ultimate AI platform for photographers. Deliver photos to guests instantly with
                        QR-triggered face recognition and personalized galleries.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {user ? (
                            <>
                                {user.role === 'super-admin' && (
                                    <Link to="/admin/dashboard">
                                        <Button size="lg" className="w-full sm:w-auto gap-2">
                                            Manage Platform <ArrowRight size={18} />
                                        </Button>
                                    </Link>
                                )}
                                {user.role === 'photographer' && (
                                    <Link to="/photographer/dashboard">
                                        <Button size="lg" className="w-full sm:w-auto gap-2">
                                            Go to Workspace <ArrowRight size={18} />
                                        </Button>
                                    </Link>
                                )}
                                {user.role === 'user' && (
                                    <Link to="/face-scan">
                                        <Button size="lg" className="w-full sm:w-auto gap-2">
                                            Find My Photos <ArrowRight size={18} />
                                        </Button>
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <Link to="/register">
                                    <Button size="lg" className="w-full sm:w-auto gap-2">
                                        Start Your Studio <ArrowRight size={18} />
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                                        Photographer Login
                                    </Button>
                                </Link>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-6 pb-20">
                <div className="grid md:grid-cols-3 gap-6">
                    {[
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
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + (i * 0.1) }}
                            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10"
                        >
                            <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                                <feature.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-400">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer with Branding */}
            <Footer variant="dark" />
        </div>
    );
};

export default Home;
