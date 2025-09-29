import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// 🔹 Utils konversi format tanggal
const toInputDate = (dateStr) => {
  if (!dateStr) return "";
  const [dd, mm, yyyy] = dateStr.split("/");
  return `${yyyy}-${mm}-${dd}`;
};

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

// 🔹 Hitung end date dari startDate + durasi kerja (exclude weekend)
const calculateEndDate = (start, duration) => {
  let date = new Date(start);
  let daysAdded = 0;
  while (daysAdded < duration) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) daysAdded++;
  }
  return date.toISOString().split("T")[0]; // format YYYY-MM-DD
};

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();

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
    keterangan: "",
  });

  // 🔹 Load user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await axios.get(`http://localhost:8080/user/${id}`);
        const data = result.data;
        setUser({
          ...data,
          receiveDate: toInputDate(data.receiveDate),
          startDate: toInputDate(data.startDate),
          endDate: toInputDate(data.endDate),
          target: toInputDate(data.target),
        });
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, [id]);

  // 🔹 Handle input change
  const onInputChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...user, [name]: value };

    // Dev Duration otomatis kalau start & end date ada
    if ((name === "startDate" || name === "endDate") && updated.startDate && updated.endDate) {
      const dur = calculateWorkdays(updated.startDate, updated.endDate);
      updated.devDuration = dur?.toString() || "";
    }

    // End Date otomatis kalau start + devDuration
    if ((name === "startDate" || name === "devDuration") && updated.startDate && updated.devDuration) {
      const durNum = parseInt(updated.devDuration, 10);
      if (!isNaN(durNum) && durNum > 0) {
        updated.endDate = calculateEndDate(updated.startDate, durNum);
      }
    }

    setUser(updated);
  };

  // 🔹 Submit update
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...user,
        receiveDate: toBackendDate(user.receiveDate),
        startDate: toBackendDate(user.startDate),
        endDate: toBackendDate(user.endDate),
        target: toBackendDate(user.target),
      };
      await axios.put(`http://localhost:8080/user/${id}`, payload);
      navigate("/");
    } catch (error) {
      alert("Gagal update user!");
      console.error(error);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-dark text-light text-center py-3 rounded-top-4">
          <h3 className="mb-0">Edit Project</h3>
        </div>
        <div className="card-body p-4">
          <form onSubmit={onSubmit} className="row g-4">

            {/* --- Input Fields --- */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Project Name</label>
              <input type="text" className="form-control shadow-sm" name="projectName" value={user.projectName} onChange={onInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">PIC Name</label>
              <input type="text" className="form-control shadow-sm" name="picName" value={user.picName} onChange={onInputChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Status</label>
              <select className="form-select shadow-sm" name="status" value={user.status} onChange={onInputChange}>
                <option value="">-- Pilih Status --</option>
                <option value="Belum dikerjakan">Belum dikerjakan</option>
                <option value="Sedang dikerjakan">Sedang dikerjakan</option>
                <option value="Hold">Hold</option>
                <option value="Ready SIT">Ready SIT</option>
                <option value="Ready Testing">Ready Testing</option>
                <option value="Ready UAT">Ready UAT</option>
                <option value="Sedang SIT">Sedang SIT</option>
                <option value="SIT Cancel">SIT Cancel</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Receive Date</label>
              <input type="date" className="form-control shadow-sm" name="receiveDate" value={user.receiveDate} onChange={onInputChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Start Date</label>
              <input type="date" className="form-control shadow-sm" name="startDate" value={user.startDate} onChange={onInputChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">End Date</label>
              <input type="date" className="form-control shadow-sm" name="endDate" value={user.endDate} onChange={onInputChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Dev Duration (hari)</label>
              <input type="number" className="form-control shadow-sm" name="devDuration" value={user.devDuration} onChange={onInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Tanggal SIT</label>
              <input type="text" className="form-control shadow-sm" name="tglSit" value={user.tglSit} onChange={onInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Tanggal UAT</label>
              <input type="text" className="form-control shadow-sm" name="tglUat" value={user.tglUat} onChange={onInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">STS FSD</label>
              <input type="text" className="form-control shadow-sm" name="stsFsd" value={user.stsFsd} onChange={onInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Project Owner</label>
              <input type="text" className="form-control shadow-sm" name="projectOwner" value={user.projectOwner} onChange={onInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Status Dokumen BRD/Change</label>
              <input type="text" className="form-control shadow-sm" name="statusDokumenBrdOrChangeRequest" value={user.statusDokumenBrdOrChangeRequest} onChange={onInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Application Name</label>
              <input type="text" className="form-control shadow-sm" name="applicationName" value={user.applicationName} onChange={onInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Category 1</label>
              <input type="text" className="form-control shadow-sm" name="category" value={user.category} onChange={onInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Category 2</label>
              <input type="text" className="form-control shadow-sm" name="category2" value={user.category2} onChange={onInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Category 3</label>
              <input type="text" className="form-control shadow-sm" name="category3" value={user.category3} onChange={onInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Target</label>
              <input type="date" className="form-control shadow-sm" name="target" value={user.target} onChange={onInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Progress (%)</label>
              <input type="number" className="form-control shadow-sm" name="progress" value={user.progress} onChange={onInputChange} />
            </div>

            {/* Keterangan */}
            <div className="col-12">
              <label className="form-label fw-semibold">Keterangan</label>
              <textarea className="form-control shadow-sm" name="keterangan" value={user.keterangan} onChange={onInputChange} rows="3" />
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-center mt-3">
              <button type="submit" className="btn btn-outline-primary px-4 me-2 shadow-sm">Update</button>
              <button type="button" className="btn btn-outline-secondary px-4 shadow-sm" onClick={() => navigate("/")}>Cancel</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
