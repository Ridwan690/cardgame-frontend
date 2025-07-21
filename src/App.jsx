import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SelectDifficulty from "./pages/SelectDifficulty";
import Game from "./pages/Game";
import Leaderboard from "./pages/Leaderboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRegister from "./pages/admin/AdminRegister";
import DashboardHome from "./pages/admin/DashboardHome";
import ManageWords from "./pages/admin/ManageWords";
import ManageLevels from "./pages/admin/ManageLevels";
import ManageLeaderboard from "./pages/admin/ManageLeaderboard";
import ManageSiswa from "./pages/admin/ManageSiswa";
import { AudioProvider } from "./contexts/AudioContext";

function App() {
  return (
    <AudioProvider>
      <Router>
        <Routes>
          {/* Guest Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/select-difficulty" element={<SelectDifficulty />} />
          <Route path="/game" element={<Game />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-register" element={<AdminRegister />} />
          
          {/* Admin Dashboard */}
          <Route path="/admin/dashboard" element={<DashboardHome />} />
          <Route path="/admin/manage-words" element={<ManageWords />} />
          <Route path="/admin/manage-levels" element={<ManageLevels />} />
          <Route path="/admin/manage-leaderboard" element={<ManageLeaderboard />} />
          <Route path="/admin/manage-siswa" element={<ManageSiswa />} />
          
        </Routes>
      </Router>
    </AudioProvider>
  );
}

export default App;
