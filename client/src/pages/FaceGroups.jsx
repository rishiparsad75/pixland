import { useState, useEffect } from "react";
import api from "../api/axios";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { User, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const FaceGroups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await api.get("/api/face/groups");
            setGroups(res.data);
        } catch (error) {
            console.error("Error fetching face groups", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await api.post("/api/face/sync-groups");
            await fetchGroups(); // Refresh list
        } catch (error) {
            alert("Sync failed");
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black pt-28 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">People & Faces</h1>
                        <p className="text-gray-400">AI-detected faces from your collections.</p>
                    </div>
                    <Button onClick={handleSync} disabled={syncing} className="gap-2">
                        <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
                        {syncing ? "Syncing..." : "Sync Faces"}
                    </Button>
                </header>

                {loading ? (
                    <div className="text-white">Loading...</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {groups.map((person, i) => (
                            <motion.div
                                key={person._id || person.id} // Handle fallback id
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="p-0 border-0 group cursor-pointer text-center overflow-hidden hover:bg-white/5 transition-colors">
                                    <div className="aspect-square bg-gray-800 relative overflow-hidden">
                                        {person.thumbnail ? (
                                            <img src={person.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                <User size={48} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                    </div>
                                    <div className="p-3">
                                        <h3 className="text-white font-medium truncate">{person.name}</h3>
                                        <p className="text-xs text-indigo-400">{person.faceCount} Photos</p>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FaceGroups;
