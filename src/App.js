import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarI from './layout/Navbar';
import Sidebar from './layout/Sidebar';
import Home from './pages/Home';
import AddUser from './users/AddUser';
import EditUser from './users/EditUser';
import ViewUser from './users/ViewUser';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Rekap from "./pages/Rekap";
import AvailableProgrammer from "./pages/AvailableProgrammer";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <NavbarI toggleSidebar={toggleSidebar} />
      <div className="d-flex">
        {/* Sidebar kiri */}
        <Sidebar isOpen={isSidebarOpen} />

        {/* Konten utama */}
        <div className={`flex-grow-1 p-3 content-area ${isSidebarOpen ? "" : "expanded"}`}>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/rekaps" element={<Rekap />} />
            <Route exact path="/available-programmer" element={<AvailableProgrammer />} />
            <Route exact path="/adduser" element={<AddUser />} />
            <Route exact path="/edituser/:id" element={<EditUser />} />
            <Route exact path="/viewuser/:id" element={<ViewUser />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
