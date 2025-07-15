import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MusicControls from "../components/MusicControls";

const Home = () => {
  const [showCreator, setShowCreator] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [bounceAnimation, setBounceAnimation] = useState(false);
  
  // Animasi bounce saat component dimuat
  useEffect(() => {
    setBounceAnimation(true);
    const timer = setTimeout(() => setBounceAnimation(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const closeModal = () => {
    setShowCreator(false);
    setShowGuide(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 p-2 md:p-4 relative overflow-hidden">
      <MusicControls />
      
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
     <div className="absolute inset-0 pointer-events-none z-[1]">
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

      {/* Admin Login Button */}
     <div className="fixed top-2 right-2 md:top-4 md:right-4 z-[9999]">
        <Link
          to="/admin-login"
          className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold text-xs py-2 px-3 md:py-3 md:px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-yellow-300 hover:scale-105 transform active:scale-95 touch-manipulation block"
          style={{ minWidth: '60px', minHeight: '32px' }}
        >
          🔐 Admin
        </Link>
      </div>

      {/* Background content */}
      <div className={`transition-all duration-300 ${(showCreator || showGuide) ? 'blur-sm' : ''}`}>
        <div className="max-w-4xl mx-auto text-center relative z-10 px-2">
          
          {/* Header */}
          <div className="mb-6 md:mb-8 relative">

            <div className={`mb-6 ${bounceAnimation ? 'animate-bounce' : ''}`}>
              <div className="bg-gradient-to-br from-amber-300 to-orange-300 w-32 h-32 rounded-full mx-auto flex items-center justify-center shadow-2xl border-4 border-yellow-400 select-none pointer-events-none">
                <span className="text-7xl drop-shadow-lg">🎮</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl shadow-xl border-2 md:border-4 border-yellow-400  select-none pointer-events-none">
              <h1 className="text-xl md:text-3xl lg:text-4xl font-black mb-2 drop-shadow-lg">
                🎯 KARTU MEMORI SUNDA 🎯
              </h1>
              <div className="bg-yellow-300 text-amber-800 px-3 py-2 md:px-4 md:py-2 rounded-full shadow-lg inline-block border-2 border-amber-600 font-bold text-sm md:text-base">
                ✨ Hayu Diajar Basa Sunda Bari Ulin! ✨
              </div>
            </div>

          </div>

          {/* Main Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8 max-w-3xl mx-auto">
            <Link
              to="/select-difficulty"
              className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 border-2 md:border-4 border-yellow-400 rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 hover:scale-105 transform transition-all duration-300 text-white font-bold hover:shadow-2xl group relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 opacity-20 rounded-2xl md:rounded-3xl"></div>
              
              <div className="relative z-10">
                <div className="bg-yellow-300 w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg border-2 border-green-600 group-hover:animate-bounce">
                  <span className="text-2xl md:text-3xl">🚀</span>
                </div>
                <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 text-white drop-shadow-lg">
                  🌟 MIMITIAN MAÉN 🌟
                </h2>
                <div className="bg-yellow-200 rounded-xl p-2 md:p-3 text-green-800 shadow-lg border-2 border-green-600">
                  <p className="text-sm md:text-base font-bold">
                    🎯 Pilih tingkat kasusahna heula! 🎯
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/leaderboard"
              className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 border-2 md:border-4 border-yellow-400 rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 hover:scale-105 transform transition-all duration-300 text-white font-bold hover:shadow-2xl group relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 opacity-20 rounded-2xl md:rounded-3xl"></div>
              
              <div className="relative z-10">
                <div className="bg-yellow-300 w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg border-2 border-purple-600 group-hover:animate-bounce">
                  <span className="text-2xl md:text-3xl">🏆</span>
                </div>
                <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 text-white drop-shadow-lg">
                  🎖️ PERINGKAT 🎖️
                </h2>
                <div className="bg-yellow-200 rounded-xl p-2 md:p-3 text-purple-800 shadow-lg border-2 border-purple-600">
                  <p className="text-sm md:text-base font-bold">
                    ⭐ Tingali skor nu pangluhurna! ⭐
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Info Buttons*/}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 md:mb-8 max-w-2xl mx-auto ">
            <button
              onClick={() => setShowCreator(true)}
              className="bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500 hover:from-blue-600 hover:via-cyan-600 hover:to-sky-600 border-2 md:border-4 border-yellow-400 rounded-2xl md:rounded-3xl shadow-xl p-3 md:p-4 hover:scale-105 transform transition-all duration-300 text-white font-bold hover:shadow-2xl group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 opacity-20 rounded-2xl md:rounded-3xl"></div>
              
              <div className="relative z-10">
                <div className="bg-yellow-300 w-10 h-10 md:w-12 md:h-12 rounded-full mx-auto mb-2 flex items-center justify-center shadow-lg border-2 border-blue-600 group-hover:animate-spin">
                  <span className="text-xl md:text-2xl">👨‍💻</span>
                </div>
                <h3 className="text-sm md:text-base font-black text-white mb-1 md:mb-2 drop-shadow-lg">
                  📝 INPO NU NYIEUN 📝
                </h3>
                <div className="bg-yellow-200 rounded-lg p-2 text-blue-800 shadow-lg border-2 border-blue-600">
                  <p className="text-xs md:text-sm font-bold">🌟 Ngeunaan nu nyieunna 🌟</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowGuide(true)}
              className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 border-2 md:border-4 border-red-400 rounded-2xl md:rounded-3xl shadow-xl p-3 md:p-4 hover:scale-105 transform transition-all duration-300 text-white font-bold hover:shadow-2xl group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-400 opacity-20 rounded-2xl md:rounded-3xl"></div>
              
              <div className="relative z-10">
                <div className="bg-red-300 w-10 h-10 md:w-12 md:h-12 rounded-full mx-auto mb-2 flex items-center justify-center shadow-lg border-2 border-orange-600 group-hover:animate-pulse">
                  <span className="text-xl md:text-2xl">❓</span>
                </div>
                <h3 className="text-sm md:text-base font-black text-white mb-1 md:mb-2 drop-shadow-lg">
                  🎯 KUMAHA MAÉNNA 🎯
                </h3>
                <div className="bg-red-200 rounded-lg p-2 text-orange-800 shadow-lg border-2 border-orange-600">
                  <p className="text-xs md:text-sm font-bold">📚 Pituduh lengkep 📚</p>
                </div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="relative">
            <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl shadow-xl border-2 md:border-4 border-yellow-400 mx-auto max-w-2xl">
              <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 select-none pointer-events-none">
                <span className="text-lg md:text-xl">🌟</span>
                <p className="text-white font-black text-sm md:text-base">
                  KAULINAN EDUKATIF KEUR BARUDAK CALAKAN!
                </p>
                <span className="text-lg md:text-xl">🌟</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Modal */}
      {showCreator && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 bg-opacity-90 backdrop-blur-sm p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-md md:max-w-lg border-2 md:border-4 border-amber-500 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full flex items-center justify-center transition-all duration-200 text-lg md:text-xl font-bold hover:scale-110 shadow-lg border-2 border-white"
            >
              ×
            </button>
            
            <div className="text-center mb-4 md:mb-6 select-none pointer-events-none">
              <div className="bg-gradient-to-br from-amber-300 to-orange-300 w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-3 flex items-center justify-center shadow-xl border-2 md:border-4 border-yellow-400">
                <span className="text-3xl md:text-4xl animate-bounce">👨‍💻</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-amber-800 mb-3 ">
                🌟 INPO NU NYIEUN 🌟
              </h2>
              <div className="w-20 h-2 md:w-24 md:h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto"></div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-200 to-orange-200 rounded-2xl p-4 md:p-6 border-2 md:border-4 border-amber-400 shadow-xl">
              <div className="space-y-3 md:space-y-4 text-amber-900 select-none pointer-events-none">
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-lg border-2 border-amber-300">
                  <div className="bg-amber-300 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center">
                    <span className="text-lg md:text-xl">👤</span>
                  </div>
                  <div>
                    <span className="font-black text-amber-900 text-sm md:text-base">Nama:</span>
                    <span className="ml-2 font-bold text-sm md:text-base">Ridwan Nurhakim</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-lg border-2 border-amber-300">
                  <div className="bg-orange-300 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center">
                    <span className="text-lg md:text-xl">👨‍🏫</span>
                  </div>
                  <div>
                    <span className="font-black text-amber-900 text-sm md:text-base">Dosen Nu Nuntun:</span>
                    <span className="ml-2 font-bold text-sm md:text-base">Dini Rohmayani M.Kom</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-lg border-2 border-amber-300">
                  <div className="bg-yellow-300 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center">
                    <span className="text-lg md:text-xl">🎓</span>
                  </div>
                  <div>
                    <span className="font-black text-amber-900 text-sm md:text-base">Jurusan:</span>
                    <span className="ml-2 font-bold text-sm md:text-base">Teknik Informatika</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-lg border-2 border-amber-300">
                  <div className="bg-red-300 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center">
                    <span className="text-lg md:text-xl">📅</span>
                  </div>
                  <div>
                    <span className="font-black text-amber-900 text-sm md:text-base">Taun:</span>
                    <span className="ml-2 font-bold text-sm md:text-base">2025</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-lg border-2 border-amber-300">
                  <div className="bg-blue-300 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center">
                    <span className="text-lg md:text-xl">🏫</span>
                  </div>
                  <div>
                    <span className="font-black text-amber-900 text-sm md:text-base">Kampus:</span>
                    <span className="ml-2 font-bold text-sm md:text-base">Politeknik TEDC Bandung</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 bg-opacity-90 backdrop-blur-sm p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-md md:max-w-lg border-2 md:border-4 border-orange-500 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full flex items-center justify-center transition-all duration-200 text-lg md:text-xl font-bold hover:scale-110 shadow-lg border-2 border-white"
            >
              ×
            </button>
            
            <div className="text-center mb-4 md:mb-6 select-none pointer-events-none">
              <div className="bg-gradient-to-br from-orange-300 to-amber-300 w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-3 flex items-center justify-center shadow-xl border-2 md:border-4 border-yellow-400">
                <span className="text-3xl md:text-4xl animate-pulse">❓</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-orange-800 mb-3">
                🎯 KUMAHA MAÉNNA 🎯
              </h2>
              <div className="w-20 h-2 md:w-24 md:h-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mx-auto"></div>
            </div>
            
            <div className="space-y-3 select-none pointer-events-none">
              {[
                { icon: "1️⃣", text: "Lebetkeun heula ngaran anjeun", color: "from-red-300 to-pink-300" },
                { icon: "2️⃣", text: "Pilih tingkat kasusahna", color: "from-orange-300 to-amber-300" },
                { icon: "3️⃣", text: "Pasangkeun kartu nu sarua sabisa-bisana", color: "from-yellow-300 to-orange-300" },
                { icon: "4️⃣", text: "Beuki gancang, beuki luhur skor anjeun!", color: "from-green-300 to-emerald-300" },
                { icon: "🏆", text: "Skor anjeun bakal kacatet dina papan peringkat", color: "from-purple-300 to-pink-300" }
              ].map((step, index) => (
                <div key={index} className={`bg-gradient-to-br ${step.color} rounded-xl p-3 md:p-4 shadow-lg border-2 border-orange-400 hover:scale-105 transform transition-all duration-300`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-lg md:text-xl">{step.icon}</span>
                    </div>
                    <p className="text-orange-900 font-black text-sm md:text-base leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/*  Moving Background Elements */}
      <div className="fixed bottom-0 left-0 w-full h-16 md:h-20 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-8 md:h-12 bg-gradient-to-t from-amber-200 to-transparent opacity-40"></div>
        <div className="absolute bottom-2 left-6 text-lg md:text-xl animate-bounce delay-200">🌸</div>
        <div className="absolute bottom-4 left-1/4 text-base md:text-lg animate-pulse delay-400">🦋</div>
        <div className="absolute bottom-1 right-1/3 text-lg md:text-xl animate-bounce delay-600">🌺</div>
        <div className="absolute bottom-3 right-6 text-base md:text-lg animate-pulse delay-800">🌷</div>
        <div className="absolute bottom-5 left-1/2 text-base md:text-lg animate-bounce delay-1000">🏮</div>
      </div>

      {/* Corner Ornaments */}
      <div className="absolute top-4 left-4 text-xl md:text-2xl opacity-30 animate-pulse select-none pointer-events-none z-[1]">🌺</div>
      <div className="absolute top-4 right-16 md:right-20 text-xl md:text-2xl opacity-30 animate-pulse select-none pointer-events-none z-[1]">🌺</div>
      <div className="absolute bottom-4 left-4 text-xl md:text-2xl opacity-30 animate-pulse select-none pointer-events-none z-[1]">🌺</div>
      <div className="absolute bottom-4 right-4 text-xl md:text-2xl opacity-30 animate-pulse select-none pointer-events-none z-[1]">🌺</div>
    </div>
  );
};

export default Home;