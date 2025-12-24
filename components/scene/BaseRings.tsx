import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Ring: React.FC<{ radius: number; speed: number; count: number; color: string }> = ({ radius, speed, count, color }) => {
  const ref = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = -5; // Base level
      pos[i * 3 + 2] = Math.sin(theta) * radius;
    }
    return pos;
  }, [radius, count]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * speed;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.15} transparent opacity={0.6} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  );
};

const BaseRings: React.FC = () => {
  return (
    <group>
      <Ring radius={4.5} speed={0.1} count={200} color="#FBC96B" />
      <Ring radius={5.5} speed={-0.08} count={250} color="#FF9FB5" />
      <Ring radius={6.5} speed={0.05} count={300} color="#FBC96B" />
    </group>
  );
};

export default BaseRings;
