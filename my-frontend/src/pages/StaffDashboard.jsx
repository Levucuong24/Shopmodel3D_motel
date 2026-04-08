import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const [editingRoomId, setEditingRoomId] = useState(null);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [uploadingRoomImage, setUploadingRoomImage] = useState(false);

  const [viewingRoom, setViewingRoom] = useState(null);
  const [viewingRoomReviews, setViewingRoomReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [newRoomForm, setNewRoomForm] = useState({
    name: "",
    price: "",
    location: "",
    area: "",
    layout: "",
    amenities: "",
    pet_policy: "",
    description: "",
    image: "",
    model_3d_url: "",
    status: "available",
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const token = localStorage.getItem("authToken");

    if (!token || role !== "staff") {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    setUser(userData);

    fetchRooms(token);
    fetchPayments(token);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token || activeTab !== "payments") return;

    const intervalId = setInterval(() => {
      fetchPayments(token);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [activeTab]);

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

  const handleRoomImageUpload = async (e) => {
    const file = e.target.files?.[0];
    const token = localStorage.getItem("authToken");

    if (!file || !token) return;

    setUploadingRoomImage(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/rooms/upload-image", {
        method: "POST",
        headers: { Authorization: token },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Lỗi tải ảnh");

      setNewRoomForm((prev) => ({ ...prev, image: data.imageUrl }));
    } catch (error) {
      alert(error.message);
    } finally {
      setUploadingRoomImage(false);
      e.target.value = "";
    }
  };

  const handleCancelEdit = () => {
    setEditingRoomId(null);
    setNewRoomForm({
      name: "",
      price: "",
      location: "",
      area: "",
      layout: "",
      amenities: "",
      pet_policy: "",
      description: "",
      image: "",
      model_3d_url: "",
      status: "available",
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
      image: room.images && room.images.length > 0 ? room.images[0] : "",
      model_3d_url: room.model_3d_url || "",
      status: room.status || "available",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phòng này không?")) return;
    const token = localStorage.getItem("authToken");

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

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    if (!newRoomForm.name || !newRoomForm.price || !newRoomForm.location) {
      alert("Vui lòng điền ít nhất tên phòng, giá và khu vực");
      return;
    }

    setCreatingRoom(true);

    try {
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
        images: newRoomForm.image ? [newRoomForm.image] : [],
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

  const handleConfirmRental = async (paymentId) => {
    if (!window.confirm("Bạn có chắc chắn xác nhận khách này đã thuê phòng không?")) return;

    const token = localStorage.getItem("authToken");
    if (!token) return alert("Bạn cần đăng nhập chủ nhà");

    try {
      const response = await fetch(`/api/payments/${paymentId}/confirm-rental`, {
        method: "POST",
        headers: { Authorization: token },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Không thể xác nhận thuê phòng");
      }

      setPayments((prev) =>
        prev.map((payment) =>
          payment._id === paymentId
            ? {
                ...payment,
                status: "success",
                room_id: {
                  ...payment.room_id,
                  status: "rented",
                  tenant_id: payment.user_id?._id || payment.user_id,
                },
              }
            : payment
        )
      );

      if (data.payment?.room_id) {
        setRooms((prev) =>
          prev.map((room) =>
            room._id === (data.payment.room_id._id || data.payment.room_id)
              ? { ...room, status: "rented", tenant_id: data.payment.user_id }
              : room
          )
        );
      }

      alert("Xác nhận thuê phòng thành công");
    } catch (error) {
      alert(error.message);
    }
  };

  if (!user) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar admin-theme" style={{ backgroundColor: "#4f46e5" }}>
        <div className="sidebar-header">
          <h2>MyHousing</h2>
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
        </ul>
        <div className="sidebar-footer">
          <Link
            to="/welcome"
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
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
            <img src="https://ui-avatars.com/api/?name=Staff&background=4f46e5&color=fff" alt="Staff Avatar" />
          </div>
        </header>

        <section className="dashboard-content">
          {activeTab === "overview" && (
            <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
              <h2>Bảng tổng quan chủ nhà</h2>
              <p>Chào mừng <strong>{user.full_name}</strong>. Bạn đang đăng nhập với tư cách Chủ nhà.</p>
              <p>Bạn có thể quản lý phòng và trực tiếp xử lý các giao dịch đặt cọc của phòng mình.</p>
            </div>
          )}

          {activeTab === "properties" && (
            <div className="recent-activity">
              <h3>Đăng phòng mới</h3>
              <form className="room-create-form" onSubmit={handleSaveRoom}>
                <div className="room-form-grid">
                  <input type="text" placeholder="Tên phòng" value={newRoomForm.name} onChange={(e) => handleNewRoomChange("name", e.target.value)} />
                  <input type="number" placeholder="Giá phòng" value={newRoomForm.price} onChange={(e) => handleNewRoomChange("price", e.target.value)} />
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
                    <span>Ảnh đại diện phòng</span>
                    <input type="file" accept="image/*" onChange={handleRoomImageUpload} disabled={uploadingRoomImage} />
                    <small>{uploadingRoomImage ? "Đang tải ảnh lên..." : newRoomForm.image ? "Ảnh đã tải lên" : "Chọn ảnh từ máy tính"}</small>
                  </label>
                  <input type="text" placeholder="Link model 3D" value={newRoomForm.model_3d_url} onChange={(e) => handleNewRoomChange("model_3d_url", e.target.value)} />
                </div>
                <textarea className="room-description-input" rows={4} placeholder="Mô tả chi tiết phòng" value={newRoomForm.description} onChange={(e) => handleNewRoomChange("description", e.target.value)} />
                {newRoomForm.image && <div className="room-image-preview"><img src={newRoomForm.image} alt="Xem trước" /></div>}

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
                        <td>{room.price?.toLocaleString("vi-VN")}đ</td>
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

          {activeTab === "payments" && (
            <div className="recent-activity">
              <h3>Quản lý Đặt cọc & Xác nhận Thuê phòng</h3>
              {paymentsLoading ? (
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
                          <span className="status-badge" style={{ background: payment.status === "success" ? "#16a34a" : "#d97706", color: "#fff" }}>
                            {payment.status === "success" ? "Khách đã CK" : "Chờ chuyển khoản"}
                          </span>
                        </td>
                        <td>
                          {payment.room_id?.status !== "rented" ? (
                            <button
                              onClick={() => handleConfirmRental(payment._id)}
                              style={{ padding: "6px 12px", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                            >
                              Xác nhận thuê phòng
                            </button>
                          ) : (
                            <span style={{ color: "#10b981", fontWeight: "bold", marginLeft: "10px" }}>✓ Đã giao phòng</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Chưa có giao dịch đặt cọc nào thuộc phòng của bạn.</p>
              )}
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
