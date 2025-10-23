// src/pages/Grafik1.js
import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";

const STATUS_COLORS = { Selesai: "#588e6fff", "Belum Selesai": "#4a6585ff" };
const CATEGORY_COLORS = ["#4a6585ff", "#c5b272ff", "#a65959ff", "#588e6fff"];

const STATUS_BELUM = [
  "Belum dikerjakan", "Hold", "Ready SIT", "Ready UAT", "Reschdule",
  "SIT Cancel", "Sedang SIT", "Sedang VIT", "Sedang dikerjakan"
];

const CATEGORY_MAPPING = {
  "Temuan": ["Temuan", "Temuan DAI", "Temuan OJK"],
  "KPI": ["KPI"],
  "PKLD": ["PKLD"],
  "PKLD Tambahan": ["PKLD Tambahan"]
};

const parseDate = (val) => {
  if (!val) return null;
  let parts;
  if (val.includes('/')) {
    parts = val.split('/');
    if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
  } else if (val.includes('-')) {
    parts = val.split('-');
    if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

export default function Grafik1() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const saved = localStorage.getItem("selectedMonths");
    return saved ? JSON.parse(saved) : [thisMonth];
  });
  const [showMonthFilter, setShowMonthFilter] = useState(false);

  const barMonthlyRef = useRef(null);
  const pieMonthlyRef = useRef(null);
  const barYearlyRef = useRef(null);
  const pieYearlyRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8080/users");
        setProjects(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedMonths", JSON.stringify(selectedMonth));
  }, [selectedMonth]);

  // ================== DATA ==================
  const monthlyBarData = useMemo(() => {
    return Object.keys(CATEGORY_MAPPING).map(cat => {
      const filtered = projects.filter(p => {
        const endDate = parseDate(p.endDate);
        const monthsArray = Array.isArray(selectedMonth) ? selectedMonth : [selectedMonth];
        const isMatchMonth = endDate &&
          endDate.getFullYear() === thisYear &&
          monthsArray.includes(endDate.getMonth());
        const isMatchCategory = CATEGORY_MAPPING[cat].includes(p.category);
        return isMatchCategory && isMatchMonth;
      });
      const selesai = filtered.filter(p => p.status === "Selesai").length;
      const belumSelesai = filtered.filter(p => STATUS_BELUM.includes(p.status)).length;
      return { category: cat, Selesai: selesai, "Belum Selesai": belumSelesai };
    });
  }, [projects, selectedMonth, thisYear]);

  const yearlyBarData = useMemo(() => {
    return Object.keys(CATEGORY_MAPPING).map(cat => {
      const filtered = projects.filter(p => {
        const endDate = parseDate(p.endDate);
        const isMatchCategory = CATEGORY_MAPPING[cat].includes(p.category);
        const isMatchYear = endDate && endDate.getFullYear() === thisYear;
        return isMatchCategory && isMatchYear;
      });
      const selesai = filtered.filter(p => p.status === "Selesai").length;
      const belumSelesai = filtered.filter(p => STATUS_BELUM.includes(p.status)).length;
      return { category: cat, Selesai: selesai, "Belum Selesai": belumSelesai };
    });
  }, [projects, thisYear]);

  const monthlyPieData = useMemo(() => {
    return Object.keys(CATEGORY_MAPPING).map((cat, i) => {
      const filtered = projects.filter(p => {
        const endDate = parseDate(p.endDate);
        const isMatchCategory = CATEGORY_MAPPING[cat].includes(p.category);
        const monthsArray = Array.isArray(selectedMonth) ? selectedMonth : [selectedMonth];
        const isMatchMonth = endDate &&
          endDate.getFullYear() === thisYear &&
          monthsArray.includes(endDate.getMonth());
        return isMatchCategory && isMatchMonth;
      });
      return { name: cat, value: filtered.length, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] };
    });
  }, [projects, selectedMonth, thisYear]);

  const yearlyPieData = useMemo(() => {
    return Object.keys(CATEGORY_MAPPING).map((cat, i) => {
      const filtered = projects.filter(p => {
        const endDate = parseDate(p.endDate);
        const isMatchCategory = CATEGORY_MAPPING[cat].includes(p.category);
        const isMatchYear = endDate && endDate.getFullYear() === thisYear;
        return isMatchCategory && isMatchYear;
      });
      return { name: cat, value: filtered.length, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] };
    });
  }, [projects, thisYear]);

  // ================== Export Excel ==================
  const exportToExcel = (data, filename) => {
    const sheetData = data.map((d) => ({
      Kategori: d.category,
      Selesai: d.Selesai,
      "Belum Selesai": d["Belum Selesai"],
      Total: d.Selesai + d["Belum Selesai"],
    }));
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, filename);
  };

  // ================== Download PNG ==================
  const downloadChartAsPNG = async (ref, name) => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current);
    const link = document.createElement("a");
    link.download = `${name}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: new Date(0, i).toLocaleString("id-ID", { month: "long" }),
    }));
  }, []);

  const handleMonthToggle = (monthValue) => {
    setSelectedMonth((prev) => {
      const monthsArray = Array.isArray(prev) ? prev : [prev];
      if (monthsArray.includes(monthValue)) {
        const newMonths = monthsArray.filter((m) => m !== monthValue);
        return newMonths.length > 0 ? newMonths : [thisMonth];
      } else {
        return [...monthsArray, monthValue];
      }
    });
  };

  const selectAllMonths = () => {
    setSelectedMonth(monthOptions.map((m) => m.value));
  };

  const clearAllMonths = () => {
    setSelectedMonth([thisMonth]);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="card shadow p-4">
      <h3 className="fw-bold mb-4">Monitoring Project {thisYear}</h3>

      {/* ========== FILTER BULAN ========== */}
      <div className="card mb-4">
        <div className="mb-4">
          <button 
            className="btn btn-outline-dark mt-3"
            onClick={() => setShowMonthFilter(!showMonthFilter)}
          >
            {showMonthFilter ? 'Sembunyikan Filter Bulan' : 'Tampilkan Filter Bulan'}
          </button>
          
          {showMonthFilter && (
            <div className="card mt-3" style={{ maxWidth: 600 }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Pilih Bulan</h6>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-success" onClick={selectAllMonths}>
                      Pilih Semua
                    </button>
                    <button className="btn btn-outline-danger" onClick={clearAllMonths}>
                      Reset
                    </button>
                  </div>
                </div>
                
                <div className="row g-2">
                  {monthOptions.map(month => {
                    const monthsArray = Array.isArray(selectedMonth) ? selectedMonth : [selectedMonth];
                    const isChecked = monthsArray.includes(month.value);
                    
                    return (
                      <div key={month.value} className="col-6 col-md-4 col-lg-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input" 
                            id={`month-${month.value}`}
                            checked={isChecked}
                            onChange={() => handleMonthToggle(month.value)}
                          />
                          <label 
                            className="form-check-label" 
                            htmlFor={`month-${month.value}`}
                            style={{ cursor: 'pointer' }}
                          >
                            {month.label}
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-3 pt-3 border-top">
                  <small className="text-muted">
                    <strong>Terpilih:</strong>{' '}
                    {Array.isArray(selectedMonth) && selectedMonth.length === 12
                      ? 'Semua bulan'
                      : Array.isArray(selectedMonth)
                        ? selectedMonth.map(m => monthOptions[m].label).join(', ')
                        : monthOptions[selectedMonth]?.label || ''}
                  </small>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================== BULANAN ================== */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title mb-3">Grafik Bulanan ({thisYear})</h4>
          <div className="d-flex gap-2 mb-3">
            <button className="btn btn-outline-success btn-sm" onClick={() => exportToExcel(monthlyBarData, "Grafik_Bulanan.xlsx")}>
              Export Excel
            </button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => downloadChartAsPNG(barMonthlyRef, "Bar_Bulanan")}>
              Bar PNG
            </button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => downloadChartAsPNG(pieMonthlyRef, "Pie_Bulanan")}>
              Pie PNG
            </button>
          </div>

          <div className="row">
            <div className="col-md-6 mb-4">
              <div ref={barMonthlyRef} className="border rounded p-3 bg-light">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={monthlyBarData}>
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
            </div>
            <div className="col-md-6 mb-4">
              <div ref={pieMonthlyRef} className="border rounded p-3 bg-light">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie 
                      data={monthlyPieData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100} 
                      label={({ name, value }) => {
                        const total = monthlyPieData.reduce((sum, item) => sum + item.value, 0);
                        const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                        return `${name}: ${percent}%`;
                      }}
                    >
                      {monthlyPieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ========== DETAIL DATA BULANAN ========== */}
          <div style={{ marginTop: "20px" }}>
            <h6 style={{ marginBottom: "12px", fontWeight: "bold" }}>Detail Data Bulanan:</h6>
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
                {monthlyBarData.map((item, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "white" : "#f8f9fa" }}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{item.category}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>{item.Selesai}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>{item["Belum Selesai"]}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center", fontWeight: "bold" }}>{item.Selesai + item["Belum Selesai"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================== TAHUNAN ================== */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title mb-3">Grafik Tahunan ({thisYear})</h4>
          <div className="d-flex gap-2 mb-3">
            <button className="btn btn-outline-success btn-sm" onClick={() => exportToExcel(yearlyBarData, "Grafik_Tahunan.xlsx")}>
              Export Excel
            </button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => downloadChartAsPNG(barYearlyRef, "Bar_Tahunan")}>
              Bar PNG
            </button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => downloadChartAsPNG(pieYearlyRef, "Pie_Tahunan")}>
              Pie PNG
            </button>
          </div>

          <div className="row">
            <div className="col-md-6 mb-4">
              <div ref={barYearlyRef} className="border rounded p-3 bg-light">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={yearlyBarData}>
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
            </div>
            <div className="col-md-6 mb-4">
              <div ref={pieYearlyRef} className="border rounded p-3 bg-light">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie 
                      data={yearlyPieData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100} 
                      label={({ name, value }) => {
                        const total = yearlyPieData.reduce((sum, item) => sum + item.value, 0);
                        const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                        return `${name}: ${percent}%`;
                      }}
                    >
                      {yearlyPieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ========== DETAIL DATA TAHUNAN ========== */}
          <div style={{ marginTop: "20px" }}>
            <h6 style={{ marginBottom: "12px", fontWeight: "bold" }}>Detail Data Tahunan:</h6>
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
                {yearlyBarData.map((item, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "white" : "#f8f9fa" }}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{item.category}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>{item.Selesai}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>{item["Belum Selesai"]}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center", fontWeight: "bold" }}>{item.Selesai + item["Belum Selesai"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
