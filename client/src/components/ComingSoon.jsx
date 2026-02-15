import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles } from 'lucide-react';
import Card from './ui/Card';

const ComingSoon = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        // Set launch date to 10 days from now
        const launchDate = new Date();
        launchDate.setDate(launchDate.getDate() + 10);

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = launchDate.getTime() - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl w-full"
            >
                <Card className="p-8 md:p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
                    {/* Icon */}
                    <motion.div
                        animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-6"
                    >
                        <Sparkles className="w-10 h-10 text-white" />
                    </motion.div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Face Recognition
                    </h1>
                    <p className="text-xl md:text-2xl text-purple-200 mb-8">
                        Coming Soon!
                    </p>

                    {/* Description */}
                    <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                        We're upgrading our AI-powered face recognition system to bring you even more accurate photo matching.
                        This feature will be available very soon!
                    </p>

                    {/* Countdown Timer */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-2 text-purple-300 mb-4">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm font-medium">Launching in</span>
                        </div>

                        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                            {[
                                { label: 'Days', value: timeLeft.days },
                                { label: 'Hours', value: timeLeft.hours },
                                { label: 'Minutes', value: timeLeft.minutes },
                                { label: 'Seconds', value: timeLeft.seconds }
                            ].map((item, index) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                                >
                                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                                        {String(item.value).padStart(2, '0')}
                                    </div>
                                    <div className="text-xs md:text-sm text-purple-200 uppercase tracking-wide">
                                        {item.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 max-w-lg mx-auto">
                        <p className="text-sm text-blue-100">
                            <strong>What's happening?</strong> We're waiting for Microsoft Azure approval to enable advanced face recognition features.
                            Once approved, you'll be able to find your photos instantly by uploading a selfie!
                        </p>
                    </div>

                    {/* Back Button */}
                    <motion.a
                        href="/"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-block mt-8 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    >
                        Back to Home
                    </motion.a>
                </Card>
            </motion.div>
        </div>
    );
};

export default ComingSoon;
