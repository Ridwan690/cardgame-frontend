import React, { useEffect, useState } from "react";
import API from "../../api";
import Sidebar from "../../components/admin/Sidebar";

export default function ManageLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);


  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get("/leaderboard");
      
      // Ngurutkeun data sarua jeung komponen Leaderboard
      const sorted = (response.data || []).sort((a, b) => {
        // Urutan kahiji: Skor pangluhurna heula
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        
        // Urutan kadua: Lamun skor sarua, durasi pangancikna (ASC)
        const durationA = a.duration || 0;
        const durationB = b.duration || 0;
        return durationA - durationB;
      });
      
      setLeaderboard(sorted);
    } catch (error) {
      console.error("Gagal nyokot data papan juara", error);
      setError("Gagal nyokot data papan juara. Mangga cobaan deui.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setSelectedEntryId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEntryId) return;
    
    try {
      setDeleteLoading(true);

      const token = localStorage.getItem("adminToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      await API.delete(`/leaderboard/${selectedEntryId}`, config);
      await fetchLeaderboard();
      setShowDeleteModal(false);
      setSelectedEntryId(null);
      alert("Data hasil dihapus!");
    } catch (error) {
      console.error("Gagal ngahapus data papan juara", error);
      alert("Gagal ngahapus data. Mangga cobaan deui.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = async () => {
    try {
      setResetLoading(true);
      
      const token = localStorage.getItem("adminToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      await API.delete("/leaderboard/reset", config);
      await fetchLeaderboard();
      setShowResetModal(false);
      alert("Papan juara hasil direset!");
    } catch (error) {
      console.error("Gagal ngareset papan juara", error);
      alert("Gagal ngareset papan juara. Mangga cobaan deui.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchLeaderboard();
  };

  // Fungsi format durasi
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar active="kelola-leaderboard" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center pointer-events-none select-none">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Ngamuat data papan juara...</p>
          </div>
        </div>
      </div>
    );
  }

  const DeleteModal = () => (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Konfirmasi Hapus Data
        </h3>
        <p className="text-gray-600 mb-6">
          Yakin rék ngahapus data ieu?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedEntryId(null);
            }}
            className="px-4 py-2 text-white font-medium"
            disabled={deleteLoading}
          >
            Batal
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={deleteLoading}
            className="px-4 py-2 bg-red-500 hover:text-white text-red-600 rounded font-medium disabled:opacity-50"
          >
            {deleteLoading ? "Ngahapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );

  const ResetModal = () => (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Konfirmasi Reset Papan Juara
        </h3>
        <p className="text-gray-600 mb-6">
          Yakin rék mupus sadaya data leaderboard? Tindakan ieu teu tiasa dibalikeun deui!
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowResetModal(false)}
            className="px-4 py-2 text-white font-medium"
            disabled={resetLoading}
          >
            Batal
          </button>
          <button
            onClick={handleConfirmReset}
            disabled={resetLoading}
            className="px-4 py-2 bg-red-500 hover:text-white text-red-500 rounded font-medium disabled:opacity-50"
          >
            {resetLoading ? "Ngareset..." : "Reset"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar active="kelola-leaderboard" />
      <div className="flex-1 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
          <div className="pointer-events-none select-none">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Ngatur Papan Juara</h1>
            <p className="text-gray-600 mt-1">Ngatur sareng ngawas peringkat murid</p>
            <p className="text-sm text-blue-600 mt-1">Diurutkeun dumasar: Skor Pangluhurna → Waktos panggancangna</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRefresh}
              disabled={actionLoading}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Nyegerkeun
            </button>
            <button
              onClick={handleReset}
              disabled={actionLoading || leaderboard.length === 0}
              className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {actionLoading === 'reset' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              Reset Papan Juara
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200 pointer-events-none select-none">
            <h2 className="text-lg font-semibold text-gray-800">
              Data Papan Juara ({leaderboard.length} éntri)
            </h2>
          </div>
          
          {/* Tataletak Kartu Mobile */}
          <div className="block lg:hidden">
            {leaderboard.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {leaderboard.map((entry, index) => (
                  <div key={entry.id_leaderboard} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                          #{index + 1}
                        </span>
                        
                      </div>
                      <button
                        onClick={() => handleDelete(entry.id_leaderboard)}
                        disabled={actionLoading === entry.id_leaderboard}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-1 rounded text-sm"
                      >
                        {actionLoading === entry.id_leaderboard ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          "Hapus"
                        )}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-sm pointer-events-none select-none">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tingkat:</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs text-black">
                          {entry.level?.nama_level || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Skor:</span>
                        <span className="font-semibold text-green-600">
                          {entry.score ? entry.score.toLocaleString() : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Waktu:</span>
                        <span className="font-mono text-blue-600">
                          {formatDuration(entry.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-lg font-medium mb-1">Tacan aya data papan juara</p>
                  <p className="text-sm">Data bakal némbongan nalika murid mimiti ngabéréskeun tingkat</p>
                </div>
              </div>
            )}
          </div>

          {/* Tataletak Tabel Desktop */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto overflow-y-auto max-h-120 border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50 sticky top-0 z-10 pointer-events-none select-none">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Peringkat</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Nami Murid</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Tingkat</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Skor</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Waktu</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((entry, index) => (
                      <tr key={entry.id_leaderboard} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm pointer-events-none select-none">
                          <div className="flex items-center">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                              #{index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap pointer-events-none select-none">
                          <div className="text-sm font-medium text-gray-900">
                            {entry.LeaderboardSiswa?.username || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap pointer-events-none select-none">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {entry.level?.nama_level || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 pointer-events-none select-none">
                          <span className="font-semibold text-green-600">
                            {entry.score ? entry.score.toLocaleString() : 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 pointer-events-none select-none">
                          <span className="font-mono text-blue-600">
                            {formatDuration(entry.duration)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDelete(entry.id_leaderboard)}
                            disabled={actionLoading === entry.id_leaderboard}
                            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center gap-1"
                          >
                            {actionLoading === entry.id_leaderboard ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            ) : (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center pointer-events-none select-none">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="text-lg font-medium mb-1">Tacan aya data papan juara</p>
                          <p className="text-sm">Data bakal némbongan nalika murid mimiti ngabéréskeun tingkat</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && <DeleteModal />}
      {/* Modal Konfirmasi Reset */}
      {showResetModal && <ResetModal />}
    </div>
  );
}