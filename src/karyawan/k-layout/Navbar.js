import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Navbar.css";

export default function NavbarI({ toggleSidebar }) {
  const [invalidDateProjects, setInvalidDateProjects] = useState([]);
  const [newProjects, setNewProjects] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    checkInvalidDates();
    checkNewProjects();

    // Interval setiap 30 detik
    const interval = setInterval(checkNewProjects, 30000);
    return () => clearInterval(interval);
  }, []);

  const parseDateSortable = (dateStr) => {
    if (!dateStr) return null;
    let parts;
    if (dateStr.includes("/")) {
      parts = dateStr.split("/");
      if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
    } else if (dateStr.includes("-")) {
      parts = dateStr.split("-");
      if (parts.length === 3) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
    }
    const parsed = new Date(dateStr);
    return isNaN(parsed) ? null : parsed;
  };

  const formatDate = (dateStr) => {
    const date = parseDateSortable(dateStr);
    if (!date) return dateStr;
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const checkInvalidDates = async () => {
    try {
      const result = await axios.get("http://localhost:8080/users");
      const users = result.data || [];

      const invalid = users
        .filter((user) => {
          const startDate = parseDateSortable(user.startDate);
          const endDate = parseDateSortable(user.endDate);
          return startDate && endDate && endDate < startDate;
        })
        .map((user) => ({
          id: user.id,
          projectName: user.projectName,
          startDate: user.startDate,
          endDate: user.endDate,
        }));

      setInvalidDateProjects(invalid);
    } catch (error) {
      console.error("Error checking invalid dates:", error);
    }
  };

  const checkNewProjects = async () => {
    try {
      const result = await axios.get("http://localhost:8080/users");
      const users = result.data || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7); // Seminggu ke belakang

      // Ambil daftar ID yang sudah dibaca dari localStorage
      const readData = JSON.parse(localStorage.getItem("readProjects") || "{}");

      const todaysProjects = users
        .filter((user) => {
          const createdAt = parseDateSortable(user.createdAt || user.startDate);
          if (!createdAt) return false;
          // Proyek dalam seminggu terakhir
          return createdAt >= weekAgo && createdAt <= today;
        })
        .map((user) => ({
          id: user.id,
          projectName: user.projectName,
          picName: user.picName,
          startDate: user.startDate,
          endDate: user.endDate,
          createdAt: user.createdAt || user.startDate,
          isRead: !!readData[user.id], // Cek status baca
        }))
        // Sort by createdAt in descending order (newest first)
        .sort((a, b) => {
          const dateA = parseDateSortable(a.createdAt);
          const dateB = parseDateSortable(b.createdAt);
          return dateB - dateA; // Newest first
        });

      // Hapus data lama (dibaca lebih dari sehari)
      for (const id in readData) {
        const saved = readData[id];
        const savedDate = new Date(saved.date);
        const diffDays = (today - savedDate) / (1000 * 60 * 60 * 24);
        if (diffDays >= 1) delete readData[id];
      }
      localStorage.setItem("readProjects", JSON.stringify(readData));

      // Set ke state
      const unread = todaysProjects.filter((p) => !p.isRead);
      setUnreadCount(unread.length);
      setNewProjects(todaysProjects);
    } catch (error) {
      console.error("Error checking new projects:", error);
    }
  };

  const toggleNotifications = () => setShowNotifications(!showNotifications);

  const markAsRead = (projectId) => {
    const today = new Date();
    setNewProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, isRead: true } : p
      )
    );

    // Simpan ke localStorage
    const readData = JSON.parse(localStorage.getItem("readProjects") || "{}");
    readData[projectId] = { date: today.toISOString() };
    localStorage.setItem("readProjects", JSON.stringify(readData));

    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  const markAllAsRead = () => {
    const today = new Date();
    const newReadData = {};
    newProjects.forEach((p) => {
      newReadData[p.id] = { date: today.toISOString() };
    });
    localStorage.setItem("readProjects", JSON.stringify(newReadData));

    setNewProjects((prev) => prev.map((p) => ({ ...p, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-3 d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center">
        <button className="btn-toggle-sidebar me-2" onClick={toggleSidebar}>
          ☰
        </button>
        <img
          src="/brk.png"
          alt="Logo BRK"
          className="rounded float-start"
          style={{ height: 20, marginRight: 12 }}
        />
        <span className="navbar-brand mb-0 h4">Bank Riau Kepri - Syariah</span>
      </div>
      <div className="position-relative">
        <button
          className="btn btn-outline-light position-relative"
          onClick={toggleNotifications}
        >
          🔔 Notifikasi
          {unreadCount > 0 && (
            <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              backgroundColor: "white",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              width: "300px",
              maxHeight: "400px",
              overflowY: "auto",
              zIndex: 1000,
              padding: "10px",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Notifikasi Proyek Baru</h6>
              {newProjects.length > 0 && (
                <button
                  className="btn btn-sm btn-link text-primary"
                  onClick={markAllAsRead}
                >
                  Tandai Semua Dibaca
                </button>
              )}
            </div>
            {newProjects.length > 0 ? (
              newProjects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                    backgroundColor: project.isRead ? "#f8f9fa" : "#e9ecef",
                    cursor: "pointer",
                  }}
                  onClick={() => markAsRead(project.id)}
                >
                  <strong>{project.projectName}</strong>
                  <p className="mb-1" style={{ fontSize: "14px" }}>
                    PIC: {project.picName}
                  </p>
                  <p className="mb-1" style={{ fontSize: "14px" }}>
                    Mulai: {formatDate(project.startDate)}
                  </p>
                  <p className="mb-1" style={{ fontSize: "14px" }}>
                    Selesai: {formatDate(project.endDate)}
                  </p>
                  <p className="mb-1" style={{ fontSize: "14px" }}>
                    Dibuat: {formatDate(project.createdAt)}
                  </p>
                  <small className="text-muted">
                    {project.isRead ? "Dibaca" : "Belum Dibaca"}
                  </small>
                </div>
              ))
            ) : (
              <p className="text-center text-muted mb-0">
                Tidak ada notifikasi baru minggu ini
              </p>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}