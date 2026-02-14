import { motion } from "framer-motion";
import { cn } from "./Button"; // Reusing cn utility

const Card = ({ children, className, hoverEffect = false, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hoverEffect ? { y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" } : {}}
            className={cn(
                "glass-card rounded-xl p-6 relative overflow-hidden",
                className
            )}
            {...props}
        >
            {/* Optional gradient glow effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20" />
            {children}
        </motion.div>
    );
};

export default Card;
