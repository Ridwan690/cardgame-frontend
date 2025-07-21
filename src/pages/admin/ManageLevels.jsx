import React, { useState, useEffect } from "react";
import API from "../../api";
import Sidebar from "../../components/admin/Sidebar";
import Modal from "../../components/Modal";

export default function ManageLevels() {
  const [levels, setLevels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_level: "",
    time_limit: "",
    card_count: "",
  });

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/levels");
      setLevels(res.data);
    } catch (err) {
      console.error("Gagal memuat level", err);
      setError("Teu bisa ngamuat data level. Coba deui wae.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setActionLoading('submit');
      const payload = {
        nama_level: formData.nama_level.trim(),
        card_count: parseInt(formData.card_count),
        time_limit: parseInt(formData.time_limit),
      };

      const token = localStorage.getItem("adminToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (editId) {
        await API.put(`/levels/${editId}`, payload, config);
        alert("Level geus hasil dirobah!");
      } else {
        await API.post("/levels", payload, config);
        alert("Level geus hasil ditambah!");
      }

      setIsModalOpen(false);
      setFormData({ nama_level: "", card_count: "", time_limit: "" });
      setEditId(null);
      await fetchLevels();
    } catch (err) {
      console.error("Gagal menyimpan level", err);
      alert("Teu bisa nyimpen level. Coba deui wae.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (level) => {
    setEditId(level.id_level);
    setFormData({
      nama_level: level.nama_level,
      card_count: Number(level.card_count),
      time_limit: Number(level.time_limit),
    });
    setIsModalOpen(true);
  };

  // Fungsi baru untuk menampilkan modal konfirmasi hapus
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Fungsi baru untuk menangani hapus setelah konfirmasi
  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("adminToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      await API.delete(`/levels/${deleteId}`, config);
      alert("Level geus hasil dihapus!");
      await fetchLevels();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error("Gagal menghapus level", err);
      alert("Teu bisa ngahapus level. Coba deui wae.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Hapus fungsi handleDelete yang lama
  const handleRefresh = () => {
    fetchLevels();
  };

  // Komponen modal konfirmasi hapus
  const DeleteModal = () => (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Konfirmasi Hapus Level
        </h3>
        <p className="text-gray-600 mb-6">
          Apakah Anda yakin ingin menghapus level ini? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 text-white font-medium"
            disabled={deleteLoading}
          >
            Batal
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={deleteLoading}
            className="px-4 py-2 bg-red-500 text-red-500 hover:text-white rounded hover:bg-red-600 font-medium disabled:opacity-50"
          >
            {deleteLoading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar active="kelola-level" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 pointer-events-none select-none">Keur ngamuat data level...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar active="kelola-level" />
      
      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="pointer-events-none select-none">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Ngatur Level</h1>
            <p className="text-sm sm:text-base text-gray-600">Ngatur tingkat sesah ulin</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleRefresh}
              disabled={actionLoading}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 text-sm sm:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => {
                setIsModalOpen(true);
                setEditId(null);
                setFormData({ nama_level: "", time_limit: "", card_count: "" });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 text-sm sm:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden xs:inline">Tambah Level</span>
              <span className="xs:hidden">Tambah</span>
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm sm:text-base">{error}</span>
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

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 pointer-events-none select-none">
            <h2 className="text-lg font-semibold text-gray-800">
              Data Level ({levels.length} level)
            </h2>
          </div>
          
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            {levels.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500 pointer-events-none select-none">
                  <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium mb-1">Can taya level</p>
                  <p className="text-sm">Mimiti ku nambah level kahiji</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {levels.map((level, index) => (
                  <div key={level.id_level} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{index + 1}</span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">{level.nama_level}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {level.time_limit}s
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            {level.card_count} kartu
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(level)}
                        disabled={actionLoading}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white px-3 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-1 text-sm"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Robah
                      </button>
                      <button
                        onClick={() => handleDeleteClick(level.id_level)}
                        disabled={actionLoading}
                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-1 text-sm"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto overflow-y-auto max-h-96">
            <table className="w-full min-w-full">
              <thead className="bg-blue-50 sticky top-0 z-10 pointer-events-none select-none">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">#</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Ngaran Level</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Waktu (detik)</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Jumlah Kartu</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {levels.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 pointer-events-none select-none">
                        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium mb-1">Can taya level</p>
                        <p className="text-sm">Mimiti ku nambah level kahiji</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  levels.map((level, index) => (
                    <tr key={level.id_level} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 pointer-events-none select-none">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap pointer-events-none select-none">
                        <div className="text-sm font-medium text-gray-900">
                          {level.nama_level}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 pointer-events-none select-none">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {level.time_limit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 pointer-events-none select-none">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          {level.card_count}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(level)}
                            disabled={actionLoading}
                            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden lg:inline">Robah</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(level.id_level)}
                            disabled={actionLoading}
                            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-2 rounded-md transition-colors duration-200 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden lg:inline">Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <Modal 
          onClose={() => setIsModalOpen(false)}
          title={editId ? "Édit Level" : "Tambah Level"}
          size="md"
        >
          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 font-medium text-gray-700 text-sm sm:text-base">
                  Ngaran Level <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_level"
                  value={formData.nama_level}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm sm:text-base"
                  placeholder="Conto: Level 1 - Pemula"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700 text-sm sm:text-base">
                  Waktu (detik) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="time_limit"
                  value={formData.time_limit}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm sm:text-base"
                  placeholder="60"
                  min="10"
                  max="300"
                  required
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Waktu anu dibéré pikeun réngsé level (10-300 detik)</p>
              </div>
              
              <div>
                <label className="block mb-2 font-medium text-gray-700 text-sm sm:text-base">
                  Jumlah Kartu <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="card_count"
                  value={formData.card_count}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm sm:text-base"
                  placeholder="10"
                  min="4"
                  max="50"
                  required
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Jumlah kartu anu bakal dimaénkeun (4-50 kartu)</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={actionLoading}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm sm:text-base"
                >
                  {actionLoading === 'submit' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Simpen
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && <DeleteModal />}
    </div>
  );
}