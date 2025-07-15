import React, { useEffect, useState } from "react";
import API from "../../api";
import Sidebar from "../../components/admin/Sidebar";

export default function DashboardHome() {
  const [totalKosakata, setTotalKosakata] = useState(0);
  const [totalPemain, setTotalPemain] = useState(0);
  const [scoreTertinggi, setScoreTertinggi] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [wordsRes, siswaRes, leaderboardRes, activitiesRes] = await Promise.all([
        API.get("/words"),
        API.get("/siswa"),
        API.get("/leaderboard"),
        API.get("/activity"),
      ]);

      setTotalKosakata(wordsRes.data.length);
      setTotalPemain(siswaRes.data.length);
      setRecentActivities(activitiesRes.data);

      const skor = leaderboardRes.data.map((l) => l.score);
      setScoreTertinggi(skor.length > 0 ? Math.max(...skor) : 0);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
      setError("Gagal muka data dasbor");
    } finally {
      setLoading(false);
    }
  };

  const handleResetActivities = async () => {
    try {
      setResetLoading(true);
      await API.delete("/activity/reset");
      
      // Refresh data setelah reset
      await fetchDashboardData();
      
      setShowResetModal(false);
      // Opsional: tambahkan notifikasi sukses
      alert("Data kagiatan berhasil direset");
    } catch (error) {
      console.error("Error resetting activities:", error);
      alert("Gagal mereset data kagiatan");
    } finally {
      setResetLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = "blue" }) => {
    const colorClasses = {
      blue: "border-blue-500 text-blue-700",
      green: "border-green-500 text-green-700",
      yellow: "border-yellow-500 text-yellow-700",
    };

    const iconColor = {
      blue: "text-blue-500",
      green: "text-green-500",
      yellow: "text-yellow-500",
    };

    return (
      <div className={`bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{title}</h2>
            <div className={`text-2xl sm:text-3xl font-bold ${colorClasses[color]}`}>
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-6 sm:h-8 w-12 sm:w-16 rounded"></div>
              ) : (
                value.toLocaleString()
              )}
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl lg:text-4xl ${iconColor[color]} opacity-80 ml-2`}>
            {icon}
          </div>
        </div>
      </div>
    );
  };

  // Modal Konfirmasi Reset
  const ResetModal = () => (
    <div className="fixed inset-0 bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Konfirmasi Reset Data
        </h3>
        <p className="text-gray-600 mb-6">
          Apakah Anda yakin ingin mereset semua data kagiatan? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowResetModal(false)}
            className="px-4 py-2 hover:text-w font-medium text-white"
            disabled={resetLoading}
          >
            Batal
          </button>
          <button
            onClick={handleResetActivities}
            disabled={resetLoading}
            className="px-4 py-2 bg-red-500 text-red-500 hover:text-white rounded hover:bg-red-600 font-medium disabled:opacity-50"
          >
            {resetLoading ? "Mereset..." : "Reset"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar active="dashboard" />

      <div className="flex-1 md:ml-0">
        <div className="p-3 sm:p-4 md:p-6 pt-16 sm:pt-20 md:pt-6">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8 pointer-events-none select-none">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dasbor</h1>
            <p className="text-sm sm:text-base text-gray-600">Wilujeng sumping di panel admin</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg mb-4 sm:mb-6">
              <div className="flex items-center flex-wrap sm:flex-nowrap">
                <span className="text-red-500 mr-2 flex-shrink-0">⚠️</span>
                <span className="flex-1 text-sm sm:text-base">{error}</span>
                <button
                  onClick={fetchDashboardData}
                  className="mt-2 sm:mt-0 sm:ml-auto text-red-600 hover:text-red-800 font-medium text-sm sm:text-base"
                >
                  Cobian Deui
                </button>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 pointer-events-none select-none">
            <StatCard title="Jumlah Kécap" value={totalKosakata} icon="📚" color="blue" />
            <StatCard title="Jumlah Murid" value={totalPemain} icon="👥" color="green" />
            <div className="sm:col-span-2 lg:col-span-1">
              <StatCard title="Nilai Pangluhurna" value={scoreTertinggi} icon="🏆" color="yellow" />
            </div>
          </div>

          {/* Recent Activities Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pointer-events-none select-none">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md lg:col-span-1">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Kagiatan Panganyarna
                </h3>
                <button
                  onClick={() => setShowResetModal(true)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors pointer-events-auto"
                  disabled={loading || resetLoading}
                >
                  Reset Data
                </button>
              </div>
              <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3">
                      <div className="bg-gray-200 h-6 w-6 sm:h-8 sm:w-8 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-200 h-3 sm:h-4 w-3/4 rounded mb-1"></div>
                        <div className="bg-gray-200 h-2 sm:h-3 w-1/2 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                        {activity.siswa?.username} maén dina tingkat {activity.level?.nama_level}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Nilai: {activity.score} • {new Date(activity.play_date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">
                    Henteu aya kagiatan panganyarna
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Reset */}
      {showResetModal && <ResetModal />}
    </div>
  );
}