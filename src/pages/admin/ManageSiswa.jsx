import React, { useState, useEffect } from "react";
import API from "../../api";
import Sidebar from "../../components/admin/Sidebar";

const ManageSiswa = () => {
  const [siswaList, setSiswaList] = useState([]);
  const [form, setForm] = useState({ username: "", nis: "", kelas: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedSiswaId, setSelectedSiswaId] = useState(null);

  const fetchSiswa = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/siswa");
      setSiswaList(res.data);
    } catch (err) {
      console.error("Gagal ngamuat data siswa", err);
      setError("Gagal ngamuat data siswa. Punten coba deui.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiswa();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Debug log untuk melihat form state saat submit
    console.log("Form state saat submit:", form);
    console.log("Form types:", {
      username: typeof form.username,
      nis: typeof form.nis,
      kelas: typeof form.kelas
    });
    
    // Validasi form dengan pengecekan yang lebih aman
    if (!form.username || !form.nis || !form.kelas) {
      alert("Sadaya kolom kedah dieusian!");
      return;
    }

    // Pastikan semua field adalah string sebelum memanggil trim()
    const username = (form.username || '').toString().trim();
    const nis = (form.nis || '').toString().trim();
    const kelas = (form.kelas || '').toString().trim();

    // Validasi setelah trim
    if (!username || !nis || !kelas) {
      alert("Sadaya kolom kedah dieusian!");
      return;
    }

    try {
      setActionLoading('submit');

      const token = localStorage.getItem("adminToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const payload = {
        username,
        nis,
        kelas
      };

      if (editId) {
        await API.put(`/siswa/${editId}`, payload, config);
        alert("Data siswa geus hasil dirobah!");
        setEditId(null);
      } else {
        await API.post("/siswa", payload, config);
        alert("Data siswa geus hasil ditambah!");
      }

      await fetchSiswa();
      setForm({ username: "", nis: "", kelas: "" });
      setShowForm(false);
    } catch (err) {
      console.error("Gagal nyimpen data siswa", err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Gagal nyimpen data siswa. Punten coba deui.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (siswa) => {
    console.log("Data siswa yang akan diedit:", siswa); // Debug log
    
    setEditId(siswa.id_siswa);
    setForm({
      username: siswa.username || "", // Fallback ke string kosong
      nis: siswa.nis || "",
      kelas: siswa.kelas || ""
    });
    
    // Debug log untuk melihat form state
    console.log("Form state setelah set:", {
      username: siswa.username,
      nis: siswa.nis,
      kelas: siswa.kelas
    });
    
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm({ username: "", nis: "", kelas: "" });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setSelectedSiswaId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSiswaId) return;
    
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("adminToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await API.delete(`/siswa/${selectedSiswaId}`, config);
      alert("Data siswa geus hasil dihapus!");
      await fetchSiswa();
      setShowDeleteModal(false);
      setSelectedSiswaId(null);
    } catch (err) {
      console.error("Gagal ngahapus data siswa", err);
      alert("Gagal ngahapus data siswa. Punten coba deui.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSiswa();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Keur ngamuat data siswa...</p>
        </div>
      </div>
    );
  }

  const DeleteModal = () => (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Konfirmasi Hapus Siswa
        </h3>
        <p className="text-gray-600 mb-6">
          Yakin rék ngahapus data siswa ieu? Kalakuan ieu teu tiasa dibatalkeun.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedSiswaId(null);
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      <Sidebar activePage="kelola-siswa" />
      
      <div className="flex-1 p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 lg:mb-6 gap-3">
          <div className="pointer-events-none select-none">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Ngatur Siswa</h1>
            <p className="text-sm sm:text-base text-gray-600">Ngatur data siswa dina sistem</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 text-sm sm:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Tambah</span>
              <span className="sm:hidden">Tambah Siswa</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={actionLoading}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 lg:mb-6 flex items-center justify-between">
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

        {/* Form - Only show on desktop or when mobile form is toggled */}
        {(showForm || window.innerWidth >= 1024) && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 lg:mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 pointer-events-none select-none">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                  {editId ? "Édit Data Siswa" : "Tambah Data Siswa"}
                </h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700 pointer-events-none select-none text-sm sm:text-base">
                    Nami <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Lebet nami siswa"
                    value={form.username || ""} // Fallback ke string kosong
                    onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm sm:text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700 pointer-events-none select-none text-sm sm:text-base">
                    NIS <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Lebet NIS"
                    value={form.nis || ""} // Fallback ke string kosong
                    onChange={(e) => setForm(prev => ({ ...prev, nis: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm sm:text-base"
                    required
                  />
                </div>
                
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block mb-2 font-medium text-gray-700 pointer-events-none select-none text-sm sm:text-base">
                    Kelas <span className="text-red-500">*</span>
                  </label>
                    <input
                      type="text"
                      placeholder="Lebet kelas"
                      value={form.kelas || ""} // Fallback ke string kosong
                      onChange={(e) => setForm(prev => ({ ...prev, kelas: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm sm:text-base"
                      required
                    />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {editId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={actionLoading === 'submit'}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {actionLoading === 'submit' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  )}
                  {editId ? "Robah" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 pointer-events-none select-none">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">
              Data Siswa ({siswaList.length} siswa)
            </h2>
          </div>
          
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            {siswaList.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500 pointer-events-none select-none">
                  <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-lg font-medium mb-1">Teu aya data siswa</p>
                  <p className="text-sm">Mimitian ku nambah data siswa anu heula</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {siswaList.map((siswa, index) => (
                  <div key={siswa.id_siswa} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">#{index + 1}</span>
                          <h3 className="font-medium text-gray-900">{siswa.username}</h3>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">NIS:</span> {siswa.nis}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 font-medium">Kelas:</span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {siswa.kelas}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(siswa)}
                          disabled={actionLoading}
                          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center gap-1 text-xs"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Robah
                        </button>
                        <button
                          onClick={() => handleDelete(siswa.id_siswa)}
                          disabled={actionLoading === siswa.id_siswa}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center gap-1 text-xs"
                        >
                          {actionLoading === siswa.id_siswa ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto overflow-y-auto max-h-96">
            <table className="w-full">
              <thead className="bg-blue-50 sticky top-0 z-10 pointer-events-none select-none">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nami</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {siswaList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 pointer-events-none select-none">
                        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-lg font-medium mb-1">Teu aya data siswa</p>
                        <p className="text-sm">Mimitian ku nambah data siswa anu heula</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  siswaList.map((siswa, index) => (
                    <tr key={siswa.id_siswa} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 pointer-events-none select-none">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap pointer-events-none select-none">
                        <div className="text-sm font-medium text-gray-900">
                          {siswa.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 pointer-events-none select-none">
                        {siswa.nis}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 pointer-events-none select-none">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {siswa.kelas}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(siswa)}
                            disabled={actionLoading}
                            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden md:inline">Robah</span>
                          </button>
                          <button
                            onClick={() => handleDelete(siswa.id_siswa)}
                            disabled={actionLoading === siswa.id_siswa}
                            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center gap-1"
                          >
                            {actionLoading === siswa.id_siswa ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            ) : (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                            <span className="hidden md:inline">Hapus</span>
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
      {/* Delete Confirmation Modal */}
      {showDeleteModal && <DeleteModal />}
    </div>
  );
};

export default ManageSiswa;