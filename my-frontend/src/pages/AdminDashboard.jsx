import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { clearAuthSession, getAuthToken, getUserData } from "../utils/authStorage.js";
import "../css/AdminDashboard.css";

const roomStatusLabel = {
  available: "Còn phòng",
  reserved: "Đã được cọc",
  rented: "Hết phòng",
};

const roomStatusColor = {
  available: "#16a34a",
  reserved: "#d97706",
  rented: "#dc2626",
};

const approvalStatusLabel = {
  pending: "Chờ duyệt",
  approved: "Được duyệt",
  rejected: "Bị từ chối",
};

const approvalStatusColor = {
  pending: "#f59e0b",
  approved: "#10b981",
  rejected: "#ef4444",
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [rooms, setRooms] = useState([]);
  const [payments, setPayments] = useState([]);
  const [revenueSummary, setRevenueSummary] = useState({ totalCommission: 0, totalLandlordPayout: 0, totalTransactions: 0 });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [users, setUsers] = useState([]);
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingsLoading, setViewingsLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [tenantUpdatingId, setTenantUpdatingId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [priceUpdatingId, setPriceUpdatingId] = useState(null);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [uploadingRoomImage, setUploadingRoomImage] = useState(false);
  const [newRoomForm, setNewRoomForm] = useState({
    name: "",
    price: "",
    location: "",
    area: "",
    layout: "",
    amenities: "",
    pet_policy: "",
    description: "",
    images: [],
    model_3d_url: "",
    status: "available",
  });

  const currentReportDate = new Date();
  const currentMonthLabel = currentReportDate.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
  const reportMonths = Array.from({ length: 4 }, (_, index) => {
    const date = new Date(currentReportDate.getFullYear(), currentReportDate.getMonth() - (3 - index), 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      id: key,
      key,
      month: date.toLocaleDateString("vi-VN", { month: "long" }),
      year: date.getFullYear(),
    };
  });

  const dynamicRevenues = useMemo(() => {
    const monthlyMap = new Map(
      monthlyRevenue.map((item) => [item.month, Number(item.amount || 0)])
    );

    const latestMonthKey = reportMonths[reportMonths.length - 1]?.key;

    return reportMonths.map((item) => ({
      id: item.key,
      month: item.month,
      amount: monthlyMap.get(item.key) || 0,
      status: item.key === latestMonthKey ? "Thực tế hiện tại" : "Đã chốt",
    }));
  }, [monthlyRevenue]);

  const [breakevenData, setBreakevenData] = useState({
    fixedCost: 50000000,
    variableCostPerRoom: 500000,
    rentPricePerRoom: 4000000,
  });

  useEffect(() => {
    const token = getAuthToken();
    const headers = token ? { Authorization: token } : {};
    
    fetch("/api/rooms/all", { headers })
      .then((res) => res.json())
      .then((data) => {
        setRooms(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching rooms:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    const headers = token ? { Authorization: token } : {};

    fetch("/api/viewings", { headers })
      .then((res) => res.json())
      .then((data) => {
        setViewings(Array.isArray(data) ? data : []);
        setViewingsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching viewings:", err);
        setViewingsLoading(false);
      });

    if (token) {
      fetch("/api/payments/admin-revenue", { headers })
        .then((res) => res.json())
        .then((data) => {
          setPayments(Array.isArray(data.payments) ? data.payments : []);
          setMonthlyRevenue(Array.isArray(data.monthlyRevenue) ? data.monthlyRevenue : []);
          setRevenueSummary(data.summary || { totalCommission: 0, totalLandlordPayout: 0, totalTransactions: 0 });
          setRevenueLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching admin revenue:", err);
          setRevenueLoading(false);
        });

      fetch("/api/users", { headers })
        .then((res) => res.json())
        .then((data) => setUsers(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error fetching users:", err));

      fetch("/api/gallery", { headers })
        .then((res) => res.json())
        .then((data) => setGalleryImages(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error fetching gallery:", err));
    }
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token || activeTab !== "accounting") return;

    const intervalId = setInterval(() => {
      fetch("/api/payments/admin-revenue", { headers: { Authorization: token } })
        .then((res) => res.json())
        .then((data) => {
          setPayments(Array.isArray(data.payments) ? data.payments : []);
          setMonthlyRevenue(Array.isArray(data.monthlyRevenue) ? data.monthlyRevenue : []);
          setRevenueSummary(data.summary || { totalCommission: 0, totalLandlordPayout: 0, totalTransactions: 0 });
        })
        .catch((err) => console.error("Error polling admin revenue:", err));
    }, 3000);

    return () => clearInterval(intervalId);
  }, [activeTab]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token || activeTab !== "logs") return;

    setLogsLoading(true);
    fetch("/api/logs", { headers: { Authorization: token } })
      .then((res) => res.json())
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error fetching logs:", err))
      .finally(() => setLogsLoading(false));
  }, [activeTab]);

  const roomStats = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter((room) => room.status === "available").length;
    const reserved = rooms.filter((room) => room.status === "reserved").length;
    const rented = rooms.filter((room) => room.status === "rented").length;
    const avgPrice = total ? Math.round(rooms.reduce((sum, room) => sum + (room.price || 0), 0) / total) : 0;

    return { total, available, reserved, rented, avgPrice };
  }, [rooms]);

  const contributionMargin = breakevenData.rentPricePerRoom - breakevenData.variableCostPerRoom;
  const breakevenRooms = contributionMargin > 0 ? Math.ceil(breakevenData.fixedCost / contributionMargin) : 0;

  const generateBreakevenChartData = () => {
    const data = [];
    const maxRooms = Math.max(30, breakevenRooms + 10);
    for (let i = 0; i <= maxRooms; i += 5) {
      data.push({
        rooms: i,
        "Tổng chi phí": breakevenData.fixedCost + i * breakevenData.variableCostPerRoom,
        "Doanh thu": i * breakevenData.rentPricePerRoom,
      });
    }
    return data;
  };

  const handleViewingStatusChange = async (id, newStatus) => {
    const token = getAuthToken();

    if (!token) {
      alert("Bạn cần đăng nhập admin để cập nhật trạng thái");
      return;
    }

    try {
      const response = await fetch(`/api/viewings/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Không thể cập nhật trạng thái");
      
      const updated = await response.json();
      setViewings((prev) => prev.map((v) => (v._id === id ? updated : v)));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUserRoleChange = async (id, newRole) => {
    const token = getAuthToken();
    if (!token) {
      alert("Bạn cần đăng nhập admin để thao tác");
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Lỗi đổi quyền user");

      setUsers((prev) => prev.map((u) => (u._id === id ? data : u)));
      alert("Cập nhật quyền thành công");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const token = getAuthToken();

    if (!token) {
      alert("Bạn cần đăng nhập admin để cập nhật trạng thái phòng");
      return;
    }

    const previousRooms = rooms;
    setStatusUpdatingId(id);
    setRooms((prev) => prev.map((room) => (room._id === id ? { ...room, status: newStatus } : room)));

    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể cập nhật trạng thái phòng");
      }

      setRooms((prev) => prev.map((room) => (room._id === id ? data : room)));
    } catch (error) {
      setRooms(previousRooms);
      alert(error.message);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleConfirmRental = async (paymentId) => {
    if (!window.confirm("Bạn có chắc chắn xác nhận người này đã thuê phòng?")) return;
    
    const token = getAuthToken();
    if (!token) return alert("Bạn cần đăng nhập admin");

    try {
      const response = await fetch(`/api/payments/${paymentId}/confirm-rental`, {
        method: "POST",
        headers: { Authorization: token },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể xác nhận thuê phòng");
      }

      setPayments((prev) => prev.map((p) => {
        if (p._id === paymentId) {
          return {
            ...p,
            status: "success",
            room_id: {
              ...p.room_id,
              status: "rented",
              tenant_id: p.user_id?._id || p.user_id
            }
          };
        }
        return p;
      }));
      
      if(data.payment && data.payment.room_id) {
         setRooms((prev) => prev.map((r) => r._id === (data.payment.room_id._id || data.payment.room_id) ? { ...r, status: "rented", tenant_id: data.payment.user_id } : r));
      }
      
      alert("Xác nhận thuê phòng thành công!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleTenantChange = async (id, newTenantId) => {
    const token = getAuthToken();
    if (!token) return alert("Bạn cần đăng nhập admin để cập nhật người thuê");

    const previousRooms = rooms;
    setTenantUpdatingId(id);
    const updatedTenant = newTenantId === "" ? null : newTenantId;
    setRooms((prev) => prev.map((room) => (room._id === id ? { ...room, tenant_id: updatedTenant } : room)));

    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ tenant_id: updatedTenant }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể cập nhật người thuê");

      setRooms((prev) => prev.map((room) => (room._id === id ? data : room)));
      alert("Cập nhật người thuê thành công");
    } catch (error) {
      setRooms(previousRooms);
      alert(error.message);
    } finally {
      setTenantUpdatingId(null);
    }
  };

  const handlePriceChange = (id, newPrice) => {
    setRooms((prev) =>
      prev.map((room) =>
        room._id === id ? { ...room, price: Number(newPrice) || 0 } : room
      )
    );
  };

  const handlePriceSave = async (id, price) => {
    const token = getAuthToken();

    if (!token) {
      alert("Bạn cần đăng nhập admin để cập nhật giá phòng");
      return;
    }

    setPriceUpdatingId(id);

    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ price: Number(price) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể cập nhật giá phòng");
      }

      setRooms((prev) => prev.map((room) => (room._id === id ? data : room)));
      alert("Cập nhật giá phòng thành công");
    } catch (error) {
      alert(error.message);
    } finally {
      setPriceUpdatingId(null);
    }
  };

  const handleNewRoomChange = (field, value) => {
    setNewRoomForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoomImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const token = getAuthToken();

    if (files.length === 0) {
      return;
    }

    if (!token) {
      alert("Bạn cần đăng nhập admin để tải ảnh phòng lên");
      e.target.value = "";
      return;
    }

    setUploadingRoomImage(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/rooms/upload-image", {
          method: "POST",
          headers: {
            Authorization: token,
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Không thể tải ảnh phòng lên");
        }
        return data.imageUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      setNewRoomForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }));
    } catch (error) {
      alert(error.message);
    } finally {
      setUploadingRoomImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setNewRoomForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files?.[0];
    const token = getAuthToken();
    if (!file || !token) return;

    setUploadingGallery(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/gallery/upload-image", {
        method: "POST",
        headers: { Authorization: token },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Lỗi tải ảnh");

      const addRes = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ imageUrl: data.imageUrl })
      });
      const addedData = await addRes.json();
      if (!addRes.ok) throw new Error(addedData.message || "Lỗi lưu ảnh gallery");

      setGalleryImages(prev => [addedData, ...prev]);
      alert("Thêm ảnh thành công");
    } catch (error) {
      alert(error.message);
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  };

  const handleAddGalleryUrl = async (e) => {
    e.preventDefault();
    if (!newGalleryUrl.trim()) return;
    const token = getAuthToken();

    try {
      const addRes = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ imageUrl: newGalleryUrl.trim() })
      });
      const addedData = await addRes.json();
      if (!addRes.ok) throw new Error(addedData.message || "Lỗi lưu ảnh gallery");

      setGalleryImages(prev => [addedData, ...prev]);
      setNewGalleryUrl("");
      alert("Thêm ảnh thành công");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteGalleryUrl = async (id) => {
    if (!window.confirm("Xóa ảnh này khỏi Gallery?")) return;
    const token = getAuthToken();

    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (!res.ok) throw new Error("Lỗi xóa ảnh");

      setGalleryImages(prev => prev.filter((img) => img._id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingRoomId(null);
    setNewRoomForm({
      name: "", price: "", location: "", area: "", layout: "", amenities: "",
      pet_policy: "", description: "", images: [], model_3d_url: "", status: "available",
    });
  };

  const handleEditRoomClick = (room) => {
    setEditingRoomId(room._id);
    setNewRoomForm({
      name: room.name || "",
      price: room.price || "",
      location: room.location || "",
      area: room.specs?.area || "",
      layout: room.specs?.layout || "",
      amenities: room.amenities ? room.amenities.join(", ") : "",
      pet_policy: room.pet_policy || "",
      description: room.description || "",
      images: room.images || [],
      model_3d_url: room.model_3d_url || "",
      status: room.status || "available",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phòng này không?")) return;
    const token = getAuthToken();
    if (!token) return alert("Bạn cần đăng nhập admin để xóa phòng");
    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Không thể xóa phòng");
      }
      setRooms((prev) => prev.filter((room) => room._id !== id));
      alert("Xóa phòng thành công");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();

    const token = getAuthToken();
    if (!token) {
      alert("Bạn cần đăng nhập admin để cập nhật phòng");
      return;
    }

    if (!newRoomForm.name || !newRoomForm.price || !newRoomForm.location) {
      alert("Vui lòng điền ít nhất tên phòng, giá và khu vực");
      return;
    }

    setCreatingRoom(true);

    try {
      const storedUser = getUserData();
      
      const payload = {
        name: newRoomForm.name,
        price: Number(newRoomForm.price),
        status: newRoomForm.status,
        location: newRoomForm.location,
        specs: {
          area: newRoomForm.area ? Number(newRoomForm.area) : undefined,
          layout: newRoomForm.layout,
        },
        amenities: newRoomForm.amenities.split(",").map((item) => item.trim()).filter(Boolean),
        pet_policy: newRoomForm.pet_policy,
        description: newRoomForm.description,
        images: newRoomForm.images || [],
        model_3d_url: newRoomForm.model_3d_url,
      };

      let url = "/api/rooms";
      let method = "POST";

      if (editingRoomId) {
        url = `/api/rooms/${editingRoomId}`;
        method = "PUT";
      } else {
        payload.created_by = storedUser?._id;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (editingRoomId ? "Không thể cập nhật phòng" : "Không thể tạo phòng mới"));
      }

      if (editingRoomId) {
        setRooms((prev) => prev.map((room) => (room._id === editingRoomId ? data : room)));
        alert("Cập nhật phòng thành công");
      } else {
        setRooms((prev) => [data, ...prev]);
        alert("Thêm phòng mới thành công");
      }
      handleCancelEdit();
    } catch (error) {
      alert(error.message);
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleApproveRoom = async (id, status) => {
    const token = getAuthToken();
    if (!token) return alert("Bạn cần đăng nhập admin");
    if (!window.confirm(`Bạn có chắc chắn muốn ${status === "approved" ? "duyệt" : "từ chối"} phòng này?`)) return;
    
    try {
      const response = await fetch(`/api/rooms/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Lỗi duyệt phòng");
      setRooms((prev) => prev.map((r) => r._id === id ? data : r));
      alert("Cập nhật trạng thái duyệt thành công!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar admin-theme">
        <div className="sidebar-header">
          <h2>Homie</h2>
          <span className="role-badge admin">Admin</span>
        </div>
        <ul className="nav-links">
          <li className={activeTab === "overview" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("overview"); }}>Tổng quan</a>
          </li>
          <li className={activeTab === "properties" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("properties"); }}>Quản lý phòng</a>
          </li>
          <li className={activeTab === "approvals" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("approvals"); }}>Phê duyệt phòng đăng</a>
          </li>
          <li className={activeTab === "viewings" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("viewings"); }}>Lịch xem phòng</a>
          </li>
          <li className={activeTab === "accounting" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("accounting"); }}>Kế toán doanh thu</a>
          </li>
          <li className={activeTab === "reports" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("reports"); }}>Báo cáo doanh thu</a>
          </li>
          <li className={activeTab === "gallery" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("gallery"); }}>Quản lý 3D Gallery</a>
          </li>
          <li className={activeTab === "users" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("users"); }}>Quản lý Người dùng</a>
          </li>
          <li className={activeTab === "breakeven" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("breakeven"); }}>Điểm hòa vốn</a>
          </li>
          <li className={activeTab === "logs" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("logs"); }}>Nhật ký hệ thống</a>
          </li>
        </ul>
        <div className="sidebar-footer" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link
            to="/"
            className="logout-btn"
            style={{ background: "#3b82f6" }}
          >
            Quay lại Website
          </Link>
          <Link
            to="/welcome"
            className="logout-btn"
            onClick={() => {
              clearAuthSession();
            }}
          >
            Đăng xuất
          </Link>
        </div>
      </aside>

      <main className="main-content bg-light">
        <header className="topbar">
          <h1>Bảng Điều Khiển Quản Trị</h1>
          <div className="user-profile">
            <img src="https://ui-avatars.com/api/?name=Admin&background=dc3545&color=fff" alt="Admin Avatar" />
          </div>
        </header>

        <section className="dashboard-content">
          {activeTab === "overview" && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon income-icon">💰</div>
                  <div className="stat-details">
                    <h3>Giá thuê trung bình</h3>
                    <p className="stat-number">{roomStats.avgPrice.toLocaleString("vi-VN")}đ</p>
                    <span className="trend neutral">Tính từ dữ liệu hệ thống</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon rooms-icon">🏢</div>
                  <div className="stat-details">
                    <h3>Tổng số phòng</h3>
                    <p className="stat-number">{roomStats.total} Phòng</p>
                    <span className="trend neutral">Còn phòng {roomStats.available} / Đã cọc {roomStats.reserved} / Hết phòng {roomStats.rented}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon users-icon">📅</div>
                  <div className="stat-details">
                    <h3>Lịch xem phòng</h3>
                    <p className="stat-number">{viewings.length}</p>
                    <span className="trend positive">Tổng yêu cầu khách hàng đã gửi</span>
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Phòng mới cập nhật</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tên phòng</th>
                      <th>Khu vực</th>
                      <th>Giá</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.slice(0, 5).map((room) => (
                      <tr key={room._id}>
                        <td>{room.name}</td>
                        <td>{room.location}</td>
                        <td>{room.price?.toLocaleString("vi-VN")}đ</td>
                        <td>
                          <span className="status-badge" style={{ background: roomStatusColor[room.status] || "#64748b", color: "#fff" }}>
                            {roomStatusLabel[room.status] || room.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "logs" && (
            <div className="recent-activity">
              <div className="section-header-with-action">
                <h3>Nhật ký hoạt động hệ thống</h3>
                <button className="clear-landlord-filter" onClick={() => {
                  setLogsLoading(true);
                  fetch("/api/logs", { headers: { Authorization: getAuthToken() } })
                    .then(res => res.json())
                    .then(data => setLogs(Array.isArray(data) ? data : []))
                    .catch(err => alert("Lỗi làm mới: " + err.message))
                    .finally(() => setLogsLoading(false));
                }}>
                  Làm mới
                </button>
              </div>

              {logsLoading ? (
                <p>Đang tải nhật ký...</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Người thực hiện</th>
                      <th>Thao tác</th>
                      <th>Dữ liệu / Tài nguyên</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length > 0 ? logs.map((log) => (
                      <tr key={log._id}>
                        <td>{new Date(log.createdAt).toLocaleString("vi-VN")}</td>
                        <td>
                          {log.user_id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img 
                                src={log.user_id.avatar || `https://ui-avatars.com/api/?name=${log.user_id.full_name}`} 
                                style={{ width: '30px', height: '30px', borderRadius: '50%' }} 
                                alt="avatar" 
                              />
                              <div>
                                <strong>{log.user_id.full_name}</strong><br/>
                                <small style={{ color: '#64748b' }}>{log.user_id.role}</small>
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>Hệ thống / Vô danh</span>
                          )}
                        </td>
                        <td>
                          <span className="status-badge" style={{ 
                            background: log.action === 'POST' ? '#10b981' : log.action === 'PUT' ? '#f59e0b' : log.action === 'DELETE' ? '#ef4444' : '#64748b',
                            color: '#fff' 
                          }}>
                            {log.action === 'POST' ? 'TẠO MỚI' : log.action === 'PUT' ? 'CẬP NHẬT' : log.action === 'DELETE' ? 'XÓA' : log.action}
                          </span>
                        </td>
                        <td>
                          <div style={{ marginBottom: '4px', fontSize: '13px', background: 'var(--section-bg)', padding: '4px 8px', borderRadius: '4px', wordBreak: 'break-all' }}>
                            <code>{log.resource}</code>
                          </div>
                          <details style={{ fontSize: '12px', color: 'var(--muted-text)', cursor: 'pointer' }}>
                            <summary>Xem chi tiết (Payload)</summary>
                            <pre style={{ background: '#f1f5f9', color: '#0f172a', padding: '8px', borderRadius: '4px', marginTop: '4px', overflowX: 'auto' }}>
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", color: "#64748b" }}>Chưa có nhật ký hoạt động nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "properties" && (
            <div className="recent-activity">
              <h3>Quản lý phòng</h3>
              <form className="room-create-form" onSubmit={handleSaveRoom}>
                <div className="room-form-grid">
                  <input
                    type="text"
                    placeholder="Tên phòng"
                    value={newRoomForm.name}
                    onChange={(e) => handleNewRoomChange("name", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Giá phòng"
                    value={newRoomForm.price}
                    onChange={(e) => handleNewRoomChange("price", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Khu vực"
                    value={newRoomForm.location}
                    onChange={(e) => handleNewRoomChange("location", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Diện tích (m²)"
                    value={newRoomForm.area}
                    onChange={(e) => handleNewRoomChange("area", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Bố trí"
                    value={newRoomForm.layout}
                    onChange={(e) => handleNewRoomChange("layout", e.target.value)}
                  />
                  <select
                    value={newRoomForm.status}
                    onChange={(e) => handleNewRoomChange("status", e.target.value)}
                  >
                    <option value="available">Còn phòng</option>
                    <option value="reserved">Đã được cọc</option>
                    <option value="rented">Hết phòng</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Tiện nghi, ngăn cách bằng dấu phẩy"
                    value={newRoomForm.amenities}
                    onChange={(e) => handleNewRoomChange("amenities", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Chính sách thú cưng"
                    value={newRoomForm.pet_policy}
                    onChange={(e) => handleNewRoomChange("pet_policy", e.target.value)}
                  />
                  <label className="room-upload-field">
                    <span>Ảnh đại diện phòng (chọn nhiều ảnh)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleRoomImageUpload}
                      disabled={uploadingRoomImage}
                    />
                    <small>
                      {uploadingRoomImage
                        ? "Đang tải ảnh lên..."
                        : "Chọn một hoặc nhiều ảnh từ máy tính"}
                    </small>
                  </label>
                  <input
                    type="text"
                    placeholder="Link model 3D"
                    value={newRoomForm.model_3d_url}
                    onChange={(e) => handleNewRoomChange("model_3d_url", e.target.value)}
                  />
                </div>
                <textarea
                  className="room-description-input"
                  rows={4}
                  placeholder="Mô tả chi tiết phòng"
                  value={newRoomForm.description}
                  onChange={(e) => handleNewRoomChange("description", e.target.value)}
                />
                {newRoomForm.images && newRoomForm.images.length > 0 && (
                  <div className="room-images-preview-list" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px", marginBottom: "15px" }}>
                    {newRoomForm.images.map((imgUrl, index) => (
                      <div key={index} className="preview-image-item" style={{ position: "relative", width: "120px", height: "90px", border: "1px solid #ddd", borderRadius: "8px", overflow: "visible" }}>
                        <img src={imgUrl} alt={`Xem trước ${index}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveImage(index)} 
                          style={{ 
                            position: "absolute", 
                            top: "-8px", 
                            right: "-8px", 
                            background: "#dc2626", 
                            color: "white", 
                            border: "none", 
                            borderRadius: "50%", 
                            width: "22px", 
                            height: "22px", 
                            cursor: "pointer", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "14px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button type="submit" className="create-room-btn" disabled={creatingRoom} style={{ flex: 1 }}>
                    {creatingRoom ? "Đang xử lý..." : editingRoomId ? "Lưu thay đổi" : "Thêm phòng mới"}
                  </button>
                  {editingRoomId && (
                    <button type="button" className="cancel-edit-btn" onClick={handleCancelEdit} style={{ flex: 1, backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                      Hủy
                    </button>
                  )}
                </div>
              </form>
              {loading ? (
                <p>Đang tải dữ liệu phòng...</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tên phòng</th>
                      <th>Giá thuê</th>
                      <th>Khu vực</th>
                      <th>Diện tích</th>
                      <th>Người thuê</th>
                      <th>Trạng thái hiện tại</th>
                      <th>Trạng thái duyệt</th>
                      <th>Chuyển trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room._id}>
                        <td style={{ fontWeight: "bold" }}>{room.name}</td>
                        <td>
                          <div className="price-editor">
                            <input
                              type="number"
                              value={room.price || 0}
                              onChange={(e) => handlePriceChange(room._id, e.target.value)}
                              className="price-input"
                            />
                            <button
                              type="button"
                              className="price-save-btn"
                              onClick={() => handlePriceSave(room._id, room.price)}
                              disabled={priceUpdatingId === room._id}
                            >
                              {priceUpdatingId === room._id ? "Đang lưu..." : "Lưu giá"}
                            </button>
                          </div>
                        </td>
                        <td>{room.location}</td>
                        <td>{room.specs?.area ? `${room.specs.area}m²` : "Đang cập nhật"}</td>
                        <td>
                          <select
                            value={room.tenant_id || ""}
                            onChange={(e) => handleTenantChange(room._id, e.target.value)}
                            disabled={tenantUpdatingId === room._id}
                            style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", maxWidth: "150px" }}
                          >
                            <option value="">-- Chưa có --</option>
                            {users.map((u) => (
                              <option key={u._id} value={u._id}>
                                {u.full_name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <span style={{ padding: "5px 10px", borderRadius: "12px", color: "white", fontSize: "12px", fontWeight: "bold", background: roomStatusColor[room.status] || "#64748b" }}>
                            {roomStatusLabel[room.status] || room.status}
                          </span>
                        </td>
                        <td>
                          <span style={{ padding: "5px 10px", borderRadius: "12px", color: "white", fontSize: "12px", fontWeight: "bold", background: approvalStatusColor[room.approval_status] || "#64748b" }}>
                            {approvalStatusLabel[room.approval_status] || room.approval_status}
                          </span>
                        </td>
                        <td>
                          <select
                            value={room.status}
                            onChange={(e) => handleStatusChange(room._id, e.target.value)}
                            disabled={statusUpdatingId === room._id}
                            style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
                          >
                            <option value="available">Còn phòng</option>
                            <option value="reserved">Đã được cọc</option>
                            <option value="rented">Hết phòng</option>
                          </select>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "5px" }}>
                            <Link
                              to={`/admin/room-builder/${room._id}`}
                              style={{
                                padding: "5px 10px",
                                background: "#0284c7",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                textDecoration: "none",
                                fontSize: "13px",
                                display: "inline-flex",
                                alignItems: "center"
                              }}
                            >
                              Thiết kế 3D
                            </Link>
                            <button onClick={() => handleEditRoomClick(room)} style={{ padding: "5px 10px", background: "#f59e0b", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Sửa</button>
                            <button onClick={() => handleDeleteRoom(room._id)} style={{ padding: "5px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "approvals" && (
            <div className="recent-activity">
              <h3>Phê duyệt phòng đăng</h3>
              {loading ? (
                <p>Đang tải dữ liệu...</p>
              ) : rooms.filter(r => r.approval_status === "pending").length === 0 ? (
                <p>Không có phòng nào đang chờ duyệt.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tên phòng</th>
                      <th>Giá thuê</th>
                      <th>Khu vực</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.filter(r => r.approval_status === "pending").map((room) => (
                      <tr key={room._id}>
                        <td style={{ fontWeight: "bold" }}>{room.name}</td>
                        <td>{room.price?.toLocaleString("vi-VN")}đ</td>
                        <td>{room.location}</td>
                        <td>
                          <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={() => handleApproveRoom(room._id, "approved")} style={{ padding: "5px 10px", background: "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Duyệt</button>
                            <button onClick={() => handleApproveRoom(room._id, "rejected")} style={{ padding: "5px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Từ chối</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "viewings" && (
            <div className="recent-activity">
              <h3>Lịch đặt xem phòng từ khách hàng</h3>
              {viewingsLoading ? (
                <p>Đang tải lịch xem phòng...</p>
              ) : viewings.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Khách hàng</th>
                      <th>Số điện thoại</th>
                      <th>Phòng</th>
                      <th>Thời gian xem</th>
                      <th>Ghi chú</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewings.map((item) => (
                      <tr key={item._id}>
                        <td>{item.full_name || item.user_id?.full_name || "Khách vãng lai"}</td>
                        <td>{item.phone || item.user_id?.phone || "Đang cập nhật"}</td>
                        <td>
                          <div>{item.room_id?.name || "Phòng đã xóa"}</div>
                          <div className="table-subtext">{item.room_id?.location || ""}</div>
                        </td>
                        <td>{item.scheduled_at ? new Date(item.scheduled_at).toLocaleString("vi-VN") : "Đang cập nhật"}</td>
                        <td>{item.note || "Không có"}</td>
                        <td>
                          <select
                            value={item.status || "pending"}
                            onChange={(e) => handleViewingStatusChange(item._id, e.target.value)}
                            style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
                          >
                            <option value="pending">Chờ xác nhận</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Chưa có lịch đặt xem phòng nào.</p>
              )}
            </div>
          )}

          {activeTab === "accounting" && (
            <div className="recent-activity">
              <h3>Kế toán doanh thu admin</h3>
              <div className="stats-grid" style={{ marginBottom: "24px" }}>
                <div className="stat-card">
                  <div className="stat-details">
                    <h3>Tổng hoa hồng 5%</h3>
                    <p className="stat-number">{Number(revenueSummary.totalCommission || 0).toLocaleString("vi-VN")}đ</p>
                    <span className="trend positive">{revenueSummary.totalTransactions || 0} giao dịch đã xác nhận</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-details">
                    <h3>Chủ nhà thực nhận</h3>
                    <p className="stat-number">{Number(revenueSummary.totalLandlordPayout || 0).toLocaleString("vi-VN")}đ</p>
                    <span className="trend neutral">Tương ứng 95% sau chiết khấu</span>
                  </div>
                </div>
              </div>

              {revenueLoading ? (
                <p>Đang tải dữ liệu kế toán doanh thu...</p>
              ) : payments.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Khách hàng</th>
                      <th>Phòng</th>
                      <th>Tổng tiền</th>
                      <th>Hoa hồng admin 5%</th>
                      <th>Chủ nhà nhận</th>
                      <th>Ngày xác nhận</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id}>
                        <td>
                          <div>{payment.customer_name || payment.user_id?.full_name || "Khách"}</div>
                          <div className="table-subtext">{payment.customer_email || payment.user_id?.email || ""}</div>
                        </td>
                        <td>
                          <div>{payment.room_id?.name || "Phòng đã xóa"}</div>
                          <div className="table-subtext">{payment.room_id?.location || ""}</div>
                        </td>
                        <td style={{ fontWeight: "bold" }}>{payment.amount?.toLocaleString("vi-VN")}đ</td>
                        <td style={{ fontWeight: "bold", color: "#dc2626" }}>{payment.admin_commission?.toLocaleString("vi-VN")}đ</td>
                        <td style={{ fontWeight: "bold", color: "#16a34a" }}>{payment.landlord_payout?.toLocaleString("vi-VN")}đ</td>
                        <td>{new Date(payment.rental_confirmed_at || payment.created_at || payment.createdAt).toLocaleString("vi-VN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Chưa có khoản hoa hồng 5% nào được ghi nhận.</p>
              )}

              {!revenueLoading && monthlyRevenue.length > 0 && (
                <div style={{ marginTop: "28px" }}>
                  <h4 style={{ marginBottom: "14px" }}>Tổng hợp theo tháng</h4>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Tháng</th>
                        <th>Tổng hoa hồng 5%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyRevenue.map((item) => (
                        <tr key={`${item.month}-${item.status}`}>
                          <td>{item.month}</td>
                          <td style={{ fontWeight: "bold", color: "#dc2626" }}>{Number(item.amount || 0).toLocaleString("vi-VN")}đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "payments" && (
            <div className="recent-activity">
              <h3>Quản lý Đặt cọc & Xác nhận Thuê phòng</h3>
              {loading ? (
                <p>Đang tải dữ liệu đặt cọc...</p>
              ) : payments.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Khách hàng</th>
                      <th>Phòng</th>
                      <th>Số tiền</th>
                      <th>Ngày đặt</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id}>
                        <td>
                          <div>{payment.customer_name || payment.user_id?.full_name || "Khách"}</div>
                          <div className="table-subtext">{payment.customer_email || payment.user_id?.email || ""}</div>
                        </td>
                        <td>
                          <div>{payment.room_id?.name || "Phòng đã xóa"}</div>
                          <div className="table-subtext">{payment.room_id?.location || ""}</div>
                        </td>
                        <td style={{ fontWeight: "bold", color: "#eab308" }}>{payment.amount?.toLocaleString("vi-VN")}đ</td>
                        <td>{new Date(payment.created_at || payment.createdAt).toLocaleString("vi-VN")}</td>
                        <td>
                          <span className={`status-badge`} style={{ background: payment.status === "success" ? "#16a34a" : "#d97706", color: "#fff" }}>
                            {payment.status === "success" ? "Khách đã CK" : "Chờ chuyển khoản"}
                          </span>
                        </td>
                        <td>
                          {payment.room_id?.status !== "rented" && (
                            <button
                              onClick={() => handleConfirmRental(payment._id)}
                              style={{ padding: "6px 12px", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                            >
                              Xác nhận thuê phòng
                            </button>
                          )}
                          {payment.room_id?.status === "rented" && <span style={{ color: "#10b981", fontWeight: "bold", marginLeft: "10px" }}>✓ Đã giao phòng</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Chưa có giao dịch đặt cọc nào.</p>
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="recent-activity">
              <h3>{`Báo cáo doanh thu (${currentMonthLabel})`}</h3>
              <p style={{ color: "#64748b", marginBottom: "25px" }}>Biểu đồ doanh thu được cập nhật theo các tháng gần thời điểm hiện tại của hệ thống.</p>

              <div className="revenue-grid">
                {dynamicRevenues.map((item, index) => {
                  let percentChange = null;
                  let isPositive = true;

                  if (index > 0) {
                    const prevRevenue = dynamicRevenues[index - 1].amount;
                    const change = ((item.amount - prevRevenue) / prevRevenue) * 100;
                    percentChange = change.toFixed(1);
                    isPositive = change >= 0;
                  }

                  return (
                    <div className="revenue-card" key={item.id}>
                      <div className="revenue-header">
                        <h4>{item.month}</h4>
                        <span className={`revenue-badge ${item.status === "Thực tế hiện tại" ? "pending" : "completed"}`}>{item.status}</span>
                      </div>
                      <div className="revenue-body">
                        <p className="revenue-amount">{item.amount.toLocaleString("vi-VN")}đ</p>
                        {percentChange !== null ? (
                          <div className={`revenue-comparison ${isPositive ? "positive" : "negative"}`}>
                            <span className="trend-icon">{isPositive ? "↑" : "↓"}</span>
                            <span className="trend-text">{Math.abs(percentChange)}% so với tháng trước</span>
                          </div>
                        ) : (
                          <div className="revenue-comparison neutral">
                            <span className="trend-text">Dữ liệu gốc</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="chart-container" style={{ marginTop: "40px", padding: "30px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
                <h4 style={{ marginBottom: "20px", fontSize: "18px", color: "#1e293b" }}>Sơ đồ đường Doanh Thu (VNĐ)</h4>
                <div style={{ width: "100%", height: 350 }}>
                  <ResponsiveContainer>
                    <AreaChart data={dynamicRevenues} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff6a00" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ff6a00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} dy={10} />
                      <YAxis tickFormatter={(value) => `${value / 1000000}M`} axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} />
                      <Tooltip formatter={(value) => [`${value.toLocaleString("vi-VN")} VNĐ`, "Doanh thu"]} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} />
                      <Area type="monotone" dataKey="amount" stroke="#ff6a00" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 8, strokeWidth: 2, fill: "#fff" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "breakeven" && (
            <div className="recent-activity">
              <h3>Phân tích điểm hòa vốn</h3>
              <p style={{ color: "#64748b", marginBottom: "25px" }}>Tính toán theo số phòng và giá thuê trung bình hiện có trong hệ thống.</p>

              <div className="stats-grid" style={{ marginBottom: "30px" }}>
                <div className="stat-card" style={{ flexWrap: "wrap" }}>
                  <div className="stat-details" style={{ width: "100%" }}>
                    <h3>Chi phí cố định (VNĐ/tháng)</h3>
                    <input type="number" value={breakevenData.fixedCost} onChange={(e) => setBreakevenData({ ...breakevenData, fixedCost: Number(e.target.value) })} className="admin-input" />
                  </div>
                </div>
                <div className="stat-card" style={{ flexWrap: "wrap" }}>
                  <div className="stat-details" style={{ width: "100%" }}>
                    <h3>Chi phí phát sinh (VNĐ/phòng)</h3>
                    <input type="number" value={breakevenData.variableCostPerRoom} onChange={(e) => setBreakevenData({ ...breakevenData, variableCostPerRoom: Number(e.target.value) })} className="admin-input" />
                  </div>
                </div>
                <div className="stat-card" style={{ flexWrap: "wrap" }}>
                  <div className="stat-details" style={{ width: "100%" }}>
                    <h3>Giá cho thuê TB (VNĐ/phòng)</h3>
                    <input type="number" value={breakevenData.rentPricePerRoom} onChange={(e) => setBreakevenData({ ...breakevenData, rentPricePerRoom: Number(e.target.value) })} className="admin-input" />
                  </div>
                </div>
              </div>

              <div style={{ padding: "20px", background: "#ecfdf5", borderRadius: "8px", borderLeft: "4px solid #10b981", marginBottom: "30px", display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ fontSize: "40px" }}>🎯</div>
                <div>
                  <h4 style={{ margin: "0 0 5px 0", color: "#065f46", fontSize: "18px" }}>Mục tiêu hòa vốn lợi nhuận</h4>
                  <p style={{ margin: 0, color: "#047857", fontSize: "15px" }}>
                    Yêu cầu cho thuê tối thiểu <strong>{breakevenRooms > 0 ? breakevenRooms : 0} phòng</strong> mỗi tháng để đạt điểm hòa vốn.
                    <br />
                    (Mức doanh thu điểm hòa vốn khoảng {(breakevenRooms * breakevenData.rentPricePerRoom).toLocaleString("vi-VN")} VNĐ)
                  </p>
                </div>
              </div>

              <div className="chart-container" style={{ padding: "30px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
                <h4 style={{ marginBottom: "20px", fontSize: "18px", color: "#1e293b" }}>Mô hình tương quan chi phí và doanh thu</h4>
                <div style={{ width: "100%", height: 350 }}>
                  <ResponsiveContainer>
                    <LineChart data={generateBreakevenChartData()} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="rooms" name="Số phòng" tick={{ fill: "#64748b" }} dy={10} />
                      <YAxis tickFormatter={(value) => `${value / 1000000}M`} tick={{ fill: "#64748b" }} />
                      <Tooltip formatter={(value) => [`${value.toLocaleString("vi-VN")} VNĐ`]} labelFormatter={(label) => `Số phòng thuê: ${label}`} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} />
                      <Legend verticalAlign="top" height={36} />
                      <Line type="monotone" dataKey="Tổng chi phí" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Doanh thu" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="recent-activity">
              <h3>Quản lý Gallery (3D Renderings)</h3>
              
              <div style={{ marginBottom: "20px", padding: "15px", background: "#f8fafc", borderRadius: "8px" }}>
                <div style={{ marginBottom: "15px" }}>
                  <label>
                    <span style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Tải ảnh từ máy tính:</span>
                    <input type="file" accept="image/*" onChange={handleGalleryUpload} disabled={uploadingGallery} />
                  </label>
                  {uploadingGallery && <span style={{ marginLeft: "10px", color: "#64748b" }}>Đang tải lên...</span>}
                </div>
                
                <h4 style={{ margin: "10px 0" }}>Hoặc thêm bằng URL</h4>
                <form onSubmit={handleAddGalleryUrl} style={{ display: "flex", gap: "10px" }}>
                  <input type="text" placeholder="https://..." value={newGalleryUrl} onChange={(e) => setNewGalleryUrl(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
                  <button type="submit" style={{ padding: "8px 15px", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Thêm</button>
                </form>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px" }}>
                {galleryImages.map((img) => (
                  <div key={img._id} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", position: "relative" }}>
                    <img src={img.imageUrl} alt="Gallery" style={{ width: "100%", height: "150px", objectFit: "cover", display: "block" }} />
                    <button 
                      onClick={() => handleDeleteGalleryUrl(img._id)}
                      style={{ position: "absolute", top: "5px", right: "5px", background: "rgba(239, 68, 68, 0.9)", color: "white", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {galleryImages.length === 0 && <p style={{ color: "#64748b" }}>Chưa có hình ảnh nào trong Gallery.</p>}
            </div>
          )}

          {activeTab === "users" && (
            <div className="recent-activity">
              <h3>Quản lý Người Dùng</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Họ Tên</th>
                    <th>Email / SĐT</th>
                    <th>Vai trò hiện tại</th>
                    <th>Chuyển vai trò</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td style={{ fontWeight: "bold" }}>{user.full_name}</td>
                      <td>
                        <div>{user.email || "N/A"}</div>
                        <div className="table-subtext">{user.phone || "N/A"}</div>
                      </td>
                      <td>
                        <span className="status-badge" style={{ background: user.role === "admin" ? "#dc2626" : user.role === "staff" ? "#f59e0b" : "#3b82f6", color: "white" }}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(e) => handleUserRoleChange(user._id, e.target.value)}
                          style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
                          disabled={user.role === "admin"} // Không cho phép tự đổi quyền admin
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
