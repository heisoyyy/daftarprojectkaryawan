import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/* ===========================================================
   🔧 UTIL FUNCTIONS
   =========================================================== */
const toInputDate = (str) => (str ? str.split("/").reverse().join("-") : "");
const toBackendDate = (str) => (str ? str.split("-").reverse().join("/") : "");

const formatDate = (d) => {
  if (!d || !(d instanceof Date) || isNaN(d)) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear().toString().slice(-2);
  return `${dd}/${mm}/${yy}`;
};

const formatRange = (start, end) =>
  !start || !end ? "" : `${formatDate(start)}-${formatDate(end)}`;

const calculateWorkdays = (start, end) => {
  const s = new Date(start), e = new Date(end);
  let count = 0;
  while (s <= e) {
    const day = s.getDay();
    if (day !== 0 && day !== 6) count++;
    s.setDate(s.getDate() + 1);
  }
  return count;
};

const calculateEndDate = (start, dur) => {
  const date = new Date(start);
  let days = 0;
  while (days < dur) {
    date.setDate(date.getDate() + 1);
    if (![0, 6].includes(date.getDay())) days++;
  }
  return date.toISOString().split("T")[0];
};

const formatDatesToDB = (items) =>
  items
    ?.map((it) =>
      it.type === "range" ? formatRange(it.start, it.end) : formatDate(it.date)
    )
    .filter(Boolean)
    .join(",") || "";

const parseFromDB = (str) => {
  if (!str) return [];
  return str.split(",").map((part) => {
    const [a, b] = part.split("-");
    const parseDate = (d) => {
      const [dd, mm, yy] = d.split("/");
      return new Date(`20${yy}`, mm - 1, dd);
    };
    if (b) return { type: "range", start: parseDate(a), end: parseDate(b) };
    const d = parseDate(a);
    return { type: "solo", date: d };
  });
};

/* ===========================================================
   🎨 COMPONENT
   =========================================================== */
export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();

  /* ---------- STATE ---------- */
  const [user, setUser] = useState({
    projectName: "", picName: "", status: "", receiveDate: "",
    startDate: "", endDate: "", devDuration: "", tglSit: "",
    tglUat: "", stsFsd: "", projectOwner: "", 
    statusDokumenBrdOrChangeRequest: "", applicationName: "",
    category: "", category2: "", category3: "", target: "",
    progress: "", col1: 0, col2: 0, col3: 0, col4: 0, col5: 0, col6: 0,
    col7: 0, col8: 0, col9: 0, col10: 0, col11: 0, col12: 0,
    keterangan: ""
  });

  const [sitItems, setSitItems] = useState([]);
  const [uatItems, setUatItems] = useState([]);
  const [sitMode, setSitMode] = useState("solo");
  const [uatMode, setUatMode] = useState("solo");
  const [tempSolo, setTempSolo] = useState(null);
  const [tempRange, setTempRange] = useState([null, null]);
  const [picNames, setPicNames] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // User info untuk history
  const [currentUser, setCurrentUser] = useState({
    username: localStorage.getItem('username') || 'Unknown',
    role: localStorage.getItem('userRole') || 'Unknown'
  });

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await axios.get(`http://localhost:8080/user/${id}`);
        setSitItems(parseFromDB(data.tglSit));
        setUatItems(parseFromDB(data.tglUat));
        setUser({
          ...data,
          receiveDate: toInputDate(data.receiveDate),
          startDate: toInputDate(data.startDate),
          endDate: toInputDate(data.endDate),
          target: toInputDate(data.target),
        });
      } catch (err) {
        console.error("Error load user:", err);
        alert("❌ Gagal memuat data project!");
      }
    };

    const loadOptions = async () => {
      try {
        const res = await axios.get("http://localhost:8080/users");
        const users = res.data || [];
        setPicNames([...new Set(users.map((u) => u.picName).filter(Boolean))].sort());
        setStatuses([...new Set(users.map((u) => u.status).filter(Boolean))].sort());
      } catch (err) {
        console.error("Error loading options:", err);
        setStatuses([
          "Belum dikerjakan", "Sedang dikerjakan", "Hold",
          "Ready SIT", "Ready Testing", "Ready UAT",
          "Sedang SIT", "SIT Cancel", "Selesai"
        ]);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadData();
    loadOptions();
  }, [id]);

  /* ---------- HANDLERS ---------- */
  const onInputChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...user, [name]: value };

    if (["startDate", "endDate"].includes(name) && updated.startDate && updated.endDate) {
      updated.devDuration = calculateWorkdays(updated.startDate, updated.endDate);
    }

    if (["startDate", "devDuration"].includes(name) && updated.startDate && updated.devDuration) {
      const dur = parseInt(updated.devDuration, 10);
      if (!isNaN(dur) && dur > 0) updated.endDate = calculateEndDate(updated.startDate, dur);
    }

    setUser(updated);
  };

  const handleAddItem = (type) => {
    const mode = type === "sit" ? sitMode : uatMode;
    const items = type === "sit" ? sitItems : uatItems;
    let newItems = [...items];

    if (mode === "solo" && tempSolo) {
      newItems.push({ type: "solo", date: tempSolo });
    } else if (mode === "range" && tempRange[0] && tempRange[1]) {
      newItems.push({ type: "range", start: tempRange[0], end: tempRange[1] });
    } else {
      alert("⚠️ Silakan pilih tanggal terlebih dahulu!");
      return;
    }

    if (type === "sit") {
      setSitItems(newItems);
      setUser((u) => ({ ...u, tglSit: formatDatesToDB(newItems) }));
    } else {
      setUatItems(newItems);
      setUser((u) => ({ ...u, tglUat: formatDatesToDB(newItems) }));
    }

    // Reset temp values
    setTempSolo(null);
    setTempRange([null, null]);
  };

  const handleRemoveItem = (type, index) => {
    if (type === "sit") {
      const newItems = sitItems.filter((_, i) => i !== index);
      setSitItems(newItems);
      setUser((u) => ({ ...u, tglSit: formatDatesToDB(newItems) }));
    } else {
      const newItems = uatItems.filter((_, i) => i !== index);
      setUatItems(newItems);
      setUser((u) => ({ ...u, tglUat: formatDatesToDB(newItems) }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!user.projectName || !user.picName) {
      alert("⚠️ Project Name dan PIC Name wajib diisi!");
      return;
    }

    try {
      const payload = {
        ...user,
        receiveDate: toBackendDate(user.receiveDate),
        startDate: toBackendDate(user.startDate),
        endDate: toBackendDate(user.endDate),
        target: toBackendDate(user.target),
        devDuration: parseInt(user.devDuration) || 0,
        progress: parseInt(user.progress) || 0,
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

      await axios.put(`http://localhost:8080/user/${id}`, payload);
      
      // Success message dengan info user
      alert(
        `✅ Project berhasil diupdate!\n\n` +
        `📝 Diubah oleh: ${currentUser.username}\n` +
        `👤 Role: ${currentUser.role}\n` +
        `📋 Perubahan telah tercatat di History`
      );
      
      navigate("/");
    } catch (err) {
      console.error("Error updating user:", err);
      alert("❌ Gagal mengupdate project!\n\nSilakan coba lagi atau hubungi administrator.");
    }
  };

  /* ===========================================================
     🧱 RENDER
     =========================================================== */
  const renderDateItems = (items, type) => (
    <div className="mt-2">
      {items.length === 0 ? (
        <small className="text-muted fst-italic">Belum ada tanggal ditambahkan</small>
      ) : (
        items.map((it, i) => (
          <div key={i} className="badge bg-light text-dark border p-2 me-1 mb-1 d-inline-flex align-items-center">
            {it.type === "range" ? formatRange(it.start, it.end) : formatDate(it.date)}
            <button 
              type="button" 
              className="btn-close btn-sm ms-2" 
              style={{ fontSize: '0.6rem' }}
              onClick={() => handleRemoveItem(type, i)}
              aria-label="Remove"
            ></button>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-warning text-dark text-center py-3 rounded-top-4">
          <h3 className="mb-0">✏️ Edit Project</h3>
          <small className="text-muted">
            Diubah oleh: <strong>{currentUser.username}</strong> ({currentUser.role})
          </small>
        </div>

        <div className="card-body p-4">
          <form onSubmit={onSubmit} className="row g-4">
            
            {/* ========= BASIC INFO ========= */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Project Name <span className="text-danger">*</span>
              </label>
              <input 
                name="projectName" 
                className="form-control shadow-sm" 
                value={user.projectName} 
                onChange={onInputChange} 
                required 
                placeholder="Masukkan nama project"
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                PIC Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="picName"
                className="form-control shadow-sm"
                value={user.picName}
                onChange={onInputChange}
                placeholder="Masukkan atau pilih nama PIC"
                list="picNamesList"
                disabled={loadingOptions}
                required
              />
              <datalist id="picNamesList">
                {picNames.map((n, i) => (
                  <option key={i} value={n} />
                ))}
              </datalist>
            </div>

            {/* ========= STATUS & DATES ========= */}
            <div className="col-md-4">
              <label className="form-label fw-semibold">Status</label>
              <select 
                name="status" 
                className="form-select shadow-sm" 
                value={user.status} 
                onChange={onInputChange}
                disabled={loadingOptions}
              >
                <option value="">-- Pilih Status --</option>
                {statuses.map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-4">
              <label className="form-label fw-semibold">Receive Date</label>
              <input 
                type="date" 
                name="receiveDate" 
                className="form-control shadow-sm" 
                value={user.receiveDate} 
                onChange={onInputChange} 
              />
            </div>
            
            <div className="col-md-4">
              <label className="form-label fw-semibold">Start Date</label>
              <input 
                type="date" 
                name="startDate" 
                className="form-control shadow-sm" 
                value={user.startDate} 
                onChange={onInputChange} 
              />
            </div>

            {/* ========= DURATION ========= */}
            <div className="col-md-4">
              <label className="form-label fw-semibold">End Date</label>
              <input 
                type="date" 
                name="endDate" 
                className="form-control shadow-sm" 
                value={user.endDate} 
                onChange={onInputChange} 
              />
            </div>
            
            <div className="col-md-4">
              <label className="form-label fw-semibold">Dev Duration (hari)</label>
              <input 
                type="number" 
                name="devDuration" 
                className="form-control shadow-sm" 
                value={user.devDuration} 
                onChange={onInputChange}
                min="0"
                placeholder="Auto-calculated"
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Progress (%)</label>
              <input 
                type="number" 
                name="progress" 
                className="form-control shadow-sm" 
                min="0" 
                max="100" 
                value={user.progress} 
                onChange={onInputChange}
                placeholder="0-100"
              />
            </div>

            {/* ========= SIT / UAT ========= */}
            {[
              { label: "Tanggal SIT", mode: sitMode, setMode: setSitMode, items: sitItems, type: "sit" },
              { label: "Tanggal UAT", mode: uatMode, setMode: setUatMode, items: uatItems, type: "uat" }
            ].map(({ label, mode, setMode, items, type }) => (
              <div key={type} className="col-md-6">
                <label className="form-label fw-semibold">{label}</label>
                
                <div className="d-flex gap-2 mb-2">
                  {["solo", "range"].map((m) => (
                    <button 
                      key={m} 
                      type="button"
                      className={`btn btn-sm ${mode === m ? "btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => setMode(m)}
                    >
                      {m === "solo" ? "📅 Tanggal Tunggal" : "📆 Rentang Tanggal"}
                    </button>
                  ))}
                </div>

                <div className="input-group mb-2">
                  <DatePicker
                    selected={mode === "solo" ? tempSolo : tempRange[0]}
                    onChange={mode === "solo" ? setTempSolo : setTempRange}
                    selectsRange={mode === "range"}
                    startDate={tempRange[0]}
                    endDate={tempRange[1]}
                    dateFormat="dd/MM/yy"
                    className="form-control shadow-sm"
                    placeholderText={mode === "solo" ? "Pilih tanggal" : "Pilih rentang tanggal"}
                  />
                  <button 
                    type="button" 
                    className="btn btn-success" 
                    onClick={() => handleAddItem(type)}
                  >
                    ➕ Tambah
                  </button>
                </div>

                {renderDateItems(items, type)}
                
                <div className="mt-2 p-2 bg-light rounded">
                  <small className="text-muted">
                    <strong>DB Value:</strong> {user[type === "sit" ? "tglSit" : "tglUat"] || <em className="text-danger">Kosong</em>}
                  </small>
                </div>
              </div>
            ))}

            {/* ========= OTHER FIELDS ========= */}
            {[
              ["STS FSD", "stsFsd"], 
              ["Project Owner", "projectOwner"],
              ["Status Dokumen BRD/Change", "statusDokumenBrdOrChangeRequest"],
              ["Application Name", "applicationName"],
              ["Category 1", "category"], 
              ["Category 2", "category2"], 
              ["Category 3", "category3"]
            ].map(([label, name]) => (
              <div key={name} className="col-md-6">
                <label className="form-label fw-semibold">{label}</label>
                <input 
                  name={name} 
                  className="form-control shadow-sm" 
                  value={user[name]} 
                  onChange={onInputChange}
                  placeholder={`Masukkan ${label.toLowerCase()}`}
                />
              </div>
            ))}

            <div className="col-md-6">
              <label className="form-label fw-semibold">Target</label>
              <input 
                type="date" 
                name="target" 
                className="form-control shadow-sm" 
                value={user.target} 
                onChange={onInputChange} 
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">Keterangan</label>
              <textarea 
                name="keterangan" 
                className="form-control shadow-sm" 
                rows="3" 
                value={user.keterangan} 
                onChange={onInputChange}
                placeholder="Masukkan keterangan tambahan..."
              ></textarea>
            </div>

            {/* ========= INFO ALERT ========= */}
            <div className="col-12">
              <div className="alert alert-info d-flex align-items-center">
                <i className="bi bi-info-circle-fill me-2"></i>
                <div>
                  <strong>ℹ️ Informasi:</strong> Perubahan yang Anda lakukan akan tercatat di History 
                  dengan username <strong>{currentUser.username}</strong> dan role <strong>{currentUser.role}</strong>.
                </div>
              </div>
            </div>

            {/* ========= BUTTONS ========= */}
            <div className="d-flex justify-content-center mt-4 gap-3">
              <button 
                type="submit"
                className="btn btn-warning text-dark px-5 shadow-sm fw-bold"
              >
                💾 Update Project
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary px-5 shadow-sm" 
                onClick={() => {
                  if (window.confirm("⚠️ Perubahan belum disimpan. Yakin ingin kembali?")) {
                    navigate("/");
                  }
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}