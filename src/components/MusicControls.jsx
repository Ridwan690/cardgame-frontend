// src/components/MusicControls.jsx - Debug Version
import React from 'react';
import { useAudio } from '../contexts/AudioContext';

const MusicControls = () => {
  const { isMusicPlaying, musicVolume, toggleMusic, handleVolumeChange, forceStopAllAudio } = useAudio();

  return (
    <div className="fixed top-162 left-8 z-50 bg-gradient-to-br from-amber-200 to-orange-200 p-3 rounded-xl shadow-lg border-2 border-amber-500 select-none cursor-pointer focus:outline-none">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMusic}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
            isMusicPlaying 
              ? 'bg-gradient-to-r from-green-400 to-emerald-400 border-green-600 hover:from-green-500 hover:to-emerald-500' 
              : 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-600 hover:from-gray-500 hover:to-gray-600'
          }`}
        >
          <span className="text-xl">
            {isMusicPlaying ? '🎵' : '🔇'}
          </span>
        </button>
        
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-amber-800">
            🎶 Manuk Dadali {isMusicPlaying ? '(Maén)' : '(Eureun)'}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={musicVolume}
            onChange={handleVolumeChange}
            className="w-16 h-2 bg-amber-300 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${musicVolume * 100}%, #fcd34d ${musicVolume * 100}%, #fcd34d 100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MusicControls;