import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./CustomerDashboard.css";

function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [customerName, setCustomerName] = useState("Khách hàng");
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = JSON.parse(localStorage.getItem("userData") || "null");

    if (storedUser) {
      setCustomerName(storedUser.full_name || "Khách hàng");
      setProfileForm({
        full_name: storedUser.full_name || "",
        email: storedUser.email || "",
        phone: storedUser.phone || "",
        avatar: storedUser.avatar || "",
      });
    }

    if (!token) return;

    fetch("/api/users/me", {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?._id) {
          setCustomerName(data.full_name || "Khách hàng");
          setProfileForm({
            full_name: data.full_name || "",
            email: data.email || "",
            phone: data.phone || "",
            avatar: data.avatar || "",
          });
          localStorage.setItem("userData", JSON.stringify(data));
        }
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
      });
  }, []);

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

  const savedRooms = rooms.slice(0, 2);
  const rentedRoom = rooms[0] || null;
  const customerAvatar =
    profileForm.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName || "Khach Hang")}&background=00c6ff&color=fff`;

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  };

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");
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

      setCustomerName(data.full_name || "Khách hàng");
      setProfileForm({
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        avatar: data.avatar || "",
      });
      localStorage.setItem("userData", JSON.stringify(data));
      alert("Cập nhật thông tin thành công");
    } catch (error) {
      alert(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    const token = localStorage.getItem("authToken");

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

      setCustomerName(data.full_name || "Khách hàng");
      setProfileForm({
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        avatar: data.avatar || "",
      });
      localStorage.setItem("userData", JSON.stringify(data));
      alert("Tải ảnh đại diện thành công");
    } catch (error) {
      alert(error.message);
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>MyHousing</h2>
          <span className="role-badge customer">Customer</span>
        </div>
        <ul className="nav-links">
          <li className={activeTab === "overview" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("overview"); }}>Trang chủ</a>
          </li>
          <li className={activeTab === "profile" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("profile"); }}>Thông tin cá nhân</a>
          </li>
          <li className={activeTab === "saved" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("saved"); }}>Phòng đã lưu</a>
          </li>
          <li className={activeTab === "rented" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("rented"); }}>Phòng đang thuê</a>
          </li>
        </ul>
        <div className="sidebar-footer">
          <Link to="/welcome" className="logout-btn" onClick={handleLogout}>Đăng xuất</Link>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1>Xin chào, {customerName}</h1>
          <div className="user-profile">
            <img src={customerAvatar} alt={customerName} />
          </div>
        </header>

        <section className="dashboard-content">
          {activeTab === "overview" && (
            <div className="welcome-banner">
              <h2>Tìm kiếm không gian sống lý tưởng của bạn</h2>
              <p>Khám phá các phòng trọ tiện nghi, giá cả hợp lý từ dữ liệu phòng đang có trong hệ thống.</p>
              <Link to="/welcome" className="explore-btn">Xem phòng trọ</Link>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h3 className="section-title">Thông tin cá nhân</h3>
                <img src={customerAvatar} alt={customerName} className="profile-preview-avatar" />
              </div>

              <form className="profile-form" onSubmit={handleProfileSave}>
                <div className="avatar-upload-box">
                  <label className="avatar-upload-label">
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
                    Link avatar
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

          {activeTab === "saved" && (
            <>
              <h3 className="section-title">Phòng đang quan tâm (đồng bộ từ MongoDB)</h3>
              {loading ? (
                <p>Đang tải dữ liệu phòng...</p>
              ) : (
                <div className="saved-rooms-grid">
                  {savedRooms.map((room) => (
                    <div className="saved-card" key={room._id}>
                      <img src={room.images?.[0]} alt={room.name} />
                      <div className="saved-info">
                        <h4>{room.name}</h4>
                        <p>{room.location}</p>
                        <p className="price">{room.price?.toLocaleString("vi-VN")}đ / tháng</p>
                        <p>Diện tích: {room.specs?.area ? `${room.specs.area}m²` : "Đang cập nhật"}</p>
                        <p>Trạng thái: {room.status}</p>
                        <Link to={`/product/${room._id}`} className="view-detail-btn" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "rented" && (
            <>
              <h3 className="section-title">Thông tin phòng đang thuê</h3>
              {loading ? (
                <p>Đang tải dữ liệu phòng...</p>
              ) : rentedRoom ? (
                <div className="rented-rooms-container" style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "15px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", fontSize: "18px" }}>{rentedRoom.name}</h4>
                      <p style={{ margin: 0, color: "#666" }}>
                        Trạng thái: <span style={{ color: "green", fontWeight: "bold" }}>{rentedRoom.status}</span>
                      </p>
                    </div>
                    <div>
                      <Link to={`/product/${rentedRoom._id}`} className="view-detail-btn" style={{ padding: "8px 15px", textDecoration: "none" }}>
                        Xem trang chi tiết
                      </Link>
                    </div>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, lineHeight: 1.8 }}>
                    <li><strong>Địa điểm:</strong> {rentedRoom.location}</li>
                    <li><strong>Giá thuê:</strong> {rentedRoom.price?.toLocaleString("vi-VN")}đ/tháng</li>
                    <li><strong>Diện tích:</strong> {rentedRoom.specs?.area ? `${rentedRoom.specs.area}m²` : "Đang cập nhật"}</li>
                    <li><strong>Bố trí:</strong> {rentedRoom.specs?.layout || "Đang cập nhật"}</li>
                    <li><strong>Thú cưng:</strong> {rentedRoom.pet_policy || "Đang cập nhật"}</li>
                  </ul>
                </div>
              ) : (
                <p>Chưa có dữ liệu phòng để hiển thị.</p>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default CustomerDashboard;
