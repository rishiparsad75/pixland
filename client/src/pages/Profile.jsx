import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { User, Mail, HardDrive, Key } from "lucide-react";

const Profile = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-black pt-28 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* User Info Card */}
                    <Card className="md:col-span-2">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-black shadow-lg">
                                {user.name[0]}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                                <p className="text-indigo-400 font-medium capitalize">{user.role.replace('-', ' ')} Account</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 text-white">
                                    <User size={18} className="text-gray-400" />
                                    {user.name}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Account Type</label>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 text-white">
                                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${user.role === 'photographer'
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                            : user.role === 'super-admin'
                                                ? 'bg-gradient-to-r from-red-500 to-orange-500'
                                                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                        }`}>
                                        {user.role === 'super-admin' ? 'Super Admin' : user.role === 'photographer' ? 'Photographer' : 'User'}
                                    </div>
                                    <span className="text-gray-300 text-sm">
                                        {user.role === 'photographer'
                                            ? 'Upload and manage event photos'
                                            : user.role === 'super-admin'
                                                ? 'Full system access'
                                                : 'Download and view photos'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Email Address</label>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 text-white">
                                    <Mail size={18} className="text-gray-400" />
                                    {user.email}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10 flex justify-end">
                            <Button variant="danger" onClick={logout}>Sign Out</Button>
                        </div>
                    </Card>

                    {/* Storage & Security */}
                    <div className="space-y-6">
                        {user.role !== 'user' && (
                            <Card>
                                <div className="flex items-center gap-3 mb-4 text-white">
                                    <HardDrive size={20} className="text-indigo-400" />
                                    <h3 className="font-bold">Cloud Storage</h3>
                                </div>
                                <div className="mb-2 flex justify-between text-sm">
                                    <span className="text-gray-400">Used Assets</span>
                                    <span className="text-white font-medium">842 Photos / 5,000</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '16.8%' }}></div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full border-white/10 hover:bg-white/5">Manage Storage</Button>
                            </Card>
                        )}

                        <Card>
                            <div className="flex items-center gap-3 mb-4 text-white">
                                <Key size={20} className="text-purple-400" />
                                <h3 className="font-bold">Security</h3>
                            </div>
                            <p className="text-sm text-gray-400 mb-4">
                                Keep your {user.role} credentials secure. Enable 2FA for extra protection.
                            </p>
                            <Button variant="secondary" size="sm" className="w-full">Change Password</Button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
