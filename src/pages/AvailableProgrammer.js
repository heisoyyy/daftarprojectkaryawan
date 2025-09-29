import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Tabs, Tab, Button, OverlayTrigger, Popover } from "react-bootstrap";
import { FaFileExcel, FaFileCsv } from "react-icons/fa";
import Select from "react-select";
import * as XLSX from "xlsx";

// 🎯 Daftar libur nasional
const HOLIDAYS = [
  "2025-01-01",
  "2025-03-31",
  "2025-05-01",
  "2025-05-29",
  "2025-06-01",
  "2025-12-25",
];

// 🔄 Helper parseDate
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
  return new Date(val);
};

export default function AvailableProgrammer() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPic, setSelectedPic] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8080/users");
        setProjects(res.data || []);
      } catch (e) {
        console.error("Error fetching /users:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  };

  const isHoliday = (date) => {
    const day = date.getDay();
    const iso = date.toISOString().split("T")[0];
    return day === 0 || day === 6 || HOLIDAYS.includes(iso);
  };

  const countWorkdays = (start, end) => {
    let workdays = 0;
    let cur = new Date(start);
    while (cur <= end) {
      if (!isHoliday(cur)) workdays++;
      cur.setDate(cur.getDate() + 1);
    }
    return workdays;
  };

  // Filter projects by PIC & Status
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchPic = selectedPic.length === 0 || selectedPic.includes(p.picName || "(No PIC)");
      const matchStatus = selectedStatus.length === 0 || selectedStatus.includes(p.status || "(No Status)");
      return matchPic && matchStatus;
    });
  }, [projects, selectedPic, selectedStatus]);

  // 🔵 Detailed Rows (Available)
  const detailedRows = useMemo(() => {
    const byPic = filteredProjects.reduce((acc, p) => {
      const key = p.picName || "(No PIC)";
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {});

    const result = [];
    Object.entries(byPic).forEach(([pic, list]) => {
      const sorted = list
        .map((p) => ({ start: parseDate(p.startDate), end: parseDate(p.endDate) }))
        .filter((d) => d.start && d.end)
        .sort((a, b) => a.start - b.start);

      let today = new Date();
      let availableStart = new Date(today);
      availableStart.setDate(today.getDate() + 1);

      sorted.forEach((proj) => {
        if (proj.start > availableStart) {
          let availableEnd = new Date(proj.start);
          availableEnd.setDate(proj.start.getDate() - 1);
          if (availableStart <= availableEnd) {
            result.push({
              pic,
              start: new Date(availableStart),
              end: new Date(availableEnd),
              workdays: countWorkdays(availableStart, availableEnd),
            });
          }
        }
        availableStart = new Date(proj.end);
        availableStart.setDate(proj.end.getDate() + 1);
      });

      // Slot terakhir sampai akhir tahun proyek, otomatis pindah ke tahun berikut jika perlu
      const lastSlotEndYear = availableStart.getFullYear();
      const lastEnd = new Date(lastSlotEndYear, 11, 31); // 31 Desember tahun yang sesuai
      result.push({
        pic,
        start: availableStart,
        end: lastEnd,
        workdays: countWorkdays(availableStart, lastEnd),
      });
    });

    return result.sort((a, b) => a.pic === b.pic ? a.start - b.start : a.pic.localeCompare(b.pic));
  }, [filteredProjects]);

  // 🔵 Nearest Rows (ambil available terdekat per PIC)
  const nearestRows = useMemo(() => {
    const firstAvailablePerPic = {};
    const today = new Date();

    detailedRows.forEach((r) => {
      if (r.end < today) return; // skip yang sudah lewat
      if (!firstAvailablePerPic[r.pic] || r.start < firstAvailablePerPic[r.pic].start) {
        firstAvailablePerPic[r.pic] = r;
      }
    });

    return Object.values(firstAvailablePerPic).sort((a, b) => a.start - b.start);
  }, [detailedRows]);

  // 🔹 Popover multi-slot
  const getNextAvailabilitiesPopover = (pic) => {
    const today = new Date();
    const picSlots = detailedRows
      .filter((r) => r.pic === pic)
      .filter((r) => r.end >= today) // hanya slot yang belum lewat
      .sort((a, b) => a.start - b.start);

    return (
      <Popover
        id={`popover-next-${pic}`}
        style={{
          maxWidth: "300px",
          backgroundColor: "#000",
          color: "#fff",
          border: "1px solid #fff",
        }}
      >
        <Popover.Header
          as="h6"
          className="text-center"
          style={{ backgroundColor: "#000", color: "#fff", borderBottom: "1px solid #fff" }}
        >
          {pic} - Next Availabilities
        </Popover.Header>
        <Popover.Body style={{ fontSize: "0.85rem", backgroundColor: "#000", color: "#fff" }}>
          {picSlots.length > 0 ? (
            <table className="table table-sm table-borderless mb-0" style={{ color: "#fff" }}>
              <thead>
                <tr>
                  <th>Start</th>
                  <th>→</th>
                  <th>End</th>
                  <th>(WD)</th>
                </tr>
              </thead>
              <tbody>
                {picSlots.map((slot, idx) => (
                  <tr key={idx}>
                    <td>{formatDate(slot.start)}</td>
                    <td>→</td>
                    <td>{formatDate(slot.end)}</td>
                    <td>{slot.workdays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center fw-bold">Sedang Menunggu</div>
          )}
        </Popover.Body>
      </Popover>
    );
  };

  const allPics = useMemo(() => [...new Set(projects.map((p) => p.picName || "(No PIC)"))].sort(), [projects]);
  const allStatuses = useMemo(() => [...new Set(projects.map((p) => p.status || "(No Status)"))].sort(), [projects]);

  if (loading) return <div className="p-3">Loading…</div>;

  const totalDetailed = detailedRows.reduce((sum, r) => sum + r.workdays, 0);
  const totalNearest = nearestRows.reduce((sum, r) => sum + r.workdays, 0);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentDetailedRows = detailedRows.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(detailedRows.length / rowsPerPage);

  const exportToExcel = (rows, filename) => {
    const ws = XLSX.utils.json_to_sheet(
      rows.map((r, i) => ({
        No: i + 1,
        "PIC Name": r.pic,
        "Available Start": formatDate(r.start),
        "Available End": formatDate(r.end),
        Workdays: r.workdays,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Available");
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="card shadow p-4" style={{ borderRadius: "16px" }}>
      <h4 className="mb-3 text-dark fw-bold">Programmer Availability</h4>

      {/* Filter */}
      <div className="d-flex flex-column flex-md-row gap-3 mb-4">
        <div style={{ flex: 1, minWidth: "200px" }}>
          <Select
            isMulti
            options={allPics.map((p) => ({ value: p, label: p }))}
            value={selectedPic.map((p) => ({ value: p, label: p }))}
            onChange={(selected) => setSelectedPic(selected.map((s) => s.value))}
            placeholder="Filter by PIC..."
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </div>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <Select
            isMulti
            options={allStatuses.map((s) => ({ value: s, label: s }))}
            value={selectedStatus.map((s) => ({ value: s, label: s }))}
            onChange={(selected) => setSelectedStatus(selected.map((s) => s.value))}
            placeholder="Filter by Status..."
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultActiveKey="nearest" id="available-tabs" className="mb-3">
        {/* Nearest */}
        <Tab eventKey="nearest" title="Nearest">
          <div className="d-flex justify-content-end mb-2 gap-2">
            <Button variant="success" size="sm" onClick={() => exportToExcel(nearestRows, "Nearest.xlsx")}>
              <FaFileExcel /> Excel
            </Button>
            <Button variant="secondary" size="sm" onClick={() => exportToExcel(nearestRows, "Nearest.csv")}>
              <FaFileCsv /> CSV
            </Button>
          </div>
          <table className="table table-bordered table-hover text-center align-middle table-striped shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>No</th>
                <th>PIC Name</th>
                <th>Available Start</th>
                <th>Available End</th>
                <th>Workdays</th>
              </tr>
            </thead>
            <tbody>
              {nearestRows.length > 0 ? (
                <>
                  {nearestRows.map((r, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <OverlayTrigger
                          trigger={["hover", "focus"]}
                          placement="top"
                          overlay={getNextAvailabilitiesPopover(r.pic)}
                        >
                          <span style={{ cursor: "pointer" }}>{r.pic}</span>
                        </OverlayTrigger>
                      </td>
                      <td>{formatDate(r.start)}</td>
                      <td>{formatDate(r.end)}</td>
                      <td>{r.workdays}</td>
                    </tr>
                  ))}
                  <tr className="table-dark fw-bold">
                    <td colSpan={4}>TOTAL</td>
                    <td>{totalNearest}</td>
                  </tr>
                </>
              ) : (
                <tr><td colSpan={5}>No data available</td></tr>
              )}
            </tbody>
          </table>
        </Tab>

        {/* Available */}
        <Tab eventKey="available" title="Available">
          <div className="d-flex justify-content-end mb-2 gap-2">
            <Button variant="success" size="sm" onClick={() => exportToExcel(detailedRows, "Available.xlsx")}>
              <FaFileExcel /> Excel
            </Button>
            <Button variant="secondary" size="sm" onClick={() => exportToExcel(detailedRows, "Available.csv")}>
              <FaFileCsv /> CSV
            </Button>
          </div>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table className="table table-bordered table-hover text-center align-middle table-striped shadow-sm">
              <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 2 }}>
                <tr>
                  <th>No</th>
                  <th>PIC Name</th>
                  <th>Available Start</th>
                  <th>Available End</th>
                  <th>Workdays</th>
                </tr>
              </thead>
              <tbody>
                {currentDetailedRows.length > 0 ? (
                  <>
                    {currentDetailedRows.map((r, idx) => (
                      <tr key={idx}>
                        <td>{indexOfFirstRow + idx + 1}</td>
                        <td>
                          <OverlayTrigger
                            trigger={["hover", "focus"]}
                            placement="top"
                            overlay={getNextAvailabilitiesPopover(r.pic)}
                          >
                            <span style={{ cursor: "pointer" }}>{r.pic}</span>
                          </OverlayTrigger>
                        </td>
                        <td>{formatDate(r.start)}</td>
                        <td>{formatDate(r.end)}</td>
                        <td>{r.workdays}</td>
                      </tr>
                    ))}
                    <tr className="table-dark fw-bold">
                      <td colSpan={4}>TOTAL</td>
                      <td>{totalDetailed}</td>
                    </tr>
                  </>
                ) : (
                  <tr><td colSpan={5}>No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Button size="sm" variant="outline-dark" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
              <span>Page {currentPage} of {totalPages}</span>
              <Button size="sm" variant="outline-dark" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}
