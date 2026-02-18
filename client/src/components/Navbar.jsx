import { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Camera, User, LogOut, Upload as UploadIcon, Image as ImageIcon, Users, FolderHeart, LayoutDashboard } from "lucide-react";
import Button from "./ui/Button";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        ...(user?.role === 'photographer' || user?.role === 'super-admin' ? [{ name: "Upload", path: "/photographer/upload", icon: UploadIcon }] : []),
        { name: "Find My Photos", path: "/face-scan", icon: Camera },
        { name: "Gallery", path: "/gallery", icon: ImageIcon },
        ...(user?.role !== 'super-admin' ? [{ name: "Pricing", path: "/pricing", icon: Users }] : []),
        ...(user?.role === 'user' ? [{ name: "My Collections", path: "/gallery", icon: FolderHeart }] : []),
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-black/50 backdrop-blur-md border-b border-white/10 py-3" : "bg-transparent py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all">
                        <Camera size={18} />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        PixLand<span className="text-indigo-400">.ai</span>
                        <span className="ml-2 text-xs text-gray-400 font-semibold uppercase tracking-wider opacity-100">by Rishi Parsad</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {user ? (
                        <>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === link.path
                                        ? "text-white"
                                        : "text-gray-400 hover:text-white"
                                        }`}
                                >
                                    <link.icon size={16} />
                                    {link.name}
                                </Link>
                            ))}

                            <div className="h-6 w-px bg-white/10" />

                            <div className="flex items-center gap-4">
                                {user.role === 'super-admin' && (
                                    <Link to="/admin/dashboard">
                                        <Button variant="ghost" size="sm" className="hidden lg:flex gap-2 text-indigo-400 hover:bg-indigo-500/10">
                                            <LayoutDashboard size={14} />
                                            Admin
                                        </Button>
                                    </Link>
                                )}
                                {user.role === 'photographer' && (
                                    <Link to="/photographer/dashboard">
                                        <Button variant="ghost" size="sm" className="hidden lg:flex gap-2 text-indigo-400 hover:bg-indigo-500/10">
                                            <LayoutDashboard size={14} />
                                            Hub
                                        </Button>
                                    </Link>
                                )}
                                <Link to="/profile" className="flex items-center gap-2 group pl-2 border-l border-white/10">
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center border border-white/10 group-hover:border-indigo-500 transition-colors">
                                            <User size={14} className="text-white" />
                                        </div>
                                        {(user.role === 'super-admin' || user.role === 'photographer') && (
                                            <div className={`absolute -top-1 -right-1 w-3 h-3 ${user.role === 'super-admin' ? 'bg-indigo-500' : 'bg-purple-500'} rounded-full border-2 border-black`} title={user.role} />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">{user.name}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{user.role}</span>
                                    </div>
                                </Link>
                                <Button variant="ghost" size="sm" onClick={logout} className="text-white/40 hover:text-red-400 hover:bg-red-500/10 ml-1">
                                    <LogOut size={16} />
                                </Button>
                            </div>
                        </>
                    ) : (

                        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                            <Link to="/login">
                                <Button
                                    variant={location.pathname === "/login" ? "primary" : "ghost"}
                                    className={location.pathname === "/login" ? "shadow-indigo-500/20" : "text-gray-400 hover:text-white"}
                                >
                                    Sign In
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button
                                    variant={location.pathname === "/register" ? "primary" : "ghost"}
                                    className={location.pathname === "/register" ? "shadow-indigo-500/20" : "text-gray-400 hover:text-white"}
                                >
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
                    >
                        <div className="p-6 flex flex-col gap-4">
                            {user ? (
                                <>
                                    <Link to="/profile" className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white/5 border border-white/10" onClick={() => setMobileMenuOpen(false)}>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-lg font-bold text-white">{user.name[0]}</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{user.name}</p>
                                            <p className="text-xs text-gray-400">{user.email}</p>
                                        </div>
                                    </Link>
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 text-gray-300 hover:text-white py-2"
                                        >
                                            <link.icon size={18} />
                                            {link.name}
                                        </Link>
                                    ))}
                                    {user.role === 'super-admin' && (
                                        <Link
                                            to="/admin/dashboard"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 text-indigo-400 hover:text-indigo-300 py-2"
                                        >
                                            <LayoutDashboard size={18} />
                                            Admin Panel
                                        </Link>
                                    )}
                                    {user.role === 'photographer' && (
                                        <Link
                                            to="/photographer/dashboard"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 text-indigo-400 hover:text-indigo-300 py-2"
                                        >
                                            <LayoutDashboard size={18} />
                                            Photographer Hub
                                        </Link>
                                    )}

                                    <button onClick={logout} className="flex items-center gap-3 text-red-400 py-2 mt-2">
                                        <LogOut size={18} />
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="secondary" className="w-full">Sign In</Button>
                                    </Link>
                                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="primary" className="w-full">Get Started</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
