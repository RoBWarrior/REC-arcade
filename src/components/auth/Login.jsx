import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    regNumber: ''
  });
  const [errors, setErrors] = useState({});

  // Demo mode - no validation required
  // const validateRegNumber = (regNumber) => {
  //   return true; // Accept any registration number for demo
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.regNumber.trim()) {
      newErrors.regNumber = 'Registration number is required';
    }

    if (Object.keys(newErrors).length === 0) {
      onLogin({
        username: formData.username.trim(),
        regNumber: formData.regNumber.toUpperCase()
      });
    } else {
      setErrors(newErrors);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl border border-green-500/30 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-black">TA</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: '"Courier New", monospace', letterSpacing: '2px' }}>
            Team RECursion
          </h1>
          <p className="text-gray-400">Coding Club Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-green-400 font-semibold mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-green-500'
              }`}
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="text-red-400 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-green-400 font-semibold mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Registration Number
            </label>
            <input
              type="text"
              name="regNumber"
              value={formData.regNumber}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all uppercase ${
                errors.regNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-green-500'
              }`}
              placeholder="Enter college registration number"
            />
            {errors.regNumber && (
              <p className="text-red-400 text-sm mt-1">{errors.regNumber}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold rounded-lg hover:from-green-400 hover:to-emerald-400 transition-all transform hover:scale-105"
          >
            LOGIN
          </button>
        </form>

        {/* <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Demo Mode: Enter any registration number
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
