// Sidebar.js
// import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import './Sidebar.css';

export default function Sidebar({ isOpen }) {
  const location = useLocation();
  // const [rekapOpen, setRekapOpen] = useState(false);

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Logo/Header */}
      <div className="sidebar-header">
        <span className="logo"></span>
        <h5 className="mb-0">Sistem Project Karyawan</h5>
      </div>

      {/* Menu
      <ul className="nav flex-column mt-4">
        <li className="nav-item mb-2">
          <Link to="/" className={`sidebar-link ${location.pathname === "/" ? "active" : ""}`}>
            Home
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/tasklist" className={`sidebar-link ${location.pathname === "/tasklist" ? "active" : ""}`}>
            Task List
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/detail" className={`sidebar-link ${location.pathname === "/detail" ? "active" : ""}`}>
            Detail
          </Link>
        </li> */}
      
      {/* Menu */}
      <ul className="nav flex-column mt-4">
        <li className="nav-item mb-2">
          <Link to="/" className={`sidebar-link ${location.pathname === "/" ? "active" : ""}`}>
            Task List
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/rekaps" className={`sidebar-link ${location.pathname === "/rekaps" ? "active" : ""}`}>
            Rekap Project
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/available-programmer" className={`sidebar-link ${location.pathname === "/available-programmer" ? "active" : ""}`}>
            Programmer
          </Link>
        </li>

        {/* Dropdown Rekap PIC
        <li className="nav-item">
          <Link
            className={`sidebar-link w-100 text-start ${location.pathname.includes("rekap") ? "" : ""}`}
            onClick={() => setRekapOpen(!rekapOpen)}
          >
            Rekap Per PIC ▾
          </Link>
          {rekapOpen && (
            <ul className="nav flex-column ms-3 mt-2">
              <li>
                <Link
                  to="/rekaps"
                  className={`sidebar-link ${location.pathname === "/rekaps" ? "active" : ""}`}
                >
                  Rekap Project
                </Link>
              </li>
              <li>
                <Link
                  to="/available-programmer"
                  className={`sidebar-link ${location.pathname === "/available-programmer" ? "active" : ""}`}
                >
                  Available Programmer
                </Link>
              </li>
            </ul>
          )}
        </li> */}
      </ul>
    </div>
  );
}
