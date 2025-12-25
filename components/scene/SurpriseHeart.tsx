import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../hooks/useStore';
import { heartFrag, heartVert } from '../../shaders';
import gsap from 'gsap';

const PARTICLE_COUNT = 6000;

const SurpriseHeart: React.FC = () => {
  const { showSurprise, startVideo } = useStore();
  const meshRef = useRef<THREE.Points>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBoostIntensity: { value: 0 },
    uExplosion: { value: 0 },
  }), []);

  // Use a heart geometry
  const { positions, colors, sizes, phases, densities } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);
    const densities = new Float32Array(PARTICLE_COUNT);

    const mainPink = new THREE.Color('#FF1053');
    const lightPink = new THREE.Color('#FF80A0');
    const white = new THREE.Color('#FFFFFF');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random());
      
      // Heart Equation
      let x = 16 * Math.pow(Math.sin(t), 3);
      let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      
      // Make it smaller (0.12 scale)
      const scale = 0.12 * r; 
      x *= scale;
      y *= scale;
      
      // Thickness
      const z = (Math.random() - 0.5) * 2.0 * (1 - r);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y + 3; // Move up to center it visually above tree
      positions[i * 3 + 2] = z;

      // Color Gradient
      const rand = Math.random();
      if (rand > 0.8) {
        colors[i*3] = white.r; colors[i*3+1] = white.g; colors[i*3+2] = white.b;
      } else {
        const c = new THREE.Color().lerpColors(mainPink, lightPink, Math.random());
        colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
      }

      sizes[i] = Math.random() * 0.3 + 0.1;
      phases[i] = Math.random() * Math.PI * 2;
      densities[i] = 1.0 - r;
    }
    return { positions, colors, sizes, phases, densities };
  }, []);

  useEffect(() => {
    if (showSurprise && meshRef.current) {
       const material = meshRef.current.material as THREE.ShaderMaterial;
       
       // Reset state
       material.uniforms.uExplosion.value = 0;
       material.uniforms.uBoostIntensity.value = 2.0;
       material.opacity = 0;
       material.transparent = true;
       
       // Animation Sequence
       const tl = gsap.timeline();

       // 1. Fade In
       tl.to(material, { opacity: 1, duration: 1.0, ease: "power2.out" });
       
       // 2. Wait a beat (heartbeat handled by shader)
       tl.to({}, { duration: 1.5 });
       
       // 3. Flash before explosion
       tl.to(material.uniforms.uBoostIntensity, { value: 8.0, duration: 0.5, ease: "power2.in" });
       
       // 4. Explosion!
       tl.to(material.uniforms.uExplosion, { 
         value: 1.0, 
         duration: 0.8, 
         ease: "expo.out",
         onStart: () => {
             // Trigger video slightly after explosion starts so it emerges from the particles
             setTimeout(() => startVideo(), 150);
         }
       });
    }
  }, [showSurprise, startVideo]);

  useFrame(({ clock }) => {
    if (meshRef.current && showSurprise) {
       const material = meshRef.current.material as THREE.ShaderMaterial;
       material.uniforms.uTime.value = clock.getElapsedTime();
       // Slow rotation
       meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  if (!showSurprise) return null;

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aColor" count={PARTICLE_COUNT} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={PARTICLE_COUNT} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aPhase" count={PARTICLE_COUNT} array={phases} itemSize={1} />
        <bufferAttribute attach="attributes-aDensity" count={PARTICLE_COUNT} array={densities} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={heartVert}
        fragmentShader={heartFrag}
        uniforms={uniforms}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent={true}
      />
    </points>
  );
};

export default SurpriseHeart;