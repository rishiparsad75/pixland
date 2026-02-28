import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Button = ({
    children,
    variant = "primary",
    size = "md",
    className,
    isLoading,
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#2B2E33] disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        // Platinum Mist primary — charcoal on light silver
        primary: "bg-[#F5F6F7] hover:bg-[#C1C4C8] text-[#2B2E33] shadow-lg shadow-black/20 focus:ring-[#C1C4C8]",
        // Subtle secondary — glassy charcoal
        secondary: "bg-[#2B2E33]/80 hover:bg-[#3A3D42] text-[#F5F6F7] border border-[#C1C4C8]/20 focus:ring-[#7B7F85]",
        // Outline — bordered, transparent fill
        outline: "border border-[#C1C4C8]/30 hover:bg-[#C1C4C8]/10 text-[#C1C4C8] hover:text-[#F5F6F7] focus:ring-[#7B7F85]",
        // Ghost — no border, minimal
        ghost: "hover:bg-[#C1C4C8]/10 text-[#7B7F85] hover:text-[#F5F6F7] focus:ring-[#7B7F85]",
        // Danger — deep red
        danger: "bg-red-700/80 hover:bg-red-600 text-white focus:ring-red-500",
        // Platinum shimmer — accent variant
        platinum: "bg-gradient-to-r from-[#7B7F85] to-[#C1C4C8] hover:from-[#C1C4C8] hover:to-[#F5F6F7] text-[#2B2E33] font-bold shadow-md focus:ring-[#C1C4C8]",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm gap-1.5",
        md: "px-5 py-2.5 text-base gap-2",
        lg: "px-8 py-3.5 text-lg gap-2.5",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </motion.button>
    );
};

export default Button;
