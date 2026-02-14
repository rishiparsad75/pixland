import { useEffect, useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import { Search, Filter, MoreHorizontal, User } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await api.get("/api/images");
                setImages(res.data);
            } catch (error) {
                console.error("Error fetching images", error);
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-black pt-28 pb-10 px-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Photo Gallery</h1>
                        <p className="text-gray-400">
                            {images.length} photos secured in your vault
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search faces..."
                                className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-black/40 transition-all w-64"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter size={16} /> Filter
                        </Button>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Gallery Grid */}
                {!loading && (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    >
                        {images.map((img) => (
                            <motion.div key={img._id} variants={item}>
                                <Card className="p-0 group cursor-pointer border-0" hoverEffect={false}>
                                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
                                        <img
                                            src={img.url}
                                            alt="Uploaded"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />

                                        {/* Overlay on Hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">

                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">
                                                        {new Date(img.createdAt).toLocaleDateString()}
                                                    </p>
                                                    {img.metadata?.detectedFaces?.length > 0 && (
                                                        <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-medium bg-indigo-500/20 px-2 py-1 rounded-full w-fit backdrop-blur-md">
                                                            <User size={12} />
                                                            {img.metadata.detectedFaces.length} Face(s)
                                                        </div>
                                                    )}
                                                </div>
                                                <button className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {!loading && images.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                            <FileImage size={32} />
                        </div>
                        <p className="text-gray-400 text-lg mb-6">No photos found in your gallery.</p>
                        <Button onClick={() => window.location.href = '/upload'}>Upload your first photo</Button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Gallery;
