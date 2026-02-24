"use client";

import { motion } from "framer-motion";

export default function HeroSection({ visible }: { visible: boolean }) {
    if (!visible) return null;

    return (
        <div className="relative flex flex-col items-center justify-center text-center px-4 overflow-visible">
            {/* Decorative background text */}
            <div className="absolute -top-24 opacity-5 select-none pointer-events-none">
                <h2 className="text-[20vw] font-black tracking-tighter text-white whitespace-nowrap">
                    SYSTEM_BREACH
                </h2>
            </div>

            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "backOut" }}
                className="mb-8"
            >
                <div className="inline-block bg-[#ff0055] text-black text-[10px] font-black px-4 py-1 skew-x-[-20deg]">
                    PROTOCOL // ALPHA_01
                </div>
            </motion.div>

            <h1
                className="text-6xl md:text-9xl font-black mb-6 leading-none tracking-tighter text-glitch"
                data-text="CYBER_FUSION"
            >
                CYBER_FUSION
            </h1>

            <div className="flex flex-col md:flex-row gap-4 items-center mb-12">
                <div className="h-px w-12 bg-[#00f2ff]" />
                <p className="text-sm md:text-base font-mono text-[#00f2ff] tracking-[0.3em] uppercase">
                    Transcending the Digital Horizon
                </p>
                <div className="h-px w-12 bg-[#00f2ff]" />
            </div>

            <div className="grid grid-cols-2 gap-8 max-w-lg mb-12">
                <div className="text-left border-l-2 border-[#ffcc00] pl-4">
                    <span className="block text-[8px] font-black text-[#ffcc00] uppercase mb-1">Status</span>
                    <span className="text-xs text-white/60 font-mono">NEURAL_SYNC_SUCCESSFUL</span>
                </div>
                <div className="text-left border-l-2 border-[#ffcc00] pl-4">
                    <span className="block text-[8px] font-black text-[#ffcc00] uppercase mb-1">Latency</span>
                    <span className="text-xs text-white/60 font-mono">0.002MS_ACTIVE</span>
                </div>
            </div>
        </div>
    );
}
