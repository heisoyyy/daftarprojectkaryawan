import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ViewUser() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await axios.get(`http://localhost:8080/user/${id}`);
        setUser(result.data);
      } catch (error) {
        console.error("Error loading user:", error);
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
    if (!dateStr) return null;
    let date;
    if (dateStr.includes("/")) {
      // DD/MM/YYYY
      const [dd, mm, yyyy] = dateStr.split("/");
      date = new Date(`${yyyy}-${mm}-${dd}`);
    } else {
      // YYYY-MM-DD
      date = new Date(dateStr);
    }
    return date.getMonth() + 1; // 1-12
  };

  const startMonth = parseMonth(user.startDate);
  const endMonth = parseMonth(user.endDate);

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-10 offset-md-1 border rounded p-4 shadow-lg bg-light">
          <h2 className="text-center mb-4">📌 Project Detail</h2>

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
                <li className="list-group-item"><strong>Receive Date:</strong> {user.receiveDate}</li>
                <li className="list-group-item"><strong>Start Date:</strong> {user.startDate}</li>
                <li className="list-group-item"><strong>End Date:</strong> {user.endDate}</li>
                <li className="list-group-item"><strong>Dev Duration:</strong> {user.devDuration} hari</li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul className="list-group">
                <li className="list-group-item"><strong>Tanggal SIT:</strong> {user.tglSit}</li>
                <li className="list-group-item"><strong>Tanggal UAT:</strong> {user.tglUat}</li>
                <li className="list-group-item"><strong>STS FSD:</strong> {user.stsFsd}</li>
                <li className="list-group-item"><strong>Dokumen BRD/CR:</strong> {user.statusDokumenBrdOrChangeRequest}</li>
              </ul>
            </div>
          </div>

          {/* Monthly Table */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header">📊 Monthly Data</div>
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
                      const isHighlighted = monthIndex === startMonth || monthIndex === endMonth;
                      return (
                        <td key={i} style={{ padding: 0 }}>
                          <div
                            style={{
                              backgroundColor: isHighlighted ? "yellow" : "white",
                              width: "100%",
                              height: "25px",
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
              onClick={() => navigate("/")}
            >
              ⬅ Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
