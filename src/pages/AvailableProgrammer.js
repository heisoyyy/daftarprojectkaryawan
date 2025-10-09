import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Tabs, Tab, Button, OverlayTrigger, Popover } from "react-bootstrap";
import { FaFileExcel, FaFileCsv } from "react-icons/fa";
import Select from "react-select";
import * as XLSX from "xlsx";


// 🎯 Daftar libur nasional (contoh - update sesuai kebutuhan)
const HOLIDAYS = [
  "2025-01-01",
  "2025-03-31",
  "2025-05-01",
  "2025-05-29",
  "2025-06-01",
  "2025-12-25",
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
  if (!date) return "-";
  return startOfDay(date).toLocaleDateString("en-GB", {
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

  const currentYear = new Date().getFullYear();

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchPic = selectedPic.length === 0 || selectedPic.includes(p.picName || "(No PIC)");
      const matchStatus = selectedStatus.length === 0 || selectedStatus.includes(p.status || "(No Status)");
      return matchPic && matchStatus;
    });
  }, [projects, selectedPic, selectedStatus]);

  // ----------------- All Available (hanya tahun berjalan) -----------------
  const allAvailableSlots = useMemo(() => {
    const byPic = filteredProjects.reduce((acc, p) => {
      const key = p.picName || "(No PIC)";
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {});

    const tmr = tomorrow();
    const results = [];

    Object.entries(byPic).forEach(([pic, list]) => {
      const projRanges = list
        .map((p) => ({
          start: parseDate(p.startDate),
          end: parseDate(p.endDate),
          raw: p,
        }))
        .filter((r) => r.start && r.end && !isNaN(r.start.getTime()) && !isNaN(r.end.getTime()))
        .sort((a, b) => a.start - b.start);

      let availableStart = new Date(tmr);

      projRanges.forEach((proj) => {
        if (availableStart <= tmr) availableStart = new Date(tmr);

        if (proj.start > availableStart) {
          const availableEnd = new Date(startOfDay(proj.start));
          availableEnd.setDate(availableEnd.getDate() - 1);

          if (availableStart <= availableEnd && availableEnd.getFullYear() === currentYear) {
            results.push({
              pic,
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
            pic,
            start: startOfDay(availableStart),
            end: startOfDay(lastEnd),
            workdays: countWorkdays(availableStart, lastEnd),
          });
        }
      }
    });

    results.sort((a, b) => (a.pic === b.pic ? a.start - b.start : a.pic.localeCompare(b.pic)));
    return results;
  }, [filteredProjects]);

  // ----------------- Nearest -----------------
  const nearestSlots = useMemo(() => {
    const firstPerPic = {};
    const tmr = tomorrow();
    allAvailableSlots.forEach((slot) => {
      if (slot.end < tmr) return;
      const displayStart = slot.start < tmr ? new Date(tmr) : slot.start;
      const normalized = { ...slot, start: startOfDay(displayStart) };
      if (!firstPerPic[slot.pic] || normalized.start < firstPerPic[slot.pic].start) {
        firstPerPic[slot.pic] = normalized;
      }
    });
    return Object.values(firstPerPic).sort((a, b) => a.start - b.start);
  }, [allAvailableSlots]);

  const getPopoverForPic = (pic) => {
    const tmr = tomorrow();
    const upcoming = allAvailableSlots
      .filter((s) => s.pic === pic && s.end >= tmr)
      .sort((a, b) => a.start - b.start);

    const past = allAvailableSlots
      .filter((s) => s.pic === pic && s.end < tmr)
      .sort((a, b) => a.start - b.start);

    return (
      <Popover id={`popover-${pic}`} style={{ maxWidth: 360, backgroundColor: "#000", color: "#fff" }}>
        <Popover.Header as="h6" style={{ backgroundColor: "#000", color: "#fff", textAlign: "center" }}>
          {pic} — Next / History
        </Popover.Header>
        <Popover.Body style={{ backgroundColor: "#000", color: "#fff", fontSize: 13 }}>
          {upcoming.length > 0 ? (
            <>
              <div style={{ marginBottom: 6, fontWeight: 700 }}>Next Availabilities</div>
              <table className="table table-sm table-borderless mb-2" style={{ color: "#fff" }}>
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>Start</th>
                    <th>→</th>
                    <th style={{ width: 90 }}>End</th>
                    <th style={{ width: 40 }}>(WD)</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((s, i) => (
                    <tr key={i}>
                      <td>{formatDate(s.start)}</td>
                      <td>→</td>
                      <td>{formatDate(s.end)}</td>
                      <td>{s.workdays}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className="text-center fw-bold">Sedang Menunggu</div>
          )}

          {past.length > 0 && (
            <>
              <div style={{ marginTop: 6, fontWeight: 700 }}>Past Availabilities</div>
              <table className="table table-sm table-borderless mb-0" style={{ color: "#fff" }}>
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>Start</th>
                    <th>→</th>
                    <th style={{ width: 90 }}>End</th>
                    <th style={{ width: 40 }}>(WD)</th>
                  </tr>
                </thead>
                <tbody>
                  {past.map((s, i) => (
                    <tr key={i}>
                      <td>{formatDate(s.start)}</td>
                      <td>→</td>
                      <td>{formatDate(s.end)}</td>
                      <td>{s.workdays}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </Popover.Body>
      </Popover>
    );
  };

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

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentDetailedRows = allAvailableSlots.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(allAvailableSlots.length / rowsPerPage);

  const allPics = useMemo(() => [...new Set(projects.map((p) => p.picName || "(No PIC)"))].sort(), [projects]);
  const allStatuses = useMemo(() => [...new Set(projects.map((p) => p.status || "(No Status)"))].sort(), [projects]);

  if (loading) return <div className="p-3">Loading…</div>;

  const totalNearest = nearestSlots.reduce((s, r) => s + r.workdays, 0);
  const totalAll = allAvailableSlots.reduce((s, r) => s + r.workdays, 0);

  return (
    <div className="card shadow p-4" style={{ borderRadius: "16px" }}>
      <h4 className="mb-3 text-dark fw-bold">Programmer Availability ({currentYear})</h4>

      {/* Filters */}
      <div className="d-flex flex-column flex-md-row gap-3 mb-3">
        <div style={{ flex: 1, minWidth: 180 }}>
          <Select
            isMulti
            options={allPics.map((p) => ({ value: p, label: p }))}
            value={selectedPic.map((p) => ({ value: p, label: p }))}
            onChange={(sel) => setSelectedPic((sel || []).map((s) => s.value))}
            placeholder="Filter by PIC..."
            menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 })
              }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 180 }}>
          <Select
            isMulti
            options={allStatuses.map((s) => ({ value: s, label: s }))}
            value={selectedStatus.map((s) => ({ value: s, label: s }))}
            onChange={(sel) => setSelectedStatus((sel || []).map((s) => s.value))}
            placeholder="Filter by Status..."
            menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 })
              }}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultActiveKey="nearest" id="available-tabs" className="mb-3">
        {/* Nearest */}
        <Tab eventKey="nearest" title="Nearest">
          <div className="d-flex justify-content-end mb-2 gap-2">
            <Button variant="success" size="sm" onClick={() => exportToExcel(nearestSlots, "Nearest.xlsx")}>
              <FaFileExcel /> Excel
            </Button>
            <Button variant="secondary" size="sm" onClick={() => exportToExcel(nearestSlots, "Nearest.csv")}>
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
            <tbody className="table-light">
              {nearestSlots.length > 0 ? (
                <>
                  {nearestSlots.map((r, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <OverlayTrigger trigger={["hover", "focus"]} placement="top" overlay={getPopoverForPic(r.pic)}>
                          <span style={{ cursor: "pointer", color: "#000" }}>{r.pic}</span>
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

        {/* All Available */}
        <Tab eventKey="all" title="All Available">
          <div className="d-flex justify-content-end mb-2 gap-2">
            <Button variant="success" size="sm" onClick={() => exportToExcel(allAvailableSlots, "AllAvailable.xlsx")}>
              <FaFileExcel /> Excel
            </Button>
            <Button variant="secondary" size="sm" onClick={() => exportToExcel(allAvailableSlots, "AllAvailable.csv")}>
              <FaFileCsv /> CSV
            </Button>
          </div>

          <div style={{ maxHeight: 420, overflowY: "auto" }}>
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
              <tbody className="table-light">
              {(() => {
                const grouped = currentDetailedRows.reduce((acc, item) => {
                  acc[item.pic] = acc[item.pic] || [];
                  acc[item.pic].push(item);
                  return acc;
                }, {});

                const rows = [];
                let rowIndex = indexOfFirstRow;
                Object.entries(grouped).forEach(([pic, items]) => {
                  items.forEach((r, idx) => {
                    rows.push(
                      <tr key={`${pic}-${idx}`}>
                        <td>{rowIndex + 1}</td>
                        {idx === 0 && (
                          <td rowSpan={items.length}>
                            <OverlayTrigger trigger={["hover", "focus"]} placement="top" overlay={getPopoverForPic(pic)}>
                              <span style={{ cursor: "pointer", color: "#000" }}>{pic}</span>
                            </OverlayTrigger>
                          </td>
                        )}
                        <td>{formatDate(r.start)}</td>
                        <td>{formatDate(r.end)}</td>
                        <td>{r.workdays}</td>
                      </tr>
                    );
                    rowIndex++;
                  });
                });

                return (
                  <>
                    {rows}
                    <tr className="table-dark fw-bold">
                      <td colSpan={4}>TOTAL</td>
                      <td>{totalAll}</td>
                    </tr>
                  </>
                );
              })()}
            </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Button size="sm" variant="outline-dark" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</Button>
              <span>Page {currentPage} of {totalPages}</span>
              <Button size="sm" variant="outline-dark" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}
