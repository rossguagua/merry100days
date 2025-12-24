import React, { useRef, useState, useMemo, useEffect } from 'react';

// Lyrics data
const LYRICS_RAW = `
00:21
我写了这首歌
00:24
是一首简单的
00:27
不复杂也不难唱的
00:30
那一首歌
00:34
这并不是那种
00:37
只剩下那钢琴的歌
00:40
也不是那种
00:41
不能只是朋友的歌
00:44
这不是那种
00:45
两个人的
00:46
故事写在一本小说
00:49
那小说里有谁会在花田里犯了错
00:54
这就是一首写给你听的一个
00:58
Love Song
01:00
一直想写一首
01:03
Love Song
01:05
你给了我一首
01:08
Love Song
01:10
那 DJ 会播放
01:12
这也许会上榜
01:14
不过我只想
01:16
写出一首 Love Song
01:19
一直想写一首
01:21
Love Song
01:23
你给了我一首
01:26
Love Song
01:28
你就像那夏天的凉风
01:31
吹过我的面孔
01:33
情翔飞
01:34
在我心底
01:36
你就是我第一
01:40
想说爱你
01:43
我写了这首歌
01:46
是一首简单的
01:50
不复杂也不难唱的
01:52
那一首歌
01:56
这并不是那种
01:59
童话里会遇见的歌
02:02
也不是那种
02:04
真真切切爱我的歌
02:07
这不是那种
02:08
两个人的故事写在一本小说
02:11
那小说里有谁被它看流星在降落
02:16
这就是一首写给你听的一个
02:20
Love Song
02:22
一直想写一首
02:25
Love Song
02:27
你给了我一首
02:30
Love Song
02:32
那 DJ 会播放
02:34
这也许会上榜
02:36
不过我只想
02:38
写出一首 Love Song
02:41
一直想写一首
02:44
Love Song
02:46
你给了我一首
02:49
Love Song
02:51
你就像那夏天的凉风
02:53
吹过我的面孔
02:55
情翔飞
02:56
在我心底
02:58
你就是我第一
03:02
想说爱你
03:03
如果你是一幅画
03:06
你会是最珍贵的一幅画
03:09
如果那画家是梵高的话
03:12
有何贵人钱那有钱花
03:15
各个向你求嫁
03:17
梵高他说你们都回家
03:20
如果不准你是
03:22
Melody 就是最动听
03:23
所有的人都会跟着你齐唱
03:26
就算在夜晚
03:28
你的星太亮
03:29
让我忘了月亮代表我的
03:34
Love Song
03:37
一直想写一首
03:39
Love Song
03:41
你给了我一首
03:44
Love Song
03:46
那 DJ 会播放
03:48
这也许会上榜
03:50
不过我只想
03:52
写出一首 Love Song
03:55
一直想写一首
03:58
Love Song
04:00
你给了我一首
04:02
Love Song
04:04
你就像那夏天的凉风
04:07
吹过我的面孔
04:09
情翔飞
04:10
在我心底
04:12
你就是我第一
`;

interface LyricLine {
  time: number;
  text: string;
}

const parseLyrics = (raw: string): LyricLine[] => {
  const lines = raw.trim().split('\n').filter(l => l.trim() !== '');
  const parsed: LyricLine[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Match "MM:SS" format
    const match = line.match(/^(\d{2}):(\d{2})$/);
    if (match) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const time = min * 60 + sec;
        
        // Next line is the text
        if (i + 1 < lines.length) {
            const text = lines[i+1].trim();
            // Verify next line is not another timestamp (avoid mis-parsing)
            if (!text.match(/^(\d{2}):(\d{2})$/)) {
                parsed.push({ time, text });
                i++; // Skip the text line
            }
        }
    }
  }
  return parsed.sort((a, b) => a.time - b.time);
};

const MusicPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasError, setHasError] = useState(false);
  // Add a timestamp to bust cache if the file was just updated
  const [audioUrl] = useState(() => `/lovesong.mp3?v=${Date.now()}`);

  const lyrics = useMemo(() => parseLyrics(LYRICS_RAW), []);

  const currentLyric = useMemo(() => {
    // Find the current lyric based on time
    let active: LyricLine | null = null;
    for (const line of lyrics) {
        if (line.time <= currentTime) {
            active = line;
        } else {
            break;
        }
    }
    return active;
  }, [currentTime, lyrics]);

  const togglePlay = () => {
    if (hasError) {
        // Retry loading if previously failed
        if (audioRef.current) {
            audioRef.current.load();
            setHasError(false);
        }
        return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error("Playback failed:", error);
            });
        }
      }
    }
  };

  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-3">
      <audio 
        ref={audioRef} 
        src={audioUrl}
        preload="auto"
        loop
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => {
            setIsPlaying(true);
            setHasError(false);
        }}
        onError={(e) => {
            const error = e.currentTarget.error;
            console.error("Audio source error:", error);
            if (error && error.code === 4) {
               console.warn("Media Error 4 (SRC_NOT_SUPPORTED): The file might be missing, 404 (serving HTML), or corrupted.");
            }
            setHasError(true);
            setIsPlaying(false);
        }}
      />
      
      <button 
        onClick={togglePlay}
        className={`group relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 backdrop-blur-md rounded-full border transition-all duration-300 ${
            hasError 
            ? 'bg-red-500/20 border-red-500/50 text-red-200' 
            : 'bg-black/30 border-white/20 text-white hover:bg-white/20 hover:scale-105'
        }`}
        title={hasError ? "Check console for error" : (isPlaying ? "Pause Music" : "Play Music")}
      >
        {hasError ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
        ) : isPlaying ? (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 fill-current" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
           </svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 fill-current translate-x-0.5" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
           </svg>
        )}
      </button>

      {hasError && (
          <div className="mt-2 mr-2 text-right pointer-events-none max-w-[200px] md:max-w-xs">
            <p className="text-red-300 text-xs md:text-sm font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Music File Error
            </p>
          </div>
      )}

      {!hasError && isPlaying && currentLyric && (
        <div className="mt-2 mr-2 text-right pointer-events-none max-w-[200px] md:max-w-xs">
          <p className="text-[#FF9FB5] text-base md:text-lg font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-all duration-300 font-sans leading-relaxed">
            {currentLyric.text}
          </p>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
