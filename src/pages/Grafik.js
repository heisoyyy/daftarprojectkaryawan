// src/pages/Grafik1.js
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
// import Select from "react-select";

const STATUS_COLORS = { Selesai: "#288d3b", "Belum Selesai": "#c53d13" };
const CATEGORY_COLORS = ["#e16f0c", "#288d3b", "#c53d13", "#ed7c19"];

const STATUS_BELUM = [
  "Belum dikerjakan", "Hold", "Ready SIT", "Ready UAT", "Reschdule",
  "SIT Cancel", "Sedang SIT", "Sedang VIT", "Sedang dikerjakan"
];

// Kategori yang diambil
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
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  } else if (val.includes('-')) {
    parts = val.split('-');
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
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

  const [selectedMonth, setSelectedMonth] = useState([thisMonth]);
  const [showMonthFilter, setShowMonthFilter] = useState(false);

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

  // ================== BULANAN - Berdasarkan End Date ==================
  const monthlyBarData = useMemo(() => {
    return Object.keys(CATEGORY_MAPPING).map(cat => {
      // Filter berdasarkan kategori dan bulan dari End Date
      const filtered = projects.filter(p => {
        const endDate = parseDate(p.endDate);
        const isMatchCategory = CATEGORY_MAPPING[cat].includes(p.category);
        const monthsArray = Array.isArray(selectedMonth) ? selectedMonth : [selectedMonth];
        const isMatchMonth = endDate && 
                            endDate.getFullYear() === thisYear && 
                            monthsArray.includes(endDate.getMonth());
        return isMatchCategory && isMatchMonth;
      });

      // Hitung Selesai dan Belum Selesai
      const selesai = filtered.filter(p => p.status === "Selesai").length;
      const belumSelesai = filtered.filter(p => STATUS_BELUM.includes(p.status)).length;

      return { 
        category: cat, 
        Selesai: selesai, 
        "Belum Selesai": belumSelesai 
      };
    });
  }, [projects, selectedMonth, thisYear]);

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
      return { 
        name: cat, 
        value: filtered.length, 
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] 
      };
    });
  }, [projects, selectedMonth, thisYear]);

  // ================== TAHUNAN - Agregat dari semua bulan di tahun ini ==================
  const yearlyBarData = useMemo(() => {
    return Object.keys(CATEGORY_MAPPING).map(cat => {
      // Filter berdasarkan kategori dan tahun dari End Date
      const filtered = projects.filter(p => {
        const endDate = parseDate(p.endDate);
        const isMatchCategory = CATEGORY_MAPPING[cat].includes(p.category);
        const isMatchYear = endDate && endDate.getFullYear() === thisYear;
        return isMatchCategory && isMatchYear;
      });

      const selesai = filtered.filter(p => p.status === "Selesai").length;
      const belumSelesai = filtered.filter(p => STATUS_BELUM.includes(p.status)).length;

      return { 
        category: cat, 
        Selesai: selesai, 
        "Belum Selesai": belumSelesai 
      };
    });
  }, [projects, thisYear]);

  const yearlyPieData = useMemo(() => {
    return Object.keys(CATEGORY_MAPPING).map((cat, i) => {
      const filtered = projects.filter(p => {
        const endDate = parseDate(p.endDate);
        const isMatchCategory = CATEGORY_MAPPING[cat].includes(p.category);
        const isMatchYear = endDate && endDate.getFullYear() === thisYear;
        return isMatchCategory && isMatchYear;
      });
      return { 
        name: cat, 
        value: filtered.length, 
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] 
      };
    });
  }, [projects, thisYear]);

  // Bulan dropdown
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: new Date(0, i).toLocaleString("id-ID", { month: "long" })
    }));
  }, []);

  const handleMonthToggle = (monthValue) => {
    setSelectedMonth(prev => {
      const monthsArray = Array.isArray(prev) ? prev : [prev];
      if (monthsArray.includes(monthValue)) {
        const newMonths = monthsArray.filter(m => m !== monthValue);
        return newMonths.length > 0 ? newMonths : [thisMonth];
      } else {
        return [...monthsArray, monthValue];
      }
    });
  };

  const selectAllMonths = () => {
    setSelectedMonth(monthOptions.map(m => m.value));
  };

  const clearAllMonths = () => {
    setSelectedMonth([thisMonth]);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="card shadow p-4">
      <h3 className="fw-bold mb-4">Monitoring Project {thisYear}</h3>

      <div className="mb-4">
        <button 
          className="btn btn-outline-dark"
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
                  <strong>Terpilih:</strong> {
                    Array.isArray(selectedMonth) && selectedMonth.length === 12
                      ? 'Semua bulan'
                      : Array.isArray(selectedMonth)
                        ? selectedMonth.map(m => monthOptions[m].label).join(', ')
                        : monthOptions[selectedMonth]?.label || ''
                  }
                </small>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BULANAN */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title mb-4">
            Grafik Bulanan - {
              Array.isArray(selectedMonth) && selectedMonth.length === 1 
                ? `${monthOptions[selectedMonth[0]].label} ${thisYear}`
                : `${Array.isArray(selectedMonth) ? selectedMonth.length : 1} Bulan Terpilih (${thisYear})`
            }
          </h4>
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="border rounded p-3 bg-light">
                <h5 className="fw-bold mb-3">Selesai vs Belum Selesai (Bulanan)</h5>
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
              <div className="border rounded p-3 bg-light">
                <h5 className="fw-bold mb-3">Persentase Kategori (Bulanan)</h5>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie 
                      data={monthlyPieData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100} 
                      label
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

          {/* Tabel Detail Bulanan */}
          <div className="mt-3">
            <h6 className="fw-bold">Detail Data Bulanan:</h6>
            <table className="table table-sm table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Kategori</th>
                  <th>Selesai</th>
                  <th>Belum Selesai</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody className="table-light">
                {monthlyBarData.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.category}</td>
                    <td className="text-center">{item.Selesai}</td>
                    <td className="text-center">{item["Belum Selesai"]}</td>
                    <td className="text-center fw-bold">{item.Selesai + item["Belum Selesai"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TAHUNAN */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="card-title mb-4">Grafik Tahunan - {thisYear}</h4>
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="border rounded p-3 bg-light">
                <h5 className="fw-bold mb-3">Selesai vs Belum Selesai (Tahunan)</h5>
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
              <div className="border rounded p-3 bg-light">
                <h5 className="fw-bold mb-3">Persentase Kategori (Tahunan)</h5>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie 
                      data={yearlyPieData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100} 
                      label
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

          {/* Tabel Detail Tahunan */}
          <div className="mt-3">
            <h6 className="fw-bold">Detail Data Tahunan:</h6>
            <table className="table table-sm table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Kategori</th>
                  <th>Selesai</th>
                  <th>Belum Selesai</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody className="table-light">
                {yearlyBarData.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.category}</td>
                    <td className="text-center">{item.Selesai}</td>
                    <td className="text-center">{item["Belum Selesai"]}</td>
                    <td className="text-center fw-bold">{item.Selesai + item["Belum Selesai"]}</td>
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