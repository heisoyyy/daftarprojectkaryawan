import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

import NavbarI from './layout/Navbar';
import Sidebar from './layout/Sidebar';
import Home from './pages/Home';
import AddKaryawan from './pages/AddKaryawan'; 
import History from './pages/History'; 
import AddUser from './users/AddUser';
import EditUser from './users/EditUser';
import ViewUser from './users/ViewUser';
import Rekap from './pages/Rekap';
import AvailableProgrammer from './pages/AvailableProgrammer';
import Grafik from './pages/Grafik';
import Settings from './pages/Settings';
import Talon from './pages/Talon';

import NavbarKaryawan from './karyawan/k-layout/Navbar';
import SidebarKaryawan from './karyawan/k-layout/KSidebar';
import DashboardKaryawan from './karyawan/pages/DashboardKaryawan';

import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState } from 'react';

function AdminLayout({ children, isSidebarOpen, toggleSidebar }) {
  return (
    <>
      <NavbarI toggleSidebar={toggleSidebar} />
      <div className="d-flex">
        <Sidebar isOpen={isSidebarOpen} />
        <div className={`flex-grow-1 p-3 content-area ${isSidebarOpen ? '' : 'expanded'}`}>
          {children}
        </div>
      </div>
    </>
  );
}

function SekbagLayout({ children, isSidebarOpen, toggleSidebar }) {
  return (
    <>
      <NavbarI toggleSidebar={toggleSidebar} />
      <div className="d-flex">
        <Sidebar isOpen={isSidebarOpen} />
        <div className={`flex-grow-1 p-3 content-area ${isSidebarOpen ? '' : 'expanded'}`}>
          {children}
        </div>
      </div>
    </>
  );
}

function KaryawanLayout({ children, isSidebarOpen, toggleSidebar }) {
  return (
    <>
      <NavbarKaryawan toggleSidebar={toggleSidebar} />
      <div className="d-flex">
        <SidebarKaryawan isOpen={isSidebarOpen} />
        <div className={`flex-grow-1 p-3 content-area ${isSidebarOpen ? '' : 'expanded'}`}>
          {children}
        </div>
      </div>
    </>
  );
}

function AppContent() {
  const location = useLocation();

  const isKaryawanRoute = location.pathname.startsWith('/karyawan');
  const isLoginRoute = location.pathname === '/login';

  const [isSidebarOpenAdmin, setIsSidebarOpenAdmin] = useState(true);
  const [isSidebarOpenKaryawan, setIsSidebarOpenKaryawan] = useState(true);

  const toggleSidebarAdmin = () => setIsSidebarOpenAdmin(!isSidebarOpenAdmin);
  const toggleSidebarKaryawan = () => setIsSidebarOpenKaryawan(!isSidebarOpenKaryawan);

  if (isLoginRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  const userRole = localStorage.getItem('userRole');

  if (isKaryawanRoute) {
    if (userRole !== 'GUEST') {
      return <Navigate to="/" replace />;
    }
    return (
      <KaryawanLayout
        isSidebarOpen={isSidebarOpenKaryawan}
        toggleSidebar={toggleSidebarKaryawan}
      >
        <Routes>
          <Route path="/karyawan" element={<DashboardKaryawan />} />
          <Route path="/talons" element={<Talon />} />
        </Routes>
      </KaryawanLayout>
    );
  }

  if (userRole === 'PINBAG') {
    return (
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
            <Route path="/addkaryawan" element={<AddKaryawan />} />
            <Route path="/history" element={<History />} />
            <Route path="/adduser" element={<AddUser />} />
            <Route path="/edituser/:id" element={<EditUser />} />
            <Route path="/viewuser/:id" element={<ViewUser />} />
          </Routes>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (userRole === 'SEKBAG') {
    return (
      <ProtectedRoute>
        <SekbagLayout
          isSidebarOpen={isSidebarOpenAdmin}
          toggleSidebar={toggleSidebarAdmin}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rekaps" element={<Rekap />} />
            <Route path="/available-programmer" element={<AvailableProgrammer />} />
            <Route path="/grafiks" element={<Grafik />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/addkaryawan" element={<AddKaryawan />} />
            <Route path="/adduser" element={<AddUser />} />
            <Route path="/edituser/:id" element={<EditUser />} />
            <Route path="/viewuser/:id" element={<ViewUser />} />
          </Routes>
        </SekbagLayout>
      </ProtectedRoute>
    );
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
 