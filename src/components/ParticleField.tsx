"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 3000;

interface ParticleSystemProps {
    phase: number;
    intensity: number;
}

function ParticleSystem({ phase, intensity }: ParticleSystemProps) {
    const meshRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const { positions, velocities, colors, sizes, randoms } = useMemo(() => {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const velocities = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        const sizes = new Float32Array(PARTICLE_COUNT);
        const randoms = new Float32Array(PARTICLE_COUNT);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Sphere distribution
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 3 + Math.random() * 12;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            velocities[i * 3] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

            // Color palette: deep purple to cyan (dimmed)
            const colorChoice = Math.random();
            if (colorChoice < 0.3) {
                colors[i * 3] = 0.28;     // Purple (dimmed)
                colors[i * 3 + 1] = 0.18;
                colors[i * 3 + 2] = 0.6;
            } else if (colorChoice < 0.6) {
                colors[i * 3] = 0.0;      // Cyan (dimmed)
                colors[i * 3 + 1] = 0.5;
                colors[i * 3 + 2] = 0.6;
            } else if (colorChoice < 0.8) {
                colors[i * 3] = 0.5;      // Hot pink (dimmed)
                colors[i * 3 + 1] = 0.06;
                colors[i * 3 + 2] = 0.35;
            } else {
                colors[i * 3] = 0.6;      // White (dimmed)
                colors[i * 3 + 1] = 0.6;
                colors[i * 3 + 2] = 0.6;
            }

            sizes[i] = Math.random() * 2 + 0.3;
            randoms[i] = Math.random();
        }

        return { positions, velocities, colors, sizes, randoms };
    }, []);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uPhase: { value: 0 },
            uIntensity: { value: 0 },
            uPixelRatio: { value: typeof window !== "undefined" ? window.devicePixelRatio : 1 },
        }),
        []
    );

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = time;
            materialRef.current.uniforms.uPhase.value = phase;
            materialRef.current.uniforms.uIntensity.value = intensity;
        }

        if (meshRef.current) {
            const geo = meshRef.current.geometry;
            const posAttr = geo.attributes.position as THREE.BufferAttribute;
            const posArray = posAttr.array as Float32Array;

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const i3 = i * 3;

                if (phase >= 3) {
                    // Warp speed - stretch z
                    posArray[i3 + 2] -= 0.5 * intensity;
                    if (posArray[i3 + 2] < -20) {
                        posArray[i3 + 2] = 20;
                    }
                } else if (phase >= 1) {
                    // Orbital motion with phase-dependent speed
                    const speed = 0.001 + intensity * 0.005;
                    const angle = speed;
                    const x = posArray[i3];
                    const z = posArray[i3 + 2];
                    posArray[i3] = x * Math.cos(angle) - z * Math.sin(angle);
                    posArray[i3 + 2] = x * Math.sin(angle) + z * Math.cos(angle);

                    // Gentle bob
                    posArray[i3 + 1] += Math.sin(time * 2 + randoms[i] * 10) * 0.003;
                } else {
                    // Idle drift
                    posArray[i3] += velocities[i3] + Math.sin(time * 0.5 + randoms[i] * 6.28) * 0.002;
                    posArray[i3 + 1] += velocities[i3 + 1] + Math.cos(time * 0.3 + randoms[i] * 6.28) * 0.002;
                    posArray[i3 + 2] += velocities[i3 + 2] + Math.sin(time * 0.7 + randoms[i] * 6.28) * 0.002;

                    // Boundary wrap
                    for (let axis = 0; axis < 3; axis++) {
                        if (Math.abs(posArray[i3 + axis]) > 15) {
                            posArray[i3 + axis] *= -0.5;
                        }
                    }
                }
            }

            // Camera shake on warp
            if (phase === 3) {
                state.camera.position.x = (Math.random() - 0.5) * 0.1 * intensity;
                state.camera.position.y = (Math.random() - 0.5) * 0.1 * intensity;
            } else {
                state.camera.position.x = 0;
                state.camera.position.y = 0;
            }

            posAttr.needsUpdate = true;
        }
    });

    const vertexShader = `
    uniform float uTime;
    uniform float uPhase;
    uniform float uIntensity;
    uniform float uPixelRatio;

    attribute float aSize;
    attribute float aRandom;

    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vColor = color;
      
      vec3 pos = position;
      
      // Add shimmer
      float shimmer = sin(uTime * 3.0 + aRandom * 6.28) * 0.5 + 0.5;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      float sizeMultiplier = 1.0 + uIntensity * 0.5;
      gl_PointSize = aSize * sizeMultiplier * uPixelRatio * (200.0 / -mvPosition.z);
      gl_PointSize = max(gl_PointSize, 1.0);
      
      vAlpha = (0.2 + shimmer * 0.3) * (1.0 - smoothstep(8.0, 15.0, length(position)));
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

    const fragmentShader = `
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      // Soft circle
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      
      float alpha = smoothstep(0.5, 0.1, d) * vAlpha * 0.5;
      
      // Glow core
      float core = smoothstep(0.3, 0.0, d);
      vec3 finalColor = mix(vColor, vec3(1.0), core * 0.5);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                    count={PARTICLE_COUNT}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[colors, 3]}
                    count={PARTICLE_COUNT}
                    array={colors}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aSize"
                    args={[sizes, 1]}
                    count={PARTICLE_COUNT}
                    array={sizes}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-aRandom"
                    args={[randoms, 1]}
                    count={PARTICLE_COUNT}
                    array={randoms}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                vertexColors
            />
        </points>
    );
}

// Nebula cloud
function NebulaClouds() {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
        }),
        []
    );

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
        if (meshRef.current) {
            meshRef.current.rotation.z = state.clock.elapsedTime * 0.02;
        }
    });

    const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

    const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;

    // Simplex noise approximation
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vec2 uv = vUv - 0.5;
      float dist = length(uv);
      
      float n1 = snoise(vec3(uv * 2.0, uTime * 0.05)) * 0.5 + 0.5;
      float n2 = snoise(vec3(uv * 3.0 + 100.0, uTime * 0.08)) * 0.5 + 0.5;
      
      vec3 purple = vec3(0.22, 0.05, 0.45);
      vec3 blue = vec3(0.05, 0.12, 0.35);
      vec3 cyan = vec3(0.02, 0.3, 0.35);
      
      vec3 color = mix(purple, blue, n1);
      color = mix(color, cyan, n2 * 0.5);
      
      float alpha = smoothstep(0.8, 0.0, dist) * 0.06;
      alpha *= (n1 * 0.5 + n2 * 0.5);
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

    return (
        <mesh ref={meshRef} position={[0, 0, -5]}>
            <planeGeometry args={[30, 30]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

interface ParticleFieldProps {
    phase: number;
    intensity: number;
}

export default function ParticleField({ phase, intensity }: ParticleFieldProps) {
    return (
        <div className="fixed inset-0" style={{ zIndex: -1 }}>
            <Canvas
                camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 100 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]}
            >
                <NebulaClouds />
                <ParticleSystem phase={phase} intensity={intensity} />
                <ambientLight intensity={0.1} />
            </Canvas>
        </div>
    );
}
