"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function EnergyVortex() {
    const pointsRef = useRef<THREE.Points>(null);

    const [positions, colors] = useMemo(() => {
        const count = 5000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const r = 2 + Math.random() * 8;
            const z = (Math.random() - 0.5) * 10;

            positions[i * 3] = r * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(theta);
            positions[i * 3 + 2] = z;

            // Cyber Colors: Magenta to Cyan
            const mix = Math.random();
            colors[i * 3] = mix > 0.5 ? 1 : 0; // R
            colors[i * 3 + 1] = mix < 0.5 ? 0.95 : 0; // G
            colors[i * 3 + 2] = 1; // B
        }
        return [positions, colors];
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.z += 0.005;
            pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={colors.length / 3}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                vertexColors
                transparent
                opacity={0.6}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

export default function SimpleBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-black">
            <div className="absolute inset-0 cyber-grid opacity-20" />
            <div className="cyber-scanline" />

            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <EnergyVortex />
                <ambientLight intensity={0.5} />
            </Canvas>

            {/* Glitch overlays */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[-5%] w-[110%] h-px bg-magenta-500/20 blur-sm animate-pulse" />
                <div className="absolute bottom-[20%] left-[-5%] w-[110%] h-px bg-cyan-500/20 blur-sm animate-pulse" />
            </div>
        </div>
    );
}
