import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { clearAuthSession, getAuthToken, getUserData, setUserData } from "../utils/authStorage.js";
import { formatDateTime, formatPriceByUnit, formatRentalDuration } from "../utils/rentalFormat.js";
import "../css/CustomerDashboard.css";

function CustomerDashboard() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [rooms, setRooms] = useState([]);
  const [savedRooms, setSavedRooms] = useState([]);
  const [viewings, setViewings] = useState([]);
  const [viewingsLoading, setViewingsLoading] = useState(true);
  const [rentalPayment, setRentalPayment] = useState(null);
  const [rentalPaymentLoading, setRentalPaymentLoading] = useState(true);
  const [requestingCancellation, setRequestingCancellation] = useState(false);
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
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getUserData();

    if (storedUser) {
      setCustomerName(storedUser.full_name || "Khách hàng");
      setProfileForm({
        full_name: storedUser.full_name || "",
        email: storedUser.email || "",
        phone: storedUser.phone || "",
        avatar: storedUser.avatar || "",
      });
    }

    if (!token) {
      setRentalPaymentLoading(false);
      return;
    }

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
          setSavedRooms(data.saved_rooms || []);
          setUserData(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
      });

    fetch("/api/payments/my-rental", {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setRentalPayment(data && !data.message ? data : null);
        setRentalPaymentLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching rental payment:", err);
        setRentalPaymentLoading(false);
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

    const token = getAuthToken();
    if (token) {
      fetch("/api/viewings/my-viewings", {
        headers: { Authorization: token }
      })
        .then((res) => res.json())
        .then((data) => {
          setViewings(Array.isArray(data) ? data : []);
          setViewingsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching viewings:", err);
          setViewingsLoading(false);
        });
    } else {
      setViewingsLoading(false);
    }
  }, []);

  const storedUser = getUserData();
  const rentedRoom = rentalPayment?.room_id || rooms.find(room => room.tenant_id === storedUser?._id) || null;
  const customerAvatar =
    profileForm.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName || "Khach Hang")}&background=00c6ff&color=fff`;

  const handleLogout = () => {
    clearAuthSession();
  };

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRequestCancellation = async () => {
    const token = getAuthToken();
    if (!token || !rentalPayment?._id) return;

    if (!window.confirm("Bạn muốn gửi yêu cầu hủy thuê phòng này tới chủ phòng?")) return;

    setRequestingCancellation(true);
    try {
      const response = await fetch(`/api/payments/${rentalPayment._id}/request-cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Không thể gửi yêu cầu hủy thuê");
      }

      setRentalPayment(data.payment || null);
      alert(data.message || "Đã gửi yêu cầu hủy thuê");
    } catch (error) {
      alert(error.message);
    } finally {
      setRequestingCancellation(false);
    }
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

      setCustomerName(data.full_name || "Khách hàng");
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

      setCustomerName(data.full_name || "Khách hàng");
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
          <li className={activeTab === "viewings" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("viewings"); }}>Lịch xem phòng</a>
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
              <h3 className="section-title">Phòng đang quan tâm</h3>
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
                        <p className="price">{formatPriceByUnit(room.price, room.price_unit)}</p>
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

          {activeTab === "viewings" && (
            <>
              <h3 className="section-title">Lịch xem phòng của bạn</h3>
              {viewingsLoading ? (
                <p>Đang tải lịch xem phòng...</p>
              ) : viewings.length > 0 ? (
                <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #f1f5f9", textAlign: "left" }}>
                        <th style={{ padding: "12px", color: "#64748b" }}>Phòng</th>
                        <th style={{ padding: "12px", color: "#64748b" }}>Thời gian xem</th>
                        <th style={{ padding: "12px", color: "#64748b" }}>Ghi chú</th>
                        <th style={{ padding: "12px", color: "#64748b" }}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewings.map((item) => (
                        <tr key={item._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px", fontWeight: "bold" }}>
                            {item.room_id?.name || "Phòng đã xóa"}
                            <br />
                            <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "normal" }}>{item.room_id?.location || ""}</span>
                          </td>
                          <td style={{ padding: "12px" }}>{item.scheduled_at ? new Date(item.scheduled_at).toLocaleString("vi-VN") : "Đang cập nhật"}</td>
                          <td style={{ padding: "12px", maxWidth: "200px" }}>{item.note || "Không có"}</td>
                          <td style={{ padding: "12px" }}>
                            <span style={{
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontSize: "13px",
                              fontWeight: "600",
                              backgroundColor: item.status === "confirmed" ? "#dcfce7" : item.status === "cancelled" ? "#fee2e2" : "#fef3c7",
                              color: item.status === "confirmed" ? "#16a34a" : item.status === "cancelled" ? "#dc2626" : "#d97706"
                            }}>
                              {item.status === "confirmed" ? "Đã duyệt" : item.status === "cancelled" ? "Bị từ chối" : "Chờ xác nhận"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: "#64748b" }}>Bạn chưa có lịch đặt xem phòng nào.</p>
              )}
            </>
          )}

          {activeTab === "rented" && (
            <>
              <h3 className="section-title">Thông tin phòng đang thuê</h3>
              {loading || rentalPaymentLoading ? (
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
                    <li><strong>Giá thuê:</strong> {formatPriceByUnit(rentedRoom.price, rentedRoom.price_unit)}
                    <li><strong>Chu k??? thu??:</strong> {formatRentalDuration(rentalPayment?.rental_duration_value, rentalPayment?.rental_duration_unit)}</li>
                    <li><strong>B???t ?????u:</strong> {formatDateTime(rentalPayment?.rental_start_at || rentalPayment?.rental_confirmed_at)}</li>
                    <li><strong>H???t h???n:</strong> {formatDateTime(rentalPayment?.rental_end_at)}</li></li>
                    <li><strong>Diện tích:</strong> {rentedRoom.specs?.area ? `${rentedRoom.specs.area}m²` : "Đang cập nhật"}</li>
                    <li><strong>Bố trí:</strong> {rentedRoom.specs?.layout || "Đang cập nhật"}</li>
                    <li><strong>Thú cưng:</strong> {rentedRoom.pet_policy || "Đang cập nhật"}</li>
                  </ul>
                  {rentalPayment?.cancellation_status === "pending" ? (
                    <div style={{ marginTop: "16px", padding: "14px", borderRadius: "10px", background: "#fff7ed", color: "#c2410c", fontWeight: "600" }}>
                      Yêu cầu hủy thuê đã được gửi. Hệ thống đang chờ chủ phòng xác nhận.
                    </div>
                  ) : rentalPayment?.status === "success" ? (
                    <button
                      type="button"
                      onClick={handleRequestCancellation}
                      disabled={requestingCancellation}
                      style={{
                        marginTop: "16px",
                        padding: "10px 16px",
                        background: "#dc2626",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: requestingCancellation ? "not-allowed" : "pointer",
                        opacity: requestingCancellation ? 0.7 : 1,
                      }}
                    >
                      {requestingCancellation ? "Đang gửi yêu cầu..." : "Yêu cầu hủy thuê"}
                    </button>
                  ) : null}
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






