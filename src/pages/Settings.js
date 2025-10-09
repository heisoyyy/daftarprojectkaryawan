// src/pages/Settings.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './Settings.css';

export default function Settings() {
  const username = localStorage.getItem('username');
  const fullName = localStorage.getItem('fullName');

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validasi
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'danger', text: 'Password baru tidak cocok!' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'danger', text: 'Password minimal 6 karakter!' });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        'http://localhost:8080/auth/change-password',
        {
          username: username,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password berhasil diubah!' });
        // Reset form
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      if (err.response) {
        setMessage({ type: 'danger', text: err.response.data.message || 'Gagal mengubah password' });
      } else {
        setMessage({ type: 'danger', text: 'Tidak dapat terhubung ke server' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h3>
          <i className="bi bi-gear me-2"></i>
          Settings
        </h3>
        <p className="text-muted">Kelola akun dan keamanan Anda</p>
      </div>

      <div className="row">
        {/* Profile Card */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <div className="profile-icon mb-3">
                <i className="bi bi-person-circle"></i>
              </div>
              <h5>{fullName}</h5>
              <p className="text-muted mb-1">@{username}</p>
              <span className="badge bg-primary">Admin</span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-shield-lock me-2"></i>
                Ubah Password
              </h5>
            </div>
            <div className="card-body">
              {message.text && (
                <div className={`alert alert-${message.type}`} role="alert">
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="oldPassword" className="form-label">
                    Password Lama
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="oldPassword"
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    placeholder="Masukkan password lama"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Masukkan password baru"
                    required
                  />
                  <small className="text-muted">Minimal 6 karakter</small>
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Konfirmasi password baru"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-edit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}