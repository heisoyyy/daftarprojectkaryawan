import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Sidebar.css";

export default function Sidebar({ isOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Ambil role user dari localStorage
  const userRole = localStorage.getItem("userRole");

  // State buka/tutup dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Auto-open jika sedang di /history atau /addkaryawan
  useEffect(() => {
    if (location.pathname === "/history" || location.pathname === "/addkaryawan") {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userRole");
      localStorage.removeItem("username");
      localStorage.removeItem("fullName");
      navigate("/login");
    }
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Header */}
      <div className="sidebar-header">
        <h5>MoniSys</h5>
      </div>

      {/* Menu Utama */}
      <ul className="nav flex-column sidebar-menu">
        <li className="nav-item">
          <Link
            to="/"
            className={`sidebar-link ${location.pathname === "/" ? "active" : ""}`}
          >
            <i className="bi bi-list-task me-2"></i>
            Task List
          </Link>
        </li>

        <li className="nav-item">
          <Link
            to="/rekaps"
            className={`sidebar-link ${location.pathname === "/rekaps" ? "active" : ""}`}
          >
            <i className="bi bi-file-earmark-text me-2"></i>
            Rekap Project
          </Link>
        </li>

        <li className="nav-item">
          <Link
            to="/available-programmer"
            className={`sidebar-link ${location.pathname === "/available-programmer" ? "active" : ""}`}
          >
            <i className="bi bi-people me-2"></i>
            Programmer
          </Link>
        </li>

        <li className="nav-item">
          <Link
            to="/grafiks"
            className={`sidebar-link ${location.pathname === "/grafiks" ? "active" : ""}`}
          >
            <i className="bi bi-bar-chart me-2"></i>
            Grafik
          </Link>
        </li>
      </ul>

      {/* Divider */}
      <div className="divider"></div>

      {/* Menu bawah */}
      <ul className="nav flex-column sidebar-menu-bottom">
        {/* Dropdown hanya untuk PINBAG */}
        {userRole === "PINBAG" && (
          <li className={`nav-item dropdown ${isDropdownOpen ? "show" : ""}`}>
            <button
              className="nav-link dropdown-toggle sidebar-link"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              Manajemen User
            </button>

            <ul className={`dropdown-menu ${isDropdownOpen ? "show" : ""}`}>
              <li>
                <Link
                  to="/history"
                  className={`dropdown-item ${location.pathname === "/history" ? "active" : ""}`}
                >
                  <i className="bi bi-clock-history me-2"></i>
                  Riwayat
                </Link>
              </li>
              <li>
                <Link
                  to="/addkaryawan"
                  className={`dropdown-item ${location.pathname === "/addkaryawan" ? "active" : ""}`}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Tambah User
                </Link>
              </li>
            </ul>
          </li>
        )}

        <li className="nav-item">
          <Link
            to="/settings"
            className={`sidebar-link ${location.pathname === "/settings" ? "active" : ""}`}
          >
            <i className="bi bi-gear me-2"></i>
            Settings
          </Link>
        </li>

        <li className="nav-item">
          <button className="sidebar-link logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </li>
      </ul>

      {/* Footer */}
      <div className="sidebar-footer">
        © {new Date().getFullYear()} TSI Dept.
      </div>
    </div>
  );
}
