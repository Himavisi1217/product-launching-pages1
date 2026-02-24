"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";

export default function FloatingHUD() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [metrics, setMetrics] = useState({
        cpu: 0,
        memory: 0,
        network: 0,
        nodes: 0,
        latency: 0,
        coordN: "0.0000",
        coordE: "0.0000",
    });

    // Animate fake metrics — client-only to avoid hydration mismatch
    useEffect(() => {
        const update = () => {
            setMetrics({
                cpu: 45 + Math.random() * 35,
                memory: 60 + Math.random() * 25,
                network: 80 + Math.random() * 18,
                nodes: Math.floor(120 + Math.random() * 80),
                latency: Math.floor(12 + Math.random() * 8),
                coordN: (Math.random() * 90).toFixed(4),
                coordE: (Math.random() * 180).toFixed(4),
            });
        };
        update(); // initial client-side values
        const interval = setInterval(update, 1500);

        return () => clearInterval(interval);
    }, []);

    // Entrance animation
    useEffect(() => {
        if (!containerRef.current) return;

        const elements = containerRef.current.querySelectorAll(".hud-element");
        gsap.from(elements, {
            opacity: 0,
            y: 20,
            stagger: 0.1,
            duration: 0.8,
            ease: "power2.out",
            delay: 1,
        });
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none select-none"
            style={{ zIndex: 5 }}
        >
            {/* Top-left corner HUD */}
            <div className="absolute top-6 left-6 hud-element">
                <div className="flex items-center gap-2 text-[10px] text-white/20 font-mono tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 animate-pulse" />
                    SYS.ONLINE
                </div>
                <div className="text-[10px] text-white/10 font-mono mt-1">
                    v2.4.1-prod
                </div>
            </div>

            {/* Top-right metrics panel */}
            <div className="absolute top-6 right-6 hud-element">
                <div className="flex flex-col gap-2 items-end">
                    <MetricBar label="CPU" value={metrics.cpu} color="#7850ff" />
                    <MetricBar label="MEM" value={metrics.memory} color="#00c8ff" />
                    <MetricBar label="NET" value={metrics.network} color="#00ffaa" />
                </div>
            </div>

            {/* Bottom-left data */}
            <div className="absolute bottom-6 left-6 hud-element">
                <div className="flex flex-col gap-1">
                    <div className="text-[10px] text-white/15 font-mono">
                        ACTIVE NODES: {metrics.nodes}
                    </div>
                    <div className="text-[10px] text-white/10 font-mono">
                        LATENCY: {metrics.latency}ms
                    </div>
                    <div className="text-[10px] text-white/10 font-mono">
                        STATUS: NOMINAL
                    </div>
                </div>
            </div>

            {/* Bottom-right coordinates */}
            <div className="absolute bottom-6 right-6 hud-element">
                <div className="text-[10px] text-white/10 font-mono text-right">
                    <div>COORDINATES</div>
                    <div className="text-white/15">
                        {metrics.coordN}°N{" "}
                        {metrics.coordE}°E
                    </div>
                </div>
            </div>

            {/* Corner decorations */}
            <svg
                className="absolute top-0 left-0 w-20 h-20 text-white/5 hud-element"
                viewBox="0 0 80 80"
            >
                <path
                    d="M0 20 L0 0 L20 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                />
            </svg>
            <svg
                className="absolute top-0 right-0 w-20 h-20 text-white/5 hud-element"
                viewBox="0 0 80 80"
            >
                <path
                    d="M60 0 L80 0 L80 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                />
            </svg>
            <svg
                className="absolute bottom-0 left-0 w-20 h-20 text-white/5 hud-element"
                viewBox="0 0 80 80"
            >
                <path
                    d="M0 60 L0 80 L20 80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                />
            </svg>
            <svg
                className="absolute bottom-0 right-0 w-20 h-20 text-white/5 hud-element"
                viewBox="0 0 80 80"
            >
                <path
                    d="M60 80 L80 80 L80 60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                />
            </svg>
        </div>
    );
}

function MetricBar({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/20 font-mono w-6 text-right">
                {label}
            </span>
            <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${value}%`,
                        background: color,
                        boxShadow: `0 0 6px ${color}40`,
                    }}
                />
            </div>
            <span
                className="text-[10px] font-mono w-8 text-right"
                style={{ color: `${color}80` }}
            >
                {Math.round(value)}%
            </span>
        </div>
    );
}
