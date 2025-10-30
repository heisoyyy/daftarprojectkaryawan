import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 🔹 Utils konversi tanggal
const toBackendDate = (dateStr) => {
  if (!dateStr) return null;
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}/${mm}/${yyyy}`;
};

// 🔹 Hitung jumlah workdays (exclude Sabtu & Minggu)
const calculateWorkdays = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  let count = 0;

  while (startDate <= endDate) {
    const day = startDate.getDay();
    if (day !== 0 && day !== 6) count++;
    startDate.setDate(startDate.getDate() + 1);
  }

  return count;
};

const calculateEndDate = (start, duration) => {
  let date = new Date(start);
  let daysAdded = 0;

  while (daysAdded < duration) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) daysAdded++;
  }

  return date.toISOString().split("T")[0];
};

export default function AddUser() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    projectName: "",
    picName: "",
    status: "",
    receiveDate: "",
    startDate: "",
    endDate: "",
    devDuration: "",
    tglSit: "",
    tglUat: "",
    stsFsd: "",
    projectOwner: "",
    statusDokumenBrdOrChangeRequest: "",
    applicationName: "",
    category: "",
    category2: "",
    category3: "",
    target: "",
    progress: "",
    col1: 0,
    col2: 0,
    col3: 0,
    col4: 0,
    col5: 0,
    col6: 0,
    col7: 0,
    col8: 0,
    col9: 0,
    col10: 0,
    col11: 0,
    col12: 0,
    keterangan: ""
  });

  const [picNames, setPicNames] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // 🔹 Fetch PIC names and statuses from database
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get("http://192.168.1.22:8080/users");
        const projects = response.data || [];

        // Extract unique picNames and statuses
        const uniquePicNames = [...new Set(projects
          .map(project => project.picName)
          .filter(name => name && name.trim() !== ""))]
          .sort();

        const uniqueStatuses = [...new Set(projects
          .map(project => project.status)
          .filter(status => status && status.trim() !== ""))]
          .sort();

        setPicNames(uniquePicNames);
        setStatuses(uniqueStatuses);
      } catch (error) {
        console.error("Error fetching options:", error);
        // Fallback to default statuses
        setPicNames([]);
        setStatuses([
          "Belum dikerjakan",
          "Sedang dikerjakan",
          "Hold",
          "Ready SIT",
          "Ready Testing",
          "Ready UAT",
          "Sedang SIT",
          "SIT Cancel",
          "Selesai"
        ]);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // 🔹 Handle input change
  const onInputChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...user, [name]: value };

    // 🔹 Hitung devDuration otomatis dari startDate & endDate
    if ((name === "startDate" || name === "endDate") && updated.startDate && updated.endDate) {
      const dur = calculateWorkdays(updated.startDate, updated.endDate);
      updated.devDuration = dur?.toString() || "";
    }

    // 🔹 Hitung endDate otomatis dari startDate + devDuration
    if ((name === "startDate" || name === "devDuration") && updated.startDate && updated.devDuration) {
      const durNum = parseInt(updated.devDuration, 10);
      if (!isNaN(durNum) && durNum > 0) {
        updated.endDate = calculateEndDate(updated.startDate, durNum);
      }
    }

    setUser(updated);
  };

  // 🔹 Submit form
  // Di AddUser.jsx, update fungsi onSubmit
  const onSubmit = async (e) => {
    e.preventDefault();
    
    const username = localStorage.getItem('username') || 'Unknown';
    const role = localStorage.getItem('userRole') || 'Unknown';
    
    try {
      const payload = {
        ...user,
        receiveDate: toBackendDate(user.receiveDate),
        startDate: toBackendDate(user.startDate),
        endDate: toBackendDate(user.endDate),
        target: toBackendDate(user.target),
        devDuration: parseInt(user.devDuration) || 0,
        col1: parseInt(user.col1) || 0,
        col2: parseInt(user.col2) || 0,
        col3: parseInt(user.col3) || 0,
        col4: parseInt(user.col4) || 0,
        col5: parseInt(user.col5) || 0,
        col6: parseInt(user.col6) || 0,
        col7: parseInt(user.col7) || 0,
        col8: parseInt(user.col8) || 0,
        col9: parseInt(user.col9) || 0,
        col10: parseInt(user.col10) || 0,
        col11: parseInt(user.col11) || 0,
        col12: parseInt(user.col12) || 0,
        statusDokumenBrdOrChangeRequest: user.statusDokumenBrdOrChangeRequest || "-"
      };

      await axios.post("http://192.168.1.22:8080/user", payload);
      
      alert(
        `✅ Project berhasil ditambahkan!\n\n` +
        `📝 Ditambahkan oleh: ${username}\n` +
        `👤 Role: ${role}\n` +
        `📋 Data telah tercatat di History`
      );
      
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("❌ Gagal menambahkan project. Silakan coba lagi!");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-dark text-white text-center py-3 rounded-top-4">
          <h3 className="mb-0">Tambah Project</h3>
        </div>
        <div className="card-body p-4">
          <form onSubmit={onSubmit} className="row g-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Project Name</label>
              <input
                type="text"
                className="form-control shadow-sm"
                name="projectName"
                value={user.projectName}
                onChange={onInputChange}
                placeholder="Nama Project"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">PIC Name</label>
              <input
                type="text"
                className="form-control shadow-sm"
                name="picName"
                value={user.picName}
                onChange={onInputChange}
                placeholder="Masukkan atau pilih nama PIC"
                list="picNamesList"
                disabled={loadingOptions}
              />
              <datalist id="picNamesList">
                {loadingOptions ? (
                  <option value="Memuat PIC..." />
                ) : (
                  picNames.map((name, index) => (
                    <option key={index} value={name} />
                  ))
                )}
              </datalist>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Status</label>
              <select
                className="form-select shadow-sm"
                name="status"
                value={user.status}
                onChange={onInputChange}
                disabled={loadingOptions}
              >
                <option value="">-- Pilih Status --</option>
                {loadingOptions ? (
                  <option value="">Memuat status...</option>
                ) : (
                  statuses.map((status, index) => (
                    <option key={index} value={status}>
                      {status}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Receive Date</label>
              <input
                type="date"
                className="form-control shadow-sm"
                name="receiveDate"
                value={user.receiveDate}
                onChange={onInputChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Start Date</label>
              <input
                type="date"
                className="form-control shadow-sm"
                name="startDate"
                value={user.startDate}
                onChange={onInputChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">End Date</label>
              <input
                type="date"
                className="form-control shadow-sm"
                name="endDate"
                value={user.endDate}
                onChange={onInputChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Dev Duration (hari)</label>
              <input
                type="number"
                className="form-control shadow-sm"
                name="devDuration"
                value={user.devDuration}
                onChange={onInputChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Project Owner</label>
              <input
                type="text"
                className="form-control shadow-sm"
                name="projectOwner"
                value={user.projectOwner}
                onChange={onInputChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Target</label>
              <input
                type="date"
                className="form-control shadow-sm"
                name="target"
                value={user.target}
                onChange={onInputChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">Keterangan</label>
              <textarea
                className="form-control shadow-sm"
                name="keterangan"
                rows="3"
                value={user.keterangan}
                onChange={onInputChange}
              />
            </div>

            <div className="d-flex justify-content-center mt-3">
              <button type="submit" className="btn btn-outline-primary px-4 me-2 shadow-sm">
                Save
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary px-4 shadow-sm"
                onClick={() => navigate("/")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}