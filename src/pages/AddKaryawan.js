import React, { useState, useEffect } from "react";
import { Table, Card, Form, Button, Alert } from "react-bootstrap";

const AddKaryawan = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [allUsers, setAllUsers] = useState([]);

  // Ambil role user login
  const currentUserRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (currentUserRole === "PINBAG") fetchUsers();
  }, [currentUserRole]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8080/auth/users");
      const data = await res.json();
      setAllUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleAddKaryawan = async (e) => {
    e.preventDefault();

    if (!username || !password || !fullName) {
      setMessage({ text: "Semua field wajib diisi", type: "danger" });
      return;
    }

    const newUser = { username, password, fullName };

    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          text: `User ${username} berhasil ditambahkan sebagai SEKBAG`,
          type: "success",
        });
        setUsername("");
        setPassword("");
        setFullName("");
        fetchUsers();
      } else {
        setMessage({
          text: "Gagal menambahkan user: " + data.message,
          type: "danger",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        text: "Terjadi kesalahan saat menambahkan user",
        type: "danger",
      });
    }
  };

  const handleDeleteUser = async (id, username) => {
    if (window.confirm(`Yakin ingin menghapus user "${username}"?`)) {
      try {
        const response = await fetch(`http://localhost:8080/auth/users/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setMessage({
            text: `User ${username} berhasil dihapus`,
            type: "success",
          });
          fetchUsers();
        } else {
          setMessage({
            text: "Gagal menghapus user",
            type: "danger",
          });
        }
      } catch (err) {
        console.error(err);
        setMessage({
          text: "Terjadi kesalahan saat menghapus user",
          type: "danger",
        });
      }
    }
  };

  // Jika bukan PINBAG
  if (currentUserRole !== "PINBAG") {
    return (
      <p className="text-center mt-3">
        Hanya PINBAG yang dapat menambahkan atau menghapus user.
      </p>
    );
  }

  return (
    <div className="container mt-4">
      <Card>
        <Card.Header as="h5">Tambah User Baru</Card.Header>
        <Card.Body>
          {message.text && <Alert variant={message.type}>{message.text}</Alert>}
          <Form onSubmit={handleAddKaryawan}>
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formFullName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Masukkan nama lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Tambah
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mt-4">
        <Card.Header as="h5">Daftar User</Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.username}</td>
                  <td>{user.fullName}</td>
                  <td>{user.role}</td>
                  <td>
                    {user.role !== "PINBAG" && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.username)}
                      >
                        Hapus
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AddKaryawan;
