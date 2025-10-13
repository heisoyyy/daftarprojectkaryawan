import React, { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import axios from "axios";

const STATUS_COLORS = { Selesai: "#288d3b", "Belum Selesai": "#c53d13" };
const CATEGORY_COLORS = ["#e16f0c", "#288d3b", "#c53d13", "#ed7c19"];
const STATUS_BELUM = [
  "Belum dikerjakan", "Hold", "Ready SIT", "Ready UAT", "Reschdule",
  "SIT Cancel", "Sedang SIT", "Sedang VIT", "Sedang Dikerjakan"
];

const CATEGORY_MAPPING = {
  "Temuan": ["Temuan", "Temuan DAI", "Temuan OJK"],
  "KPI": ["KPI"],
  "PKLD": ["PKLD"],
  "PKLD Tambahan": ["PKLD Tambahan"]
};

const HOLIDAYS = [
  "2025-01-01", "2025-03-31", "2025-05-01", "2025-05-29",
  "2025-06-01", "2025-12-25"
];

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

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

const startOfDay = (d) => {
  if (!d) return null;
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const tomorrow = () => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  t.setDate(t.getDate() + 1);
  return t;
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

const isHoliday = (date) => {
  const day = date.getDay();
  const iso = startOfDay(date).toISOString().split("T")[0];
  return day === 0 || day === 6 || HOLIDAYS.includes(iso);
};

const countWorkdays = (start, end) => {
  let workdays = 0;
  let cur = new Date(startOfDay(start));
  const e = startOfDay(end);
  while (cur <= e) {
    if (!isHoliday(cur)) workdays++;
    cur.setDate(cur.getDate() + 1);
  }
  return workdays;
};

const endOfYearFor = (date) => {
  const y = date.getFullYear();
  return new Date(y, 11, 31, 0, 0, 0, 0);
};

const ViewKaryawanModal = ({ user, onClose }) => {
  const monthLabels = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const parseMonth = (dateStr) => {
    const date = parseDate(dateStr);
    return date ? date.getMonth() + 1 : null;
  };

  const startMonth = parseMonth(user.startDate);
  const endMonth = parseMonth(user.endDate);

  if (!user || Object.keys(user).length === 0) {
    return (
      <div className="modal-content p-5 text-center text-danger">
        <h5>Data tidak ditemukan</h5>
        <button className="btn btn-secondary mt-3" onClick={onClose}>
          Tutup
        </button>
      </div>
    );
  }

  return (
    <div className="modal-content p-4" style={{ backgroundColor: "#f8f9fa", borderRadius: "8px", maxWidth: "800px", margin: "auto" }}>
      <h2 className="text-center mb-4">📌 Detail Project Karyawan</h2>
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
            <li className="list-group-item"><strong>Tanggal SIT:</strong> {(user.tglSit)}</li>
            <li className="list-group-item"><strong>Tanggal UAT:</strong> {(user.tglUat)}</li>
            <li className="list-group-item"><strong>STS FSD:</strong> {user.stsFsd}</li>
            <li className="list-group-item"><strong>Dokumen BRD/CR:</strong> {user.statusDokumenBrdOrChangeRequest}</li>
          </ul>
        </div>
      </div>
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
      <div className="card mb-3 shadow-sm">
        <div className="card-header">📝 Keterangan</div>
        <div className="card-body">
          <p>{user.keterangan || "Tidak ada keterangan"}</p>
        </div>
      </div>
      <div className="text-center">
        <button className="btn btn-primary px-4" onClick={onClose}>
          Tutup
        </button>
      </div>
    </div>
  );
};

export default function EmployeeDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPic, setSelectedPic] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole, setUserRole] = useState("karyawan");
  const [currentUser, setCurrentUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Belum dikerjakan");
  const [modalUser, setModalUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem("user");
        const user = userData ? JSON.parse(userData) : null;
        setCurrentUser(user);

        const res = await fetch("http://localhost:8080/users");
        const data = await res.json();
        const normalizedData = data.map(project => ({
          ...project,
          id: project.id || project.Id,
          status: project.status || "Belum dikerjakan" // Set default status
        }));
        setProjects(normalizedData || []);

        if (user && user.role === "karyawan" && user.picName) {
          setSelectedPic(user.picName);
        }
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const role = localStorage.getItem("userRole") || "karyawan";
    setUserRole(role);
  }, []);

  const handleViewClick = async (projectId) => {
    setModalLoading(true);
    try {
      const result = await axios.get(`http://localhost:8080/user/${projectId}`);
      setModalUser(result.data);
    } catch (error) {
      console.error("Error loading user:", error);
      setModalUser({});
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalUser(null);
  };

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const allPics = useMemo(() => {
    const pics = [...new Set(projects.map(p => p.picName).filter(Boolean))].sort();
    if (userRole === "karyawan" && currentUser?.picName) {
      return pics.filter(pic => pic === currentUser.picName);
    }
    return pics;
  }, [projects, userRole, currentUser]);

  const filteredPics = useMemo(() => {
    if (!searchTerm) return allPics;
    return allPics.filter(pic => 
      pic.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allPics, searchTerm]);

  const allStatuses = useMemo(() => {
    return ["Semua", ...new Set(projects.map(p => p.status).filter(Boolean))].sort();
  }, [projects]);

  const picProjects = useMemo(() => {
    if (!selectedPic) return [];
    let filteredProjects = projects.filter(p => p.picName === selectedPic);
    if (statusFilter !== "Semua") {
      filteredProjects = filteredProjects.filter(p => p.status === statusFilter);
    }
    return filteredProjects;
  }, [projects, selectedPic, statusFilter]);

  const taskListData = useMemo(() => {
    return picProjects.map((p, idx) => ({
      no: idx + 1,
      projectName: p.projectName || "-",
      status: p.status || "Belum dikerjakan",
      startDate: formatDate(p.startDate),
      endDate: formatDate(p.endDate),
      progress: p.progress ? `${p.progress}%` : "-",
      id: p.id
    }));
  }, [picProjects]);

  const availableSlots = useMemo(() => {
    if (!selectedPic) return [];
    
    const projRanges = picProjects
      .map((p) => ({
        start: parseDate(p.startDate),
        end: parseDate(p.endDate),
      }))
      .filter((r) => r.start && r.end)
      .sort((a, b) => a.start - b.start);

    const tmr = tomorrow();
    const results = [];
    let availableStart = new Date(tmr);

    projRanges.forEach((proj) => {
      if (availableStart <= tmr) availableStart = new Date(tmr);

      if (proj.start > availableStart) {
        const availableEnd = new Date(startOfDay(proj.start));
        availableEnd.setDate(availableEnd.getDate() - 1);

        if (availableStart <= availableEnd && availableEnd.getFullYear() === currentYear) {
          results.push({
            start: startOfDay(availableStart),
            end: startOfDay(availableEnd),
            workdays: countWorkdays(availableStart, availableEnd),
          });
        }
      }

      let nextStart = new Date(startOfDay(proj.end));
      nextStart.setDate(nextStart.getDate() + 1);
      if (nextStart <= tmr) nextStart = new Date(tmr);
      if (nextStart > availableStart) availableStart = new Date(nextStart);
    });

    if (availableStart) {
      if (availableStart <= tmr) availableStart = new Date(tmr);
      const lastEnd = endOfYearFor(availableStart);
      if (availableStart <= lastEnd && lastEnd.getFullYear() === currentYear) {
        results.push({
          start: startOfDay(availableStart),
          end: startOfDay(lastEnd),
          workdays: countWorkdays(availableStart, lastEnd),
        });
      }
    }

    return results;
  }, [picProjects, currentYear]);

  const rekapData = useMemo(() => {
    const grouped = {};
    picProjects.forEach((p) => {
      const status = p.status || "Belum dikerjakan";
      grouped[status] = (grouped[status] || 0) + 1;
    });

    return Object.entries(grouped).map(([status, count]) => ({
      status,
      count
    }));
  }, [picProjects]);

  const chartData = useMemo(() => {
    const barData = Object.keys(CATEGORY_MAPPING).map(cat => {
      const filtered = picProjects.filter(p => {
        const endDate = parseDate(p.endDate);
        const isMatchCategory = CATEGORY_MAPPING[cat].includes(p.category);
        const isMatchMonth = endDate && 
                            endDate.getFullYear() === currentYear && 
                            endDate.getMonth() === currentMonth;
        return isMatchCategory && isMatchMonth;
      });

      const selesai = filtered.filter(p => p.status === "Selesai").length;
      const belumSelesai = filtered.filter(p => STATUS_BELUM.includes(p.status)).length;

      return { 
        category: cat, 
        Selesai: selesai, 
        "Belum Selesai": belumSelesai 
      };
    });

    const pieData = Object.keys(CATEGORY_MAPPING).map((cat, i) => {
      const filtered = picProjects.filter(p => {
        const endDate = parseDate(p.endDate);
        const isMatchCategory = CATEGORY_MAPPING[cat].includes(p.category);
        const isMatchMonth = endDate && 
                            endDate.getFullYear() === currentYear && 
                            endDate.getMonth() === currentMonth;
        return isMatchCategory && isMatchMonth;
      });
      return { 
        name: cat, 
        value: filtered.length, 
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] 
      };
    });

    return { barData, pieData };
  }, [picProjects, currentYear, currentMonth]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "18px", color: "#666" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5"}}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h3 style={{ marginBottom: "24px", color: "#333", textAlign: "center" }}>
          Dashboard Development
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: selectedPic ? "300px 1fr" : "1fr", gap: "20px" }}>
          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "8px", 
            padding: "20px", 
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            height: "fit-content",
            position: "sticky",
            top: "20px"
          }}>
            <h4 style={{ marginBottom: "16px", color: "#333" }}>Daftar Karyawan</h4>
            <input
              type="text"
              placeholder="Cari karyawan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                marginBottom: "16px",
                fontSize: "14px"
              }}
              disabled={userRole === "karyawan" && currentUser?.picName}
            />
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {filteredPics.length > 0 ? (
                filteredPics.map((pic) => (
                  <button
                    key={pic}
                    onClick={() => setSelectedPic(pic)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      marginBottom: "8px",
                      border: selectedPic === pic ? "2px solid #007bff" : "1px solid #ddd",
                      borderRadius: "6px",
                      backgroundColor: selectedPic === pic ? "#ffffffff" : "white",
                      color: selectedPic === pic ? "#007bff" : "#333",
                      cursor: "pointer",
                      textAlign: "left",
                      fontWeight: selectedPic === pic ? "bold" : "normal",
                      transition: "all 0.2s"  
                    }}
                    onMouseEnter={(e) => {
                      if (selectedPic !== pic) {
                        e.target.style.backgroundColor = "#f8f9fa";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedPic !== pic) {
                        e.target.style.backgroundColor = "white";
                      }
                    }}
                  >
                    {pic}
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                      {projects.filter(p => p.picName === pic).length} projects
                    </div>
                  </button>
                ))
              ) : (
                <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>
                  Tidak ada karyawan ditemukan
                </div>
              )}
            </div>
          </div>

          {selectedPic ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ 
                backgroundColor: "white", 
                borderRadius: "8px", 
                padding: "24px", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)" 
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "#333" }}>{selectedPic}</h3>
                    <p style={{ margin: "8px 0 0 0", color: "#666" }}>
                      Total Projects: {picProjects.length}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPic(null)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Tutup
                  </button>
                </div>
              </div>

              <div style={{ 
                backgroundColor: "white", 
                borderRadius: "8px", 
                padding: "24px", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)" 
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h4 style={{ margin: 0, color: "#333" }}>Task List</h4>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                  >
                    {allStatuses.map((status, idx) => (
                      <option key={idx} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead style={{ backgroundColor: "#000000ff", color: "white" }}>
                      <tr>
                        <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>No</th>
                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>Project Name</th>
                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>Status</th>
                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>Start Date</th>
                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>End Date</th>
                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>Progress</th>
                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taskListData.length > 0 ? (
                        taskListData.map((task, idx) => (
                          <tr key={task.id || idx} style={{ backgroundColor: idx % 2 === 0 ? "#f8f9fa" : "white" }}>
                            <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>{task.no}</td>
                            <td style={{ padding: "12px", border: "1px solid #ddd" }}>{task.projectName}</td>
                            <td style={{ padding: "12px", border: "1px solid #ddd" }}>{task.status}</td>
                            <td style={{ padding: "12px", border: "1px solid #ddd" }}>{task.startDate}</td>
                            <td style={{ padding: "12px", border: "1px solid #ddd" }}>{task.endDate}</td>
                            <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>{task.progress}</td>
                            <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleViewClick(task.id)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                            Tidak ada data task
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {modalUser && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    padding: "20px"
                  }}
                >
                  <div style={{ maxHeight: "90vh", overflowY: "auto", width: "100%", maxWidth: "800px" }}>
                    {modalLoading ? (
                      <div className="p-5 text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Mengambil data...</p>
                      </div>
                    ) : (
                      <ViewKaryawanModal user={modalUser} onClose={closeModal} />
                    )}
                  </div>
                </div>
              )}

              <div style={{ 
                backgroundColor: "white", 
                borderRadius: "8px", 
                padding: "24px", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)" 
              }}>
                <h4 style={{ marginBottom: "16px", color: "#333" }}>Available ({currentYear})</h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead style={{ backgroundColor: "#101110ff", color: "white" }}>
                      <tr>
                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>No</th>
                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>Available Start</th>
                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>Available End</th>
                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>Workdays</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableSlots.length > 0 ? (
                        <>
                          {availableSlots.map((slot, idx) => (
                            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#f8f9fa" : "white" }}>
                              <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>{idx + 1}</td>
                              <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>{formatDate(slot.start)}</td>
                              <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>{formatDate(slot.end)}</td>
                              <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>{slot.workdays}</td>
                            </tr>
                          ))}
                          <tr style={{ backgroundColor: "#0d0f0eff", color: "white", fontWeight: "bold" }}>
                            <td colSpan="3" style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>TOTAL</td>
                            <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>
                              {availableSlots.reduce((sum, s) => sum + s.workdays, 0)}
                            </td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                            Tidak ada available slots
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ 
                backgroundColor: "white", 
                borderRadius: "8px", 
                padding: "24px", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)" 
              }}>
                <h4 style={{ marginBottom: "16px", color: "#333" }}>Rekap Project</h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead style={{ backgroundColor: "#0d0f0eff", color: "white" }}>
                      <tr>
                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>Status</th>
                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rekapData.length > 0 ? (
                        <>
                          {rekapData.map((item, idx) => (
                            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#f8f9fa" : "white" }}>
                              <td style={{ padding: "12px", border: "1px solid #ddd" }}>{item.status}</td>
                              <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>{item.count}</td>
                            </tr>
                          ))}
                          <tr style={{ backgroundColor: "#0d0f0eff", color: "white", fontWeight: "bold" }}>
                            <td style={{ padding: "12px", border: "1px solid #ddd" }}>TOTAL</td>
                            <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>
                              {rekapData.reduce((sum, r) => sum + r.count, 0)}
                            </td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan="2" style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                            Tidak ada data rekap
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ 
                backgroundColor: "white", 
                borderRadius: "8px", 
                padding: "24px", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)" 
              }}>
                <h4 style={{ marginBottom: "16px", color: "#333" }}>
                  Grafik - {monthNames[currentMonth]} {currentYear}
                </h4>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px" }}>
                  <div>
                    <h5 style={{ marginBottom: "12px", fontSize: "16px", color: "#555" }}>
                      Selesai vs Belum Selesai
                    </h5>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Selesai" fill={STATUS_COLORS.Selesai} />
                        <Bar dataKey="Belum Selesai" fill={STATUS_COLORS["Belum Selesai"]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h5 style={{ marginBottom: "12px", fontSize: "16px", color: "#555" }}>
                      Persentase Kategori
                    </h5>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie 
                          data={chartData.pieData} 
                          dataKey="value" 
                          nameKey="name" 
                          cx="50%" 
                          cy="50%" 
                          outerRadius={80} 
                          label
                        >
                          {chartData.pieData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div style={{ marginTop: "20px" }}>
                  <h6 style={{ marginBottom: "12px", fontWeight: "bold" }}>Detail Data:</h6>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead style={{ backgroundColor: "#0d0f0eff", color: "white" }}>
                      <tr>
                        <th style={{ padding: "10px", border: "1px solid #ddd" }}>Kategori</th>
                        <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>Selesai</th>
                        <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>Belum Selesai</th>
                        <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.barData.map((item, idx) => (
                        <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "white" : "#f8f9fa" }}>
                          <td style={{ padding: "10px", border: "1px solid #ddd" }}>{item.category}</td>
                          <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>{item.Selesai}</td>
                          <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>{item["Belum Selesai"]}</td>
                          <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center", fontWeight: "bold" }}>
                            {item.Selesai + item["Belum Selesai"]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ 
              backgroundColor: "white", 
              borderRadius: "8px", 
              padding: "60px 24px", 
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>👈</div>
              <h3 style={{ color: "#666", marginBottom: "8px" }}>Pilih Karyawan</h3>
              <p style={{ color: "#999" }}>Klik nama karyawan di sidebar untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}