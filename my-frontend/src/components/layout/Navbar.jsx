import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import logo from "../../assets/logo.png";
import { clearAuthSession, getUserData, getUserId, getUserRole, getWelcomePath } from "../../utils/authStorage.js";

function Navbar() {
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

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
                  style={{ cursor: "pointer" }}
                >
                  {area}
                </div>
              ))}
          </div>
        </div>

        <Link to="/blog" className="nav-link">
          Blog
        </Link>
      </div>

      <div className="navbar-center">
        <form onSubmit={handleSearch} style={{ width: "100%", margin: 0, display: "flex" }}>
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
    </nav>
  );
}

export default Navbar;
