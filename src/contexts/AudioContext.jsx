// src/contexts/AudioContext.jsx - StrictMode Compatible
import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};

// Global variable untuk prevent multiple instances
let globalAudioInstance = null;
let globalAudioState = {
  isPlaying: false,
  volume: 0.5
};

export const AudioProvider = ({ children }) => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(globalAudioState.isPlaying);
  const [musicVolume, setMusicVolume] = useState(globalAudioState.volume);
  const audioRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Jika sudah ada global instance, gunakan yang sudah ada
    if (globalAudioInstance) {
      console.log('🔄 AudioProvider: Using existing global audio instance');
      audioRef.current = globalAudioInstance;
      setIsMusicPlaying(globalAudioState.isPlaying);
      setMusicVolume(globalAudioState.volume);
      return;
    }

    // Prevent double initialization dalam satu component
    if (isInitialized.current) {
      console.log('⚠️ AudioProvider: Already initialized in this component, skipping...');
      return;
    }

    console.log('🎵 AudioProvider: Creating new global audio instance...');
    isInitialized.current = true;

    // Stop semua audio yang ada di document
    const existingAudios = document.querySelectorAll('audio');
    existingAudios.forEach((audio, index) => {
      console.log(`🛑 Stopping existing audio ${index + 1}`);
      audio.pause();
      audio.currentTime = 0;
    });

    // Membuat audio element untuk musik latar
    const audio = new Audio();
    audio.src = "/music/sunda-background.mp3";
    audio.loop = true;
    audio.volume = musicVolume;
    
    // Set sebagai global instance
    globalAudioInstance = audio;
    audioRef.current = audio;

    // Event listeners untuk sync state
    audio.addEventListener('play', () => {
      console.log('▶️ Audio: Started playing');
      globalAudioState.isPlaying = true;
      setIsMusicPlaying(true);
    });

    audio.addEventListener('pause', () => {
      console.log('⏸️ Audio: Paused');
      globalAudioState.isPlaying = false;
      setIsMusicPlaying(false);
    });

    audio.addEventListener('error', (e) => {
      console.error('❌ Audio Error:', e);
    });

    // Coba auto play
    const attemptAutoPlay = async () => {
      try {
        await audio.play();
        console.log('✅ Auto play berhasil');
        globalAudioState.isPlaying = true;
        setIsMusicPlaying(true);
      } catch (error) {
        console.log('⚠️ Auto play diblokir, menunggu interaksi user');
        globalAudioState.isPlaying = false;
        setIsMusicPlaying(false);
        
        const handleFirstInteraction = async () => {
          try {
            await audio.play();
            console.log('✅ Play setelah user interaction');
            globalAudioState.isPlaying = true;
            setIsMusicPlaying(true);
            document.removeEventListener('click', handleFirstInteraction);
          } catch (e) {
            console.error('❌ Gagal memutar musik:', e);
          }
        };
        
        document.addEventListener('click', handleFirstInteraction);
      }
    };

    attemptAutoPlay();

    // Cleanup saat component unmount
    return () => {
      console.log('🧹 AudioProvider: Component unmounting...');
      // Jangan destroy global instance, biarkan tetap ada
      // globalAudioInstance tetap ada untuk component lain
    };
  }, []);

  // Update volume saat musicVolume berubah
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
      globalAudioState.volume = musicVolume;
      console.log('🔊 Volume updated:', musicVolume);
    }
  }, [musicVolume]);

  const toggleMusic = async () => {
    console.log('🎛️ Toggle music clicked. Current state:', isMusicPlaying);
    
    if (!audioRef.current) {
      console.error('❌ No audio reference available');
      return;
    }

    try {
      if (isMusicPlaying) {
        console.log('⏸️ Pausing music...');
        audioRef.current.pause();
        globalAudioState.isPlaying = false;
        setIsMusicPlaying(false);
      } else {
        console.log('▶️ Playing music...');
        await audioRef.current.play();
        globalAudioState.isPlaying = true;
        setIsMusicPlaying(true);
      }
    } catch (error) {
      console.error('❌ Error toggling music:', error);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    console.log('🔊 Volume change:', newVolume);
    globalAudioState.volume = newVolume;
    setMusicVolume(newVolume);
  };

  // Cleanup global instance saat app benar-benar close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (globalAudioInstance) {
        globalAudioInstance.pause();
        globalAudioInstance = null;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const value = {
    isMusicPlaying,
    musicVolume,
    toggleMusic,
    handleVolumeChange,
    audioRef
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};