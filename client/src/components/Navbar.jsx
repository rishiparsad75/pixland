import { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Camera, User, LogOut, Upload as UploadIcon, Image as ImageIcon, LayoutDashboard } from "lucide-react";
import Button from "./ui/Button";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Bug fix: removed duplicate "My Collections" link that also pointed to /gallery
    const navLinks = [
        ...(user?.role === 'photographer' || user?.role === 'super-admin'
            ? [{ name: "Upload", path: "/photographer/upload", icon: UploadIcon }]
            : []),
        { name: "Find My Photos", path: "/face-scan", icon: Camera },
        { name: "Gallery", path: "/gallery", icon: ImageIcon },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? "bg-[#2B2E33]/80 backdrop-blur-xl border-b border-[#C1C4C8]/10 py-3 shadow-lg shadow-black/20"
                    : "bg-transparent py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-lg bg-[#F5F6F7] flex items-center justify-center shadow-md group-hover:shadow-[#C1C4C8]/30 transition-all duration-300">
                        <img src="/logo.svg" alt="PixLand Logo" className="w-5 h-5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        <span className="text-[#2B2E33] font-black text-sm hidden">P</span>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-lg font-black tracking-tight text-[#F5F6F7]">
                            PixLand<span className="text-[#7B7F85]">.ai</span>
                        </span>
                        <span className="text-[9px] text-[#7B7F85] font-semibold uppercase tracking-widest">by Rishi Parsad</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {user ? (
                        <>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-lg ${isActive(link.path)
                                            ? "text-[#F5F6F7] bg-[#C1C4C8]/15"
                                            : "text-[#7B7F85] hover:text-[#C1C4C8] hover:bg-[#C1C4C8]/8"
                                        }`}
                                >
                                    <link.icon size={15} />
                                    {link.name}
                                </Link>
                            ))}

                            <div className="h-5 w-px bg-[#C1C4C8]/20" />

                            <div className="flex items-center gap-3">
                                {user.role === 'super-admin' && (
                                    <Link to="/admin/dashboard">
                                        <Button variant="outline" size="sm" className="gap-1.5 border-[#7B7F85]/40 text-[#7B7F85] hover:bg-[#7B7F85]/10">
                                            <LayoutDashboard size={13} /> Admin
                                        </Button>
                                    </Link>
                                )}
                                {user.role === 'photographer' && (
                                    <Link to="/photographer/dashboard">
                                        <Button variant="outline" size="sm" className="gap-1.5 border-[#7B7F85]/40 text-[#7B7F85] hover:bg-[#7B7F85]/10">
                                            <LayoutDashboard size={13} /> Hub
                                        </Button>
                                    </Link>
                                )}

                                {/* User Avatar */}
                                <Link to="/profile" className="flex items-center gap-2.5 group pl-3 border-l border-[#C1C4C8]/15">
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-[#7B7F85]/30 border border-[#C1C4C8]/20 flex items-center justify-center group-hover:border-[#C1C4C8]/50 transition-colors">
                                            <User size={14} className="text-[#C1C4C8]" />
                                        </div>
                                        {(user.role === 'super-admin' || user.role === 'photographer') && (
                                            <div className={`absolute -top-1 -right-1 w-3 h-3 ${user.role === 'super-admin' ? 'bg-[#F5F6F7]' : 'bg-[#C1C4C8]'} rounded-full border-2 border-[#2B2E33]`} />
                                        )}
                                    </div>
                                    <div className="flex flex-col leading-none">
                                        <span className="text-sm font-semibold text-[#C1C4C8] group-hover:text-[#F5F6F7] transition-colors">{user.name}</span>
                                        <span className="text-[9px] text-[#7B7F85] uppercase tracking-wider">{user.role}</span>
                                    </div>
                                </Link>

                                <button
                                    onClick={logout}
                                    className="p-2 rounded-lg text-[#7B7F85] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                                    title="Sign Out"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex gap-2 bg-[#1A1D20]/60 p-1 rounded-xl border border-[#C1C4C8]/10">
                            <Link to="/login">
                                <Button
                                    variant={isActive("/login") ? "primary" : "ghost"}
                                    size="sm"
                                    className={isActive("/login") ? "" : "text-[#7B7F85] hover:text-[#C1C4C8]"}
                                >
                                    Sign In
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button
                                    variant={isActive("/register") ? "primary" : "secondary"}
                                    size="sm"
                                >
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-[#C1C4C8] hover:text-[#F5F6F7] transition-colors p-2 rounded-lg hover:bg-[#C1C4C8]/10"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-[#2B2E33]/98 backdrop-blur-xl border-b border-[#C1C4C8]/10 overflow-hidden"
                    >
                        <div className="p-5 flex flex-col gap-3">
                            {user ? (
                                <>
                                    {/* User card */}
                                    <Link
                                        to="/profile"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-[#C1C4C8]/8 border border-[#C1C4C8]/12 mb-2"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#7B7F85]/40 border border-[#C1C4C8]/25 flex items-center justify-center text-lg font-bold text-[#F5F6F7]">
                                            {user.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-[#F5F6F7] font-semibold text-sm">{user.name}</p>
                                            <p className="text-[10px] text-[#7B7F85]">{user.email}</p>
                                        </div>
                                    </Link>

                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                                                    ? "text-[#F5F6F7] bg-[#C1C4C8]/12"
                                                    : "text-[#7B7F85] hover:text-[#C1C4C8]"
                                                }`}
                                        >
                                            <link.icon size={17} />
                                            {link.name}
                                        </Link>
                                    ))}

                                    {user.role === 'super-admin' && (
                                        <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm text-[#C1C4C8] hover:text-[#F5F6F7] transition-colors"
                                        >
                                            <LayoutDashboard size={17} /> Admin Panel
                                        </Link>
                                    )}
                                    {user.role === 'photographer' && (
                                        <Link to="/photographer/dashboard" onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm text-[#C1C4C8] hover:text-[#F5F6F7] transition-colors"
                                        >
                                            <LayoutDashboard size={17} /> Photographer Hub
                                        </Link>
                                    )}

                                    <div className="h-px bg-[#C1C4C8]/10 my-1" />

                                    <button
                                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                                        className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        <LogOut size={17} /> Sign Out
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
