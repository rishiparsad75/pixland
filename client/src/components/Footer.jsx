import { motion } from "framer-motion";
import { Heart, Github, Linkedin, Mail } from "lucide-react";

const Footer = ({ variant = "dark" }) => {
    const isDark = variant === "dark";

    return (
        <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-center py-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
            <div className="flex flex-col items-center gap-3">
                {/* Built by text with animation */}
                <motion.div
                    className="flex items-center gap-2 text-sm"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Built with</span>
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 3
                        }}
                    >
                        <Heart size={14} className="text-red-500 fill-red-500" />
                    </motion.div>
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>by</span>
                    <motion.span
                        className="font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                        animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            backgroundSize: '200% 200%'
                        }}
                    >
                        Rishi Parsad
                    </motion.span>
                </motion.div>

                {/* Social Links */}
                <div className="flex items-center gap-4">
                    <motion.a
                        href="https://github.com/rishiparsad75"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${isDark ? 'text-gray-600 hover:text-indigo-400' : 'text-gray-400 hover:text-indigo-600'} transition-colors`}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Github size={16} />
                    </motion.a>
                    <motion.a
                        href="https://linkedin.com/in/rishiparsad"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${isDark ? 'text-gray-600 hover:text-indigo-400' : 'text-gray-400 hover:text-indigo-600'} transition-colors`}
                        whileHover={{ scale: 1.2, rotate: -5 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Linkedin size={16} />
                    </motion.a>
                    <motion.a
                        href="mailto:rishi.parsad@example.com"
                        className={`${isDark ? 'text-gray-600 hover:text-indigo-400' : 'text-gray-400 hover:text-indigo-600'} transition-colors`}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Mail size={16} />
                    </motion.a>
                </div>

                {/* Copyright */}
                <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    © 2026 PixLand. All rights reserved.
                </p>
            </div>
        </motion.footer>
    );
};

export default Footer;
