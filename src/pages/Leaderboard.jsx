import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import MusicControls from "../components/MusicControls";

const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [playerRank, setPlayerRank] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [availableLevels, setAvailableLevels] = useState([]);
  const [bounceAnimation, setBounceAnimation] = useState(false);
  
  const navigate = useNavigate();

  // Animasi bounce saat component dimuat (sama seperti Home)
  useEffect(() => {
    setBounceAnimation(true);
    const timer = setTimeout(() => setBounceAnimation(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await API.get("/leaderboard");
        
        // Extract available levels
      const levels = [...new Set(res.data.map(item => item.level?.nama_level).filter(Boolean))];
      setAvailableLevels(levels);
      
      // Filter berdasarkan level yang dipilih
      let filteredData = res.data;
      if (selectedLevel !== "all") {
        filteredData = res.data.filter(item => 
          item.level?.nama_level?.toLowerCase() === selectedLevel.toLowerCase()
        );
      }
      
      // Sorting berdasarkan score tertinggi, lalu duration tercepat
      const sorted = filteredData.sort((a, b) => {
        // Primary sort: Score tertinggi dulu
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        
        // Secondary sort: Jika score sama, duration tercepat (ASC)
        const durationA = a.duration || 0;
        const durationB = b.duration || 0;
        return durationA - durationB;
      });
      
      setScores(sorted);

        // Cek apakah ada data pemain yang baru selesai bermain
        checkForNewGameCompletion(sorted);
      } catch (err) {
        setError("Gagal ngamuat daptar jawara");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedLevel]);

  // Fungsi untuk mengecek apakah pemain baru saja menyelesaikan permainan
  const checkForNewGameCompletion = (sortedScores) => {
    // Cek dari localStorage atau URL params
    const siswaId = localStorage.getItem("siswaId");
    const siswaName = localStorage.getItem("siswaName");
    const justCompletedGame = localStorage.getItem("justCompletedGame");
    const lastGameScore = localStorage.getItem("lastGameScore");
    
    if (justCompletedGame === "true" && siswaId && siswaName) {
      // Set current player info
      setCurrentPlayer({
        id: siswaId,
        name: siswaName,
        score: lastGameScore || 0
      });

      // Cari ranking pemain
      const playerRankIndex = sortedScores.findIndex(score => 
        score.LeaderboardSiswa?.id_siswa?.toString() === siswaId.toString()
      );

      if (playerRankIndex !== -1) {
        setPlayerRank(playerRankIndex + 1);
      }

      // Clear the completion flag
      localStorage.removeItem("justCompletedGame");
      localStorage.removeItem("lastGameScore");
    }
  };

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    setLoading(true);
  };

  // Fungsi untuk kembali ke SelectDifficulty dengan data pemain sebelumnya
  const handleBackToGame = () => {
    // Data pemain sudah tersimpan di localStorage (siswaId, siswaName)
    // Pastikan data masih ada
    const siswaId = localStorage.getItem("siswaId");
    const siswaName = localStorage.getItem("siswaName");
    
    if (siswaId && siswaName) {
      // Navigasi ke select-difficulty
      navigate("/select-difficulty");
    } else {
      // Jika data tidak ada, redirect ke home
      navigate("/");
    }
  };

  const handleBackToHome = () => {
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

  const getRankIcon = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
  };

  const getRankStyle = (index) => {
    if (index === 0)
      return "bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 text-white shadow-xl border-4 border-yellow-400";
    if (index === 1)
      return "bg-gradient-to-br from-gray-300 via-slate-300 to-gray-400 text-white shadow-xl border-4 border-gray-400";
    if (index === 2)
      return "bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 text-white shadow-xl border-4 border-orange-400";
    return "bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 hover:from-purple-500 hover:via-pink-500 hover:to-red-500 text-white border-4 border-purple-400 shadow-xl";
  };

  // Fungsi untuk format duration dengan handling null/undefined
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Fungsi untuk menentukan apakah waktu bagus (hijau) atau lambat (merah)
  const getDurationStyle = (duration, score) => {
    // Jika score tinggi dan duration rendah, warna hijau (bagus)
    if (score >= 50 && duration <= 60) {
      return "bg-gradient-to-r from-green-400 to-emerald-400 text-white border-2 border-green-500";
    }
    // Jika score rendah atau duration tinggi, warna merah (perlu diperbaiki)
    if (score < 30 || duration > 120) {
      return "bg-gradient-to-r from-red-400 to-pink-400 text-white border-2 border-red-500";
    }
    // Default orange untuk yang sedang-sedang
    return "bg-gradient-to-r from-orange-400 to-yellow-400 text-white border-2 border-orange-500";
  };

  // Fungsi untuk highlight current player
  const isCurrentPlayer = (item) => {
    return currentPlayer && item.LeaderboardSiswa?.id_siswa?.toString() === currentPlayer.id?.toString();
  };

  const FilterButtons = () => (
    <div className="mb-6">
      <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl md:rounded-3xl shadow-xl border-2 md:border-4 border-amber-500 p-4 md:p-6">
        <div className="flex items-center justify-center mb-4">
          <span className="text-2xl md:text-3xl mr-2">🎯</span>
          <h3 className="text-lg md:text-xl font-bold text-amber-800">Filter Tingkatan</h3>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {/* All Button */}
          <button
            onClick={() => handleLevelChange("all")}
            className={`px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-sm md:text-base transition-all duration-300 border-2 shadow-lg ${
              selectedLevel === "all"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400 shadow-xl scale-105"
                : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 border-gray-400 hover:from-gray-300 hover:to-gray-400"
            }`}
          >
            <span className="mr-2">🌟</span>
            Kabéh Tingkatan
          </button>

          {/* Level Buttons */}
          {availableLevels.map((level, index) => {
            const icons = {
              "mudah": "🟢",
              "sedang": "🟡", 
              "sulit": "🔴"
            };
            
            const colors = {
              "mudah": selectedLevel.toLowerCase() === level.toLowerCase() 
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400 shadow-xl scale-105"
                : "bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 border-green-400 hover:from-green-300 hover:to-emerald-300",
              "sedang": selectedLevel.toLowerCase() === level.toLowerCase()
                ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-400 shadow-xl scale-105" 
                : "bg-gradient-to-r from-yellow-200 to-orange-200 text-yellow-800 border-yellow-400 hover:from-yellow-300 hover:to-orange-300",
              "sulit": selectedLevel.toLowerCase() === level.toLowerCase()
                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400 shadow-xl scale-105"
                : "bg-gradient-to-r from-red-200 to-pink-200 text-red-800 border-red-400 hover:from-red-300 hover:to-pink-300"
            };

            return (
              <button
                key={index}
                onClick={() => handleLevelChange(level)}
                className={`px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-sm md:text-base transition-all duration-300 border-2 shadow-lg ${
                  colors[level.toLowerCase()] || "bg-gradient-to-r from-blue-200 to-purple-200 text-blue-800 border-blue-400 hover:from-blue-300 hover:to-purple-300"
                }`}
              >
                <span className="mr-2">{icons[level.toLowerCase()] || "⚫"}</span>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            );
          })}
        </div>
        
        {/* Info text */}
        <div className="mt-4 text-center">
          <p className="text-amber-700 font-bold text-sm md:text-base">
            {selectedLevel === "all" 
              ? "🌟 Némbongkeun kabéh tingkatan" 
              : `🎯 Ngan tingkat ${selectedLevel} waé`}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 p-2 md:p-4 relative overflow-hidden">
      <MusicControls />
      
      {/* Background Pattern - matching Home */}
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

      {/* Floating Elements - matching Home */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 text-xl md:text-2xl animate-bounce delay-100">🏆</div>
        <div className="absolute top-16 right-12 text-lg md:text-xl animate-pulse delay-300">⭐</div>
        <div className="absolute bottom-16 left-6 text-base md:text-lg animate-bounce delay-500">🎯</div>
        <div className="absolute top-24 left-1/4 text-lg md:text-xl animate-pulse delay-700">🎮</div>
        <div className="absolute bottom-20 right-8 text-base md:text-lg animate-bounce delay-900">🥇</div>
        <div className="absolute top-12 right-1/4 text-xl md:text-2xl animate-pulse delay-1100">🌟</div>
        <div className="absolute bottom-24 left-1/3 text-base md:text-lg animate-bounce delay-1300">🎖️</div>
        <div className="absolute top-32 right-1/3 text-lg md:text-xl animate-pulse delay-1500">🏅</div>
      </div>

      {/* Border - matching Home */}
      <div className="absolute inset-2 md:inset-4 border-4 md:border-8 border-amber-600 rounded-2xl md:rounded-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute inset-3 md:inset-6 border-2 md:border-4 border-orange-500 rounded-xl md:rounded-2xl opacity-30 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto text-center relative z-10 px-2">
        {/* Header - matching Home style */}
        <div className="mb-6 md:mb-8 relative">
          <div className={`mb-6 ${bounceAnimation ? 'animate-bounce' : ''}`}>
            <div className="bg-gradient-to-br from-amber-300 to-orange-300 w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto flex items-center justify-center shadow-2xl border-4 border-yellow-400 select-none pointer-events-none">
              <span className="text-5xl md:text-7xl drop-shadow-lg">🏆</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl shadow-xl border-2 md:border-4 border-yellow-400 select-none pointer-events-none mb-4">
            <h1 className="text-lg md:text-2xl lg:text-3xl font-black mb-2 drop-shadow-lg">
              🎯 DAPTAR JAWARA 🎯
            </h1>
            <div className="bg-yellow-300 text-amber-800 px-3 py-2 md:px-4 md:py-2 rounded-full shadow-lg inline-block border-2 border-amber-600 font-bold text-sm md:text-base">
              ✨ Saha nu pangjawarana dina maén kartu? ✨
            </div>
          </div>

          
          {/* Info sorting */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl md:rounded-3xl shadow-xl border-2 md:border-4 border-white mx-auto max-w-2xl mb-4 select-none pointer-events-none">
            <p className="text-white font-bold text-sm md:text-base">
              📊 Diurutan tina: Skor Pangluhurna → Waktu Panggancangna
              {selectedLevel !== "all" && ` (${selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} wungkul)`}
            </p>
          </div>
          
          {/* Show current player info if available */}
          {currentPlayer && (
            <div className="bg-gradient-to-br from-green-500 to-blue-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl md:rounded-3xl shadow-xl border-2 md:border-4 border-white mx-auto max-w-2xl">
              <span className="font-bold text-sm md:text-base">👤 {currentPlayer.name}</span>
              {playerRank && (
                <span className="ml-2 font-bold">• Peringkat ke-{playerRank}</span>
              )}
            </div>
          )}
        </div>

        <FilterButtons />

        {/* Leaderboard Card */}
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border-2 md:border-4 border-amber-500 mb-6 md:mb-8">
          {/* Header */}
          <div className="bg-gradient-to-br from-amber-600 to-orange-700 px-4 py-3 md:px-6 md:py-4 sticky top-0 z-10 select-none pointer-events-none">
            <div className="grid grid-cols-6 gap-2 md:gap-3 text-white font-bold text-xs md:text-sm drop-shadow-md ">
              <div className="text-center">🏅 Peringkat</div>
              <div className="col-span-2">👤 Ngaran Murid</div>
              <div className="text-center">🎯 Tingkatan</div>
              <div className="text-center">⭐ Nilai</div>
              <div className="text-center">⏱️ Waktos</div>
            </div>
          </div>

          {/* Scrollable Content Container */}
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-amber-100">
            <div className="divide-y-2 divide-amber-200 select-none pointer-events-none">
              {loading ? (
                <div className="p-6 md:p-8 text-center">
                  <div className="text-4xl md:text-5xl mb-3 animate-bounce">⏳</div>
                  <p className="text-amber-600 text-lg md:text-xl font-bold">Ngamuat data...</p>
                </div>
              ) : error ? (
                <div className="p-6 md:p-8 text-center">
                  <div className="text-4xl md:text-5xl mb-3 animate-pulse">😵</div>
                  <p className="text-red-500 text-lg md:text-xl font-bold">{error}</p>
                </div>
              ) : scores.length > 0 ? (
                scores.map((item, index) => (
                  <div
                    key={item.id_leaderboard}
                    className={`grid grid-cols-6 gap-2 md:gap-3 items-center p-3 md:p-4 transition-all duration-300 rounded-xl md:rounded-2xl mx-2 md:mx-3 my-2 
                      ${getRankStyle(index)} 
                      ${isCurrentPlayer(item) ? 'ring-4 ring-blue-400 bg-gradient-to-r from-blue-100 to-purple-100' : ''}
                    `}
                  >
                    {/* Rank */}
                    <div className="text-center">
                      <span className="text-xl md:text-2xl font-bold drop-shadow-md">{getRankIcon(index)}</span>
                      {isCurrentPlayer(item) && (
                        <div className="text-xs text-blue-600 font-bold mt-1 bg-white px-2 py-1 rounded-full">👈 ANJEUN</div>
                      )}
                    </div>

                    {/* Name */}
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg border-2 border-white">
                          {(item.LeaderboardSiswa?.username || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs md:text-sm drop-shadow-md">
                            {item.LeaderboardSiswa?.username || "Teu Aya Ngaran"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Level */}
                    <div className="text-center">
                      <span className="inline-block bg-gradient-to-r from-blue-400 to-green-400 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white">
                        {item.level?.nama_level || "?"}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="text-center">
                      <span className="inline-block bg-gradient-to-r from-green-400 to-blue-400 text-white px-2 py-1 md:px-3 md:py-2 rounded-full font-bold text-xs md:text-sm shadow-lg border-2 border-white">
                        {item.score.toLocaleString()}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="text-center">
                      <span className={`inline-block px-2 py-1 md:px-3 md:py-1 rounded-full font-bold text-xs shadow-lg border-2 border-white ${getDurationStyle(item.duration, item.score)}`}>
                        {formatDuration(item.duration)}
                      </span>
                      
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 md:p-8 text-center">
                  <div className="text-5xl md:text-6xl mb-3 animate-bounce">😴</div>
                  <p className="text-amber-600 text-lg md:text-xl font-bold mb-2">Teu acan aya data jawara</p>
                  <p className="text-amber-500 text-sm md:text-base">Hayu maén heula sangkan asup kana peringkat!</p>
                </div>
              )}
            </div>
          </div>

          {/* Scroll indicator */}
          {scores.length > 5 && (
            <div className="bg-gradient-to-br from-amber-600 to-orange-700 px-3 py-2 md:px-4 md:py-3 text-center select-none pointer-events-none">
              <p className="text-white font-bold text-xs md:text-sm animate-pulse">
                ⬇️ Scroll ka handap pikeun ningal langkung seueur ⬇️
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
            <div className="flex flex-wrap justify-center gap-3">
          {/* Game Buttons */}
          {localStorage.getItem("siswaId") && localStorage.getItem("siswaName") && (
            <>
              <button
                onClick={handleBackToGame}
                className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 border-2 md:border-4 border-yellow-400 rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 hover:scale-105 transform transition-all duration-300 text-white font-bold hover:shadow-2xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 opacity-20 rounded-2xl md:rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="bg-yellow-300 w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg border-2 border-green-600 group-hover:animate-bounce">
                    <span className="text-2xl md:text-3xl">🎮</span>
                  </div>
                  <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 text-white drop-shadow-lg">
                    🌟 MAÉN DEUI 🌟
                  </h2>
                  <div className="bg-yellow-200 rounded-xl p-2 md:p-3 text-green-800 shadow-lg border-2 border-green-600">
                    <p className="text-sm md:text-base font-bold">
                      🎯 Tingkatkeun skor! 🎯
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate("/select-difficulty")}
                className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 border-2 md:border-4 border-yellow-400 rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 hover:scale-105 transform transition-all duration-300 text-white font-bold hover:shadow-2xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 opacity-20 rounded-2xl md:rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="bg-yellow-300 w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg border-2 border-orange-600 group-hover:animate-bounce">
                    <span className="text-2xl md:text-3xl">🎯</span>
                  </div>
                  <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 text-white drop-shadow-lg">
                    🎖️ PILIH TINGKATAN 🎖️
                  </h2>
                  <div className="bg-yellow-200 rounded-xl p-2 md:p-3 text-orange-800 shadow-lg border-2 border-orange-600">
                    <p className="text-sm md:text-base font-bold">
                      ⭐ Ganti tingkat! ⭐
                    </p>
                  </div>
                </div>
              </button>
            </>
          )}

          {/* Back to Home Button */}
          <button
            onClick={handleBackToHome}
            className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 border-2 md:border-4 border-yellow-400 rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 hover:scale-105 transform transition-all duration-300 text-white font-bold hover:shadow-2xl group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 opacity-20 rounded-2xl md:rounded-3xl"></div>
            <div className="relative z-10">
              <div className="bg-yellow-300 w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg border-2 border-purple-600 group-hover:animate-bounce">
                <span className="text-2xl md:text-3xl">🏠</span>
              </div>
              <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 text-white drop-shadow-lg">
                🌟 KACA UTAMA 🌟
              </h2>
              <div className="bg-yellow-200 rounded-xl p-2 md:p-3 text-purple-800 shadow-lg border-2 border-purple-600">
                <p className="text-sm md:text-base font-bold">
                  🎯 Balik ka beranda! 🎯
                </p>
              </div>
            </div>
          </button>
          </div>
        </div>

        {/* Footer - matching Home style */}
        <div className="relative">
          <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl shadow-xl border-2 md:border-4 border-yellow-400 mx-auto max-w-2xl">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 select-none pointer-events-none">
              <span className="text-lg md:text-xl">🌟</span>
              <p className="text-white font-black text-sm md:text-base">
                SELAMAT KEUR SADAYA JAWARA!
              </p>
              <span className="text-lg md:text-xl">🌟</span>
            </div>
          </div>
        </div>
      </div>

      {/* Moving Background Elements - matching Home */}
      <div className="fixed bottom-0 left-0 w-full h-16 md:h-20 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-8 md:h-12 bg-gradient-to-t from-amber-200 to-transparent opacity-40"></div>
        <div className="absolute bottom-2 left-6 text-lg md:text-xl animate-bounce delay-200">🏆</div>
        <div className="absolute bottom-4 left-1/4 text-base md:text-lg animate-pulse delay-400">⭐</div>
        <div className="absolute bottom-1 right-1/3 text-lg md:text-xl animate-bounce delay-600">🎯</div>
        <div className="absolute bottom-3 right-6 text-base md:text-lg animate-pulse delay-800">🥇</div>
        <div className="absolute bottom-5 left-1/2 text-base md:text-lg animate-bounce delay-1000">🏅</div>
      </div>

      {/* Corner Ornaments - matching Home */}
      <div className="absolute top-4 left-4 text-xl md:text-2xl opacity-30 animate-pulse select-none pointer-events-none">🌟</div>
      <div className="absolute top-4 right-4 text-xl md:text-2xl opacity-30 animate-pulse select-none pointer-events-none">🌟</div>
      <div className="absolute bottom-4 left-4 text-xl md:text-2xl opacity-30 animate-pulse select-none pointer-events-none">🌟</div>
      <div className="absolute bottom-4 right-4 text-xl md:text-2xl opacity-30 animate-pulse select-none pointer-events-none">🌟</div>
    </div>
  );
};

export default Leaderboard;