// src/App.js
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// 🔐 Login & Protected Route
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// 🧭 Admin imports
import NavbarI from './layout/Navbar';
import Sidebar from './layout/Sidebar';
import Home from './pages/Home';
import AddUser from './users/AddUser';
import EditUser from './users/EditUser';
import ViewUser from './users/ViewUser';
import Rekap from './pages/Rekap';
import AvailableProgrammer from './pages/AvailableProgrammer';
import Grafik from './pages/Grafik';
import Settings from './pages/Settings';

// 👷‍♂️ Karyawan imports
import NavbarKaryawan from './karyawan/k-layout/Navbar';
import SidebarKaryawan from './karyawan/k-layout/KSidebar';
import DashboardKaryawan from './karyawan/pages/DashboardKaryawan';
import ViewKaryawan from './karyawan/users/ViewKaryawan';

import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState } from 'react';

// ======================
// Layout untuk ADMIN
// ======================
function AdminLayout({ children, isSidebarOpen, toggleSidebar }) {
  return (
    <>
      <NavbarI toggleSidebar={toggleSidebar} />
      <div className="d-flex">
        <Sidebar isOpen={isSidebarOpen} />
        <div className={`flex-grow-1 p-3 content-area ${isSidebarOpen ? "" : "expanded"}`}>
          {children}
        </div>
      </div>
    </>
  );
}

// ======================
// Layout untuk KARYAWAN
// ======================
function KaryawanLayout({ children, isSidebarOpen, toggleSidebar }) {
  return (
    <>
      <NavbarKaryawan toggleSidebar={toggleSidebar} />
      <div className="d-flex">
        <SidebarKaryawan isOpen={isSidebarOpen} />
        <div className={`flex-grow-1 p-3 content-area ${isSidebarOpen ? "" : "expanded"}`}>
          {children}
        </div>
      </div>
    </>
  );
}

// ======================
// Routing utama
// ======================
function AppContent() {
  const location = useLocation();

  // Tentukan layout mana yang aktif
  const isKaryawanRoute = location.pathname.startsWith("/karyawan");
  const isLoginRoute = location.pathname === "/login";

  // State sidebar terpisah agar tidak bentrok
  const [isSidebarOpenAdmin, setIsSidebarOpenAdmin] = useState(true);
  const [isSidebarOpenKaryawan, setIsSidebarOpenKaryawan] = useState(true);

  const toggleSidebarAdmin = () => setIsSidebarOpenAdmin(!isSidebarOpenAdmin);
  const toggleSidebarKaryawan = () => setIsSidebarOpenKaryawan(!isSidebarOpenKaryawan);

  // Jika di halaman login, tampilkan tanpa layout
  if (isLoginRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <>
      {isKaryawanRoute ? (
        // 🧑‍💼 Layout untuk halaman Karyawan (TIDAK PERLU LOGIN)
        <KaryawanLayout
          isSidebarOpen={isSidebarOpenKaryawan}
          toggleSidebar={toggleSidebarKaryawan}
        >
          <Routes>
            <Route path="/karyawan" element={<DashboardKaryawan />} />
            <Route path="/karyawan/viewuser/:id" element={<ViewKaryawan />} />
          </Routes>
        </KaryawanLayout>
      ) : (
        // 🧑‍💻 Layout untuk halaman Admin (PERLU LOGIN)
        <ProtectedRoute>
          <AdminLayout
            isSidebarOpen={isSidebarOpenAdmin}
            toggleSidebar={toggleSidebarAdmin}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rekaps" element={<Rekap />} />
              <Route path="/available-programmer" element={<AvailableProgrammer />} />
              <Route path="/grafiks" element={<Grafik />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/adduser" element={<AddUser />} />
              <Route path="/edituser/:id" element={<EditUser />} />
              <Route path="/viewuser/:id" element={<ViewUser />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;