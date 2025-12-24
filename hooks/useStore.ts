import { create } from 'zustand';
import { AppState } from '../types';

export const useStore = create<AppState>((set) => ({
  isWishing: false,
  treeBoostIntensity: 0,
  showSurprise: false,
  isVideoPlaying: false,
  startWish: (wish) => {
    console.log(`Wishing for: ${wish}`);
    set({ isWishing: true });
  },
  endWish: () => set({ isWishing: false }),
  setTreeBoost: (intensity) => set({ treeBoostIntensity: intensity }),
  triggerSurprise: () => set({ showSurprise: true }),
  startVideo: () => set({ isVideoPlaying: true, showSurprise: false }),
  endVideo: () => set({ isVideoPlaying: false }),
}));