import { Link, useLocation, useNavigate } from "react-router-dom";
import "./KSidebar.css";

export default function Sidebar({ isOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Fungsi logout / kembali ke login
  const handleBackToLogin = () => {
    // Hapus data localStorage agar sesi karyawan hilang
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    localStorage.removeItem("fullName");

    // Arahkan ke halaman login
    navigate("/login");
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Logo/Header */}
      <div className="sidebar-header"> 
        <h5>MoniSys</h5>
      </div>

      {/* Main Menu */}
      <ul className="nav flex-column mt-4 sidebar-menu">
        <li className="nav-item mb-2">
          <Link
            to="/karyawan"
            className={`sidebar-link ${
              location.pathname === "/karyawan" ? "active" : ""
            }`}
          >
            Dashboard
          </Link>
        </li>
      </ul>

      {/* Footer */}
      <div className="sidebar-footer mt-auto text-center">
        <button 
          className="btn btn-outline-danger w-75 mb-2"
          onClick={handleBackToLogin}
        >
          Kembali ke Login
        </button>
        <br/>
        <small>© {new Date().getFullYear()} TSI Dept.</small>
      </div>
    </aside>
  );
}
