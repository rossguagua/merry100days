import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PointMaterial } from '@react-three/drei';

const SNOW_COUNT = 2000;
const RANGE = 30;

const SnowParticles: React.FC = () => {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(SNOW_COUNT * 3);
    for (let i = 0; i < SNOW_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * RANGE;
      pos[i * 3 + 1] = (Math.random() - 0.5) * RANGE;
      pos[i * 3 + 2] = (Math.random() - 0.5) * RANGE;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < SNOW_COUNT; i++) {
      let y = pos[i * 3 + 1];
      y -= delta * (0.5 + Math.random() * 1.5);
      if (y < -RANGE / 2) {
        y = RANGE / 2;
      }
      pos[i * 3 + 1] = y;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={SNOW_COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <PointMaterial 
        transparent 
        vertexColors={false} 
        color="#FFE8F0" 
        size={0.1} 
        sizeAttenuation={true} 
        depthWrite={false} 
        blending={THREE.AdditiveBlending} 
      />
    </points>
  );
};

export default SnowParticles;
