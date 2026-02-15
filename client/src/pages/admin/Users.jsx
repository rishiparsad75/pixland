import { useState, useEffect } from "react";
import api from "../../api/axios";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Plus, Trash2, UserCheck, Search, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [approveLoading, setApproveLoading] = useState(null);
    const [rejectLoading, setRejectLoading] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get("/api/users"); // Helper route in authRoute
                setUsers(res.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        setDeleteLoading(id);
        try {
            await api.delete(`/api/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user");
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleApprove = async (id) => {
        setApproveLoading(id);
        try {
            await api.patch(`/api/users/${id}/approve`);
            setUsers(users.map(u => u._id === id ? { ...u, status: 'active' } : u));
        } catch (error) {
            console.error("Error approving user:", error);
            alert("Failed to approve user");
        } finally {
            setApproveLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject this user?")) return;

        setRejectLoading(id);
        try {
            await api.patch(`/api/users/${id}/reject`);
            setUsers(users.map(u => u._id === id ? { ...u, status: 'rejected' } : u));
        } catch (error) {
            console.error("Error rejecting user:", error);
            alert("Failed to reject user");
        } finally {
            setRejectLoading(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Platform Accounts</h1>
                    <p className="text-gray-400">Manage all users, photographers and administrators.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="p-0 border-0 overflow-hidden bg-white/5 backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 border-b border-white/10 text-xs font-bold uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-5 font-medium">Identity</th>
                                <th className="px-6 py-5 font-medium">Role Access</th>
                                <th className="px-6 py-5 font-medium">Status</th>
                                <th className="px-6 py-5 font-medium">Registration</th>
                                <th className="px-6 py-5 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="px-6 py-8 h-20 bg-white/5"></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-indigo-400 font-bold">
                                                    {user.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium group-hover:text-indigo-400 transition-colors">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest ${user.role === 'super-admin'
                                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                                : user.role === 'photographer'
                                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                }`}>
                                                {user.role === 'super-admin' && <UserCheck size={10} />}
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest ${user.status === 'active'
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : user.status === 'pending'
                                                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                {user.status === 'active' && <CheckCircle size={10} />}
                                                {user.status === 'pending' && <AlertTriangle size={10} />}
                                                {user.status === 'rejected' && <XCircle size={10} />}
                                                {(user.status || 'active').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm font-light">
                                            {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(user._id)}
                                                            disabled={approveLoading === user._id}
                                                            className="p-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Approve user"
                                                        >
                                                            {approveLoading === user._id ? (
                                                                <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <CheckCircle size={16} />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(user._id)}
                                                            disabled={rejectLoading === user._id}
                                                            className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Reject user"
                                                        >
                                                            {rejectLoading === user._id ? (
                                                                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <XCircle size={16} />
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                                {user.role !== 'super-admin' && (
                                                    <button
                                                        onClick={() => handleDelete(user._id)}
                                                        className="text-gray-500 hover:text-red-400 transition-colors p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100"
                                                        disabled={deleteLoading === user._id}
                                                    >
                                                        {deleteLoading === user._id ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <Trash2 size={16} />}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center text-gray-500">
                                        No accounts found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Users;
