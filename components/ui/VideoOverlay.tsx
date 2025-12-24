import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../../hooks/useStore';

const VideoOverlay: React.FC = () => {
  const { isVideoPlaying, endVideo } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  // Add timestamp to ensure browser fetches fresh file
  const [videoUrl] = useState(() => `/video.mp4?v=${Date.now()}`);

  useEffect(() => {
    if (isVideoPlaying && videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
            console.error("Video play error:", e);
        });
      }
    }
  }, [isVideoPlaying]);

  if (!isVideoPlaying) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black flex items-center justify-center animate-fadeIn">
      <video 
        ref={videoRef}
        src={videoUrl} 
        className="w-full h-full object-contain"
        controls={false}
        autoPlay
        playsInline
        onEnded={endVideo}
        onClick={endVideo}
        onError={(e) => {
            console.error("Video playback error:", e.currentTarget.error);
            // If video fails, close overlay immediately so user isn't stuck
            endVideo();
            alert("Video failed to load. Please check if video.mp4 exists in the public folder.");
        }}
      />
      <button 
        onClick={endVideo}
        className="absolute top-8 right-8 text-white/50 hover:text-white border border-white/30 rounded-full px-4 py-1 text-sm bg-black/20 backdrop-blur-md transition-all z-50"
      >
        Close
      </button>
    </div>
  );
};

export default VideoOverlay;
