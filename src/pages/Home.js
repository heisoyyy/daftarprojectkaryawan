import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import "./Home.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Dropdown, ButtonGroup, Button, Modal } from 'react-bootstrap';

const allColumns = [
  { key: "projectName", label: "Project Name" },
  { key: "picName", label: "PIC Name" },
  { key: "status", label: "Status" },
  { key: "receiveDate", label: "Receive Date" },
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  { key: "devDuration", label: "Dev Duration" },
  { key: "tglSit", label: "Tanggal SIT" },
  { key: "tglUat", label: "Tanggal UAT" },
  { key: "stsFsd", label: "STS FSD" },
  { key: "projectOwner", label: "Project Owner" },
  { key: "statusDokumenBrdOrChangeRequest", label: "Status Dokumen BRD/Change" },
  { key: "applicationName", label: "Application Name" },
  { key: "category", label: "Category 1" },
  { key: "category2", label: "Category 2" },
  { key: "category3", label: "Category 3" },
  { key: "target", label: "Target" },
  { key: "progress", label: "Progress" },
  { key: "col1", label: "Jan" },
  { key: "col2", label: "Feb" },
  { key: "col3", label: "Mar" },
  { key: "col4", label: "Apr" },
  { key: "col5", label: "Mei" },
  { key: "col6", label: "Jun" },
  { key: "col7", label: "Jul" },
  { key: "col8", label: "Agu" },
  { key: "col9", label: "Sep" },
  { key: "col10", label: "Okt" },
  { key: "col11", label: "Nov" },
  { key: "col12", label: "Des" },
  { key: "keterangan", label: "Keterangan" },
];

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function Home() {
  const [users, setUsers] = useState([]);
  
  // PERSISTENT FILTERS - Ambil dari localStorage
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem('dashboardFilters');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [search, setSearch] = useState(() => {
    return localStorage.getItem('dashboardSearch') || "";
  });
  
  // PERSISTENT VISIBLE COLUMNS - Ambil dari localStorage
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('dashboardVisibleColumns');
    if (saved) {
      return JSON.parse(saved);
    } else {
      const initCols = {};
      allColumns.forEach((col) => {
        initCols[col.key] = true;
      });
      return initCols;
    }
  });
  
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem('dashboardColumnWidths');
    if (saved) {
      return JSON.parse(saved);
    } else {
      const initWidths = {};
      allColumns.forEach((col) => {
        if (col.key.startsWith("col")) {
          initWidths[col.key] = 60;
        } else {
          initWidths[col.key] = 150;
        }
      });
      return initWidths;
    }
  });
  
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  
  const [sortConfig, setSortConfig] = useState(() => {
    const saved = localStorage.getItem('dashboardSort');
    return saved ? JSON.parse(saved) : { key: null, direction: "asc" };
  });
  
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem('dashboardPage');
    return saved ? parseInt(saved) : 1;
  });
  
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem('dashboardItemsPerPage');
    return saved ? parseInt(saved) : 50;
  });

  // MODAL STATE
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Simpan ke localStorage untuk visibleColumns dan columnWidths
  useEffect(() => {
    localStorage.setItem('dashboardVisibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    localStorage.setItem('dashboardColumnWidths', JSON.stringify(columnWidths));
  }, [columnWidths]);

  // SAVE TO LOCALSTORAGE WHEN FILTERS CHANGE
  useEffect(() => {
    localStorage.setItem('dashboardFilters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem('dashboardSearch', search);
  }, [search]);

  useEffect(() => {
    localStorage.setItem('dashboardSort', JSON.stringify(sortConfig));
  }, [sortConfig]);

  useEffect(() => {
    localStorage.setItem('dashboardPage', currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('dashboardItemsPerPage', itemsPerPage.toString());
  }, [itemsPerPage]);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const result = await axios.get("http://localhost:8080/users");
      setUsers(result.data);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  // Di Home.jsx, update fungsi deleteUser
  // Update fungsi deleteUser
  const deleteUser = async (id) => {
    const username = localStorage.getItem('username') || 'Unknown';
    const role = localStorage.getItem('userRole') || 'Unknown';
    
    if (window.confirm("⚠️ Apakah Anda yakin ingin menghapus project ini?\n\nAksi ini akan tercatat di History.")) {
      try {
        await axios.delete(`http://localhost:8080/user/${id}`);
        
        alert(
          `✅ Project berhasil dihapus!\n\n` +
          `📝 Dihapus oleh: ${username}\n` +
          `👤 Role: ${role}\n` +
          `📋 Penghapusan telah tercatat di History`
        );
        
        loadUser();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("❌ Gagal menghapus project!");
      }
    }
  };


  const parseDateSortable = (dateStr) => {
    if (!dateStr) return null;
    let parts;
    if (dateStr.includes("/")) {
      parts = dateStr.split("/");
      if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
    } else if (dateStr.includes("-")) {
      parts = dateStr.split("-");
      if (parts.length === 3) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
    }
    const parsed = new Date(dateStr);
    if (!isNaN(parsed)) return parsed;
    return null;
  };

  const parseMonth = (dateStr) => {
    const d = parseDateSortable(dateStr);
    return d ? d.getMonth() + 1 : null;
  };

  const getUniqueValues = (key) => {
    const dateKeys = ["receiveDate", "startDate", "endDate", "target"];
    
    if (dateKeys.includes(key)) {
      const months = users
        .map(u => parseMonth(u[key]))
        .filter(m => m !== null);
      const uniqueMonths = [...new Set(months)].sort((a, b) => a - b);
      return uniqueMonths;
    } else {
      let values = users.map(u => u[key]).filter(Boolean);
      values = [...new Set(values)].sort();
      return values;
    }
  };

  const handleFilterChange = (col, selected) => {
    setFilters(prev => ({
      ...prev,
      [col]: selected ? selected.map(s => s.value) : [],
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearch("");
    setCurrentPage(1);
    setSortConfig({ key: null, direction: "asc" });
    
    // CLEAR LOCALSTORAGE
    localStorage.removeItem('dashboardFilters');
    localStorage.removeItem('dashboardSearch');
    localStorage.removeItem('dashboardSort');
    localStorage.removeItem('dashboardPage');
  };

  const filteredUsers = users.filter(user => {
    const matchSearch =
      !search ||
      Object.values(user).some(val =>
        val?.toString().toLowerCase().includes(search.toLowerCase())
      );

    const matchFilters = Object.entries(filters).every(([key, vals]) => {
      if (!vals || vals.length === 0) return true;
      
      const dateKeys = ["receiveDate", "startDate", "endDate",  "target"];
      
      if (dateKeys.includes(key)) {
        const userMonth = parseMonth(user[key]);
        return vals.includes(userMonth);
      } else {
        return vals.includes(user[key]);
      }
    });

    return matchSearch && matchFilters;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];

    // Cek apakah kosong/null
    const isEmptyA = valA === null || valA === undefined || valA === "";
    const isEmptyB = valB === null || valB === undefined || valB === "";

    // Kalau salah satu kosong → taruh di bawah
    if (isEmptyA && !isEmptyB) return 1;
    if (!isEmptyA && isEmptyB) return -1;

    // Kalau dua-duanya kosong → posisinya tetap
    if (isEmptyA && isEmptyB) return 0;

    // Untuk kolom tanggal
    const dateKeys = ["receiveDate", "startDate", "endDate", "target"];
    if (dateKeys.includes(sortConfig.key)) {
      const dateA = parseDateSortable(valA);
      const dateB = parseDateSortable(valB);

      // Kalau salah satu tanggal invalid → taruh bawah
      if (!dateA && dateB) return 1;
      if (dateA && !dateB) return -1;
      if (!dateA && !dateB) return 0;

      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
    }

    // Untuk angka
    if (typeof valA === "number" && typeof valB === "number") {
      return sortConfig.direction === "asc" ? valA - valB : valB - valA;
    }

    // Untuk teks → ubah jadi string aman
    const strA = valA != null ? valA.toString() : "";
    const strB = valB != null ? valB.toString() : "";

    return sortConfig.direction === "asc"
      ? strA.localeCompare(strB)
      : strB.localeCompare(strA);
  });


  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "users.xlsx");
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(filteredUsers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "users.csv");
  };

  // Update fungsi importFromCSV
  const importFromCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const username = localStorage.getItem('username') || 'Unknown';
    const role = localStorage.getItem('userRole') || 'Unknown';
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8080/users/import/csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      alert(
        `✅ CSV berhasil di-import!\n\n` +
        `📊 Total: ${response.data.length} project\n` +
        `📝 Diimport oleh: ${username}\n` +
        `👤 Role: ${role}\n` +
        `📋 Semua data telah tercatat di History`
      );
      
      loadUser();
    } catch (error) {
      console.error("Error importing CSV:", error);
      alert("❌ Gagal import CSV!");
    } finally {
      e.target.value = "";
    }
  };

  // Update fungsi importFromExcel
  const importFromExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const username = localStorage.getItem('username') || 'Unknown';
    const role = localStorage.getItem('userRole') || 'Unknown';
    
    const allowedExtensions = ["xlsx", "xls"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      alert("⚠️ Format file tidak valid! Hanya mendukung .xlsx atau .xls");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8080/users/import/excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      alert(
        `✅ Excel berhasil di-import!\n\n` +
        `📊 Total: ${response.data.length} project\n` +
        `📝 Diimport oleh: ${username}\n` +
        `👤 Role: ${role}\n` +
        `📋 Semua data telah tercatat di History`
      );
      
      loadUser();
    } catch (error) {
      console.error("Error importing Excel:", error);
      alert("❌ Gagal import Excel!");
    } finally {
      e.target.value = "";
    }
  };

  const handleResize = (colKey, width) => {
    setColumnWidths(prev => ({ ...prev, [colKey]: Math.max(width, 50) }));
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        pageNumbers.push(currentPage + 1);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  // MODAL HANDLERS
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="card p-3 shadow py-4">
      <h3 className="mb-4 text-center">Dashboard Development</h3>

      <div className="d-flex justify-content-between mb-3 flex-wrap align-items-center">
        <div className="d-flex gap-2 mb-2">
          <Link className="btn btn-primary" to="/adduser">Add</Link>

          <Dropdown as={ButtonGroup}>
            <Button variant="info">Template</Button>
            <Dropdown.Toggle split variant="info" id="dropdown-split-basic" />
            <Dropdown.Menu>
              <Dropdown.Item href="/templates/template.csv" download>CSV</Dropdown.Item>
              <Dropdown.Item href="/templates/template.xlsx" download>Excel</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle variant="success" id="dropdown-excel">Excel</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={exportToExcel}>Export Excel</Dropdown.Item>
              <Dropdown.Item as="label">Import Excel
                <input type="file" accept=".xlsx,.xls" onChange={importFromExcel} hidden />
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle variant="warning" id="dropdown-csv">CSV</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={exportToCSV}>Export CSV</Dropdown.Item>
              <Dropdown.Item as="label">Import CSV
                <input type="file" accept=".csv" onChange={importFromCSV} hidden />
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <Button variant="outline-danger" className="mb-2" onClick={clearFilters}>Clear Filters</Button>
      </div>

      <div className="mb-3">
        <button
          className="btn btn-outline-primary"
          onClick={() => setShowColumnPanel(!showColumnPanel)}
        >
          Show/Hide Columns
        </button>

        {showColumnPanel && (
          <div
            className="card card-column-panel p-2 mt-2"
            style={{
              maxHeight: "250px", // tinggi maksimal panel
              overflowY: "auto",   // aktifkan scroll vertikal
              border: "1px solid #dee2e6",
            }}
          >
            <div className="row">
              {allColumns.map((col) => (
                <div key={col.key} className="col-6 col-md-3 mb-2">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={col.key}
                      checked={visibleColumns[col.key]}
                      onChange={(e) =>
                        setVisibleColumns((prev) => ({
                          ...prev,
                          [col.key]: e.target.checked,
                        }))
                      }
                    />
                    <label className="form-check-label" htmlFor={col.key}>
                      {col.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


      <div className="row mb-3">
        <div className="col-md-9">
          <input type="text" className="form-control" placeholder="Search..." value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      <div className="table-responsive table-container">
        <table className="table table-bordered table-hover table-sm align-middle text-center">
          <thead className="sticky-top text-white">
            <tr>
              <th style={{ width: "50px" }}>No</th>
              {allColumns.map(col => visibleColumns[col.key] && (
                <th key={col.key} style={{ width: columnWidths[col.key], cursor: "pointer" }} onClick={() => handleSort(col.key)}>
                  <ResizableBox width={columnWidths[col.key]} height={20} axis="x" resizeHandles={["e"]}
                    onResizeStop={(e, data) => handleResize(col.key, data.size.width)}>
                    <div style={{ width: "100%", fontSize: col.key.startsWith("col") ? "11px" : "14px" }}>
                      {col.label} {sortConfig.key === col.key ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                    </div>
                  </ResizableBox>
                </th>
              ))}
              <th style={{ width: "200px" }}>Report</th>
            </tr>

            <tr className="bg-light">
              <th></th>
              {allColumns.map(col => {
                if (!visibleColumns[col.key]) return null;
                
                const dateKeys = ["receiveDate", "startDate", "endDate",  "target"];
                const isDateColumn = dateKeys.includes(col.key);
                
                return (
                  <th key={col.key}>
                    {col.key.startsWith("col") ? null : (
                      <Select
                        isMulti
                        options={getUniqueValues(col.key).map(val => {
                          if (isDateColumn) {
                            return { value: val, label: monthNames[val - 1] };
                          } else {
                            return { value: val, label: val };
                          }
                        })}
                        value={filters[col.key]?.map(v => {
                          if (isDateColumn) {
                            return { value: v, label: monthNames[v - 1] };
                          } else {
                            return { value: v, label: v };
                          }
                        }) || []}
                        onChange={selected => handleFilterChange(col.key, selected)}
                        placeholder="Filter..."
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: base => ({ ...base, zIndex: 9999 }),
                          container: base => ({ ...base, minWidth: "120px", fontSize: "12px" }),
                        }}
                      />
                    )}
                  </th>
                );
              })}
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody className="table-light">
            {currentUsers.map((user, index) => {
              const startMonth = parseMonth(user.startDate);
              const endMonth = parseMonth(user.endDate);

              return (
                <tr key={user.id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  {allColumns.map(col => visibleColumns[col.key] && (
                    <td key={col.key} style={{ fontSize: col.key.startsWith("col") ? "10px" : "13px" }}>
                      {col.key.startsWith("col") ? (
                        <div style={{
                          backgroundColor:
                            startMonth === parseInt(col.key.replace("col","")) ||
                            endMonth === parseInt(col.key.replace("col",""))
                              ? "yellow"
                              : "white",
                          width: "100%", height: "20px", minWidth: "40px"
                        }} />
                      ) : col.key === "progress" ? (
                        user[col.key] ? `${user[col.key]}%` : ""
                      ) : (
                        user[col.key]
                      )}
                    </td>
                  ))}
                  <td>
                    <div className="btn-group">
                      <button className="btn btn-success btn-sm" onClick={() => handleViewUser(user)}>View</button>
                      <Link className="btn btn-warning btn-sm" to={`/edituser/${user.id}`}>Edit</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteUser(user.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={allColumns.filter(c => visibleColumns[c.key]).length + 2} className="text-center">No matching data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredUsers.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
          <div className="mb-2">
            <span className="text-muted">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedUsers.length)} of {sortedUsers.length} entries
            </span>
          </div>
          
          <nav aria-label="Page navigation">
            <ul className="pagination pagination-sm mb-2">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => goToPage(1)} disabled={currentPage === 1}>
                  First
                </button>
              </li>
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                  Prev
                </button>
              </li>
              
              {getPageNumbers().map((pageNum, idx) => (
                pageNum === '...' ? (
                  <li key={`ellipsis-${idx}`} className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                ) : (
                  <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => goToPage(pageNum)}>
                      {pageNum}
                    </button>
                  </li>
                )
              ))}
              
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                  Next
                </button>
              </li>
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
                  Last
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* MODAL VIEW USER */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Project Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              {/* Basic Info */}
              <div className="card mb-4 shadow-sm">
                <div className="card-body">
                  <h4 className="card-title mb-3">{selectedUser.projectName}</h4>
                  <p><strong>PIC:</strong> {selectedUser.picName}</p>
                  <p><strong>Status:</strong>{" "}
                    <span className={`badge ${
                      selectedUser.status === "Selesai"
                        ? "bg-success"
                        : selectedUser.status === "Sedang Dikerjakan"
                        ? "bg-warning text-dark"
                        : "bg-secondary"
                    }`}>
                      {selectedUser.status}
                    </span>
                  </p>
                  <p><strong>Owner:</strong> {selectedUser.projectOwner}</p>
                  <p><strong>Application:</strong> {selectedUser.applicationName}</p>
                  <p><strong>Progress:</strong> {selectedUser.progress}%</p>
                </div>
              </div>

              {/* Dates */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <ul className="list-group">
                    <li className="list-group-item"><strong>Receive Date:</strong> {selectedUser.receiveDate}</li>
                    <li className="list-group-item"><strong>Start Date:</strong> {selectedUser.startDate}</li>
                    <li className="list-group-item"><strong>End Date:</strong> {selectedUser.endDate}</li>
                    <li className="list-group-item"><strong>Dev Duration:</strong> {selectedUser.devDuration} hari</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-group">
                    <li className="list-group-item"><strong>Tanggal SIT:</strong> {selectedUser.tglSit}</li>
                    <li className="list-group-item"><strong>Tanggal UAT:</strong> {selectedUser.tglUat}</li>
                    <li className="list-group-item"><strong>STS FSD:</strong> {selectedUser.stsFsd}</li>
                    <li className="list-group-item"><strong>Dokumen BRD/CR:</strong> {selectedUser.statusDokumenBrdOrChangeRequest}</li>
                  </ul>
                </div>
              </div>

              {/* Monthly Table */}
              <div className="card mb-4 shadow-sm">
                <div className="card-header">Monthly Data</div>
                <div className="card-body">
                  <table className="table table-bordered text-center">
                    <thead className="table-light">
                      <tr>
                        {monthNames.map((m, i) => <th key={i} style={{fontSize: '12px'}}>{m}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {monthNames.map((_, i) => {
                          const monthIndex = i + 1;
                          const startMonth = parseMonth(selectedUser.startDate);
                          const endMonth = parseMonth(selectedUser.endDate);
                          const isHighlighted = monthIndex === startMonth || monthIndex === endMonth;
                          return (
                            <td key={i} style={{ padding: 0 }}>
                              <div
                                style={{
                                  backgroundColor: isHighlighted ? "yellow" : "white",
                                  width: "100%",
                                  height: "25px",
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

              {/* Keterangan */}
              <div className="card mb-3 shadow-sm">
                <div className="card-header">Keterangan</div>
                <div className="card-body">
                  <p>{selectedUser.keterangan || "Tidak ada keterangan"}</p>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}