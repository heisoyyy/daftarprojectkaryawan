import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button, Nav, Tab } from "react-bootstrap";
import { FaFileExcel, FaFileCsv } from "react-icons/fa";
import Select from "react-select";
import * as XLSX from "xlsx";

export default function Rekap() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter untuk Tab 1 (PIC dan Status)
  const [picFilterStatusTab, setPicFilterStatusTab] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);

  // Filter untuk Tab 2 (PIC dan Category3)
  const [picFilterCategoryTab, setPicFilterCategoryTab] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState([]);

  const [modernUI, setModernUI] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://192.168.1.22:8080/users");
        setProjects(res.data || []);
      } catch (e) {
        console.error("Error fetch /users:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ================== FILTER & GROUPING UNTUK TAB 1 (PIC dan Status) ==================
  const rowsStatusTab = useMemo(() => {
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

    Object.entries(byPic).forEach(([pic, data]) => {
      if (picFilterStatusTab.length > 0 && !picFilterStatusTab.includes(pic)) return;

      let filteredData = data;
      if (statusFilter.length > 0) {
        filteredData = data.filter((d) => statusFilter.includes(d.status));
      }

      if (filteredData.length === 0) return;

      const rowSpan = filteredData.length + 1;
      filteredData.forEach((d, idx) => {
        result.push({
          nomor: idx === 0 ? nomor : "",
          pic: idx === 0 ? pic : "",
          status: d.status,
          count: d.count,
          rowSpan,
          isTotal: false,
        });
      });

      result.push({
        nomor: "",
        pic: "",
        status: "TOTAL",
        count: filteredData.reduce((sum, d) => sum + d.count, 0),
        isTotal: true,
      });

      nomor++;
    });

    return result;
  }, [projects, picFilterStatusTab, statusFilter]);

  // ================== FILTER & GROUPING UNTUK TAB 2 (PIC dan Category3) ==================
  const rowsCategoryTab = useMemo(() => {
    const grouped = {};

    projects.forEach((p) => {
      const pic = p.picName || "(No PIC)";
      const category3 = p.category3 || "-";
      const key = `${pic}||${category3}`;
      grouped[key] = (grouped[key] || 0) + 1;
    });

    const byPic = {};
    Object.entries(grouped).forEach(([key, count]) => {
      const [pic, category3] = key.split("||");
      if (!byPic[pic]) byPic[pic] = [];
      byPic[pic].push({ category3, count });
    });

    let nomor = 1;
    const result = [];

    Object.entries(byPic).forEach(([pic, data]) => {
      if (picFilterCategoryTab.length > 0 && !picFilterCategoryTab.includes(pic)) return;

      let filteredData = data;
      if (categoryFilter.length > 0) {
        filteredData = data.filter((d) => categoryFilter.includes(d.category3));
      }

      if (filteredData.length === 0) return;

      const rowSpan = filteredData.length + 1;
      filteredData.forEach((d, idx) => {
        result.push({
          nomor: idx === 0 ? nomor : "",
          pic: idx === 0 ? pic : "",
          category3: d.category3,
          count: d.count,
          rowSpan,
          isTotal: false,
        });
      });

      result.push({
        nomor: "",
        pic: "",
        category3: "TOTAL",
        count: filteredData.reduce((sum, d) => sum + d.count, 0),
        isTotal: true,
      });

      nomor++;
    });

    return result;
  }, [projects, picFilterCategoryTab, categoryFilter]);

  const uniquePics = [...new Set(projects.map((p) => p.picName || "(No PIC)"))].sort();
  const uniqueStatuses = [...new Set(projects.map((p) => p.status || "Unknown"))].sort();
  const uniqueCategories = [...new Set(projects.map((p) => p.category3 || "-"))].sort();

  // ================== EXPORT FUNCTION ==================
  const exportToFile = (rows, filename, type = "xlsx", tabType = "status") => {
    const data = rows.map((r, i) => {
      if (tabType === "status") {
        return {
          No: r.nomor || i + 1,
          "PIC Name": r.pic,
          Status: r.status,
          "Jumlah Project": r.count,
        };
      } else {
        return {
          No: r.nomor || i + 1,
          "PIC Name": r.pic,
          "Kategori 3": r.category3,
          "Jumlah Project": r.count,
        };
      }
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap");

    if (type === "csv") {
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      XLSX.writeFile(wb, filename);
    }
  };

  if (loading) return <div className="p-3">Loading…</div>;

  return (
    <div className="card p-3 shadow">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Rekap Project per PIC</h4>
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              setPicFilterStatusTab([]);
              setStatusFilter([]);
              setPicFilterCategoryTab([]);
              setCategoryFilter([]);
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

      <Tab.Container defaultActiveKey="statusTab">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="statusTab">Rekap by Status</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="categoryTab">Rekap by Kategori</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* TAB 1: Rekap by PIC dan Status */}
          <Tab.Pane eventKey="statusTab">
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold">Filter PIC</label>
                {modernUI ? (
                  <Select
                    isMulti
                    options={uniquePics.map((p) => ({ value: p, label: p }))}
                    value={picFilterStatusTab.map((p) => ({ value: p, label: p }))}
                    onChange={(selected) => setPicFilterStatusTab(selected.map((s) => s.value))}
                    placeholder="Select PIC..."
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  />
                ) : (
                  <select
                    multiple
                    className="form-select"
                    value={picFilterStatusTab}
                    onChange={(e) =>
                      setPicFilterStatusTab(Array.from(e.target.selectedOptions, (o) => o.value))
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
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
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

            <div className="d-flex justify-content-end mb-2 gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => exportToFile(rowsStatusTab, "Rekap_Status.xlsx", "xlsx", "status")}
              >
                <FaFileExcel /> Excel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => exportToFile(rowsStatusTab, "Rekap_Status.csv", "csv", "status")}
              >
                <FaFileCsv /> CSV
              </Button>
            </div>

            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              <table className="table table-bordered table-hover align-middle text-center shadow-sm">
                <thead className="table-primary">
                  <tr>
                    <th style={{ width: "5%" }}>No</th>
                    <th style={{ width: "35%" }}>PIC Name</th>
                    <th style={{ width: "35%" }}>Status</th>
                    <th style={{ width: "25%" }}>Jumlah Project</th>
                  </tr>
                </thead>
                <tbody className="table-light">
                  {rowsStatusTab.length > 0 ? (
                    rowsStatusTab.map((row, idx) => (
                      <tr key={idx} className={row.isTotal ? "table-warning fw-bold" : ""}>
                        {row.nomor && (
                          <td rowSpan={row.rowSpan} className="fw-bold align-middle">
                            {row.nomor}
                          </td>
                        )}
                        {row.pic && (
                          <td
                            rowSpan={row.rowSpan}
                            className="fw-bold text-start align-middle"
                            style={{ paddingLeft: "15px" }}
                          >
                            {row.pic}
                          </td>
                        )}
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
          </Tab.Pane>

          {/* TAB 2: Rekap by PIC dan Category3 */}
          <Tab.Pane eventKey="categoryTab">
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold">Filter PIC</label>
                {modernUI ? (
                  <Select
                    isMulti
                    options={uniquePics.map((p) => ({ value: p, label: p }))}
                    value={picFilterCategoryTab.map((p) => ({ value: p, label: p }))}
                    onChange={(selected) => setPicFilterCategoryTab(selected.map((s) => s.value))}
                    placeholder="Select PIC..."
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  />
                ) : (
                  <select
                    multiple
                    className="form-select"
                    value={picFilterCategoryTab}
                    onChange={(e) =>
                      setPicFilterCategoryTab(Array.from(e.target.selectedOptions, (o) => o.value))
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
                <label className="form-label fw-bold">Filter Kategori</label>
                {modernUI ? (
                  <Select
                    isMulti
                    options={uniqueCategories.map((c) => ({ value: c, label: c }))}
                    value={categoryFilter.map((c) => ({ value: c, label: c }))}
                    onChange={(selected) => setCategoryFilter(selected.map((s) => s.value))}
                    placeholder="Select Kategori..."
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  />
                ) : (
                  <select
                    multiple
                    className="form-select"
                    value={categoryFilter}
                    onChange={(e) =>
                      setCategoryFilter(Array.from(e.target.selectedOptions, (o) => o.value))
                    }
                    style={{ height: "150px" }}
                  >
                    {uniqueCategories.map((cat, idx) => (
                      <option key={idx} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end mb-2 gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => exportToFile(rowsCategoryTab, "Rekap_Category3.xlsx", "xlsx", "category")}
              >
                <FaFileExcel /> Excel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => exportToFile(rowsCategoryTab, "Rekap_Category3.csv", "csv", "category")}
              >
                <FaFileCsv /> CSV
              </Button>
            </div>

            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              <table className="table table-bordered table-hover align-middle text-center shadow-sm">
                <thead className="table-primary">
                  <tr>
                    <th style={{ width: "5%" }}>No</th>
                    <th style={{ width: "35%" }}>PIC Name</th>
                    <th style={{ width: "35%" }}>Kategori</th>
                    <th style={{ width: "25%" }}>Jumlah Project</th>
                  </tr>
                </thead>
                <tbody className="table-light">
                  {rowsCategoryTab.length > 0 ? (
                    rowsCategoryTab.map((row, idx) => (
                      <tr key={idx} className={row.isTotal ? "table-warning fw-bold" : ""}>
                        {row.nomor && (
                          <td rowSpan={row.rowSpan} className="fw-bold align-middle">
                            {row.nomor}
                          </td>
                        )}
                        {row.pic && (
                          <td
                            rowSpan={row.rowSpan}
                            className="fw-bold text-start align-middle"
                            style={{ paddingLeft: "15px" }}
                          >
                            {row.pic}
                          </td>
                        )}
                        <td>{row.category3}</td>
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
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
}