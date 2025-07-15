import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

const AdminLogin = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/admin/login", form);
      // Simpan token atau info admin
      localStorage.setItem("adminToken", res.data.token); 
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Username atau password salah!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-yellow-100 to-blue-200 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md border border-yellow-300">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-sky-800 mb-6">Admin Login</h2>
        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sky-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md border border-sky-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sky-700 mb-1">Password</label>
            <div className="flex space-x-2">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="flex-1 px-4 py-2 rounded-md border border-sky-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-black"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 py-2 border border-sky-300 rounded-md hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors duration-200"
              >
                {showPassword ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 rounded-md transition"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;