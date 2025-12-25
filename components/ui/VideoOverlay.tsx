import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../../hooks/useStore';

const VideoOverlay: React.FC = () => {
  const { isVideoPlaying, endVideo } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Use relative path without leading slash for better compatibility
  const videoPath = "video.mp4";

  useEffect(() => {
    if (isVideoPlaying && videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
            console.warn("Video play interrupted or failed:", e);
        });
      }
    }
  }, [isVideoPlaying]);

  if (!isVideoPlaying) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
        {/* Backdrop - fades in */}
        <div className="absolute inset-0 bg-black animate-[fadeIn_1s_ease-out_forwards]" />
        
        {/* Video Container - Zooms in from center */}
        <div className="relative w-full h-full flex items-center justify-center animate-[zoomIn_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]">
            <video 
                ref={videoRef}
                src={videoPath} 
                className="max-w-full max-h-full object-contain shadow-2xl drop-shadow-[0_0_50px_rgba(255,107,144,0.5)]"
                controls={false}
                autoPlay
                playsInline
                onEnded={endVideo}
                onClick={endVideo}
                onError={(e) => {
                    const err = e.currentTarget.error;
                    console.error("Video Error Details:", err);
                    let msg = "Video playback error.";
                    if (err) {
                        if (err.code === 1) msg = "Aborted by user.";
                        if (err.code === 2) msg = "Network error while downloading.";
                        if (err.code === 3) msg = "Decode error (corrupted file?).";
                        if (err.code === 4) msg = `File not found or format not supported (SRC: ${videoPath})`;
                    }
                    alert(`${msg}\nEnsure 'video.mp4' is in the public folder.`);
                    endVideo();
                }}
            />
            
            <button 
                onClick={endVideo}
                className="absolute top-8 right-8 text-white/50 hover:text-white border border-white/30 rounded-full px-4 py-1 text-sm bg-black/20 backdrop-blur-md transition-all z-50 hover:bg-black/50"
            >
                Close
            </button>
        </div>

        <style>{`
            @keyframes zoomIn {
                0% { transform: scale(0); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes fadeIn {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }
        `}</style>
    </div>
  );
};

export default VideoOverlay;