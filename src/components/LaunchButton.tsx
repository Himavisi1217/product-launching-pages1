"use client";

import { motion } from "framer-motion";

export default function LaunchButton({ onLaunch, disabled }: { onLaunch: () => void; disabled: boolean }) {
    return (
        <div className="relative group">
            {/* Outer spinning rings */}
            <div className="absolute inset-x-[-40px] inset-y-[-40px] pointer-events-none">
                <div className="energy-ring inset-0 opacity-10" />
                <div className="energy-ring inset-4 rotation-reverse opacity-20" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            </div>

            <motion.button
                whileHover={{ scale: 1.1, skew: "-5deg" }}
                whileTap={{ scale: 0.9 }}
                onClick={onLaunch}
                disabled={disabled}
                className="btn-cyber w-32 h-32 rounded-lg flex items-center justify-center group"
            >
                {/* Button Inner Glitch */}
                <div className="absolute inset-0 bg-[#00f2ff]/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-black rounded-sm flex items-center justify-center group-hover:border-white transition-colors">
                        <div className="w-4 h-4 bg-black group-hover:bg-white animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black text-black group-hover:text-white uppercase tracking-tighter">
                        INITIATE
                    </span>
                </div>

                {/* Corner Decorations */}
                <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-black" />
                <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-black" />
            </motion.button>

            {/* Pulsing rings on hover */}
            <div className="absolute inset-0 pointer-events-none group-hover:block hidden">
                <div className="magnetic-pulse inset-[-20px]" />
                <div className="magnetic-pulse inset-[-40px]" style={{ animationDelay: '0.5s' }} />
            </div>
        </div>
    );
}
