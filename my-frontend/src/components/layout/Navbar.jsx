import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../../assets/logo.png";

function Navbar() {
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const q = searchParams.get("search");
    if(q !== null) setSearchTerm(q);
  }, [searchParams]);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role) {
      setUserRole(role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUserRole(null);
    navigate('/welcome');
    window.location.reload(); // Quick refresh to clear states
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/welcome?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate(`/welcome`);
    }
  };


  const campuses = {
    "Hà Nội": ["Xã Thạch Hòa", "Xã Tân Xã", "Xã Bình Yên"],
    "Đà Nẵng": ["Ngũ Hành Sơn"],
    "TP HCM": ["Quận 9"],
    "Cần Thơ": ["Quận Ninh Kiều"],
    "Quy Nhơn": ["Khu đô thị FPT"]
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* Logo */}
        <Link to="/welcome">
          <img src={logo} alt="Logo" className="logo" />
        </Link>

        {/* For Business */}
        <div className="dropdown">
          <span className="nav-link">For Business</span>
          <div className="dropdown-menu">
            <Link to="/enterprise">Enterprise</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/partners">Partners</Link>
            <Link to="/support">Support</Link>
          </div>
        </div>

        {/* Location dropdown */}
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
                    navigate(`/welcome?search=${encodeURIComponent(area)}`);
                    setSearchTerm(area);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {area}
                </div>
              ))}
          </div>
        </div>

        {/* Blog */}
        <Link to="/blog" className="nav-link">
          Blog
        </Link>
      </div>

      {/* Search */}
      <div className="navbar-center">
        <form onSubmit={handleSearch} style={{ width: '100%', margin: 0, display: 'flex' }}>
          <input 
            type="text" 
            placeholder="Search for accommodation..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </div>

      {/* Login / Signup / Dashboard */}
      <div className="navbar-right">
        {userRole ? (
          <>
            <Link to={`/${userRole}`} className="nav-link" style={{ fontWeight: 'bold', color: '#0ea5e9' }}>
              {userRole === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
            </Link>
            <span className="nav-link" onClick={handleLogout} style={{ cursor: 'pointer' }}>Đăng xuất</span>
          </>
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
