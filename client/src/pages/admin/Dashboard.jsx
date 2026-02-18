import { useState, useEffect } from "react";
import api from "../../api/axios";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Users, Image as ImageIcon, Briefcase, Calendar, TrendingUp, Plus, Search } from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="hover:border-indigo-500/50 transition-all group">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-bold text-white group-hover:text-indigo-400 transition-colors">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400 border border-${color}-500/20`}>
                <Icon size={24} />
            </div>
        </div>
    </Card>
);

const SuperDashboard = () => {
    const [stats, setStats] = useState(null);
    const [photographers, setPhotographers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, photoRes] = await Promise.all([
                api.get("/api/analytics/system"),
                api.get("/api/users/photographers")
            ]);
            setStats(statsRes.data);
            setPhotographers(photoRes.data);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-white">Loading SaaS Metrics...</div>;

    const chartData = {
        labels: stats?.monthlyGrowth?.map(mg => mg.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'System Growth (Users)',
                data: stats?.monthlyGrowth?.map(mg => mg.count) || [0, 0, 0, 0, 0, 0],
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                tension: 0.4
            }
        ]
    };

    const handleDownloadReport = async () => {
        try {
            const response = await api.get("/api/analytics/report", {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `pixland-report-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading report:", error);
            alert("Failed to download report. Please try again.");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">System Intelligence</h1>
                    <p className="text-gray-400">PixLand Global SaaS Analytics & Management</p>
                </div>
                <Button className="gap-2" onClick={handleDownloadReport}>
                    <TrendingUp size={18} />
                    Download Report
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Photos" value={stats?.totalPhotos || 0} icon={ImageIcon} color="indigo" />
                <StatCard title="Active Events" value={stats?.totalEvents || 0} icon={Calendar} color="purple" />
                <StatCard title="Photographers" value={stats?.totalPhotographers || 0} icon={Briefcase} color="blue" />
                <StatCard title="End Users" value={stats?.totalUsers || 0} icon={Users} color="pink" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Photographers Management */}
                <Card className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Manage Photographers</h3>
                        <Button variant="secondary" size="sm" className="gap-2">
                            <Plus size={16} /> Add New
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 text-gray-400 text-sm">
                                    <th className="pb-4 font-medium">Name</th>
                                    <th className="pb-4 font-medium">Email</th>
                                    <th className="pb-4 font-medium">Status</th>
                                    <th className="pb-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {photographers.map((p) => (
                                    <tr key={p._id} className="text-sm">
                                        <td className="py-4 text-white font-medium">{p.name}</td>
                                        <td className="py-4 text-gray-400">{p.email}</td>
                                        <td className="py-4">
                                            <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase">Active</span>
                                        </td>
                                        <td className="py-4">
                                            <button className="text-indigo-400 hover:underline">Manage</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* System Activity Chart */}
                <Card>
                    <h3 className="text-xl font-bold text-white mb-6">System Growth</h3>
                    <div className="aspect-square">
                        <Line data={chartData} options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                            scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }
                        }} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SuperDashboard;
