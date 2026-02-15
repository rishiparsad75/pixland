import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import AuthContext from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import Gallery from "./pages/Gallery";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import PhotographerDashboard from "./pages/photographer/Dashboard";
import EventLanding from "./pages/EventLanding";
import Profile from "./pages/Profile";
import FaceScan from "./pages/FaceScan";
import FaceGroups from "./pages/FaceGroups";
import Users from "./pages/admin/Users";

import Albums from "./pages/admin/Albums";
import Photos from "./pages/admin/Photos";
import Settings from "./pages/admin/Settings";
import PhotographerSignup from "./pages/PhotographerSignup";


const ProtectedRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = Array.isArray(role) ? role : [role];
  if (role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <Routes>
            <Route path="/" element={<><Navbar /><Home /></>} />
            <Route path="/login" element={<><Navbar /><Login /></>} />
            <Route path="/register" element={<><Navbar /><Register /></>} />
            <Route path="/photographer-signup" element={<PhotographerSignup />} />
            <Route path="/event/:token" element={<><Navbar /><EventLanding /></>} />
            <Route path="/gallery" element={<ProtectedRoute><Navbar /><Gallery /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Navbar /><Profile /></ProtectedRoute>} />
            <Route path="/face-scan" element={<ProtectedRoute><Navbar /><FaceScan /></ProtectedRoute>} />
            <Route path="/face-groups" element={<ProtectedRoute><Navbar /><FaceGroups /></ProtectedRoute>} />
            <Route path="/photographer" element={<ProtectedRoute role={["photographer", "super-admin"]}><AdminLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<PhotographerDashboard />} />
              <Route path="upload" element={<Upload />} />
            </Route>
            <Route path="/admin" element={<ProtectedRoute role="super-admin"><AdminLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="photographers" element={<Users />} />
              <Route path="albums" element={<Albums />} />
              <Route path="photos" element={<Photos />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
