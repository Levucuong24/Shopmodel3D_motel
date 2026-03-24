import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import "./AdminDashboard.css";

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

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [rooms, setRooms] = useState([]);
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingsLoading, setViewingsLoading] = useState(true);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [priceUpdatingId, setPriceUpdatingId] = useState(null);
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
    image: "",
    model_3d_url: "",
    status: "available",
  });
  const [revenues] = useState([
    { id: 1, month: "Tháng 1", amount: 110000000, status: "Đã chốt" },
    { id: 2, month: "Tháng 2", amount: 98000000, status: "Đã chốt" },
    { id: 3, month: "Tháng 3", amount: 125000000, status: "Dự kiến" },
    { id: 4, month: "Tháng 4", amount: 140000000, status: "Mục tiêu" },
  ]);
  const [breakevenData, setBreakevenData] = useState({
    fixedCost: 50000000,
    variableCostPerRoom: 500000,
    rentPricePerRoom: 4000000,
  });

  useEffect(() => {
    fetch("/api/rooms")
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
    const token = localStorage.getItem("authToken");
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
  }, []);

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

  const handleStatusChange = async (id, newStatus) => {
    const token = localStorage.getItem("authToken");

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

  const handlePriceChange = (id, newPrice) => {
    setRooms((prev) =>
      prev.map((room) =>
        room._id === id ? { ...room, price: Number(newPrice) || 0 } : room
      )
    );
  };

  const handlePriceSave = async (id, price) => {
    const token = localStorage.getItem("authToken");

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
    const file = e.target.files?.[0];
    const token = localStorage.getItem("authToken");

    if (!file) {
      return;
    }

    if (!token) {
      alert("Bạn cần đăng nhập admin để tải ảnh phòng lên");
      e.target.value = "";
      return;
    }

    setUploadingRoomImage(true);

    try {
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

      setNewRoomForm((prev) => ({ ...prev, image: data.imageUrl }));
    } catch (error) {
      alert(error.message);
    } finally {
      setUploadingRoomImage(false);
      e.target.value = "";
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Bạn cần đăng nhập admin để thêm phòng mới");
      return;
    }

    if (!newRoomForm.name || !newRoomForm.price || !newRoomForm.location) {
      alert("Vui lòng điền ít nhất tên phòng, giá và khu vực");
      return;
    }

    setCreatingRoom(true);

    try {
      const storedUser = JSON.parse(localStorage.getItem("userData") || "null");
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          name: newRoomForm.name,
          price: Number(newRoomForm.price),
          status: newRoomForm.status,
          location: newRoomForm.location,
          specs: {
            area: newRoomForm.area ? Number(newRoomForm.area) : undefined,
            layout: newRoomForm.layout,
          },
          amenities: newRoomForm.amenities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          pet_policy: newRoomForm.pet_policy,
          description: newRoomForm.description,
          images: newRoomForm.image ? [newRoomForm.image] : [],
          model_3d_url: newRoomForm.model_3d_url,
          created_by: storedUser?._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể tạo phòng mới");
      }

      setRooms((prev) => [data, ...prev]);
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
      alert("Thêm phòng mới thành công");
    } catch (error) {
      alert(error.message);
    } finally {
      setCreatingRoom(false);
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar admin-theme">
        <div className="sidebar-header">
          <h2>MyHousing</h2>
          <span className="role-badge admin">Admin</span>
        </div>
        <ul className="nav-links">
          <li className={activeTab === "overview" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("overview"); }}>Tổng quan</a>
          </li>
          <li className={activeTab === "properties" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("properties"); }}>Quản lý phòng</a>
          </li>
          <li className={activeTab === "viewings" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("viewings"); }}>Lịch xem phòng</a>
          </li>
          <li className={activeTab === "reports" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("reports"); }}>Báo cáo doanh thu</a>
          </li>
          <li className={activeTab === "breakeven" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("breakeven"); }}>Điểm hòa vốn</a>
          </li>
        </ul>
        <div className="sidebar-footer">
          <Link
            to="/welcome"
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("userRole");
              localStorage.removeItem("authToken");
              localStorage.removeItem("userData");
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
                    <span className="trend neutral">Tính từ dữ liệu MongoDB hiện có</span>
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

          {activeTab === "properties" && (
            <div className="recent-activity">
              <h3>Quản lý phòng</h3>
              <form className="room-create-form" onSubmit={handleCreateRoom}>
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
                    <span>Ảnh đại diện phòng</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleRoomImageUpload}
                      disabled={uploadingRoomImage}
                    />
                    <small>
                      {uploadingRoomImage
                        ? "Đang tải ảnh lên..."
                        : newRoomForm.image
                          ? "Ảnh đã tải lên thành công"
                          : "Chọn ảnh từ máy tính của bạn"}
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
                {newRoomForm.image && (
                  <div className="room-image-preview">
                    <img src={newRoomForm.image} alt="Ảnh phòng xem trước" />
                  </div>
                )}
                <button type="submit" className="create-room-btn" disabled={creatingRoom}>
                  {creatingRoom ? "Đang tạo phòng..." : "Thêm phòng mới"}
                </button>
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
                      <th>Trạng thái hiện tại</th>
                      <th>Chuyển trạng thái</th>
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
                          <span style={{ padding: "5px 10px", borderRadius: "12px", color: "white", fontSize: "12px", fontWeight: "bold", background: roomStatusColor[room.status] || "#64748b" }}>
                            {roomStatusLabel[room.status] || room.status}
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
                          <span className={`viewing-status viewing-${item.status || "pending"}`}>
                            {item.status === "confirmed" ? "Đã xác nhận" : item.status === "cancelled" ? "Đã hủy" : "Chờ xác nhận"}
                          </span>
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

          {activeTab === "reports" && (
            <div className="recent-activity">
              <h3>Báo cáo doanh thu (Quý 1 - 2026)</h3>
              <p style={{ color: "#64748b", marginBottom: "25px" }}>Biểu đồ doanh thu vẫn là dữ liệu mô phỏng, nhưng phần phòng đã đồng bộ hoàn toàn theo MongoDB.</p>

              <div className="revenue-grid">
                {revenues.slice(0, 3).map((item, index) => {
                  let percentChange = null;
                  let isPositive = true;

                  if (index > 0) {
                    const prevRevenue = revenues[index - 1].amount;
                    const change = ((item.amount - prevRevenue) / prevRevenue) * 100;
                    percentChange = change.toFixed(1);
                    isPositive = change >= 0;
                  }

                  return (
                    <div className="revenue-card" key={item.id}>
                      <div className="revenue-header">
                        <h4>{item.month}</h4>
                        <span className={`revenue-badge ${item.status === "Dự kiến" ? "pending" : "completed"}`}>{item.status}</span>
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
                    <AreaChart data={revenues} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
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
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
