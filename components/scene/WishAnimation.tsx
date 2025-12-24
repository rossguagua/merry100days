import React, { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PointMaterial } from '@react-three/drei';
import gsap from 'gsap';
import { useStore } from '../../hooks/useStore';

// Simple cubic bezier interpolation function since we aren't loading MotionPathPlugin
function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number) {
  return Math.pow(1 - t, 3) * p0 + 
         3 * Math.pow(1 - t, 2) * t * p1 + 
         3 * (1 - t) * Math.pow(t, 2) * p2 + 
         Math.pow(t, 3) * p3;
}

const WISH_PARTICLE_COUNT = 150;

const WishAnimation: React.FC<{ targetPosition: THREE.Vector3 }> = ({ targetPosition }) => {
  const { isWishing, endWish, setTreeBoost } = useStore();
  const particlesRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(WISH_PARTICLE_COUNT * 3);
    const cols = new Float32Array(WISH_PARTICLE_COUNT * 3);
    const color = new THREE.Color();
    const warmPink = new THREE.Color('#FF6B90');
    const white = new THREE.Color('#FFFFFF');

    for (let i = 0; i < WISH_PARTICLE_COUNT; i++) {
      const r = Math.random() * 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
      
      color.lerpColors(warmPink, white, r * 2);
      cols[i*3] = color.r; cols[i*3+1] = color.g; cols[i*3+2] = color.b;
    }
    return [pos, cols];
  }, []);

  useEffect(() => {
    if (isWishing && groupRef.current && particlesRef.current) {
      // Reset position to bottom start
      const startPos = new THREE.Vector3(0, -6, 5);
      groupRef.current.position.copy(startPos);
      groupRef.current.scale.set(1, 1, 1);
      
      const material = particlesRef.current.material as THREE.PointsMaterial;
      material.opacity = 1;

      // Define control points for a curve
      const p0 = startPos;
      const p1 = new THREE.Vector3(2, 0, 2);
      const p2 = new THREE.Vector3(-1, 3, 1);
      const p3 = targetPosition;

      const animObj = { t: 0 };

      const tl = gsap.timeline({
        onUpdate: () => {
           if(groupRef.current) {
              const t = animObj.t;
              groupRef.current.position.x = cubicBezier(t, p0.x, p1.x, p2.x, p3.x);
              groupRef.current.position.y = cubicBezier(t, p0.y, p1.y, p2.y, p3.y);
              groupRef.current.position.z = cubicBezier(t, p0.z, p1.z, p2.z, p3.z);
           }
        },
        onComplete: () => {
          triggerBurst();
        }
      });

      tl.to(animObj, {
        t: 1,
        duration: 2.5,
        ease: "power3.inOut"
      });
      
      // Shrink slightly during flight
      tl.to(groupRef.current.scale, { duration: 2.5, x: 0.5, y: 0.5, z: 0.5 }, "<");
    }
  }, [isWishing, targetPosition, setTreeBoost]);

  const triggerBurst = () => {
    if (!particlesRef.current || !groupRef.current) return;
    
    // 1. Boost Tree
    setTreeBoost(1.0);
    setTimeout(() => setTreeBoost(0), 1000);

    const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const material = particlesRef.current.material as THREE.PointsMaterial;

    // 2. Fade out
    gsap.to(material, { duration: 1, opacity: 0, ease: "power2.out" });

    const explosionTL = gsap.timeline({
      onComplete: () => {
        endWish();
        if(groupRef.current) groupRef.current.position.set(0, -100, 0); // Hide
      }
    });

    // 3. Explode particles outward
    for(let i=0; i < WISH_PARTICLE_COUNT; i++) {
      const x = posArray[i*3];
      const y = posArray[i*3+1];
      const z = posArray[i*3+2];
      
      const dir = new THREE.Vector3(x, y, z).normalize().multiplyScalar(Math.random() * 5 + 2);
      
      explosionTL.to(posArray, {
        [i*3]: x + dir.x,
        [i*3+1]: y + dir.y,
        [i*3+2]: z + dir.z,
        duration: 1,
        ease: "power2.out"
      }, 0);
    }
  };

  useFrame(() => {
    if (particlesRef.current && isWishing) {
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      if(groupRef.current) groupRef.current.rotation.y += 0.1;
    }
  });

  if (!isWishing) return null;

  return (
    <group ref={groupRef}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={WISH_PARTICLE_COUNT} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={WISH_PARTICLE_COUNT} array={colors} itemSize={3} />
        </bufferGeometry>
        <PointMaterial vertexColors size={0.2} blending={THREE.AdditiveBlending} transparent depthWrite={false} />
      </points>
    </group>
  );
};

export default WishAnimation;
