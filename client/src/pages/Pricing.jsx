import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, Users, Upload, Download } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const Pricing = () => {
    const { user } = useContext(AuthContext);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState(false);

    useEffect(() => {
        fetchSubscriptionStatus();
    }, []);

    const fetchSubscriptionStatus = async () => {
        try {
            const { data } = await api.get('/subscription/status');
            setSubscription(data);
        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartTrial = async () => {
        try {
            setUpgrading(true);
            const { data } = await api.post('/subscription/trial/start');
            alert(data.message);
            fetchSubscriptionStatus();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to start trial');
        } finally {
            setUpgrading(false);
        }
    };

    const handleUpgrade = async () => {
        try {
            setUpgrading(true);
            const { data } = await api.post('/subscription/upgrade');
            alert(data.message);
            fetchSubscriptionStatus();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to upgrade');
        } finally {
            setUpgrading(false);
        }
    };

    const isPhotographer = user?.role === 'photographer';
    const isPremium = subscription?.isPremium || false;
    const onTrial = subscription?.onTrial || false;

    const freePlan = {
        name: 'Free',
        price: '₹0',
        period: 'forever',
        features: isPhotographer ? [
            '500 photo uploads per month',
            'Basic analytics',
            'Standard support',
            'Event management'
        ] : [
            '10 photo downloads per month',
            'Face recognition access',
            'Basic features',
            'Standard support'
        ],
        icon: Users,
        color: 'from-gray-500 to-gray-600'
    };

    const premiumPlan = {
        name: 'Premium',
        price: isPhotographer ? '₹999' : '₹499',
        period: 'per month',
        features: isPhotographer ? [
            'Unlimited photo uploads',
            'Advanced analytics & insights',
            'Priority support',
            'Custom branding',
            'Bulk upload tools',
            'Advanced event management'
        ] : [
            'Unlimited photo downloads',
            'Priority face recognition',
            'Advanced features',
            'Priority support',
            'Early access to new features',
            'Ad-free experience'
        ],
        icon: Crown,
        color: 'from-purple-500 to-pink-500',
        trial: isPhotographer ? '9 days free trial' : '7 days free trial'
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-purple-200">
                        {isPhotographer ? 'Upload unlimited photos' : 'Download unlimited photos'} with Premium
                    </p>
                    {onTrial && (
                        <div className="mt-4 inline-block bg-green-500/20 border border-green-400/30 rounded-lg px-4 py-2">
                            <p className="text-green-200 text-sm">
                                🎉 You're on a free trial! Enjoying unlimited access.
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className={`p-8 h-full ${subscription?.plan === 'free' && !onTrial ? 'ring-2 ring-white/50' : ''} bg-white/10 backdrop-blur-lg border-white/20`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-lg bg-gradient-to-br ${freePlan.color}`}>
                                    <freePlan.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{freePlan.name}</h3>
                                    {subscription?.plan === 'free' && !onTrial && (
                                        <span className="text-sm text-green-400">Current Plan</span>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-white">{freePlan.price}</span>
                                    <span className="text-gray-300">/ {freePlan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {freePlan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-200">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {subscription?.plan === 'free' && !onTrial ? (
                                <Button variant="secondary" className="w-full" disabled>
                                    Current Plan
                                </Button>
                            ) : null}
                        </Card>
                    </motion.div>

                    {/* Premium Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className={`p-8 h-full ${isPremium || onTrial ? 'ring-2 ring-purple-400' : ''} bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg border-purple-400/30 relative overflow-hidden`}>
                            {/* Popular Badge */}
                            <div className="absolute top-4 right-4">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    POPULAR
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-lg bg-gradient-to-br ${premiumPlan.color}`}>
                                    <premiumPlan.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{premiumPlan.name}</h3>
                                    {isPremium && (
                                        <span className="text-sm text-green-400">Current Plan</span>
                                    )}
                                    {onTrial && (
                                        <span className="text-sm text-yellow-400">On Trial</span>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-white">{premiumPlan.price}</span>
                                    <span className="text-purple-200">/ {premiumPlan.period}</span>
                                </div>
                                <p className="text-sm text-purple-300 mt-1">{premiumPlan.trial}</p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {premiumPlan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-white">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {isPremium ? (
                                <Button variant="secondary" className="w-full" disabled>
                                    Current Plan
                                </Button>
                            ) : onTrial ? (
                                <Button
                                    onClick={handleUpgrade}
                                    disabled={upgrading}
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                >
                                    {upgrading ? 'Processing...' : 'Upgrade Now'}
                                </Button>
                            ) : (
                                <div className="space-y-3">
                                    <Button
                                        onClick={handleStartTrial}
                                        disabled={upgrading}
                                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                    >
                                        {upgrading ? 'Starting...' : `Start ${premiumPlan.trial}`}
                                    </Button>
                                    <Button
                                        onClick={handleUpgrade}
                                        disabled={upgrading}
                                        variant="secondary"
                                        className="w-full"
                                    >
                                        {upgrading ? 'Processing...' : 'Upgrade Now'}
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                </div>

                {/* Current Usage */}
                {subscription && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-12 max-w-2xl mx-auto"
                    >
                        <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                            <h3 className="text-xl font-bold text-white mb-4">Your Current Usage</h3>

                            <div className="space-y-4">
                                {/* Downloads */}
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-300 flex items-center gap-2">
                                            <Download className="w-4 h-4" />
                                            Downloads
                                        </span>
                                        <span className="text-white font-medium">
                                            {subscription.usage.downloads.count} / {subscription.usage.downloads.limit}
                                        </span>
                                    </div>
                                    {subscription.usage.downloads.limit !== 'unlimited' && (
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                                style={{ width: `${Math.min((subscription.usage.downloads.count / subscription.usage.downloads.limit) * 100, 100)}%` }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Uploads (for photographers) */}
                                {isPhotographer && subscription.usage.uploads && (
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-300 flex items-center gap-2">
                                                <Upload className="w-4 h-4" />
                                                Uploads
                                            </span>
                                            <span className="text-white font-medium">
                                                {subscription.usage.uploads.count} / {subscription.usage.uploads.limit}
                                            </span>
                                        </div>
                                        {subscription.usage.uploads.limit !== 'unlimited' && (
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${Math.min((subscription.usage.uploads.count / subscription.usage.uploads.limit) * 100, 100)}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* FAQ or Additional Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 text-center"
                >
                    <p className="text-gray-300 text-sm">
                        Payment integration coming soon! For now, upgrades are instant for testing.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Pricing;
