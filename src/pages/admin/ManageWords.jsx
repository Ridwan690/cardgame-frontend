import React, { useEffect, useState } from "react";
import API from "../../api";
import Sidebar from "../../components/admin/Sidebar";
import Modal from "../../components/Modal";

export default function ManageWords() {
  const [words, setWords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    kata: "",
    image: "",
    imagePreview: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get("/words");
      setWords(response.data);
    } catch (error) {
      console.error("Error fetching words", error);
      setError("Gagal ngamuat data kosakata");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const data = new FormData();
      data.append("kata", formData.kata);
      if (formData.image) {
        data.append("image", formData.image);
      }

      if (editId) {
        await API.put(`/words/${editId}`, data, config);
      } else {
        await API.post("/words", data, config);
      }

      setFormData({
        kata: "",
        image: null,
        imagePreview: "",
      });
      setEditId(null);
      setIsModalOpen(false);
      fetchWords();
    } catch (error) {
      console.error("Error saving word", error);
      alert("Gagal nyimpen kosakata");
    }
  };

  const handleEdit = (word) => {
    const imagePath = word.kartu?.image_url || "";
    const imageFileName = imagePath.split("/").pop();

    setFormData({
      kata: word.kartu?.kata || "",
      image: null,
      imagePreview: imageFileName,
    });

    setEditId(word.id_kata);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("adminToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await API.delete(`/words/${deleteId}`, config);
      fetchWords();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting word", error);
      alert("Gagal ngahapus kosakata");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredWords = words.filter(word =>
    word.kartu?.kata?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const LoadingRow = () => (
    <tr className="border-b border-gray-100">
      <td className="px-3 sm:px-6 py-4">
        <div className="bg-gray-200 h-4 w-6 sm:w-8 rounded animate-pulse"></div>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <div className="bg-gray-200 h-4 w-20 sm:w-32 rounded animate-pulse"></div>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <div className="bg-gray-200 h-12 w-12 sm:h-16 sm:w-16 rounded-lg animate-pulse"></div>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="bg-gray-200 h-8 w-full sm:w-16 rounded-md animate-pulse"></div>
          <div className="bg-gray-200 h-8 w-full sm:w-16 rounded-md animate-pulse"></div>
        </div>
      </td>
    </tr>
  );

  // Delete Confirmation Modal Component
  const DeleteModal = () => (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Konfirmasi Hapus Kosakata
        </h3>
        <p className="text-gray-600 mb-6">
          Apakah Anda yakin ingin menghapus kosakata ini? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteId(null);
            }}
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

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar active="kelola-kosakata" />
      
      <div className="flex-1 lg:ml-0">
        <div className="p-3 sm:p-6 pt-20 md:pt-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
            <div className="pointer-events-none select-none">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Ngatur Kosakata</h1>
              <p className="text-gray-600 text-sm sm:text-lg">Ngatur data kosakata dina sistem pangajaran</p>
            </div>
            <button
              onClick={() => {
                setEditId(null);
                setFormData({ kata: "", image_url: "" });
                setIsModalOpen(true);
              }}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="sm:inline">Tambah Kosakata</span>
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="flex-1 text-sm sm:text-base">{error}</span>
                <button 
                  onClick={fetchWords}
                  className="ml-4 text-red-600 hover:text-red-800 font-medium underline text-sm"
                >
                  Coba Deui
                </button>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Milarian kosakata..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 shadow-sm text-black"
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 pointer-events-none select-none">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Jumlah Kosakata</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {loading ? "..." : words.length}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Hasil Panggolongan</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {loading ? "..." : filteredWords.length}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Kalawan Gambar</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {loading ? "..." : words.filter(w => w.kartu?.image_url).length}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area - Single Responsive Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-96">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200 pointer-events-none select-none sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-3 sm:px-6 py-4 font-semibold text-gray-900 text-xs sm:text-sm uppercase tracking-wide whitespace-nowrap">#</th>
                    <th className="text-left px-3 sm:px-6 py-4 font-semibold text-gray-900 text-xs sm:text-sm uppercase tracking-wide whitespace-nowrap">Kosakata</th>
                    <th className="text-left px-3 sm:px-6 py-4 font-semibold text-gray-900 text-xs sm:text-sm uppercase tracking-wide whitespace-nowrap">Gambar</th>
                    <th className="text-left px-3 sm:px-6 py-4 font-semibold text-gray-900 text-xs sm:text-sm uppercase tracking-wide whitespace-nowrap">Perlakuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    [...Array(5)].map((_, i) => <LoadingRow key={i} />)
                  ) : filteredWords.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-3 sm:px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-500 text-lg font-medium">
                            {searchTerm ? "Teu aya kosakata anu kapanggih" : "Teu aya kosakata"}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            {searchTerm ? "Coba kalawan kecap konci anu béda" : "Mimiti kalawan nambah kosakata kahiji"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredWords.map((word, index) => (
                      <tr key={word.id_kata} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 font-medium pointer-events-none select-none">{index + 1}</td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className="font-semibold text-gray-900 text-sm sm:text-base pointer-events-none select-none">
                            {word.kartu?.kata || "-"}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 pointer-events-none select-none">
                          {word.kartu?.image_url ? (
                            <img
                              src={`${word.kartu.image_url}`}
                              alt={word.kartu.kata}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          {!word.kartu?.image_url ? (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg border border-gray-200 hidden items-center justify-center">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => handleEdit(word)}
                              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 shadow-sm hover:shadow"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span className="hidden sm:inline">Robah</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(word.id_kata)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 shadow-sm hover:shadow"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="hidden sm:inline">Hapus</span>
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
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">
              {editId ? "Édit Kosakata" : "Tambah Kosakata Anyar"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block mb-2 font-semibold text-gray-700 text-sm sm:text-base">
                  Kosakata <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="kata"
                  value={formData.kata}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black text-sm sm:text-base"
                  placeholder="Asupkeun kosakata"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700 text-sm sm:text-base">
                  Unggah Gambar <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFormData({
                      ...formData,
                      image: file,
                      imagePreview: file?.name || "",
                    });
                    if (file) {
                      setImagePreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                  className="block w-full text-xs sm:text-sm text-gray-700 file:mr-4 file:py-2 file:px-3 sm:file:px-4
                    file:rounded-full file:border-0
                    file:text-xs sm:file:text-sm file:font-semibold
                    file:bg-blue-100 file:text-blue-700
                    hover:file:bg-blue-200"
                />

                {imagePreviewUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Gambar Ayeuna:</p>
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Simpen
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && <DeleteModal />}
    </div>
  );
}