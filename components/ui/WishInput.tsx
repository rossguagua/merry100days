import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';

const WishInput: React.FC = () => {
  const [wish, setWish] = useState('');
  const { startWish, isWishing } = useStore();

  const handleSend = () => {
    if (wish.trim() && !isWishing) {
      startWish(wish);
      setWish('');
    }
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3 bg-black/50 p-3 rounded-3xl backdrop-blur-md shadow-[0_0_20px_rgba(255,107,144,0.3)] transition-all duration-300">
      <input
        type="text"
        value={wish}
        onChange={(e) => setWish(e.target.value)}
        placeholder="Make a wish..."
        className="bg-transparent border-none text-white outline-none px-2 font-sans min-w-[200px] placeholder:text-gray-400"
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
      <button
        onClick={handleSend}
        disabled={isWishing || !wish.trim()}
        className={`bg-transparent border border-[#FF9FB5] text-[#FF9FB5] px-4 py-1 rounded-2xl cursor-pointer transition-all duration-300 font-sans uppercase text-sm tracking-wider hover:bg-[#FF9FB5] hover:text-black ${isWishing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Send
      </button>
    </div>
  );
};

export default WishInput;
