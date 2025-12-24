import React, { Suspense } from 'react';
import Scene from './components/Scene';
import WishInput from './components/ui/WishInput';
import MusicPlayer from './components/ui/MusicPlayer';
import VideoOverlay from './components/ui/VideoOverlay';

function App() {
  return (
    <div className="w-screen h-screen relative overflow-hidden bg-[#02020a]">
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      
      <VideoOverlay />
      
      <MusicPlayer />
      <WishInput />
      
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex justify-center items-baseline gap-3 text-[#FF9FB5] font-bold tracking-[0.15em] md:tracking-[0.2em] pointer-events-none font-['Cinzel',serif] drop-shadow-[0_0_10px_#DF0041] z-10 whitespace-nowrap">
        <span className="text-2xl md:text-3xl">MERRY</span>
        <span className="text-4xl md:text-5xl text-[#FFE8F0] drop-shadow-[0_0_12px_#FBC96B]">100</span>
        <span className="text-2xl md:text-3xl">DAYS</span>
      </div>
    </div>
  );
}

export default App;