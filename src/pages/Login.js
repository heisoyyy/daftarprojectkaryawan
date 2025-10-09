// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error saat user mengetik
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/auth/login', formData);
      
      if (response.data.success) {
        // Simpan data user ke localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('fullName', response.data.fullName);

        // Redirect ke home
        navigate('/');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Login gagal');
      } else {
        setError('Tidak dapat terhubung ke server');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKaryawanClick = () => {
    navigate('/karyawan');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h3>Teknologi Sistem Informasi</h3>
          <p>Sistem Monitoring Timeline Project</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Masukkan username"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-log w-100 mb-3"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>

          <button 
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={handleKaryawanClick}
          >
            Masuk Sebagai Karyawan
          </button>
        </form>
      </div>
    </div>
  );
}