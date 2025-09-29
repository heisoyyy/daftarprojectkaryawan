import React from "react";
import "./Navbar.css";

export default function NavbarI({ toggleSidebar }) {
  return (
    <nav className="navbar navbar-dark bg-dark px-3 d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center">
        {/* Tombol Sidebar (Hamburger) */}
        <button
          className="btn-toggle-sidebar me-2"
          onClick={toggleSidebar}
        >
          ☰
        </button>

        {/* Brand */}
        <span className="navbar-brand mb-0 h4">Bank Riau Kepri - Syariah</span>
      </div>
    </nav>
  );
}
