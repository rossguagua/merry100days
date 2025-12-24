import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../hooks/useStore';
import { heartFrag, heartVert } from '../../shaders';

const HEART_PARTICLE_COUNT = 3000;

const HeartTopper: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Points>(null);
  const treeBoostIntensity = useStore((state) => state.treeBoostIntensity);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBoostIntensity: { value: 0 },
  }), []);

  const { positions, colors, sizes, phases, densities } = useMemo(() => {
    const positions = new Float32Array(HEART_PARTICLE_COUNT * 3);
    const colors = new Float32Array(HEART_PARTICLE_COUNT * 3);
    const sizes = new Float32Array(HEART_PARTICLE_COUNT);
    const phases = new Float32Array(HEART_PARTICLE_COUNT);
    const densities = new Float32Array(HEART_PARTICLE_COUNT);

    const mainPink = new THREE.Color('#DF0041');
    const softPink = new THREE.Color('#FF9FB5');
    const gold = new THREE.Color('#FBC96B');

    for (let i = 0; i < HEART_PARTICLE_COUNT; i++) {
      const t = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random());
      
      // Heart Equation
      let x = 16 * Math.pow(Math.sin(t), 3);
      let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      
      const scale = 0.08 * r;
      x *= scale;
      y *= scale;
      const z = (Math.random() - 0.5) * 0.5 * (1 - r);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const rand = Math.random();
      if (rand > 0.9) {
        colors[i*3] = gold.r; colors[i*3+1] = gold.g; colors[i*3+2] = gold.b;
      } else if (rand > 0.7) {
        colors[i*3] = softPink.r; colors[i*3+1] = softPink.g; colors[i*3+2] = softPink.b;
      } else {
        colors[i*3] = mainPink.r; colors[i*3+1] = mainPink.g; colors[i*3+2] = mainPink.b;
      }

      sizes[i] = Math.random() * 0.15 + 0.1;
      phases[i] = Math.random() * Math.PI * 2;
      densities[i] = 1.0 - r;
    }
    return { positions, colors, sizes, phases, densities };
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
    <points ref={meshRef} position={position}>
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
