"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Blob({ phase, intensity }: { phase: number; intensity: number }) {
    const mesh = useRef<THREE.Mesh>(null);
    const material = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uIntensity: { value: 0.3 },
            uPhase: { value: 0 },
        }),
        []
    );

    useFrame((state) => {
        const { clock } = state;
        if (material.current) {
            material.current.uniforms.uTime.value = clock.getElapsedTime();
            material.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
                material.current.uniforms.uIntensity.value,
                0.3 + intensity * 2,
                0.05
            );
            material.current.uniforms.uPhase.value = phase;
        }
        if (mesh.current) {
            mesh.current.rotation.y = clock.getElapsedTime() * 0.2;
            mesh.current.rotation.z = clock.getElapsedTime() * 0.1;

            const s = 1 + intensity * 0.5;
            mesh.current.scale.set(s, s, s);
        }
    });

    const vertexShader = `
    varying vec2 vUv;
    varying float vDistortion;
    uniform float uTime;
    uniform float uIntensity;

    // Simplex 3D Noise 
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){ 
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 =   v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod(i, 289.0 ); 
      vec4 p = permute( permute( permute( 
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 1.0/7.0;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vUv = uv;
      vDistortion = snoise(normal + uTime * 0.5) * uIntensity;
      vec3 pos = position + normal * vDistortion;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

    const fragmentShader = `
    varying vec2 vUv;
    varying float vDistortion;
    uniform float uTime;
    uniform float uPhase;

    void main() {
      float distort = vDistortion * 2.0;
      vec3 color = mix(vec3(0.05), vec3(0.1), distort);
      
      // Add subtle golden glints
      float glint = pow(max(0.0, distort), 4.0) * 0.5;
      color += vec3(0.83, 0.68, 0.21) * glint;
      
      // Pulse effect on phase shift
      float pulse = sin(uTime * 2.0) * 0.02;
      color += pulse;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

    return (
        <mesh ref={mesh}>
            <sphereGeometry args={[2.5, 128, 128]} />
            <shaderMaterial
                ref={material}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    );
}

export default function LiquidOrb({ phase, intensity }: { phase: number; intensity: number }) {
    return (
        <div className="fixed inset-0 z-0 bg-[#050505]">
            <Canvas camera={{ position: [0, 0, 7] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#d4af37" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
                <Blob phase={phase} intensity={intensity} />
            </Canvas>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_80%)]" />
        </div>
    );
}
