import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';

// ============================================
// AXIOS INTERCEPTOR - Untuk mengirim user info ke backend
// ============================================
axios.interceptors.request.use(
  (config) => {
    // Ambil data user dari localStorage
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('userRole');
    
    // Tambahkan ke header jika ada
    if (username) {
      config.headers['X-Username'] = username;
    }
    if (role) {
      config.headers['X-Role'] = role;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// RENDER APP
// ============================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();