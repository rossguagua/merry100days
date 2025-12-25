import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '../../hooks/useStore';
import { heartFrag, heartVert } from '../../shaders';

const HEART_PARTICLE_COUNT = 5000;

const HeartTopper: React.FC<{ position: [number, number, number] }> = ({ position: initialPos }) => {
  const meshRef = useRef<THREE.Points>(null);
  const { treeBoostIntensity, showSurprise, startVideo, isVideoPlaying } = useStore();
  
  // Animation state references
  const animState = useRef({ 
    spiralProgress: 0, 
    isAnimating: false,
    baseY: initialPos[1] 
  });
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBoostIntensity: { value: 0 },
    uExplosion: { value: 0 },
  }), []);

  const { positions, colors, sizes, phases, densities } = useMemo(() => {
    const positions = new Float32Array(HEART_PARTICLE_COUNT * 3);
    const colors = new Float32Array(HEART_PARTICLE_COUNT * 3);
    const sizes = new Float32Array(HEART_PARTICLE_COUNT);
    const phases = new Float32Array(HEART_PARTICLE_COUNT);
    const densities = new Float32Array(HEART_PARTICLE_COUNT);

    const mainPink = new THREE.Color('#FF1053');
    const lightPink = new THREE.Color('#FF80A0');
    const white = new THREE.Color('#FFFFFF');

    for (let i = 0; i < HEART_PARTICLE_COUNT; i++) {
      const t = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random());
      
      // Heart Equation
      let x = 16 * Math.pow(Math.sin(t), 3);
      let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      
      const scale = 0.08 * r;
      x *= scale;
      y *= scale;
      const z = (Math.random() - 0.5) * 1.5 * (1 - r);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y; // Centered locally
      positions[i * 3 + 2] = z;

      const rand = Math.random();
      if (rand > 0.8) {
        colors[i*3] = white.r; colors[i*3+1] = white.g; colors[i*3+2] = white.b;
      } else {
        const c = new THREE.Color().lerpColors(mainPink, lightPink, Math.random());
        colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
      }

      sizes[i] = Math.random() * 0.15 + 0.1;
      phases[i] = Math.random() * Math.PI * 2;
      densities[i] = 1.0 - r;
    }
    return { positions, colors, sizes, phases, densities };
  }, []);

  // Handle Surprise Animation Sequence
  useEffect(() => {
    if (showSurprise && meshRef.current) {
        const material = meshRef.current.material as THREE.ShaderMaterial;
        animState.current.isAnimating = true;

        const tl = gsap.timeline();

        // 1. Reset/Prepare
        material.uniforms.uExplosion.value = 0;
        
        // 2. Spiral Down Animation
        // We animate a progress value from 0 to 1, logic handled in useFrame
        tl.to(animState.current, {
            spiralProgress: 1,
            duration: 2.5,
            ease: "power1.inOut",
        });

        // 3. Move to Center/Front for explosion
        // (Handled by the end of the spiral path in useFrame)

        // 4. Boost intensity before explosion
        tl.to(material.uniforms.uBoostIntensity, { value: 5.0, duration: 0.5, ease: "power2.in" });

        // 5. Explode
        tl.to(material.uniforms.uExplosion, {
            value: 1.0,
            duration: 0.8,
            ease: "expo.out",
            onStart: () => {
                // Trigger video when explosion is underway
                setTimeout(() => startVideo(), 150);
            }
        });
    } else if (!showSurprise && !isVideoPlaying && meshRef.current) {
        // Reset if we are back to normal state (not playing video, not surprised)
        const material = meshRef.current.material as THREE.ShaderMaterial;
        animState.current.isAnimating = false;
        animState.current.spiralProgress = 0;
        material.uniforms.uExplosion.value = 0;
        meshRef.current.position.set(initialPos[0], initialPos[1], initialPos[2]);
        meshRef.current.scale.set(1, 1, 1);
        material.opacity = 1;
    }
  }, [showSurprise, initialPos, startVideo, isVideoPlaying]);

  // Hide heart when video is playing (it exploded)
  useEffect(() => {
     if (meshRef.current) {
         const material = meshRef.current.material as THREE.ShaderMaterial;
         if (isVideoPlaying) {
             gsap.to(material, { opacity: 0, duration: 0.5 });
         } else {
             gsap.to(material, { opacity: 1, duration: 0.5 });
         }
     }
  }, [isVideoPlaying]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = clock.getElapsedTime();

      // Normal behavior: Pulse with music/boost
      if (!animState.current.isAnimating) {
          material.uniforms.uBoostIntensity.value = THREE.MathUtils.lerp(
            material.uniforms.uBoostIntensity.value,
            treeBoostIntensity,
            0.1
          );
          // Gentle floating
          meshRef.current.position.y = animState.current.baseY + Math.sin(clock.getElapsedTime()) * 0.1;
      } 
      // Animation behavior: Spiral path
      else {
          const t = animState.current.spiralProgress;
          
          // Spiral parameters
          // Y: 5.2 -> 0.5 (Base of tree/Center screen)
          const currentY = THREE.MathUtils.lerp(5.2, 0.0, t);
          
          // Radius: 0 (at top) -> 3.5 (at bottom) -> 0 (at end for explosion center?)
          // Let's make it spiral out around the tree
          const maxRadius = 4.0;
          let currentRadius = t * maxRadius;
          
          // Pull into center at the very end for the explosion
          if (t > 0.9) {
             const closingT = (t - 0.9) * 10.0; // 0 to 1
             currentRadius = THREE.MathUtils.lerp(maxRadius, 0.0, closingT);
          }

          // Angle: 2 Loops (4PI)
          const angle = t * Math.PI * 4;
          
          const x = Math.cos(angle) * currentRadius;
          const z = Math.sin(angle) * currentRadius;
          
          // Add a forward offset at the end so it explodes in front of the tree?
          // Or just center (0,0,0) looks best for "video from inside"
          
          meshRef.current.position.set(x, currentY, z);
          
          // Scale up slightly as it descends to be more dramatic
          const scale = 1.0 + t * 0.5;
          meshRef.current.scale.set(scale, scale, scale);
      }
    }
  });

  return (
    <points ref={meshRef} position={initialPos}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={HEART_PARTICLE_COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aColor" count={HEART_PARTICLE_COUNT} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={HEART_PARTICLE_COUNT} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aPhase" count={HEART_PARTICLE_COUNT} array={phases} itemSize={1} />
        <bufferAttribute attach="attributes-aDensity" count={HEART_PARTICLE_COUNT} array={densities} itemSize={1} />
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

export default HeartTopper;