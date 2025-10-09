import { Link, useLocation } from "react-router-dom";
import './KSidebar.css';

export default function Sidebar({ isOpen }) {
  const location = useLocation();

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Logo/Header */}
      <div className="sidebar-header">
        <h5 className="mb-6">MoniSys</h5>
      </div>

      {/* Main Menu */}
      <ul className="nav flex-column mt-4 sidebar-menu">
        <li className="nav-item mb-2">
          <Link to="/karyawan" className={`sidebar-link ${location.pathname === "/karyawan" ? "active" : ""}`}>
            Dashboard 
          </Link>
        </li>
        {/* <li className="nav-item mb-2">
          <Link to="/rekaps" className={`sidebar-link ${location.pathname === "/rekaps" ? "active" : ""}`}>
            Rekap Project
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/available-programmer" className={`sidebar-link ${location.pathname === "/available-programmer" ? "active" : ""}`}>
            Programmer
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/grafiks" className={`sidebar-link ${location.pathname === "/grafiks" ? "active" : ""}`}>
            Grafik
          </Link>
        </li> */}
      </ul>
      {/* Footer */}
      <div className="sidebar-footer">
        © {new Date().getFullYear()} TSI Dept.
      </div>
    </div>
  );
}
