import { Link, useLocation } from "react-router-dom";
import "./KSidebar.css";

export default function Sidebar({ isOpen }) {
  const location = useLocation();

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
        {/* Tambahkan menu lain sesuai kebutuhan */}
      </ul>

      {/* Footer */}
      <div className="sidebar-footer">
        © {new Date().getFullYear()} TSI Dept.
      </div>
    </aside>
  );
}
