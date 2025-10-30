import React, { useState } from 'react';
import axios from 'axios';
import './Settings.css';

export default function Settings() {
  const username = localStorage.getItem('username');
  const fullName = localStorage.getItem('fullName');
  const role = localStorage.getItem('userRole')

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
      const response = await axios.put('http://192.168.1.22:8080/auth/change-password', {
        username: username,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password berhasil diubah!' });
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
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
      <div className="settings-header mb-4">
        <h3 className="fw-bold">
          <i className="bi bi-gear-fill me-2"></i> Pengaturan Akun
        </h3>
        <p className="text-muted">Kelola profil dan keamanan akun Anda</p>
      </div>

      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-lg-4 col-md-5">
          <div className="card profile-card shadow-lg border-0 rounded-4">
            <div className="card-body text-center">
              <div className="profile-avatar mb-3">
                <i className="bi bi-person-circle display-3 text-secondary"></i>
              </div>
              <h5 className="fw-bold">{fullName}</h5>
              <p className="text-muted">@{username}</p>
              <hr />
              <p className="small text-muted">
                <i className="bi bi-shield-check me-2"></i><strong>{role}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="col-lg-8 col-md-7">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-header bg-light border-0 py-3">
              <h5 className="mb-0 fw-semibold text-dark">
                <i className="bi bi-shield-lock-fill me-2 text-primary"></i>
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
                  <label htmlFor="oldPassword" className="form-label fw-semibold">
                    Password Lama
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg rounded-3"
                    id="oldPassword"
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    placeholder="Masukkan password lama"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label fw-semibold">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg rounded-3"
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
                  <label htmlFor="confirmPassword" className="form-label fw-semibold">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg rounded-3"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulangi password baru"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg rounded-3 px-4"
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
