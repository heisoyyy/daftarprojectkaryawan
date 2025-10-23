import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Badge, Pagination, Form, Card, Alert, Spinner, InputGroup } from 'react-bootstrap';
import './History.css';

export default function History() {
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    action: '',
    role: '',
    username: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [historyData, filters]);

  const loadHistory = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/history');
      setHistoryData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading history:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...historyData];

    if (filters.action) {
      filtered = filtered.filter(item => item.action === filters.action);
    }

    if (filters.role) {
      filtered = filtered.filter(item => item.role === filters.role);
    }

    if (filters.username) {
      filtered = filtered.filter(item =>
        item.username.toLowerCase().includes(filters.username.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(item =>
        new Date(item.timestamp) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59);
      filtered = filtered.filter(item =>
        new Date(item.timestamp) <= endDate
      );
    }

    if (filters.search) {
      filtered = filtered.filter(item =>
        item.changes?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.entityId?.toString().includes(filters.search)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      action: '', role: '', username: '', dateFrom: '', dateTo: '', search: ''
    });
  };

  const handleViewDetail = (history) => {
    setSelectedHistory(history);
    setShowModal(true);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadge = (action) => {
    const variants = { CREATE: 'success', UPDATE: 'warning', DELETE: 'danger' };
    return <Badge bg={variants[action] || 'secondary'}>{action}</Badge>;
  };

  const getRoleBadge = (role) => {
    const variants = { PINBAG: 'primary', SEKRE: 'info'};
    return <Badge bg={variants[role] || 'secondary'}>{role}</Badge>;
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => setCurrentPage(1)}>1</Pagination.Item>
      );
      if (startPage > 2) items.push(<Pagination.Ellipsis key="ellipsis-start" />);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) items.push(<Pagination.Ellipsis key="ellipsis-end" />);
      items.push(
        <Pagination.Item key={totalPages} onClick={() => setCurrentPage(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    return items;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 fs-5">Memuat riwayat...</span>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <Card className="shadow-lg border-0">
        <Card.Header className="bg-gradient-primary text-white py-3">
          <h4 className="mb-0 d-flex align-items-center">
            <span className="me-2">Riwayat Perubahan Data</span>
          </h4>
        </Card.Header>

        <Card.Body className="p-4">
          {/* Filter Row */}
          <Form className="mb-4">
            <div className="row g-3">
              <div className="col-md-2">
                <Form.Label className="fw-bold small">Aksi</Form.Label>
                <Form.Select
                  size="sm"
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                >
                  <option value="">Semua</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                </Form.Select>
              </div>

              <div className="col-md-2">
                <Form.Label className="fw-bold small">Role</Form.Label>
                <Form.Select
                  size="sm"
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                >
                  <option value="">Semua</option>
                  <option value="PINBAG">PINBAG</option>
                  <option value="SEKBAG">SEKBAG</option>
                </Form.Select>
              </div>

              <div className="col-md-2">
                <Form.Label className="fw-bold small">Username</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="Cari..."
                  value={filters.username}
                  onChange={(e) => handleFilterChange('username', e.target.value)}
                />
              </div>

              <div className="col-md-2">
                <Form.Label className="fw-bold small">Dari</Form.Label>
                <Form.Control
                  size="sm"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>

              <div className="col-md-2">
                <Form.Label className="fw-bold small">Sampai</Form.Label>
                <Form.Control
                  size="sm"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>

              <div className="col-md-2 d-flex align-items-end">
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="w-100"
                  onClick={clearFilters}
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <InputGroup size="sm">
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Cari perubahan atau ID entitas..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </InputGroup>
              </div>
            </div>
          </Form>

          {/* Stats */}
          <Alert variant="info" className="mb-3 py-2">
            <small>
              Menampilkan <strong>{currentItems.length}</strong> dari <strong>{filteredData.length}</strong> riwayat (total: {historyData.length})
            </small>
          </Alert>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th className="text-center" style={{ width: '50px' }}>#</th>
                  <th style={{ width: '90px' }}>Aksi</th>
                  <th style={{ width: '70px' }}>ID</th>
                  <th style={{ width: '120px' }}>User</th>
                  <th style={{ width: '80px' }}>Role</th>
                  <th>Perubahan</th>
                  <th style={{ width: '160px' }}>Waktu</th>
                  <th style={{ width: '110px' }}>IP</th>
                  <th style={{ width: '90px' }} className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      Tidak ada data riwayat
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="text-center">{indexOfFirstItem + index + 1}</td>
                      <td>{getActionBadge(item.action)}</td>
                      <td className="text-muted">#{item.entityId}</td>
                      <td>{item.username}</td>
                      <td>{getRoleBadge(item.role)}</td>
                      <td>
                        <div
                          className="text-muted small text-truncate"
                          style={{ maxWidth: '300px' }}
                          title={item.changes}
                        >
                          {item.changes?.substring(0, 80)}
                          {item.changes?.length > 80 && '...'}
                        </div>
                      </td>
                      <td className="small">{formatTimestamp(item.timestamp)}</td>
                      <td className="text-muted small">{item.ipAddress}</td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleViewDetail(item)}
                        >
                          Lihat
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                />
                {renderPaginationItems()}
                <Pagination.Next
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" scrollable>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Detail Riwayat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedHistory && (
            <div className="row g-3">
              <div className="col-md-6">
                <strong>Aksi:</strong> {getActionBadge(selectedHistory.action)}
              </div>
              <div className="col-md-6">
                <strong>ID Entitas:</strong> #{selectedHistory.entityId}
              </div>

              <div className="col-md-6">
                <strong>Username:</strong> {selectedHistory.username}
              </div>
              <div className="col-md-6">
                <strong>Role:</strong> {getRoleBadge(selectedHistory.role)}
              </div>

              <div className="col-md-6">
                <strong>Waktu:</strong> {formatTimestamp(selectedHistory.timestamp)}
              </div>
              <div className="col-md-6">
                <strong>IP Address:</strong> <code>{selectedHistory.ipAddress}</code>
              </div>

              <div className="col-12">
                <hr />
                <h6>Perubahan:</h6>
                <Alert variant="light" className="small pre-wrap">
                  {selectedHistory.changes}
                </Alert>
              </div>

              {selectedHistory.oldData && (
                <div className="col-12">
                  <h6>Data Lama:</h6>
                  <pre className="bg-light p-3 rounded small border">
                    {JSON.stringify(JSON.parse(selectedHistory.oldData), null, 2)}
                  </pre>
                </div>
              )}

              {selectedHistory.newData && (
                <div className="col-12">
                  <h6>Data Baru:</h6>
                  <pre className="bg-light p-3 rounded small border">
                    {JSON.stringify(JSON.parse(selectedHistory.newData), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}