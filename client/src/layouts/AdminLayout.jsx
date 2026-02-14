import { useState, useContext } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import {
    LayoutDashboard, Users, Image as ImageIcon, LogOut, Menu, X, Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = user?.role === 'super-admin'
        ? [
            { name: "Global Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
            { name: "Manage Users", path: "/admin/users", icon: Users },
            { name: "Event Monitor", path: "/admin/albums", icon: ImageIcon },
            { name: "Settings", path: "/admin/settings", icon: Settings },
        ]
        : [
            { name: "My Dashboard", path: "/photographer/dashboard", icon: LayoutDashboard },
            { name: "Bulk Upload", path: "/photographer/upload", icon: ImageIcon },
            { name: "Analytics", path: "/admin/dashboard", icon: Settings }, // Photographers might want basic analytics too
        ];

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <motion.aside
                initial={{ width: 250 }}
                animate={{ width: sidebarOpen ? 250 : 80 }}
                className="hidden md:flex flex-col bg-white/5 border-r border-white/10 sticky top-0 h-screen transition-all duration-300"
            >
                <div className="p-6 flex flex-col gap-4 border-b border-white/10 mb-4">
                    <div className="flex items-center justify-between">
                        {sidebarOpen ? (
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                                PixLand Admin
                            </span>
                        ) : (
                            <span className="text-xl font-bold text-indigo-400">P</span>
                        )}
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                    {sidebarOpen && (
                        <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 w-fit">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                Admin Console
                            </span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <item.icon size={20} />
                                {sidebarOpen && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden">
                <header className="flex md:hidden items-center justify-between p-4 bg-black border-b border-white/10 sticky top-0 z-50">
                    <span className="text-lg font-bold">PixLand Admin</span>
                    <button className="text-white"><Menu /></button>
                </header>
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
