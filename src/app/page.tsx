"use client";

import { useState, useCallback } from "react";
import HeroSection from "@/components/HeroSection";
import LaunchButton from "@/components/LaunchButton";
import CountdownSequence from "@/components/CountdownSequence";
import SimpleBackground from "@/components/SimpleBackground";
import { motion, AnimatePresence } from "framer-motion";

const REDIRECT_URL = "https://www.google.com";

export default function LaunchPage() {
  const [phase, setPhase] = useState<"landing" | "countdown" | "complete">("landing");

  const handleLaunch = useCallback(() => {
    setPhase("countdown");
  }, []);

  const handleCountdownComplete = useCallback(() => {
    setPhase("complete");
    setTimeout(() => {
      window.location.href = REDIRECT_URL;
    }, 1200);
  }, []);

  return (
    <main className="relative w-screen h-screen flex flex-col items-center justify-center bg-black">
      {/* Hyper-Chromatic Background */}
      <SimpleBackground />

      <AnimatePresence mode="wait">
        {phase === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center p-6"
          >
            <HeroSection visible={true} />
            <LaunchButton onLaunch={handleLaunch} disabled={false} />

            {/* Scroll/Down Indicator */}
            <div className="absolute bottom-12 flex flex-col items-center gap-2">
              <span className="text-[8px] font-black text-[#ffcc00] uppercase tracking-[0.5em]">
                Ready for sync
              </span>
              <div className="w-px h-12 bg-gradient-to-b from-[#ffcc00] to-transparent" />
            </div>
          </motion.div>
        )}

        {phase === "countdown" && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 2, filter: "brightness(2)" }}
            transition={{ duration: 0.5, ease: "circOut" }}
          >
            <CountdownSequence onComplete={handleCountdownComplete} />
          </motion.div>
        )}

        {phase === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-9xl font-black text-white tracking-widest text-glitch" data-text="BREACHED">
              BREACHED
            </h1>
            <p className="text-[#00f2ff] uppercase tracking-[1em] text-[10px] mt-8 font-black animate-pulse">
              Entering the Neural Web
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vignette focused on center */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
    </main>
  );
}
