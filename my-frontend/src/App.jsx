import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/layout/Navbar.jsx";
import Home from "./pages/Home.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Auth from "./pages/Auth.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import StaffDashboard from "./pages/StaffDashboard.jsx";
import Blog from "./pages/Blog.jsx";
import MapPage from "./pages/MapPage.jsx";
import ScrollToTop from "./components/layout/ScrollToTop.jsx";
import { clearLegacyAuthStorage } from "./utils/authStorage.js";
// Dashboard Wrapper to selectively render Navbar
function DashboardLayout({ children }) {
  return <>{children}</>;
}

function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function App() {
  useEffect(() => {
    clearLegacyAuthStorage();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Main Routes with Navbar */}
        <Route path="/welcome" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/welcome/:userId" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/product/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
        <Route path="/blog" element={<MainLayout><Blog /></MainLayout>} />
        <Route path="/map" element={<MainLayout><MapPage /></MainLayout>} />
        <Route path="/" element={<Navigate to="/welcome" />} />
        
        {/* Auth Routes without Navbar (optional depends on app design, currently Navbar holds just logo so we can omit it) */}
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Dashboard Routes without Navbar */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/staff" element={<StaffDashboard />} />
      </Routes>
      <ScrollToTop />
    </BrowserRouter>
  );
}

export default App;
