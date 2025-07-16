import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api";
import { BASE_URL } from "../api";
import MusicControls from "../components/MusicControls";

const Game = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTimeLimit, setInitialTimeLimit] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finalDuration, setFinalDuration] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);

  // Sound effect refs
  const soundRefs = useRef({
    cardFlip: null,
    cardMatch: null,
    cardMismatch: null,
    gameWin: null,
    gameTimeout: null,
    tick: null,
    buttonClick: null
  });

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const levelId = params.get("level");
  const siswaId = localStorage.getItem("siswaId");

  // Initialize sound effects
  useEffect(() => {
    const initializeSounds = () => {
      try {
        // Create audio context for Web Audio API sounds
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Function to create beep sound
        const createBeepSound = (frequency, duration, volume = 0.3) => {
          return () => {
            if (audioContext.state === 'suspended') {
              audioContext.resume();
            }
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
          };
        };

        // Function to create chord sound
        const createChordSound = (frequencies, duration, volume = 0.2) => {
          return () => {
            if (audioContext.state === 'suspended') {
              audioContext.resume();
            }
            
            frequencies.forEach((freq, index) => {
              setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
              }, index * 100);
            });
          };
        };

        // Function to create success melody
        const createSuccessSound = () => {
          return () => {
            if (audioContext.state === 'suspended') {
              audioContext.resume();
            }
            
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, index) => {
              setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
              }, index * 150);
            });
          };
        };

        // Function to create failure sound
        const createFailureSound = () => {
          return () => {
            if (audioContext.state === 'suspended') {
              audioContext.resume();
            }
            
            const notes = [440, 415.30, 392, 369.99]; // A4, Ab4, G4, Gb4 (descending)
            notes.forEach((freq, index) => {
              setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sawtooth';
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.4);
              }, index * 100);
            });
          };
        };

        // Assign sounds to refs
        soundRefs.current = {
          cardFlip: createBeepSound(800, 0.1, 0.3),
          cardMatch: createSuccessSound(),
          cardMismatch: createBeepSound(300, 0.3, 0.4),
          gameWin: createChordSound([523.25, 659.25, 783.99, 1046.50], 0.8, 0.4),
          gameTimeout: createFailureSound(),
          tick: createBeepSound(1000, 0.1, 0.1),
          buttonClick: createBeepSound(600, 0.15, 0.2)
        };

      } catch (error) {
        console.warn("Web Audio API not supported, sounds will be disabled");
        // Fallback to silent functions
        Object.keys(soundRefs.current).forEach(key => {
          soundRefs.current[key] = () => {};
        });
      }
    };

    initializeSounds();
  }, []);

  // Play sound function with volume control
  const playSound = (soundName, volume = 1) => {
    try {
      const soundSettings = JSON.parse(localStorage.getItem('soundSettings') || '{"enabled": true, "volume": 0.7}');
      
      if (soundSettings.enabled && soundRefs.current[soundName]) {
        soundRefs.current[soundName]();
      }
    } catch (error) {
      console.warn("Error playing sound:", error);
    }
  };

  useEffect(() => {
    if (!levelId || !siswaId) {
      navigate("/");
      return;
    }

    const fetchGame = async () => {
      try {
        const res = await API.get(`/game/${levelId}`);

        console.log("API Response:", res.data); // Debug response
        console.log("Cards data:", res.data.cards); // Debug cards
        
        setCards(res.data.cards);
        setTimer(res.data.time_limit);
        setTimeLeft(res.data.time_limit);
        setInitialTimeLimit(res.data.time_limit);
        
        // Hitung total pasangan unik
        const uniquePairs = new Set(res.data.cards.map((c) => c.id_kartu)).size;
        setTotalPairs(uniquePairs);
      } catch (error) {
        console.error("Gagal mengambil data game:", error);
      }
    };

    fetchGame();
  }, [levelId, siswaId, navigate]);

  // Timer countdown with tick sound
  useEffect(() => {
    if (showResult) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          const timeoutDuration = initialTimeLimit;
          setFinalDuration(timeoutDuration);
          setShowResult(true);
          playSound('gameTimeout'); // Play timeout sound
          return 0;
        }
        
        // Play tick sound for last 10 seconds
        if (prev <= 10) {
          playSound('tick');
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showResult, initialTimeLimit]);

  // Submit otomatis jika semua kartu matched
  useEffect(() => {
    if (matched.length === totalPairs && cards.length > 0 && !showResult) {
      const gameCompletionDuration = initialTimeLimit - timeLeft;
      console.log("Game completed! Duration:", gameCompletionDuration);
      setFinalDuration(gameCompletionDuration);
      setShowResult(true);
      playSound('gameWin'); // Play win sound
    }
  }, [matched, cards, timeLeft, initialTimeLimit, showResult, totalPairs]);

  // Update score berdasarkan jumlah kartu yang berhasil dipasangkan
  useEffect(() => {
    if (totalPairs > 0) {
      const newScore = Math.round((matched.length / totalPairs) * 100);
      setScore(newScore);
    }
  }, [matched, totalPairs]);

  const handleClick = (index) => {
    // Check if game is over, card is already flipped, or card is already matched
    if (flipped.length === 2 || flipped.includes(index) || showResult) return;
    
    // Additional check: if this specific card is already matched, don't allow click
    const currentCard = cards[index];
    if (matched.includes(currentCard.id_kartu)) return;

    playSound('cardFlip'); // Play flip sound

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const card1 = cards[first];
      const card2 = cards[second];

      if (
        card1.id_kartu === card2.id_kartu &&
        card1.type !== card2.type &&
        first !== second
      ) {
        setMatched((prev) => [...prev, card1.id_kartu]);
        setTimeout(() => playSound('cardMatch'), 300); // Play match sound after flip animation
      } else {
        setTimeout(() => playSound('cardMismatch'), 300); // Play mismatch sound after flip animation
      }

      setTimeout(() => setFlipped([]), 1000);
    }
  };

  const submitScore = async () => {
    playSound('buttonClick'); // Play button click sound
    
    try {
      const durationToSend = Math.round(finalDuration);
      
      console.log("Submitting score:", {
        id_siswa: siswaId,
        level_id: levelId,
        score,
        duration: durationToSend
      });

      const response = await API.post("/game/submit", {
        id_siswa: parseInt(siswaId),
        level_id: parseInt(levelId),
        score,
        duration: durationToSend,
      });

      console.log("Submit response:", response.data);
      
      // Set flag untuk menunjukkan bahwa pemain baru saja menyelesaikan permainan
      localStorage.setItem("justCompletedGame", "true");
      localStorage.setItem("lastGameScore", score.toString());
      
      navigate("/leaderboard");
    } catch (error) {
      console.error("Gagal submit skor:", error);
      alert("Gagal menyimpan skor. Silakan coba lagi.");
    }
  };

  // Fungsi untuk coba lagi (restart game di level yang sama)
  const handleTryAgain = () => {
    playSound('buttonClick'); // Play button click sound
    
    // Reset semua state game
    setCards([]);
    setFlipped([]);
    setMatched([]);
    setScore(0);
    setTimer(0);
    setTimeLeft(0);
    setInitialTimeLimit(0);
    setShowResult(false);
    setFinalDuration(0);
    setTotalPairs(0);
    
    // Reload halaman untuk memulai ulang game
    window.location.reload();
  };

  // Fungsi untuk kembali ke select difficulty
  const handleBackToSelectDifficulty = () => {
    playSound('buttonClick'); // Play button click sound
    
    // Data siswa sudah tersimpan di localStorage (siswaId, siswaName)
    navigate("/select-difficulty");
  };

  const handleBackToHome = () => {
    playSound('buttonClick'); // Play button click sound
    
    // Clear localStorage sebelum navigasi ke beranda
    localStorage.removeItem("siswaId");
    localStorage.removeItem("siswaName");
    localStorage.removeItem("siswaNIS");
    localStorage.removeItem("siswaKelas");
    localStorage.removeItem("justCompletedGame");
    localStorage.removeItem("lastGameScore");
    
    // Navigasi ke beranda
    navigate("/");
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Fungsi untuk menentukan konfigurasi grid berdasarkan jumlah kartu
  const getGridConfig = (cardCount) => {
    if (cardCount <= 6) {
      // Untuk kartu sangat sedikit (1-6 kartu)
      return {
        gridClass: "grid-cols-2 sm:grid-cols-3",
        cardHeight: "h-36 sm:h-40 md:h-44",
        maxWidth: "max-w-2xl",
        imageSize: "w-18 h-18 sm:w-22 sm:h-22 md:w-26 md:h-26",
        textSize: "text-base sm:text-lg md:text-xl"
      };
    } else if (cardCount <= 8) {
      // Untuk kartu sedikit (7-8 kartu)
      return {
        gridClass: "grid-cols-2 sm:grid-cols-4",
        cardHeight: "h-28 sm:h-32 md:h-36",
        maxWidth: "max-w-3xl",
        imageSize: "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20",
        textSize: "text-xs sm:text-sm md:text-base"
      };
    } else if (cardCount <= 12) {
      // Untuk kartu sedang (9-12 kartu) - 6 kolom
      return {
        gridClass: "grid-cols-3 sm:grid-cols-6",
        cardHeight: "h-24 sm:h-28 md:h-32",
        maxWidth: "max-w-6xl",
        imageSize: "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16",
        textSize: "text-xs sm:text-sm md:text-base"
      };
    } else {
      // Untuk kartu banyak (13+ kartu) - 6 kolom
      return {
        gridClass: "grid-cols-4 sm:grid-cols-6",
        cardHeight: "h-20 sm:h-24 md:h-28",
        maxWidth: "max-w-6xl",
        imageSize: "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14",
        textSize: "text-xs sm:text-sm"
      };
    }
  };

  // Fungsi untuk menentukan gap grid berdasarkan jumlah kartu
  const getGridGap = (cardCount) => {
    if (cardCount <= 6) {
      return "gap-6 sm:gap-8";
    } else if (cardCount <= 8) {
      return "gap-4 sm:gap-6";
    } else if (cardCount <= 12) {
      return "gap-3 sm:gap-4";
    } else {
      return "gap-2 sm:gap-3";
    }
  };

  // Fungsi untuk menentukan ukuran icon tanda tanya
  const getQuestionMarkSize = (cardCount) => {
    if (cardCount <= 8) {
      return "text-3xl md:text-4xl";
    } else if (cardCount <= 12) {
      return "text-2xl md:text-3xl";
    } else {
      return "text-xl md:text-2xl";
    }
  };

  const gridConfig = getGridConfig(cards.length);
  const gridGap = getGridGap(cards.length);
  const questionMarkSize = getQuestionMarkSize(cards.length);

  // Fungsi untuk mendapatkan status permainan
  const getGameStatus = () => {
    if (matched.length === totalPairs && totalPairs > 0) {
      return "completed";
    } else if (timeLeft === 0) {
      return "timeout";
    }
    return "playing";
  };

  const gameStatus = getGameStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 p-2 md:p-4 relative overflow-hidden">
      <div className="hidden"><MusicControls /></div>
      

      {/* Background Pattern*/}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #d97706 0px,
            #d97706 2px,
            transparent 2px,
            transparent 20px
          ), repeating-linear-gradient(
            -45deg,
            #92400e 0px,
            #92400e 2px,
            transparent 2px,
            transparent 20px
          )`
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 text-xl md:text-2xl animate-bounce delay-100">🏔️</div>
        <div className="absolute top-16 right-12 text-lg md:text-xl animate-pulse delay-300">🎭</div>
        <div className="absolute bottom-16 left-6 text-base md:text-lg animate-bounce delay-500">🌾</div>
        <div className="absolute top-24 left-1/4 text-lg md:text-xl animate-pulse delay-700">🎶</div>
        <div className="absolute bottom-20 right-8 text-base md:text-lg animate-bounce delay-900">🏮</div>
        <div className="absolute top-12 right-1/4 text-xl md:text-2xl animate-pulse delay-1100">🌺</div>
        <div className="absolute bottom-24 left-1/3 text-base md:text-lg animate-bounce delay-1300">🦋</div>
        <div className="absolute top-32 right-1/3 text-lg md:text-xl animate-pulse delay-1500">🌸</div>
      </div>

      {/* Border */}
      <div className="absolute inset-2 md:inset-4 border-4 md:border-8 border-amber-600 rounded-2xl md:rounded-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute inset-3 md:inset-6 border-2 md:border-4 border-orange-500 rounded-xl md:rounded-2xl opacity-30 pointer-events-none"></div>

      {/* Background content with blur effect when modal is shown */}
      <div className={`transition-all duration-300 ${showResult ? 'blur-sm' : ''}`}>
        
        {/* Header - Made Smaller */}
        <div className="text-center mb-3 md:mb-4 relative z-10">
          
          <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl shadow-xl border-2 border-yellow-400 mx-auto max-w-xl">
            <h1 className="text-base md:text-lg lg:text-xl font-black mb-1 drop-shadow-lg">
              🎯 Hayu Urang Maén Kartu! 🎯
            </h1>
          </div>
          
          {/* Info Panel - Made Smaller */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl md:rounded-2xl shadow-xl p-3 md:p-4 max-w-md mx-auto border-2 border-amber-400 mt-2 md:mt-3">
            <div className="flex justify-between items-center mb-2">
              <div className={`bg-gradient-to-br ${timeLeft <= 10 ? 'from-red-500 to-red-600 animate-pulse' : 'from-blue-500 to-cyan-500'} text-white px-2 py-1 md:px-3 md:py-2 rounded-lg md:rounded-xl shadow-lg border-2 border-yellow-400`}>
                <div className="flex items-center font-bold text-xs md:text-sm">
                  <span className="text-sm md:text-base mr-1">⏰</span>
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white px-2 py-1 md:px-3 md:py-2 rounded-lg md:rounded-xl shadow-lg border-2 border-yellow-400">
                <div className="flex items-center font-bold text-xs md:text-sm">
                  <span className="text-sm md:text-base mr-1">⭐</span>
                  <span>{score}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white px-2 py-1 md:px-3 md:py-2 rounded-lg md:rounded-xl shadow-lg border-2 border-yellow-400">
              <div className="text-xs md:text-sm font-bold text-center">
                {cards.length <= 8 && "⭐ Tingkat Gampil"}
                {cards.length > 8 && cards.length <= 16 && "⭐⭐ Tingkat Sedeng"}
                {cards.length > 16 && "⭐⭐⭐ Tingkat Hese"}
              </div>
              <div className="text-xs font-semibold mt-1 text-center text-yellow-200">
                {matched.length}/{totalPairs} pasangan kapanggih
              </div>
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className={`grid ${gridConfig.gridClass} ${gridGap} ${gridConfig.maxWidth} mx-auto transition-all duration-300 relative z-10 `}>
          {cards.map((card, index) => (
            <div
              key={card.uid}
              onClick={() => handleClick(index)}
              className={`
                cursor-pointer ${gridConfig.cardHeight} rounded-2xl md:rounded-3xl flex flex-col items-center justify-center text-center p-2 md:p-3
                transform transition-all duration-300 hover:scale-105 shadow-xl border-2 md:border-4 hover:shadow-2xl select-none focus:outline-none
                ${
                  flipped.includes(index) || matched.includes(card.id_kartu)
                    ? "bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400 border-yellow-400 animate-pulse"
                    : "bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 border-yellow-400 hover:from-amber-500 hover:via-orange-500 hover:to-red-500"
                }
                ${showResult ? 'pointer-events-none' : ''}
              `}
            >
              {(flipped.includes(index) || matched.includes(card.id_kartu)) ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {card.type === "image" ? (
                    <img
                      src={card.image_url.startsWith("http") ? card.image_url : `${BASE_URL}${card.image_url}`}
                      alt="gambar"
                      className={`${gridConfig.imageSize} object-cover rounded-xl border-2 border-white shadow-lg`}
                      onError={(e) => {
                        console.error("Gagal load gambar:", card.image_url);
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-yellow-200 to-amber-200 rounded-xl px-3 py-2 shadow-lg border-2 border-amber-400">
                      <p className={`${gridConfig.textSize} font-bold text-amber-800`}>
                        {card.kata}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className={questionMarkSize}>❓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 bg-opacity-95 backdrop-blur-sm p-5 rounded-2xl shadow-2xl w-full max-w-sm border-2 border-amber-500 relative max-h-[85vh] overflow-y-auto">
            
            <div className="text-center mb-4 pointer-events-none select-none">
              <div className="bg-gradient-to-br from-amber-300 to-orange-300 w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center shadow-xl border-2 border-yellow-400">
                <span className="text-2xl animate-bounce">
                  {gameStatus === "completed" ? "🎉" : "⏰"}
                </span>
              </div>
              <h2 className="text-xl font-black text-amber-800 mb-3">
                {gameStatus === "completed" ? "🌟 Bagja Pisan! 🌟" : "⏰ Waktosna Séép! ⏰"}
              </h2>
              <div className="w-20 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mb-3"></div>
              <p className="text-sm font-bold text-amber-700">
                {gameStatus === "completed" 
                  ? "Anjeun parantos suksés ngalengkepan sadaya kartu!" 
                  : "Game réngsé, tapi anjeun damel saé!"
                }
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-amber-200 to-orange-200 rounded-xl p-3 border-2 border-amber-400 shadow-xl mb-4 pointer-events-none select-none">
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg border-2 border-yellow-400 mb-3">
                  <div className="flex items-center justify-center text-base font-black">
                    <span className="mr-1">⭐</span>
                    <span>Nilai: {score}</span>
                    <span className="ml-1">⭐</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-amber-300">
                    <div className="flex items-center justify-center text-sm font-bold text-amber-800">
                      <span className="mr-1">🎯</span>
                      <span>Suksés: {matched.length}/{totalPairs}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-amber-300">
                    <div className="flex items-center justify-center text-sm font-bold text-amber-800">
                      <span className="mr-1">⏱️</span>
                      <span>Waktos: {formatTime(finalDuration)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-amber-300">
                    <div className="flex items-center justify-center text-sm font-bold text-amber-800">
                      {cards.length <= 8 && "⭐ Tingkat Gampil"}
                      {cards.length > 8 && cards.length <= 16 && "⭐⭐ Tingkat Sedeng"}
                      {cards.length > 16 && "⭐⭐⭐ Tingkat Hese"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-2">
              {/* Primary Button */}
              <button
                onClick={submitScore}
                className="w-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 
                           text-white font-black py-3 px-4 rounded-xl text-sm shadow-xl transform 
                           transition-all duration-300 hover:scale-105 border-2 border-yellow-400 hover:shadow-2xl select-none cursor-pointer focus:outline-none"
              >
                🏆 Tingali Peringkat! 🏆
              </button>

              {/* Secondary Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleTryAgain}
                  className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 
                             text-white font-black py-3 px-3 rounded-xl text-sm shadow-xl transform 
                             transition-all duration-300 hover:scale-105 border-2 border-yellow-400 hover:shadow-2xl select-none cursor-pointer focus:outline-none"
                >
                  🔄 Cobian Deui
                </button>
                
                <button
                  onClick={handleBackToSelectDifficulty}
                  className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 
                             text-white font-black py-3 px-3 rounded-xl text-sm shadow-xl transform 
                             transition-all duration-300 hover:scale-105 border-2 border-yellow-400 hover:shadow-2xl select-none cursor-pointer focus:outline-none"
                >
                  🎯 Pilih Tingkat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Moving Background Elements */}
      <div className="fixed bottom-0 left-0 w-full h-16 md:h-20 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-8 md:h-12 bg-gradient-to-t from-amber-200 to-transparent opacity-40"></div>
        <div className="absolute bottom-2 left-6 text-lg md:text-xl animate-bounce delay-200">🌸</div>
        <div className="absolute bottom-4 left-1/4 text-base md:text-lg animate-pulse delay-400">🦋</div>
        <div className="absolute bottom-1 right-1/3 text-lg md:text-xl animate-bounce delay-600">🌺</div>
        <div className="absolute bottom-3 right-6 text-base md:text-lg animate-pulse delay-800">🌷</div>
        <div className="absolute bottom-5 left-1/2 text-base md:text-lg animate-bounce delay-1000">🏮</div>
      </div>

      {/* Corner Ornaments */}
      <div className="absolute top-4 left-4 text-xl md:text-2xl opacity-30 animate-pulse select-none pointer-events-none">🌺</div>
      <div className="absolute top-4 right-4 text-xl md:text-2xl opacity-30 animate-pulse select-none pointer-events-none">🌺</div>
      <div className="absolute bottom-4 left-4 text-xl md:text-2xl opacity-30 animate-pulse select-none pointer-events-none">🌺</div>
      <div className="absolute bottom-4 right-4 text-xl md:text-2xl opacity-30 animate-pulse select-none pointer-events-none">🌺</div>
    </div>
  );
};

export default Game;