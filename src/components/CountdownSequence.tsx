"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CountdownSequence({ onComplete }: { onComplete: () => void }) {
    const [count, setCount] = useState(3);
    const [intensity, setIntensity] = useState(0);

    const runCountdown = useCallback(() => {
        if (count > 0) {
            setTimeout(() => {
                setCount(count - 1);
                setIntensity(prev => prev + 0.3);
            }, 2000);
        } else {
            onComplete();
        }
    }, [count, onComplete]);

    useEffect(() => {
        runCountdown();
    }, [runCountdown]);

    return (
        <div className="relative flex flex-col items-center justify-center">
            {/* Background intensity pulse */}
            <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="absolute w-96 h-96 bg-[#ff0055] rounded-full blur-[100px] -z-10"
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={count}
                    initial={{ opacity: 0, scale: 2, rotate: 10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    transition={{ duration: 0.3, type: "spring" }}
                    className="relative"
                >
                    <span className="text-[15rem] md:text-[25rem] font-black leading-none text-glitch" data-text={count === 0 ? "GO" : count}>
                        {count === 0 ? "GO" : count}
                    </span>

                    {/* Glitch subtext */}
                    <div className="absolute top-1/2 left-full -translate-y-1/2 ml-8 hidden md:block">
                        <div className="flex flex-col gap-2">
                            <div className="h-px w-24 bg-[#ffcc00]" />
                            <span className="text-[10px] font-mono text-[#ffcc00] uppercase tracking-[1em]">
                                {count === 3 && "PHASE_LOAD"}
                                {count === 2 && "SYNC_ACTIVE"}
                                {count === 1 && "CORE_BREACH"}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-12 flex flex-col items-center">
                <div className="text-[12px] font-black tracking-[0.5em] uppercase text-[#ff0055] animate-pulse">
                    Overclocking Systems
                </div>
                <div className="w-64 h-1 bg-white/10 mt-4 overflow-hidden">
                    <motion.div
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent"
                    />
                </div>
            </div>
        </div>
    );
}
