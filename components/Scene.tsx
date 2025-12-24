import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import PinkTreeParticles from './scene/PinkTreeParticles';
import SnowParticles from './scene/SnowParticles';
import BaseRings from './scene/BaseRings';
import HeartTopper from './scene/HeartTopper';
import WishAnimation from './scene/WishAnimation';
import SurpriseHeart from './scene/SurpriseHeart';

const TOPPER_POSITION = new THREE.Vector3(0, 5.2, 0);

const SceneContent: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <PinkTreeParticles />
      <HeartTopper position={TOPPER_POSITION.toArray() as [number, number, number]} />
      <BaseRings />
    </group>
  );
};

const Scene: React.FC = () => {
  return (
    <Canvas 
      gl={{ antialias: false, alpha: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }} 
      style={{ background: '#02020a' }}
      dpr={[1, 2]}
    >
      <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />
      <OrbitControls 
        makeDefault 
        autoRotate 
        autoRotateSpeed={0.5} 
        enableZoom={true} 
        maxPolarAngle={Math.PI / 1.8} 
        minPolarAngle={Math.PI / 4}
        maxDistance={25}
        minDistance={5}
      />
      
      <color attach="background" args={['#02020a']} />
      <fog attach="fog" args={['#02020a', 8, 30]} />
      <ambientLight intensity={0.2} />
      
      <SceneContent />
      <SnowParticles />
      {/* WishAnimation is outside rotating group to have independent flight path logic relative to world */}
      <WishAnimation targetPosition={TOPPER_POSITION} />
      
      <SurpriseHeart />

      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom 
          luminanceThreshold={0.2} 
          luminanceSmoothing={0.9} 
          intensity={1.5} 
          radius={0.8} 
          mipmapBlur 
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};

export default Scene;