import { useState } from 'react';
import { Link } from 'react-router-dom';
import './CustomerDashboard.css';

function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>MyHousing</h2>
          <span className="role-badge customer">Customer</span>
        </div>
        <ul className="nav-links">
          <li className={activeTab === 'overview' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}>Trang Chủ</a>
          </li>
          <li className={activeTab === 'saved' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('saved'); }}>Phòng Đã Lưu</a>
          </li>
          <li className={activeTab === 'rented' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('rented'); }}>Phòng Đang Thuê</a>
          </li>
        </ul>
        <div className="sidebar-footer">
          <Link to="/welcome" className="logout-btn" onClick={() => localStorage.removeItem('userRole')}>Đăng xuất</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <h1>Xin chào, Nguyễn Văn A</h1>
          <div className="user-profile">
            <img src="https://ui-avatars.com/api/?name=Nguyen+Van+A&background=00c6ff&color=fff" alt="Avatar" />
          </div>
        </header>

        <section className="dashboard-content">
          {activeTab === 'overview' && (
            <>
              <div className="welcome-banner">
                <h2>Tìm kiếm không gian sống lý tưởng của bạn</h2>
                <p>Khám phá các phòng trọ tiện nghi, giá cả hợp lý ngay hôm nay.</p>
                <Link to="/welcome" className="explore-btn">Xem phòng trọ</Link>
              </div>
            </>
          )}

          {activeTab === 'saved' && (
            <>
              <h3 className="section-title">Phòng đang quan tâm (Đã lưu)</h3>
              <div className="saved-rooms-grid">
                <div className="saved-card">
                  <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop" alt="Room" />
                  <div className="saved-info">
                    <h4>Nhà Sinh viên Tân Xã</h4>
                    <p className="price">3.500.000đ / tháng</p>
                    <Link to="/product/1" className="view-detail-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Xem chi tiết</Link>
                  </div>
                </div>
                <div className="saved-card">
                  <img src="https://images.unsplash.com/photo-1502672023488-70e25813eb80?q=80&w=1964&auto=format&fit=crop" alt="Room" />
                  <div className="saved-info">
                    <h4>Phòng trọ cao cấp Bình Yên</h4>
                    <p className="price">6.000.000đ / tháng</p>
                    <Link to="/product/2" className="view-detail-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Xem chi tiết</Link>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'rented' && (
            <>
              <h3 className="section-title">Hợp đồng phòng đang thuê</h3>
              <div className="rented-rooms-container" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>Phòng 201 - Nhà Sinh viên Tân Xã</h4>
                    <p style={{ margin: 0, color: '#666' }}>Trạng thái: <span style={{ color: 'green', fontWeight: 'bold' }}>Đang hiệu lực</span></p>
                  </div>
                  <div>
                    <Link to="/product/1" className="view-detail-btn" style={{ padding: '8px 15px', textDecoration: 'none' }}>Xem trang chi tiết</Link>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, lineHeight: 1.8 }}>
                  <li><strong>Ngày bắt đầu:</strong> 01/01/2026</li>
                  <li><strong>Ngày kết thúc:</strong> 31/12/2026</li>
                  <li><strong>Giá thuê:</strong> 3.500.000đ/tháng</li>
                  <li><strong>Tiền cọc:</strong> 3.500.000đ</li>
                </ul>
              </div>
            </>
          )}

        </section>
      </main>
    </div>
  );
}

export default CustomerDashboard;
