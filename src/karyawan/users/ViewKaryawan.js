// Updated ViewKaryawan.jsx with formatted dates and shared parseDate/formatDate functions
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const parseDate = (val) => {
  if (!val) return null;
  if (typeof val === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return new Date(`${val}T00:00:00`);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
      const [dd, mm, yyyy] = val.split("/");
      return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
      const [dd, mm, yyyy] = val.split("-");
      return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    }
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

const formatDate = (date) => {
  const parsed = parseDate(date);
  if (!parsed) return "-";
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

export default function ViewKaryawan() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await axios.get(`http://localhost:8080/user/${id}`);
        setUser(result.data);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id]);

  const monthLabels = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  // Helper: parse bulan dari string tanggal (YYYY-MM-DD atau DD/MM/YYYY)
  const parseMonth = (dateStr) => {
    const date = parseDate(dateStr);
    return date ? date.getMonth() + 1 : null; // 1-12
  };

  const startMonth = parseMonth(user.startDate);
  const endMonth = parseMonth(user.endDate);

  if (loading)
    return (
      <div className="p-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Mengambil data...</p>
      </div>
    );

  if (!user || Object.keys(user).length === 0)
    return (
      <div className="p-5 text-center text-danger">
        <h5>Data tidak ditemukan</h5>
        <button className="btn btn-secondary mt-3" onClick={() => navigate("/karyawan/dashboard")}>
          Kembali
        </button>
      </div>
    );

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-10 offset-md-1 border rounded p-4 shadow-lg bg-light">
          <h2 className="text-center mb-4">📌 Detail Project Karyawan</h2>

          {/* Basic Info */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-3">{user.projectName}</h4>
              <p><strong>PIC:</strong> {user.picName}</p>
              <p><strong>Status:</strong>{" "}
                <span className={`badge ${
                  user.status === "Selesai"
                    ? "bg-success"
                    : user.status === "Sedang Dikerjakan"
                    ? "bg-warning text-dark"
                    : "bg-secondary"
                }`}>
                  {user.status}
                </span>
              </p>
              <p><strong>Owner:</strong> {user.projectOwner}</p>
              <p><strong>Application:</strong> {user.applicationName}</p>
              <p><strong>Progress:</strong> {user.progress}%</p>
            </div>
          </div>

          {/* Dates */}
          <div className="row mb-3">
            <div className="col-md-6">
              <ul className="list-group">
                <li className="list-group-item"><strong>Receive Date:</strong> {formatDate(user.receiveDate)}</li>
                <li className="list-group-item"><strong>Start Date:</strong> {formatDate(user.startDate)}</li>
                <li className="list-group-item"><strong>End Date:</strong> {formatDate(user.endDate)}</li>
                <li className="list-group-item"><strong>Dev Duration:</strong> {user.devDuration} hari</li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul className="list-group">
                <li className="list-group-item"><strong>Tanggal SIT:</strong> {formatDate(user.tglSit)}</li>
                <li className="list-group-item"><strong>Tanggal UAT:</strong> {formatDate(user.tglUat)}</li>
                <li className="list-group-item"><strong>STS FSD:</strong> {user.stsFsd}</li>
                <li className="list-group-item"><strong>Dokumen BRD/CR:</strong> {user.statusDokumenBrdOrChangeRequest}</li>
              </ul>
            </div>
          </div>

          {/* Monthly Table */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header">📊 Timeline Bulanan</div>
            <div className="card-body">
              <table className="table table-bordered text-center">
                <thead className="table-light">
                  <tr>
                    {monthLabels.map((m, i) => <th key={i}>{m}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {monthLabels.map((_, i) => {
                      const monthIndex = i + 1;
                      const isHighlighted =
                        monthIndex >= startMonth && monthIndex <= endMonth;
                      return (
                        <td key={i} style={{ padding: 0 }}>
                          <div
                            style={{
                              backgroundColor: isHighlighted ? "#ffe066" : "#fff",
                              width: "100%",
                              height: "25px",
                              borderRadius: "3px",
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Keterangan */}
          <div className="card mb-3 shadow-sm">
            <div className="card-header">📝 Keterangan</div>
            <div className="card-body">
              <p>{user.keterangan || "Tidak ada keterangan"}</p>
            </div>
          </div>

          <div className="text-center">
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/karyawan/dashboard")}
            >
              ⬅ Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}