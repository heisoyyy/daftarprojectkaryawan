import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function NavbarI({ toggleSidebar }) {
  const [invalidDateProjects, setInvalidDateProjects] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkInvalidDates();
  }, []);

  // 🧠 Fungsi parsing tanggal
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
    if (!isNaN(parsed)) return parsed;
    return null;
  };

  // ⚙️ Fungsi ambil data dari backend
  const checkInvalidDates = async () => {
    try {
      const token = localStorage.getItem("token");
      // if (!token) {
      //   navigate("/login");
      //   return;
      // }

      const result = await axios.get("http://192.168.1.22:8080/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

      // 🚫 Jika token invalid atau kadaluarsa, logout
      if (error.response && error.response.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  // 🔢 Format tanggal agar mudah dibaca
  const formatDate = (dateStr) => {
    const date = parseDateSortable(dateStr);
    if (!date) return dateStr;
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
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
          <span className="navbar-brand mb-0 h4">
            Bank Riau Kepri - Syariah
          </span>
        </div>

        {invalidDateProjects.length > 0 && (
          <button
            className="btn btn-warning position-relative"
            onClick={() => setShowWarning(!showWarning)}
            style={{ marginLeft: "auto" }}
          >
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Peringatan
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {invalidDateProjects.length}
            </span>
          </button>
        )}
      </nav>

      {showWarning && invalidDateProjects.length > 0 && (
        <div
          className="alert alert-warning alert-dismissible fade show m-3 shadow-lg"
          role="alert"
          style={{
            position: "fixed",
            top: "70px",
            right: "20px",
            zIndex: 9999,
            maxWidth: "500px",
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Peringatan Tanggal Tidak Valid
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowWarning(false)}
            ></button>
          </div>

          <p className="fw-bold mb-2">
            Ditemukan {invalidDateProjects.length} project dengan End Date lebih
            awal dari Start Date:
          </p>

          <div className="list-group">
            {invalidDateProjects.map((project, index) => (
              <div
                key={project.id}
                className="list-group-item list-group-item-warning mb-2"
              >
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">
                    {index + 1}. {project.projectName || "No Name"}
                  </h6>
                </div>
                <small className="text-danger">
                  <strong>Start Date:</strong> {formatDate(project.startDate)}
                </small>
                <br />
                <small className="text-danger">
                  <strong>End Date:</strong> {formatDate(project.endDate)}
                </small>
                <br />
                <small className="text-muted fst-italic">
                  ⚠️ End Date seharusnya setelah Start Date
                </small>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-top">
            <small className="text-muted">
              Silakan perbaiki tanggal project tersebut melalui menu Edit.
            </small>
          </div>
        </div>
      )}
    </>
  );
}
