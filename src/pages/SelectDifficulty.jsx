import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import MusicControls from "../components/MusicControls";

const SelectDifficulty = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [siswaList, setSiswaList] = useState([]);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [levelScores, setLevelScores] = useState({}); // Menyimpan skor untuk setiap level
  const [levels, setLevels] = useState([]);
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [bounceAnimation, setBounceAnimation] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  // Animasi bounce saat component dimuat
  useEffect(() => {
    setBounceAnimation(true);
    const timer = setTimeout(() => setBounceAnimation(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await API.get("/levels");
        setLevels(res.data);
      } catch (error) {
        console.error("Gagal memuat data level:", error);
      }
    };
    fetchLevels();
  }, []);

  // Fetch siswa berdasarkan search
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const timeout = setTimeout(async () => {
        try {
          const res = await API.get(`/siswa/search?query=${searchTerm}`);
          setSiswaList(res.data);
        } catch (error) {
          console.error("Gagal mencari siswa:", error);
          setSiswaList([]);
        }
      }, 400);
      return () => clearTimeout(timeout);
    } else {
      setSiswaList([]);
    }
  }, [searchTerm]);

  // ambil level yang sudah diselesaikan dan skornya
  useEffect(() => {
    const fetchCompleted = async () => {
      if (selectedSiswa) {
        try {

          setCompletedLevels([]);
          setLevelScores({});
          setLoading(true);

          const timestamp = new Date().getTime();
          console.log(`Fetching progress for siswa ID: ${selectedSiswa.id_siswa}`);

          const res = await API.get(`/activity?siswaId=${selectedSiswa.id_siswa}&t=${timestamp}`);

          console.log('API Response:', res.data);
          console.log('Response length:', res.data?.length || 0);


          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            const levelsDone = res.data.map(item => item.id_level);
            
            // Membuat mapping skor untuk setiap level
            const scoresMap = {};
            res.data.forEach(item => {
              if (!scoresMap[item.id_level] || item.score > scoresMap[item.id_level]) {
                scoresMap[item.id_level] = item.score;
              }
            });
            
            console.log('Completed levels:', levelsDone);
            console.log('Level scores:', scoresMap);
            
            setCompletedLevels(levelsDone);
            setLevelScores(scoresMap);
          } else {
            // Jika response kosong, pastikan state kosong
            console.log('No activities found for this student');
            setCompletedLevels([]);
            setLevelScores({});
          }
        } catch (error) {
          console.error("Gagal memuat data progress siswa:", error);
          setCompletedLevels([]);
          setLevelScores({});
        } finally {
          setLoading(false);
        }
      } else {
        // Jika tidak ada siswa terpilih, clear semua data
        console.log('No student selected, clearing progress data');
        setCompletedLevels([]);
        setLevelScores({});
      }
    };
    fetchCompleted();
  }, [selectedSiswa, refreshKey]);

  const validateSelectedSiswa = async () => {
    if (selectedSiswa) {
      try {
        // Cek apakah siswa masih ada di database
        const res = await API.get(`/siswa/search?query=${selectedSiswa.nis}`);
        const siswaExists = res.data.find(s => s.id_siswa === selectedSiswa.id_siswa);
        
        if (!siswaExists) {
          // Siswa sudah dihapus, clear data
          console.log("Siswa sudah dihapus dari database, clearing data...");
          localStorage.removeItem("siswaId");
          localStorage.removeItem("siswaName");
          localStorage.removeItem("siswaNIS");
          localStorage.removeItem("siswaKelas");
          setSelectedSiswa(null);
          setCompletedLevels([]);
          setLevelScores({});
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error validating siswa:", error);
      }
    }
  };

  // Panggil validasi saat auto refresh
  useEffect(() => {
    if (!selectedSiswa) return;
    
    const interval = setInterval(() => {
      console.log("Auto refreshing and validating...");
      validateSelectedSiswa(); // Validasi siswa dulu
      setRefreshKey(prev => prev + 1); // Lalu refresh progress
    }, 15000);
    
    return () => clearInterval(interval);
  }, [selectedSiswa]);

  useEffect(() => {
    if (!selectedSiswa) return;

    const interval = setInterval(() => {
      console.log("Auto refreshing progress data...");
      setRefreshKey(prev => prev + 1);
    }, 15000);

    return () => {
      clearInterval(interval);
      console.log("Auto refresh interval cleared")
    };
  }, [selectedSiswa]);

  useEffect(() => {
    const savedSiswaId = localStorage.getItem("siswaId");
    const savedSiswaName = localStorage.getItem("siswaName");
    const savedSiswaNIS = localStorage.getItem("siswaNIS");
    const savedSiswaKelas = localStorage.getItem("siswaKelas");
    
    if (savedSiswaId && savedSiswaName && savedSiswaNIS && savedSiswaKelas) {
      console.log('Loading saved student from localStorage:', savedSiswaId);
      
      // Clear state 
      setCompletedLevels([]);
      setLevelScores({})

      setSelectedSiswa({
        id_siswa: savedSiswaId,
        username: savedSiswaName,
        nis: savedSiswaNIS,
        kelas: savedSiswaKelas
      });
      setShowModal(false);
    } else {
      console.log('No saved student found');
      setSelectedSiswa(null);
      setCompletedLevels([]);
      setLevelScores({});
    }
  }, []);

  // Handle pilih level
  const handleLevelClick = async (id_level, index) => {
    if (!selectedSiswa) {
      alert("Pilih siswa terlebih dahulu.");
      return;
    }

    // Validasi level sebelumnya harus diselesaikan dengan skor 100
    if (index > 0) {
      const previousLevel = levels[index - 1];
      const previousScore = levelScores[previousLevel.id_level];
      
      if (!completedLevels.includes(previousLevel.id_level) || previousScore < 100) {
        alert(`Anjeun kudu meunang nilai 100 dina level "${previousLevel.nama_level}" heula pikeun muka level ieu!`);
        return;
      }
    }

    localStorage.setItem("siswaId", selectedSiswa.id_siswa);
    localStorage.setItem("siswaName", selectedSiswa.username);
    navigate(`/game?level=${id_level}`);
  };

  // Cek apakah level bisa dimainkan
  const canPlayLevel = (levelId, index) => {
    if (!selectedSiswa) return false;
    
    // Level pertama selalu bisa dimainkan
    if (index === 0) return true;
    
    // Level lain hanya bisa dimainkan jika level sebelumnya sudah diselesaikan dengan skor 100
    const previousLevel = levels[index - 1];
    const previousScore = levelScores[previousLevel.id_level];
    
    return completedLevels.includes(previousLevel.id_level) && previousScore >= 100;
  };

  // Cek apakah level sudah diselesaikan
  const isLevelCompleted = (levelId) => {
    return completedLevels.includes(levelId);
  };

  // Cek apakah level sudah diselesaikan dengan skor 100
  const isLevelPerfect = (levelId) => {
    return levelScores[levelId] >= 100;
  };

  // Fungsi untuk mendapatkan icon bintang berdasarkan level
  const getStarIcon = (index) => {
    const starCount = (index % 3) + 1; // 1, 2, atau 3 bintang
    return "⭐".repeat(starCount);
  };

  // Fungsi untuk mendapatkan status level
  const getLevelStatus = (levelId, index) => {
    const isCompleted = isLevelCompleted(levelId);
    const isPerfect = isLevelPerfect(levelId);
    const canPlay = canPlayLevel(levelId, index);
    
    if (isCompleted && isPerfect) {
      return { icon: "✅", text: "Sampurna!", color: "text-green-300" };
    } else if (isCompleted && !isPerfect) {
      const score = levelScores[levelId] || 0;
      return { icon: "⚠️", text: `Nilai: ${score}`, color: "text-yellow-300" };
    } else if (!canPlay && index > 0) {
      return { icon: "🔒", text: "Kunci", color: "text-red-300" };
    } else {
      return { icon: "", text: "", color: "" };
    }
  };

  // Handle pemilihan siswa
  const handleSelectSiswa = (siswa) => {
    console.log('Selecting new student:', siswa);
    
    // Clear state lama dulu
    setCompletedLevels([]);
    setLevelScores({});
    setLoading(false);
    
    // Set siswa baru
    setSelectedSiswa(siswa);
    setSearchTerm("");
    setSiswaList([]);
    setShowModal(false);
    
    // Clear localStorage lama
    localStorage.removeItem("siswaId");
    localStorage.removeItem("siswaName");
    localStorage.removeItem("siswaNIS");
    localStorage.removeItem("siswaKelas");
    localStorage.removeItem("justCompletedGame");
    localStorage.removeItem("lastGameScore");
    
    // Set localStorage baru
    localStorage.setItem("siswaId", siswa.id_siswa);
    localStorage.setItem("siswaName", siswa.username);
    localStorage.setItem("siswaNIS", siswa.nis);
    localStorage.setItem("siswaKelas", siswa.kelas);
  };

  const handleBackToHome = () => {
    console.log('Going back to home, clearing all data');
    
    // Clear semua state
    setSelectedSiswa(null);
    setCompletedLevels([]);
    setLevelScores({});
    setSearchTerm("");
    setSiswaList([]);
    setLoading(false);
    
    // Clear localStorage
    localStorage.removeItem("siswaId");
    localStorage.removeItem("siswaName");
    localStorage.removeItem("siswaNIS");
    localStorage.removeItem("siswaKelas");
    localStorage.removeItem("justCompletedGame");
    localStorage.removeItem("lastGameScore");
    
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 p-3 md:p-6 relative overflow-hidden">
      <MusicControls />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #d97706 0px,
            #d97706 1px,
            transparent 1px,
            transparent 15px
          ), repeating-linear-gradient(
            -45deg,
            #92400e 0px,
            #92400e 1px,
            transparent 1px,
            transparent 15px
          )`
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 text-lg md:text-xl animate-bounce delay-100">🏔️</div>
        <div className="absolute top-8 right-8 text-base md:text-lg animate-pulse delay-300">🎯</div>
        <div className="absolute bottom-12 left-4 text-sm md:text-base animate-bounce delay-500">🌾</div>
        <div className="absolute top-16 left-1/4 text-base md:text-lg animate-pulse delay-700">🎮</div>
        <div className="absolute bottom-16 right-6 text-sm md:text-base animate-bounce delay-900">🏮</div>
        <div className="absolute top-6 right-1/4 text-lg md:text-xl animate-pulse delay-1100">🌺</div>
        <div className="absolute bottom-20 left-1/3 text-sm md:text-base animate-bounce delay-1300">🦋</div>
        <div className="absolute top-20 right-1/3 text-base md:text-lg animate-pulse delay-1500">🌸</div>
      </div>

      {/* Border */}
      <div className="absolute inset-1 md:inset-2 border-2 md:border-4 border-amber-600 rounded-xl md:rounded-2xl opacity-20 pointer-events-none"></div>
      <div className="absolute inset-2 md:inset-3 border-1 md:border-2 border-orange-500 rounded-lg md:rounded-xl opacity-30 pointer-events-none"></div>

      {/* Background content with blur effect when modal is shown */}
      <div className={`transition-all duration-300 ${showModal ? 'blur-sm' : ''}`}>
        <div className="max-w-6xl mx-auto text-center relative z-10 px-2">
          
          {/* Header */}
          <div className="mb-4 md:mb-6 relative">
            <div className={`mb-4 ${bounceAnimation ? 'animate-bounce' : ''}`}>
              <div className="bg-gradient-to-br from-amber-300 to-orange-300 w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto flex items-center justify-center shadow-xl border-2 md:border-3 border-yellow-400 select-none pointer-events-none">
                <span className="text-4xl md:text-5xl drop-shadow-lg">🎯</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl shadow-xl border-2 md:border-3 border-yellow-400 mx-auto max-w-4xl select-none pointer-events-none">
              <h1 className="text-lg md:text-2xl lg:text-3xl font-black mb-2 drop-shadow-lg">
                PILIH TINGKATAN ANJEUN!
              </h1>
              <div className="bg-yellow-300 text-amber-800 px-2 py-1 md:px-3 md:py-1 rounded-full shadow-lg inline-block border-2 border-amber-600 font-bold text-xs md:text-sm mb-1">
                ✨ Hayang main nu gampang atawa hese? ✨
              </div>
              <div className="bg-red-300 text-amber-900 px-2 py-1 md:px-3 md:py-1 rounded-full shadow-lg inline-block border-2 border-red-500 font-bold text-xs">
                ⚠️ Kudu meunang nilai 100 pikeun muka level salajengna! ⚠️
              </div>
            </div>
          </div>

          {/* Info Siswa yang Dipilih */}
          {selectedSiswa && ( 
            <div className="mb-4 md:mb-6 bg-gradient-to-br from-amber-50 to-orange-50 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg border-2 md:border-3 border-yellow-400 mx-auto max-w-lg select-none pointer-events-none">
              <h3 className="text-base md:text-lg font-black text-amber-800 mb-2 drop-shadow-md">
                {selectedSiswa.username}
              </h3>
              <div className="bg-gradient-to-br from-yellow-200 to-amber-200 rounded-lg p-2 border-2 border-amber-400 shadow-md">
                <p className="text-amber-900 font-bold text-xs md:text-sm">
                  NIS: <span className="text-orange-800">{selectedSiswa.nis}</span> | 
                  Kelas: <span className="text-orange-800">{selectedSiswa.kelas}</span>
                </p>
              </div>
            </div>
          )}

          {loading && selectedSiswa && (
            <div className="mb-4 text-center">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg inline-block font-bold">
                <span className="animate-spin inline-block mr-2">⏳</span>
                Ngamuat data progress...
              </div>
            </div>
          )}

          {/* Level Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">

            {levels.map((level, index) => {
              const colors = [
                'from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600',
                'from-blue-500 via-cyan-500 to-sky-500 hover:from-blue-600 hover:via-cyan-600 hover:to-sky-600', 
                'from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600',
                'from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600',
                'from-red-500 via-rose-500 to-pink-500 hover:from-red-600 hover:via-rose-600 hover:to-pink-600'
              ];

              const canPlay = canPlayLevel(level.id_level, index);
              const isCompleted = isLevelCompleted(level.id_level);
              const isPerfect = isLevelPerfect(level.id_level);
              const levelStatus = getLevelStatus(level.id_level, index);
              const currentScore = levelScores[level.id_level] || 0;
              
              return (
                <button
                  key={level.id_level}
                  onClick={() => handleLevelClick(level.id_level, index)}
                  disabled={!canPlay || loading}
                  className={`
                    bg-gradient-to-br ${colors[index % colors.length]} 
                    border-2 border-yellow-400 rounded-xl md:rounded-2xl shadow-lg p-3 md:p-4 transform transition-all duration-300 text-white font-bold hover:shadow-xl group relative overflow-hidden
                    ${canPlay ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                    ${isPerfect ? 'ring-2 ring-green-400' : isCompleted ? 'ring-1 ring-yellow-400' : ''}
                  `}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-10 rounded-xl md:rounded-2xl"></div>
                  
                  {/* Status Badge di pojok kanan atas */}
                  {levelStatus.icon && (
                    <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center shadow-md border border-amber-400 z-10">
                      <span className="text-xs md:text-sm">{levelStatus.icon}</span>
                    </div>
                  )}
                  
                  <div className="relative z-10">
                    {/* Icon Bintang */}
                    <div className="bg-yellow-300 w-10 h-10 md:w-12 md:h-12 rounded-full mx-auto mb-2 flex items-center justify-center shadow-md border-2 border-amber-600 group-hover:animate-bounce">
                      <span className="text-sm md:text-base">
                        {getStarIcon(index)}
                      </span>
                    </div>
                    
                    <h2 className="text-sm md:text-base font-black mb-2 text-white drop-shadow-lg">
                      {level.nama_level}
                    </h2>
                    
                    <div className="bg-yellow-200 rounded-lg p-2 text-amber-800 shadow-md border-2 border-amber-600 mb-2">
                      <p className="text-xs font-bold mb-1">
                        🎴 Kartu: <span className="text-orange-800">{level.card_count}</span>
                      </p>
                      <p className="text-xs font-bold">
                        ⏰ Waktos: <span className="text-orange-800">{level.time_limit}s</span>
                      </p>
                    </div>
                    
                    {/* Status Level - Teks saja tanpa icon */}
                    {levelStatus.text && (
                      <div className={`${levelStatus.color} font-black text-xs drop-shadow-md mb-1`}>
                        {levelStatus.text}
                      </div>
                    )}
                    
                    {/* Peringatan untuk level yang belum sempurna */}
                    {isCompleted && !isPerfect && (
                      <div className="mt-2 bg-yellow-100 text-yellow-800 text-xs font-bold p-1 rounded border border-yellow-400 shadow-inner">
                        Kudu meunang 100!
                      </div>
                    )}
                    
                    {/* Peringatan untuk level yang terkunci */}
                    {!canPlay && index > 0 && (
                      <div className="mt-2 bg-red-100 text-red-800 text-xs font-bold p-1 rounded border border-red-400 shadow-inner">
                        Rampungkeun level saacanna!
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Back Button */}
          <div className="mt-4 md:mt-6">
            <button
              onClick={handleBackToHome}
              className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-black py-2 px-4 md:py-3 md:px-6 rounded-xl md:rounded-2xl shadow-lg border-2 border-yellow-400 hover:scale-105 transform transition-all duration-300 text-sm md:text-base hover:shadow-xl"
            >
              <span className="text-base md:text-lg mr-2">🏠</span>
              Balik ka Kaca Utama
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 bg-opacity-95 backdrop-blur-sm p-4 md:p-5 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-sm md:max-w-md border-2 md:border-3 border-amber-500 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={handleBackToHome}
              className="absolute top-2 right-2 md:top-3 md:right-3 bg-gradient-to-br from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-black w-6 h-6 md:w-8 md:h-8 rounded-full shadow-lg border-2 border-yellow-400 hover:scale-110 transform transition-all duration-300 flex items-center justify-center text-xs md:text-sm"
            >
              ✕
            </button>
            <div className="text-center mb-4 select-none pointer-events-none">
              <div className="bg-gradient-to-br from-amber-300 to-orange-300 w-14 h-14 md:w-16 md:h-16 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg border-2 border-yellow-400">
                <span className="text-2xl md:text-3xl animate-bounce">👤</span>
              </div>
              <h2 className="text-lg md:text-xl font-black text-amber-800 mb-2">
                🌟 PILIH MURID 🌟
              </h2>
              <div className="w-16 h-1 md:w-20 md:h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mb-2"></div>
              <p className="text-amber-900 font-bold text-xs md:text-sm">Teken NIS atanapi Ngaran pikeun milarian</p>
            </div>
            
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 md:p-3 border-2 border-amber-400 rounded-lg md:rounded-xl mb-3 text-center text-amber-800 font-bold focus:outline-none focus:border-orange-500 shadow-md text-sm md:text-base bg-gradient-to-br from-yellow-50 to-amber-50"
              placeholder="Conto: 1234 atawa Andi"
            />
            
            {searchTerm.trim().length >= 2 && (
              <div className="mb-3">
                {siswaList.length > 0 ? (
                  <ul className="bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-400 rounded-lg md:rounded-xl max-h-32 overflow-y-auto shadow-lg">
                    {siswaList.map((siswa) => (
                      <li
                        key={siswa.id_siswa}
                        className="px-3 py-2 cursor-pointer hover:bg-gradient-to-r hover:from-amber-200 hover:to-orange-200 border-b border-amber-200 last:border-b-0 transition-all duration-300"
                        onClick={() => handleSelectSiswa(siswa)}
                      >
                        <div className="font-black text-amber-800 text-sm">{siswa.username}</div>
                        <div className="text-orange-700 font-bold text-xs">NIS: {siswa.nis} | Kelas: {siswa.kelas}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-400 rounded-lg md:rounded-xl p-3 text-center text-amber-800 font-bold text-sm shadow-lg">
                    Teu aya murid nu kapanggih
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-gradient-to-br from-yellow-200 to-amber-200 rounded-lg md:rounded-xl p-2 md:p-3 border-2 border-amber-400 shadow-md">
              <p className="text-amber-900 font-bold text-center text-xs md:text-sm">
                {searchTerm.trim().length < 2 
                  ? "Teken sahenteuna 2 huruf pikeun milarian 🔍" 
                  : "Klik kana ngaran murid pikeun milih 👆"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Moving Background Elements */}
      <div className="fixed bottom-0 left-0 w-full h-12 md:h-16 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-6 md:h-8 bg-gradient-to-t from-amber-200 to-transparent opacity-30"></div>
        <div className="absolute bottom-1 left-4 text-sm md:text-base animate-bounce delay-200">🌸</div>
        <div className="absolute bottom-3 left-1/4 text-xs md:text-sm animate-pulse delay-400">🦋</div>
        <div className="absolute bottom-0 right-1/3 text-sm md:text-base animate-bounce delay-600">🌺</div>
        <div className="absolute bottom-2 right-4 text-xs md:text-sm animate-pulse delay-800">🌷</div>
        <div className="absolute bottom-4 left-1/2 text-xs md:text-sm animate-bounce delay-1000">🏮</div>
      </div>

      {/* Corner Ornaments */}
      <div className="absolute top-2 left-2 text-base md:text-lg opacity-30 animate-pulse select-none pointer-events-none">🌺</div>
      <div className="absolute top-2 right-2 text-base md:text-lg opacity-30 animate-pulse select-none pointer-events-none">🌺</div>
      <div className="absolute bottom-2 left-2 text-base md:text-lg opacity-30 animate-pulse select-none pointer-events-none">🌺</div>
      <div className="absolute bottom-2 right-2 text-base md:text-lg opacity-30 animate-pulse select-none pointer-events-none">🌺</div>
    </div>
  );
};

export default SelectDifficulty;