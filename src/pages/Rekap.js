import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";

export default function Rekap() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // multi filter
  const [picFilter, setPicFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);

  // toggle untuk mode filter
  const [modernUI, setModernUI] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8080/users");
        setProjects(res.data || []);
      } catch (e) {
        console.error("Error fetch /users:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Grouping logic + filter
  const rows = useMemo(() => {
    const grouped = {};
    projects.forEach((p) => {
      const pic = p.picName || "(No PIC)";
      const status = p.status || "Unknown";
      const key = `${pic}||${status}`;
      grouped[key] = (grouped[key] || 0) + 1;
    });

    const byPic = {};
    Object.entries(grouped).forEach(([key, count]) => {
      const [pic, status] = key.split("||");
      if (!byPic[pic]) byPic[pic] = [];
      byPic[pic].push({ status, count });
    });

    let nomor = 1;
    const result = [];

    Object.entries(byPic).forEach(([pic, statuses]) => {
      if (picFilter.length > 0 && !picFilter.includes(pic)) return;

      statuses.forEach((s, idx) => {
        if (statusFilter.length > 0 && !statusFilter.includes(s.status)) return;

        result.push({
          nomor: idx === 0 ? nomor : "",
          pic: idx === 0 ? pic : "",
          status: s.status,
          count: s.count,
          isTotal: false,
        });
      });

      const filteredStatuses =
        statusFilter.length > 0
          ? statuses.filter((s) => statusFilter.includes(s.status))
          : statuses;

      if (filteredStatuses.length > 0) {
        result.push({
          nomor: "",
          pic: "",
          status: "TOTAL",
          count: filteredStatuses.reduce((sum, s) => sum + s.count, 0),
          isTotal: true,
        });
        nomor++;
      }
    });

    return result;
  }, [projects, picFilter, statusFilter]);

  const uniquePics = [...new Set(projects.map((p) => p.picName || "(No PIC)"))];
  const uniqueStatuses = [...new Set(projects.map((p) => p.status || "Unknown"))];

  if (loading) return <div className="p-3">Loading…</div>;

  return (
    <div className="card p-3 shadow">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Rekap Project per PIC</h4>
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              setPicFilter([]);
              setStatusFilter([]);
            }}
          >
            Reset Filter
          </button>
          <div className="form-check form-switch m-0">
            <input
              className="form-check-input"
              type="checkbox"
              checked={modernUI}
              onChange={() => setModernUI(!modernUI)}
            />
            <label className="form-check-label">Modern UI</label>
          </div>
        </div>
      </div>

      {/* Filter controls */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label fw-bold">Filter PIC</label>
          {modernUI ? (
            <Select
              isMulti
              options={uniquePics.map((p) => ({ value: p, label: p }))}
              value={picFilter.map((p) => ({ value: p, label: p }))}
              onChange={(selected) => setPicFilter(selected.map((s) => s.value))}
              placeholder="Select PIC..."
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 })
              }}
            />
          ) : (
            <select
              multiple
              className="form-select"
              value={picFilter}
              onChange={(e) =>
                setPicFilter(Array.from(e.target.selectedOptions, (o) => o.value))
              }
              style={{ height: "150px" }}
            >
              {uniquePics.map((pic, idx) => (
                <option key={idx} value={pic}>
                  {pic}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="col-md-6">
          <label className="form-label fw-bold">Filter Status</label>
          {modernUI ? (
            <Select
              isMulti
              options={uniqueStatuses.map((s) => ({ value: s, label: s }))}
              value={statusFilter.map((s) => ({ value: s, label: s }))}
              onChange={(selected) => setStatusFilter(selected.map((s) => s.value))}
              placeholder="Select Status..."
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 })
              }}
            />
          ) : (
            <select
              multiple
              className="form-select"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(Array.from(e.target.selectedOptions, (o) => o.value))
              }
              style={{ height: "150px" }}
            >
              {uniqueStatuses.map((st, idx) => (
                <option key={idx} value={st}>
                  {st}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="table table-bordered table-hover align-middle text-center shadow-sm">
        <thead className="table-primary">
          <tr>
            <th style={{ width: "5%" }}>No</th>
            <th style={{ width: "25%" }}>PIC Name</th>
            <th style={{ width: "30%" }}>Status</th>
            <th style={{ width: "10%" }}>Count of Project</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, idx) => (
              <tr
                key={idx}
                className={row.isTotal ? "table-secondary fw-bold" : ""}
              >
                <td className={row.nomor ? "fw-bold" : ""}>{row.nomor}</td>
                <td className={row.pic ? "fw-bold" : ""}>{row.pic}</td>
                <td>{row.status}</td>
                <td>{row.count}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>No matching data found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
