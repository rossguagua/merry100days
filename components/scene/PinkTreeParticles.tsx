import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../hooks/useStore';
import { treeFrag, treeVert } from '../../shaders';

const PARTICLE_COUNT = 15000;
const TREE_HEIGHT = 10;
const MAX_RADIUS = 4;

const PinkTreeParticles: React.FC = () => {
  const meshRef = useRef<THREE.Points>(null);
  const treeBoostIntensity = useStore((state) => state.treeBoostIntensity);
  const triggerSurprise = useStore((state) => state.triggerSurprise);
  const isVideoPlaying = useStore((state) => state.isVideoPlaying);
  const showSurprise = useStore((state) => state.showSurprise);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBoostIntensity: { value: 0 },
  }), []);

  const { positions, colors, sizes, phases, heightFactors, isOuters } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);
    const heightFactors = new Float32Array(PARTICLE_COUNT);
    const isOuters = new Float32Array(PARTICLE_COUNT);

    const color = new THREE.Color();
    const warmPink = new THREE.Color('#FF6B90');
    const softPink = new THREE.Color('#FF9FB5');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const yNormalized = Math.random(); 
      const y = yNormalized * TREE_HEIGHT - TREE_HEIGHT / 2;
      
      const currentRadius = MAX_RADIUS * (1 - yNormalized);
      const r = Math.sqrt(Math.random()) * currentRadius; // Square root for even distribution
      const theta = Math.random() * Math.PI * 2;
      
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      color.lerpColors(warmPink, softPink, Math.random());
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 0.2 + 0.05;
      phases[i] = Math.random() * Math.PI * 2;
      
      const hFactor = 1.0 - yNormalized;
      heightFactors[i] = hFactor;
      isOuters[i] = r > (currentRadius * 0.7) ? 1.0 : 0.0;
    }
    return { positions, colors, sizes, phases, heightFactors, isOuters };
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = clock.getElapsedTime();
      material.uniforms.uBoostIntensity.value = THREE.MathUtils.lerp(
        material.uniforms.uBoostIntensity.value,
        treeBoostIntensity,
        0.1
      );
    }
  });

  return (
    <points 
      ref={meshRef} 
      onClick={(e) => {
        e.stopPropagation();
        // Prevent double triggering
        if (!isVideoPlaying && !showSurprise) {
          triggerSurprise();
        }
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aColor" count={PARTICLE_COUNT} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={PARTICLE_COUNT} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aPhase" count={PARTICLE_COUNT} array={phases} itemSize={1} />
        <bufferAttribute attach="attributes-aHeightFactor" count={PARTICLE_COUNT} array={heightFactors} itemSize={1} />
        <bufferAttribute attach="attributes-aIsOuter" count={PARTICLE_COUNT} array={isOuters} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={treeVert}
        fragmentShader={treeFrag}
        uniforms={uniforms}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent={true}
      />
    </points>
  );
};

export default PinkTreeParticles;