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
      setError("Username atawa password salah!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-yellow-100 to-blue-200 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-lg border border-yellow-300">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-sky-800 mb-2">
            Admin Login
          </h2>
          <p className="text-sm sm:text-base text-sky-600 hidden sm:block">
            Lebet ka panel administrasi
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm sm:text-base text-center font-medium">
              {error}
            </p>
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Username Field */}
          <div>
            <label className="block text-sky-700 mb-2 text-sm sm:text-base font-medium">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-md border border-sky-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-black transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Lebetkeun username"
              required
            />
          </div>
          
          {/* Password Field */}
          <div>
            <label className="block text-sky-700 mb-2 text-sm sm:text-base font-medium">
              Password
            </label>
            <div className="flex gap-2">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-md border border-sky-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-black transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Lebetkeun password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 sm:px-4 py-2 sm:py-3 border border-sky-300 rounded-md hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors duration-200 bg-gray-50 hover:bg-sky-100"
                aria-label={showPassword ? "Sumputkeun password" : "Témbongkeun password"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold py-2 sm:py-3 px-4 text-sm sm:text-base rounded-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
          >
            Lebet
          </button>
        </form>
        
        {/* Footer - Optional */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-sky-600">
            Sistem Administrasi
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;