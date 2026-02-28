import { motion } from "framer-motion";
import { Heart, Github, Linkedin, Mail } from "lucide-react";

const Footer = ({ variant = "dark" }) => {

    return (
        <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-8 border-t border-[#C1C4C8]/10 mt-auto"
        >
            <div className="flex flex-col items-center gap-4">
                {/* Brand */}
                <motion.div
                    className="flex items-center gap-2 text-sm"
                    whileHover={{ scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <span className="text-[#7B7F85]">Built with</span>
                    <motion.div
                        animate={{ scale: [1, 1.25, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 4 }}
                    >
                        <Heart size={13} className="text-red-400 fill-red-400" />
                    </motion.div>
                    <span className="text-[#7B7F85]">by</span>
                    <span className="font-bold shimmer-text">Rishi Parsad</span>
                </motion.div>

                {/* Social Links */}
                <div className="flex items-center gap-5">
                    {[
                        { href: "https://github.com/rishiparsad75", icon: Github },
                        { href: "https://linkedin.com/in/rishiparsad", icon: Linkedin },
                        { href: "mailto:rishi.parsad@example.com", icon: Mail },
                    ].map(({ href, icon: Icon }) => (
                        <motion.a
                            key={href}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#7B7F85] hover:text-[#C1C4C8] transition-colors"
                            whileHover={{ scale: 1.25, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Icon size={15} />
                        </motion.a>
                    ))}
                </div>

                <p className="text-[11px] text-[#7B7F85]/60">
                    © 2026 PixLand.ai by Rishi Parsad. All rights reserved.
                </p>
            </div>
        </motion.footer>
    );
};

export default Footer;
