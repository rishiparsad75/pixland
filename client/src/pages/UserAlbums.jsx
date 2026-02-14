import { useState, useEffect } from "react";
import api from "../api/axios";
import Card from "../components/ui/Card";
import { Lock, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

const UserAlbums = () => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyAlbums = async () => {
            // Mock data until backend is ready
            // GET /api/albums/myalbums
            setAlbums([
                { _id: "1", name: "Summer Event 2026", description: "All photos from the retreat", coverImage: "", photoCount: 124 },
            ]);
            setLoading(false);
        };
        fetchMyAlbums();
    }, []);

    return (
        <div className="min-h-screen bg-black pt-28 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">My Collections</h1>
                    <p className="text-gray-400">Private albums assigned to you.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {albums.map((album, i) => (
                        <motion.div
                            key={album._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="p-0 border-0 group cursor-pointer overflow-hidden">
                                <div className="h-64 bg-gray-900 relative">
                                    {album.coverImage ? (
                                        <img src={album.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                                            <ImageIcon size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1.5">
                                        <Lock size={12} /> Private
                                    </div>
                                </div>
                                <div className="p-6 bg-white/5 border-t border-white/10">
                                    <h3 className="text-xl font-bold text-white mb-1">{album.name}</h3>
                                    <p className="text-sm text-gray-400 mb-4">{album.description}</p>
                                    <div className="text-xs text-indigo-400 font-medium">
                                        {album.photoCount} Photos
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserAlbums;
