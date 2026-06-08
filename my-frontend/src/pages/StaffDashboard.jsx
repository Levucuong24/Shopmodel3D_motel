import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthToken, getUserData, getUserRole, setUserData } from "../utils/authStorage.js";
import { formatDateTime, formatPriceByUnit, formatRentalDuration, getRentalUnitLabel } from "../utils/rentalFormat.js";
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

function StaffDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("properties");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const [editingRoomId, setEditingRoomId] = useState(null);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [uploadingRoomImage, setUploadingRoomImage] = useState(false);

  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [savingPayment, setSavingPayment] = useState(false);

  const [viewingRoom, setViewingRoom] = useState(null);
  const [viewingRoomReviews, setViewingRoomReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar: "",
  });

  const [newRoomForm, setNewRoomForm] = useState({
    name: "",
    price: "",
    price_unit: "month",
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

  const [paymentForm, setPaymentForm] = useState({
    customer_name: "",
    customer_email: "",
    amount: "",
    note: "",
    status: "pending",
    payment_method: "BANK_QR",
  });

  useEffect(() => {
    const role = getUserRole();
    const token = getAuthToken();

    if (!token || role !== "staff") {
      navigate("/login");
      return;
    }

    const userData = getUserData() || {};
    setUser(userData);
    setProfileForm({
      full_name: userData.full_name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      avatar: userData.avatar || "",
    });

    fetchRooms(token);
    fetchPayments(token);

    // Fetch fresh profile data
    fetch("/api/users/me", {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?._id) {
          setUser(data);
          setProfileForm({
            full_name: data.full_name || "",
            email: data.email || "",
            phone: data.phone || "",
            avatar: data.avatar || "",
          });
          setUserData(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
      });
  }, [navigate]);

  const fetchRooms = (token) => {
    setLoading(true);
    fetch("/api/rooms/all", { headers: { Authorization: token } })
      .then((res) => res.json())
      .then((data) => {
        setRooms(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching rooms:", err);
        setLoading(false);
      });
  };

  const fetchPayments = (token) => {
    setPaymentsLoading(true);
    fetch("/api/payments", { headers: { Authorization: token } })
      .then((res) => res.json())
      .then((data) => {
        setPayments(Array.isArray(data) ? data : []);
        setPaymentsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching payments:", err);
        setPaymentsLoading(false);
      });
  };

  const handleViewRoomClick = async (room) => {
    setViewingRoom(room);
    setLoadingReviews(true);
    try {
      const response = await fetch(`/api/reviews/${room._id}`);
      const data = await response.json();
      setViewingRoomReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleNewRoomChange = (field, value) => {
    setNewRoomForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field, value) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoomImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const token = getAuthToken();

    if (files.length === 0 || !token) return;

    setUploadingRoomImage(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/rooms/upload-image", {
          method: "POST",
          headers: { Authorization: token },
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Lỗi tải ảnh");
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

  const handleCancelEdit = () => {
    setEditingRoomId(null);
    setNewRoomForm({
      name: "",
      price: "",
      price_unit: "month",
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
  };

  const handleCancelPaymentEdit = () => {
    setEditingPaymentId(null);
    setPaymentForm({
      customer_name: "",
      customer_email: "",
      amount: "",
      note: "",
      status: "pending",
      payment_method: "BANK_QR",
    });
  };

  const handleEditRoomClick = (room) => {
    setEditingRoomId(room._id);
    setNewRoomForm({
      name: room.name || "",
      price: room.price || "",
      price_unit: room.price_unit || "month",
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

    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });

      if (!response.ok) throw new Error("Không thể xóa phòng");
      setRooms((prev) => prev.filter((room) => room._id !== id));
      alert("Xóa phòng thành công");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditPaymentClick = (payment) => {
    setActiveTab("payments");
    setEditingPaymentId(payment._id);
    setPaymentForm({
      customer_name: payment.customer_name || "",
      customer_email: payment.customer_email || "",
      amount: payment.amount ?? "",
      note: payment.note || "",
      status: payment.status || "pending",
      payment_method: payment.payment_method || "BANK_QR",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token || !editingPaymentId) return;

    if (!paymentForm.customer_name || paymentForm.amount === "") {
      alert("Vui lòng nhập tên khách và số tiền đặt cọc");
      return;
    }

    setSavingPayment(true);
    try {
      const response = await fetch(`/api/payments/${editingPaymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({
          customer_name: paymentForm.customer_name,
          customer_email: paymentForm.customer_email,
          amount: Number(paymentForm.amount),
          note: paymentForm.note,
          status: paymentForm.status,
          payment_method: paymentForm.payment_method,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể cập nhật đặt cọc");

      handleCancelPaymentEdit();
      fetchPayments(token);
      alert("Cập nhật đặt cọc thành công");
    } catch (error) {
      alert(error.message);
    } finally {
      setSavingPayment(false);
    }
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa giao dịch đặt cọc này không?")) return;
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể xóa đặt cọc");

      if (editingPaymentId === id) {
        handleCancelPaymentEdit();
      }

      fetchPayments(token);
      fetchRooms(token);
      alert(data.message || "Xóa đặt cọc thành công");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleConfirmRental = async (paymentId) => {
    const token = getAuthToken();
    if (!token) return;

    if (!window.confirm("Xác nhận giao phòng và chốt doanh thu (admin nhận 5%)?")) return;

    try {
      const response = await fetch(`/api/payments/${paymentId}/confirm-rental`, {
        method: "POST",
        headers: { Authorization: token },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể xác nhận thuê phòng");

      fetchPayments(token);
      fetchRooms(token);
      alert("Đã xác nhận thuê phòng thành công");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleConfirmCancellation = async (paymentId) => {
    const token = getAuthToken();
    if (!token) return;

    if (!window.confirm("Xác nhận cho khách hủy thuê và mở lại phòng này?")) return;

    try {
      const response = await fetch(`/api/payments/${paymentId}/confirm-cancel`, {
        method: "POST",
        headers: { Authorization: token },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể xác nhận hủy thuê");

      fetchPayments(token);
      fetchRooms(token);
      alert(data.message || "Đã xác nhận hủy thuê thành công");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    const token = getAuthToken();

    if (!newRoomForm.name || !newRoomForm.price || !newRoomForm.location) {
      alert("Vui lòng điền ít nhất tên phòng, giá và khu vực");
      return;
    }

    setCreatingRoom(true);

    try {
      const payload = {
        name: newRoomForm.name,
        price: Number(newRoomForm.price),
        price_unit: newRoomForm.price_unit,
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
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Thao tác thất bại");

      if (editingRoomId) {
        setRooms((prev) => prev.map((room) => (room._id === editingRoomId ? data : room)));
        alert("Cập nhật phòng thành công");
      } else {
        setRooms((prev) => [data, ...prev]);
        alert("Thêm phòng mới thành công! Đang chờ admin duyệt.");
      }
      handleCancelEdit();
    } catch (error) {
      alert(error.message);
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();

    const token = getAuthToken();
    if (!token) {
      alert("Bạn cần đăng nhập lại để cập nhật thông tin");
      return;
    }

    setSavingProfile(true);

    try {
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Không thể cập nhật thông tin");
      }

      setUser(data);
      setProfileForm({
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        avatar: data.avatar || "",
      });
      setUserData(data);
      alert("Cập nhật thông tin thành công");
    } catch (error) {
      alert(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    const token = getAuthToken();

    if (!file) return;

    if (!token) {
      alert("Bạn cần đăng nhập lại để tải ảnh");
      return;
    }

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/users/me/avatar", {
        method: "POST",
        headers: {
          Authorization: token,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Không thể tải ảnh đại diện");
      }

      setUser(data);
      setProfileForm({
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        avatar: data.avatar || "",
      });
      setUserData(data);
      alert("Tải ảnh đại diện thành công");
    } catch (error) {
      alert(error.message);
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  if (!user) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Đang tải dữ liệu...</div>;
  }

  const staffAvatar =
    profileForm.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.full_name || "Staff"
    )}&background=4f46e5&color=fff`;

  return (
    <div className="dashboard-container">
      <aside className="sidebar admin-theme" style={{ backgroundColor: "#4f46e5" }}>
        <div className="sidebar-header">
          <h2>Homie</h2>
          <span className="role-badge" style={{ backgroundColor: "#818cf8" }}>Staff</span>
        </div>
        <ul className="nav-links">
          <li className={activeTab === "overview" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("overview"); }}>Tổng quan</a>
          </li>
          <li className={activeTab === "properties" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("properties"); }}>Quản lý phòng</a>
          </li>
          <li className={activeTab === "payments" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("payments"); }}>Quản lý đặt cọc</a>
          </li>
          <li className={activeTab === "profile" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("profile"); }}>Thông tin cá nhân</a>
          </li>
        </ul>
        <div className="sidebar-footer">
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
          <h1>Bảng Điều Khiển Chủ nhà</h1>
          <div className="user-profile">
            <span style={{ marginRight: "10px", fontWeight: "bold" }}>{user.full_name}</span>
            <img src={staffAvatar} alt="Staff Avatar" />
          </div>
        </header>

        <section className="dashboard-content">
          {activeTab === "overview" && (
            <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
              <h2>Bảng tổng quan chủ nhà</h2>
              <p>Chào mừng <strong>{user.full_name}</strong>. Bạn đang đăng nhập với tư cách Chủ nhà.</p>
              <p>Bạn có thể quản lý phòng và cập nhật giá/phòng của chính mình tại đây.</p>
            </div>
          )}

          {activeTab === "properties" && (
            <div className="recent-activity">
              <h3>Đăng phòng mới</h3>
              <form className="room-create-form" onSubmit={handleSaveRoom}>
                <div className="room-form-grid">
                  <input type="text" placeholder="Tên phòng" value={newRoomForm.name} onChange={(e) => handleNewRoomChange("name", e.target.value)} />
                  <input type="number" placeholder="Giá phòng" value={newRoomForm.price} onChange={(e) => handleNewRoomChange("price", e.target.value)} />
                  <select value={newRoomForm.price_unit} onChange={(e) => handleNewRoomChange("price_unit", e.target.value)}>
                    <option value="month">Theo {getRentalUnitLabel("month")}</option>
                    <option value="week">Theo {getRentalUnitLabel("week")}</option>
                    <option value="day">Theo {getRentalUnitLabel("day")}</option>
                    <option value="hour">Theo {getRentalUnitLabel("hour")}</option>
                    <option value="minute">Theo {getRentalUnitLabel("minute")}</option>
                  </select>
                  <input type="text" placeholder="Khu vực" value={newRoomForm.location} onChange={(e) => handleNewRoomChange("location", e.target.value)} />
                  <input type="number" placeholder="Diện tích (m²)" value={newRoomForm.area} onChange={(e) => handleNewRoomChange("area", e.target.value)} />
                  <input type="text" placeholder="Bố trí" value={newRoomForm.layout} onChange={(e) => handleNewRoomChange("layout", e.target.value)} />
                  <select value={newRoomForm.status} onChange={(e) => handleNewRoomChange("status", e.target.value)}>
                    <option value="available">Còn phòng</option>
                    <option value="reserved">Đã được cọc</option>
                    <option value="rented">Hết phòng</option>
                  </select>
                  <input type="text" placeholder="Tiện nghi, ngăn cách dấu phẩy" value={newRoomForm.amenities} onChange={(e) => handleNewRoomChange("amenities", e.target.value)} />
                  <input type="text" placeholder="Chính sách thú cưng" value={newRoomForm.pet_policy} onChange={(e) => handleNewRoomChange("pet_policy", e.target.value)} />
                  <label className="room-upload-field">
                    <span>Ảnh đại diện phòng (chọn nhiều ảnh)</span>
                    <input type="file" accept="image/*" multiple onChange={handleRoomImageUpload} disabled={uploadingRoomImage} />
                    <small>{uploadingRoomImage ? "Đang tải ảnh lên..." : "Chọn một hoặc nhiều ảnh từ máy tính"}</small>
                  </label>
                  <input type="text" placeholder="Link model 3D" value={newRoomForm.model_3d_url} onChange={(e) => handleNewRoomChange("model_3d_url", e.target.value)} />
                </div>
                <textarea className="room-description-input" rows={4} placeholder="Mô tả chi tiết phòng" value={newRoomForm.description} onChange={(e) => handleNewRoomChange("description", e.target.value)} />
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

                <div className="form-actions" style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button type="submit" className="create-room-btn" disabled={creatingRoom} style={{ flex: 1, backgroundColor: "#4f46e5" }}>
                    {creatingRoom ? "Đang xử lý..." : editingRoomId ? "Lưu thay đổi" : "Đăng phòng"}
                  </button>
                  {editingRoomId && (
                    <button type="button" onClick={handleCancelEdit} style={{ flex: 1, padding: "10px", backgroundColor: "#6b7280", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                      Hủy
                    </button>
                  )}
                </div>
              </form>

              <h3 style={{ marginTop: "30px" }}>Danh sách bài đăng của bạn</h3>
              {loading ? (
                <p>Đang tải dữ liệu...</p>
              ) : rooms.length === 0 ? (
                <p>Bạn chưa đăng phòng nào.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tên phòng</th>
                      <th>Giá</th>
                      <th>Khu vực</th>
                      <th>Trạng thái phòng</th>
                      <th>Trạng thái duyệt</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room._id}>
                        <td style={{ fontWeight: "bold" }}>{room.name}</td>
                        <td>{formatPriceByUnit(room.price, room.price_unit)}</td>
                        <td>{room.location}</td>
                        <td>
                          <span style={{ padding: "4px 8px", borderRadius: "12px", color: "#fff", fontSize: "12px", background: roomStatusColor[room.status] || "#64748b" }}>
                            {roomStatusLabel[room.status] || room.status}
                          </span>
                        </td>
                        <td>
                          <span style={{ padding: "4px 8px", borderRadius: "12px", color: "#fff", fontSize: "12px", fontWeight: "bold", background: approvalStatusColor[room.approval_status] || "#64748b" }}>
                            {approvalStatusLabel[room.approval_status] || room.approval_status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "5px" }}>
                            <button onClick={() => handleViewRoomClick(room)} style={{ padding: "5px 10px", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Xem</button>
                            <button
                              onClick={() => handleEditRoomClick(room)}
                              disabled={room.status === "rented"}
                              style={{
                                padding: "5px 10px",
                                background: room.status === "rented" ? "#9ca3af" : "#f59e0b",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: room.status === "rented" ? "not-allowed" : "pointer",
                                opacity: room.status === "rented" ? 0.7 : 1,
                              }}
                            >
                              Sửa
                            </button>
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
          {activeTab === "payments" && (
            <div className="recent-activity">
              <h3>Quản lý đặt cọc</h3>

              {editingPaymentId && (
                <form className="room-create-form" onSubmit={handleSavePayment} style={{ marginBottom: "24px" }}>
                  <div className="room-form-grid">
                    <input type="text" placeholder="Tên khách" value={paymentForm.customer_name} onChange={(e) => handlePaymentChange("customer_name", e.target.value)} />
                    <input type="email" placeholder="Email khách" value={paymentForm.customer_email} onChange={(e) => handlePaymentChange("customer_email", e.target.value)} />
                    <input type="number" placeholder="Số tiền đặt cọc" value={paymentForm.amount} onChange={(e) => handlePaymentChange("amount", e.target.value)} />
                    <select value={paymentForm.status} onChange={(e) => handlePaymentChange("status", e.target.value)}>
                      <option value="pending">Chờ chuyển khoản</option>
                      <option value="success">Đã chuyển khoản</option>
                      <option value="failed">Thất bại</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                    <select value={paymentForm.payment_method} onChange={(e) => handlePaymentChange("payment_method", e.target.value)}>
                      <option value="BANK_QR">Bank QR</option>
                      <option value="MOMO">MoMo</option>
                      <option value="VNPAY">VNPay</option>
                      <option value="CASH">Tiền mặt</option>
                    </select>
                    <input type="text" placeholder="Ghi chú" value={paymentForm.note} onChange={(e) => handlePaymentChange("note", e.target.value)} />
                  </div>

                  <div className="form-actions" style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                    <button type="submit" className="create-room-btn" disabled={savingPayment} style={{ flex: 1, backgroundColor: "#4f46e5" }}>
                      {savingPayment ? "Đang lưu..." : "Lưu chỉnh sửa"}
                    </button>
                    <button type="button" onClick={handleCancelPaymentEdit} style={{ flex: 1, padding: "10px", backgroundColor: "#6b7280", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                      Hủy
                    </button>
                  </div>
                </form>
              )}

              {paymentsLoading ? (
                <p>Đang tải dữ liệu đặt cọc...</p>
              ) : payments.length === 0 ? (
                <p>Chưa có giao dịch đặt cọc nào cho các phòng của bạn.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Khách thuê</th>
                      <th>Phòng</th>
                      <th>Số tiền</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => {
                      const isCancelledRental = payment.cancellation_status === "approved" || payment.status === "cancelled";
                      const hasTransferred = payment.status === "success";
                      const isConfirmed =
                        !isCancelledRental &&
                        (Boolean(payment.rental_confirmed_at) || payment.room_id?.status === "rented");
                      const hasCancellationRequest = payment.cancellation_status === "pending";
                      const disableEditDelete = isConfirmed || hasCancellationRequest || isCancelledRental;
                      const disableConfirmRental = !hasTransferred || isConfirmed || hasCancellationRequest || isCancelledRental;
                      const statusLabel =
                        isConfirmed
                          ? "Đã chuyển khoản"
                          : payment.status === "failed"
                          ? "Thất bại"
                          : payment.status === "cancelled"
                          ? "Đã hủy"
                          : "Chờ chuyển khoản";

                      const statusColor =
                        isConfirmed
                          ? "#16a34a"
                          : payment.status === "failed" || payment.status === "cancelled"
                          ? "#dc2626"
                          : "#d97706";

                      return (
                        <tr key={payment._id}>
                          <td>
                            <div style={{ fontWeight: "bold" }}>{payment.customer_name || payment.user_id?.full_name || "Khách"}</div>
                            <div className="table-subtext">{payment.customer_email || payment.user_id?.email || ""}</div>
                          </td>
                          <td>
                            <div>{payment.room_id?.name || "Phòng đã xóa"}</div>
                            <div className="table-subtext">{payment.room_id?.location || ""}</div>
                          </td>
                          <td style={{ fontWeight: "bold" }}>{payment.amount?.toLocaleString("vi-VN")}đ</td>
                          <td>
                            <span className="status-badge" style={{ background: statusColor, color: "#fff" }}>
                              {statusLabel}
                            </span>
                          </td>
                          <td>{new Date(payment.created_at || payment.createdAt).toLocaleString("vi-VN")}</td>
                          <td>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                              <button
                                onClick={() => handleEditPaymentClick(payment)}
                                disabled={disableEditDelete}
                                style={{
                                  padding: "5px 10px",
                                  background: disableEditDelete ? "#9ca3af" : "#f59e0b",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: disableEditDelete ? "not-allowed" : "pointer",
                                }}
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeletePayment(payment._id)}
                                disabled={disableEditDelete}
                                style={{
                                  padding: "5px 10px",
                                  background: disableEditDelete ? "#9ca3af" : "#ef4444",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: disableEditDelete ? "not-allowed" : "pointer",
                                }}
                              >
                                Xóa
                              </button>
                              <button
                                onClick={() => handleConfirmRental(payment._id)}
                                disabled={disableConfirmRental}
                                style={{
                                  padding: "5px 10px",
                                  background: disableConfirmRental ? "#9ca3af" : "#10b981",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: disableConfirmRental ? "not-allowed" : "pointer",
                                }}
                              >
                                Xác nhận thuê
                              </button>
                              {hasCancellationRequest && (
                                <button
                                  onClick={() => handleConfirmCancellation(payment._id)}
                                  style={{
                                    padding: "5px 10px",
                                    background: "#dc2626",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                  }}
                                >
                                  Xác nhận hủy thuê
                                </button>
                              )}
                              {isConfirmed && <span style={{ color: "#10b981", fontWeight: "bold" }}>Đã chốt thuê</span>}
                              {hasCancellationRequest && <span style={{ color: "#c2410c", fontWeight: "bold" }}>Khách đang yêu cầu hủy</span>}
                              {isCancelledRental && <span style={{ color: "#6b7280", fontWeight: "bold" }}>Đã hủy thuê</span>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h3 className="section-title" style={{ borderLeftColor: "#4f46e5" }}>Thông tin cá nhân</h3>
                <img src={staffAvatar} alt={user.full_name} className="profile-preview-avatar" />
              </div>

              <form className="profile-form" onSubmit={handleProfileSave}>
                <div className="avatar-upload-box">
                  <label className="avatar-upload-label" style={{ backgroundColor: "#4f46e5" }}>
                    <span>{uploadingAvatar ? "Đang tải ảnh..." : "Tải ảnh đại diện từ máy tính"}</span>
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
                  </label>
                </div>

                <div className="profile-grid">
                  <label>
                    Họ và tên
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => handleProfileChange("full_name", e.target.value)}
                    />
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => handleProfileChange("email", e.target.value)}
                    />
                  </label>

                  <label>
                    Số điện thoại
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => handleProfileChange("phone", e.target.value)}
                    />
                  </label>

                  <label>
                    Đường dẫn ảnh đại diện (URL)
                    <input
                      type="text"
                      value={profileForm.avatar}
                      onChange={(e) => handleProfileChange("avatar", e.target.value)}
                    />
                  </label>
                </div>

                <button type="submit" className="profile-save-btn" disabled={savingProfile}>
                  {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </form>
            </div>
          )}
        </section>
      </main>

      {viewingRoom && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="modal-content" style={{ background: "white", padding: "20px", borderRadius: "8px", width: "80%", maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ddd", paddingBottom: "10px", marginBottom: "20px" }}>
              <h2>Chi tiết phòng: {viewingRoom.name}</h2>
              <button onClick={() => setViewingRoom(null)} style={{ background: "transparent", border: "none", fontSize: "28px", cursor: "pointer" }}>&times;</button>
            </div>

            <div className="modal-body">
              <h3>Hình ảnh</h3>
              <div style={{ display: "flex", gap: "10px", overflowX: "auto", marginBottom: "20px" }}>
                {viewingRoom.images && viewingRoom.images.length > 0 ? (
                  viewingRoom.images.map((img, idx) => (
                    <img key={idx} src={img} alt="Room" style={{ width: "200px", height: "150px", objectFit: "cover", borderRadius: "8px" }} />
                  ))
                ) : (
                  <p>Không có hình ảnh đính kèm</p>
                )}
              </div>

              <h3>Đánh giá từ người thuê</h3>
              {loadingReviews ? (
                <p>Đang tải đánh giá...</p>
              ) : viewingRoomReviews.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {viewingRoomReviews.map((review) => (
                    <div key={review._id} style={{ padding: "10px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong>{review.user_id?.full_name || "Người dùng"}</strong>
                        <span style={{ color: "#f59e0b" }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                      </div>
                      <p style={{ margin: "5px 0 0", color: "#4b5563" }}>{review.content}</p>
                      <small style={{ color: "#9ca3af" }}>{new Date(review.createdAt).toLocaleDateString("vi-VN")}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Chưa có đánh giá nào.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffDashboard;






