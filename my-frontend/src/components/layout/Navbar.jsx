import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import logo from "../../assets/logo.png";
import { clearAuthSession, getUserData, getUserId, getUserRole, getWelcomePath } from "../../utils/authStorage.js";


function Navbar() {
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [roomsForSelector, setRoomsForSelector] = useState([]);
  const [selectorLoading, setSelectorLoading] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);

  const handleOpenRoomSelector = () => {
    setMenuOpen(false);
    setSelectorOpen(true);
    setSelectorLoading(true);
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        setRoomsForSelector(Array.isArray(data) ? data : []);
        setSelectorLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi tải danh sách phòng:", err);
        setSelectorLoading(false);
      });
  };


  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) setSearchTerm(q);
  }, [searchParams]);

  useEffect(() => {
    setUserRole(getUserRole());
    setUserData(getUserData());
  }, []);

  const currentUserId = getUserId();
  const welcomePath = useMemo(() => {
    if (routeUserId) return `/welcome/${routeUserId}`;
    if (currentUserId) return `/welcome/${currentUserId}`;
    return "/welcome";
  }, [routeUserId, currentUserId]);

  const handleLogout = () => {
    clearAuthSession();
    setUserRole(null);
    setUserData(null);
    setMenuOpen(false);
    navigate("/welcome");
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const basePath = welcomePath;
    if (searchTerm.trim()) {
      navigate(`${basePath}?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate(basePath);
    }
  };

  const handleGoTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const campuses = {
    "Ha Noi": ["Xa Thach Hoa", "Xa Tan Xa", "Xa Binh Yen"],
    "Da Nang": ["Ngu Hanh Son"],
    "TP HCM": ["Quan 9"],
    "Can Tho": ["Quan Ninh Kieu"],
    "Quy Nhon": ["Khu do thi FPT"],
  };

  const avatarUrl =
    userData?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.full_name || "User")}&background=0f172a&color=ffffff`;

  const customerMenuItems = [
    { label: "Thong tin ca nhan", path: "/customer?tab=profile&view=single" },
    { label: "Phong da luu", path: "/customer?tab=saved&view=single" },
    { label: "Lich xem phong", path: "/customer?tab=viewings&view=single" },
    { label: "Phong dang thue", path: "/customer?tab=rented&view=single" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to={welcomePath}>
          <img src={logo} alt="Logo" className="logo" />
        </Link>

        <div className="dropdown">
          <span className="nav-link">For Business</span>
          <div className="dropdown-menu">
            <Link to="/enterprise">Enterprise</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/partners">Partners</Link>
            <Link to="/support">Support</Link>
          </div>
        </div>

        <div className="dropdown">
          <span className="nav-link">Location</span>
          <div className="dropdown-menu">
            {!selectedCampus &&
              Object.keys(campuses).map((campus) => (
                <div
                  key={campus}
                  className="dropdown-item"
                  onClick={() => setSelectedCampus(campus)}
                >
                  {campus}
                </div>
              ))}

            {selectedCampus &&
              campuses[selectedCampus].map((area) => (
                <div
                  key={area}
                  className="dropdown-item"
                  onClick={() => {
                    navigate(`${welcomePath}?search=${encodeURIComponent(area)}`);
                    setSearchTerm(area);
                  }}
                >
                  {area}
                </div>
              ))}
          </div>
        </div>

        <Link to="/blog" className="nav-link">
          Blog
        </Link>
        <Link to="/map" className="nav-link">
          Map
        </Link>
        <Link to="/new" className="nav-link">
          New
        </Link>
        <Link to="/community" className="nav-link" style={{ color: "var(--primary-color)", fontWeight: "bold" }}>
          Cộng đồng
        </Link>
      </div>

      <div className="navbar-center">
        <form onSubmit={handleSearch} className="navbar-search-form">
          <input
            type="text"
            placeholder="Search for accommodation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </div>

      <div className="navbar-right">
        {userRole ? (
          <div className="user-menu-wrapper">
            <button
              type="button"
              className="user-menu-trigger"
              onClick={() => setMenuOpen((current) => !current)}
            >
              <img src={avatarUrl} alt="User avatar" className="user-menu-avatar" />
            </button>

            {menuOpen && (
              <div className="user-menu-dropdown">
                <div className="user-menu-header">
                  <strong>{userData?.full_name || "Nguoi dung"}</strong>
                  <span>{userRole}</span>
                </div>

                {userRole === "customer" &&
                  customerMenuItems.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      className="user-menu-item"
                      onClick={() => handleGoTo(item.path)}
                    >
                      {item.label}
                    </button>
                  ))}

                {userRole !== "customer" && (
                  <button
                    type="button"
                    className="user-menu-item"
                    onClick={() => handleGoTo(`/${userRole}`)}
                  >
                    {userRole === "admin" ? "Admin Dashboard" : "Staff Dashboard"}
                  </button>
                )}

                <button
                  type="button"
                  className="user-menu-item"
                  onClick={handleOpenRoomSelector}
                  style={{
                    color: "#ff6a00",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  🎨 Tự thiết kế 3D
                </button>

                <button type="button" className="user-menu-item logout" onClick={handleLogout}>
                  Dang xuat
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link">Sign Up</Link>
          </>
        )}

      </div>

      {/* Hamburger button — mobile only */}
      <button
        className="nav-hamburger"
        onClick={() => setNavOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {navOpen ? '✕' : '☰'}
      </button>

      {/* Mobile nav overlay */}
      {navOpen && (
        <div className="mobile-nav-overlay" onClick={() => setNavOpen(false)}>
          <div className="mobile-nav-menu" onClick={e => e.stopPropagation()}>
            <Link to={welcomePath} className="mobile-nav-link" onClick={() => setNavOpen(false)}>Trang chủ</Link>
            <Link to="/blog" className="mobile-nav-link" onClick={() => setNavOpen(false)}>Blog</Link>
            <Link to="/map" className="mobile-nav-link" onClick={() => setNavOpen(false)}>Map</Link>
            <Link to="/new" className="mobile-nav-link" onClick={() => setNavOpen(false)}>New</Link>
            <div className="mobile-nav-divider" />
            {userRole ? (
              <>
                <button type="button" className="mobile-nav-link" onClick={() => { handleGoTo(`/${userRole}`); setNavOpen(false); }}>
                  Dashboard
                </button>
                <button type="button" className="mobile-nav-link mobile-nav-logout" onClick={() => { handleLogout(); setNavOpen(false); }}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-nav-link" onClick={() => setNavOpen(false)}>Đăng nhập</Link>
                <Link to="/signup" className="mobile-nav-link mobile-nav-cta" onClick={() => setNavOpen(false)}>Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* 3D Room Builder Selector Modal */}
      {selectorOpen && (
        <div className="room-selector-modal-overlay" onClick={() => setSelectorOpen(false)} style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          padding: "20px"
        }}>
          <div className="room-selector-modal" onClick={(e) => e.stopPropagation()} style={{
            background: "rgba(30, 41, 59, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "24px",
            maxWidth: "600px",
            width: "100%",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "80vh",
            color: "white"
          }}>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "bold", background: "linear-gradient(135deg, #ff6a00, #ee0979)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                🎨 Chọn phòng để tự sắp xếp 3D
              </h3>
              <button onClick={() => setSelectorOpen(false)} style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                fontSize: "20px",
                cursor: "pointer",
                padding: "4px"
              }}>
                ✕
              </button>
            </div>

            {/* Option for Free Design */}
            <div
              onClick={() => {
                setSelectorOpen(false);
                navigate("/room-builder/free");
              }}
              style={{
                display: "flex",
                gap: "16px",
                padding: "16px",
                background: "linear-gradient(135deg, rgba(255, 106, 0, 0.15), rgba(238, 9, 121, 0.15))",
                border: "1px dashed rgba(255, 106, 0, 0.5)",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                alignItems: "center",
                marginBottom: "16px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 106, 0, 0.25), rgba(238, 9, 121, 0.25))";
                e.currentTarget.style.borderColor = "rgba(255, 106, 0, 0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 106, 0, 0.15), rgba(238, 9, 121, 0.15))";
                e.currentTarget.style.borderColor = "rgba(255, 106, 0, 0.5)";
              }}
            >
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ff6a00, #ee0979)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                color: "white",
                boxShadow: "0 4px 10px rgba(238, 9, 121, 0.3)"
              }}>
                ➕
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "white", fontWeight: "bold" }}>
                  Tạo phòng trống mới & Tự do thiết kế
                </h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#cbd5e1" }}>
                  Bắt đầu từ lưới 2D trống, tự do thêm/sắp đặt tất cả các thiết bị.
                </p>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", margin: "8px 0 16px 0" }}></div>
            <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 12px 0", fontWeight: "600" }}>Hoặc chọn mẫu phòng có sẵn:</p>

            {selectorLoading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid rgba(255,255,255,0.1)",
                  borderTop: "4px solid #ff6a00",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginBottom: "16px"
                }}></div>
                <p style={{ color: "#94a3b8", margin: 0 }}>Đang tải danh sách phòng trọ...</p>
              </div>
            ) : roomsForSelector.length === 0 ? (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px 0", margin: 0 }}>
                Không tìm thấy phòng trọ nào đã duyệt trong hệ thống.
              </p>
            ) : (
              <div style={{
                overflowY: "auto",
                flex: 1,
                paddingRight: "6px",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                {roomsForSelector.map((room) => {
                  const image = room.images?.[0] || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500";
                  return (
                    <div
                      key={room._id}
                      onClick={() => {
                        setSelectorOpen(false);
                        navigate(`/room-builder/${room._id}`);
                      }}
                      style={{
                        display: "flex",
                        gap: "16px",
                        padding: "12px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        borderRadius: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
                      }}
                    >
                      <img
                        src={image}
                        alt={room.name}
                        style={{
                          width: "80px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          background: "#334155"
                        }}
                      />
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", color: "white" }}>{room.name}</h4>
                        <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
                          📍 {room.location} • {room.price?.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
