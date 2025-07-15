import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";

export default function Sidebar({ active }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById("sidebar");
      const toggleButton = document.getElementById("sidebar-toggle");

      if (
        isOpen &&
        sidebar &&
        !sidebar.contains(event.target) &&
        !toggleButton.contains(event.target) &&
        window.innerWidth < 768
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    // Hapus token atawa data login ti localStorage
    localStorage.removeItem("adminToken");
    // Redirect ka kaca login
    navigate("/");
  };

  const navClass = (name) =>
    `block px-4 py-2 rounded transition-colors duration-200 hover:bg-blue-100 ${
      active === name ? "bg-blue-200 font-semibold text-blue-800" : "text-gray-700"
    }`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-90 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="flex">
        <button
          id="sidebar-toggle"
          onClick={toggleSidebar}
          className="fixed top-4 left-4 p-3 text-blue-600 bg-white rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden z-50"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
        >
          {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>

        <div
          id="sidebar"
          className={`${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 w-64 bg-white p-4 border-r border-gray-200 min-h-screen fixed md:static z-40 transition-transform duration-300 ease-in-out shadow-lg md:shadow-none`}
        >
          <div className="pt-16 md:pt-0 flex flex-col justify-between h-full">
            <div>
              <h2 className="text-xl font-bold text-blue-700 mb-6">Panel Admin</h2>

              <nav className="space-y-2">
                <Link to="/admin/dashboard" className={navClass("dashboard")} onClick={() => window.innerWidth < 768 && setIsOpen(false)}>
                  📊 Dasbor
                </Link>
                <Link to="/admin/manage-words" className={navClass("kelola-kosakata")} onClick={() => window.innerWidth < 768 && setIsOpen(false)}>
                  📚 Ngatur Kosakata
                </Link>
                <Link to="/admin/manage-levels" className={navClass("kelola-level")} onClick={() => window.innerWidth < 768 && setIsOpen(false)}>
                  🎯 Ngatur Level
                </Link>
                <Link to="/admin/manage-leaderboard" className={navClass("kelola-leaderboard")} onClick={() => window.innerWidth < 768 && setIsOpen(false)}>
                  🏆 Ngatur Papan Jawara
                </Link>
                <Link to="/admin/manage-siswa" className={navClass("kelola-siswa")} onClick={() => window.innerWidth < 768 && setIsOpen(false)}>
                  🧑‍🎓 Ngatur Murid
                </Link>
                <Link to="/admin-register" className={navClass("admin-register")} onClick={() => window.innerWidth < 768 && setIsOpen(false)}>
                  👤 Tambah Admin
                </Link>
              </nav>
            </div>

            {/* Tombol Kaluar */}
            <button
              onClick={handleLogout}
              className="mt-6 text-left px-4 py-2 text-red-600 rounded hover:bg-red-100 transition-colors duration-200"
            >
              🚪 Kaluar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}