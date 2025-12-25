import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      bufferAttribute: any;
      bufferGeometry: any;
      color: any;
      fog: any;
      group: any;
      points: any;
      pointsMaterial: any;
      shaderMaterial: any;
      primitive: any;
      mesh: any;
    }
  }
}

export interface AppState {
  isWishing: boolean;
  treeBoostIntensity: number;
  showSurprise: boolean;
  isVideoPlaying: boolean;
  startWish: (wish: string) => void;
  endWish: () => void;
  setTreeBoost: (intensity: number) => void;
  triggerSurprise: () => void;
  startVideo: () => void;
  endVideo: () => void;
}

export interface ParticleProps {
  count?: number;
}