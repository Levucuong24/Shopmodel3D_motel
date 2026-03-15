import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock global state for rooms to allow status modification in UI
  const [rooms, setRooms] = useState([
    { id: 1, name: "Phòng 201 - Nhà Tân Xã", price: "3.500.000đ", status: "Còn phòng" },
    { id: 2, name: "Phòng 305 - Bình Yên", price: "6.000.000đ", status: "Đã được cọc" },
    { id: 3, name: "Phòng 102 - Nhà Tân Xã", price: "3.000.000đ", status: "Hết phòng" },
    { id: 4, name: "Phòng 401 - Quận 9", price: "4.500.000đ", status: "Còn phòng" },
  ]);

  // Mock revenue data for calculating % differences and chart
  const [revenues] = useState([
    { id: 1, month: "Tháng 1", amount: 110000000, status: "Đã chốt" },
    { id: 2, month: "Tháng 2", amount: 98000000, status: "Đã chốt" },
    { id: 3, month: "Tháng 3", amount: 125000000, status: "Dự kiến" },
    { id: 4, month: "Tháng 4", amount: 140000000, status: "Mục tiêu" }
  ]);

  const [breakevenData, setBreakevenData] = useState({
    fixedCost: 50000000,
    variableCostPerRoom: 500000,
    rentPricePerRoom: 4000000
  });

  const contributionMargin = breakevenData.rentPricePerRoom - breakevenData.variableCostPerRoom;
  const breakevenRooms = contributionMargin > 0 ? Math.ceil(breakevenData.fixedCost / contributionMargin) : 0;

  const generateBreakevenChartData = () => {
    const data = [];
    // Render up to slightly past the break-even point for a good view
    const maxRooms = Math.max(30, breakevenRooms + 10);
    for (let i = 0; i <= maxRooms; i += 5) {
      data.push({
        rooms: i,
        "Tổng chi phí": breakevenData.fixedCost + (i * breakevenData.variableCostPerRoom),
        "Doanh thu": i * breakevenData.rentPricePerRoom
      });
    }
    return data;
  };

  const handleStatusChange = (id, newStatus) => {
    setRooms(rooms.map(room => room.id === id ? { ...room, status: newStatus } : room));
  };

  const statusColors = {
    "Còn phòng": "#16a34a",
    "Đã được cọc": "#d97706",
    "Hết phòng": "#dc2626"
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar admin-theme">
        <div className="sidebar-header">
          <h2>MyHousing</h2>
          <span className="role-badge admin">Admin</span>
        </div>
        <ul className="nav-links">
          <li className={activeTab === 'overview' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}>Tổng Quan</a>
          </li>
          <li className={activeTab === 'properties' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('properties'); }}>Quản Lý Phòng</a>
          </li>
          <li className={activeTab === 'customers' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('customers'); }}>Khách Hàng</a>
          </li>
          <li className={activeTab === 'reports' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('reports'); }}>Báo Cáo Doanh Thu</a>
          </li>
          <li className={activeTab === 'breakeven' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('breakeven'); }}>Điểm Hòa Vốn</a>
          </li>
        </ul>
        <div className="sidebar-footer">
          <Link to="/welcome" className="logout-btn" onClick={() => localStorage.removeItem('userRole')}>Đăng xuất</Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="main-content bg-light">
        <header className="topbar">
          <h1>Bảng Điều Khiển Quản Trị</h1>
          <div className="user-profile">
            <img src="https://ui-avatars.com/api/?name=Admin&background=dc3545&color=fff" alt="Admin Avatar" />
          </div>
        </header>

        <section className="dashboard-content">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon income-icon">💰</div>
                  <div className="stat-details">
                    <h3>Doanh thu tháng</h3>
                    <p className="stat-number">125.000.000đ</p>
                    <span className="trend positive">↑ 12% so với tháng trước</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon rooms-icon">🏢</div>
                  <div className="stat-details">
                    <h3>Tổng số phòng</h3>
                    <p className="stat-number">45 Phòng</p>
                    <span className="trend neutral">Đã thuê 38 / Trống 7</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon users-icon">👥</div>
                  <div className="stat-details">
                    <h3>Thành viên mới</h3>
                    <p className="stat-number">+12</p>
                    <span className="trend positive">Tuần này</span>
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Hoạt động gần đây</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Khách hàng</th>
                      <th>Phòng</th>
                      <th>Ngày giao dịch</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Nguyễn Văn A</td>
                      <td>Phòng 201 - Nhà Tân Xã</td>
                      <td>10/03/2026</td>
                      <td><span className="status-badge success">Đã thanh toán</span></td>
                    </tr>
                    <tr>
                      <td>Trần Thị B</td>
                      <td>Phòng 305 - Bình Yên</td>
                      <td>09/03/2026</td>
                      <td><span className="status-badge pending">Chờ duyệt cọc</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* TAB 2: PROPERTIES (ROOM MANAGEMENT) */}
          {activeTab === 'properties' && (
            <div className="recent-activity">
              <h3>Quản lý trạng thái phòng</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tên phòng</th>
                    <th>Giá Thuê</th>
                    <th>Trạng Thái Hiện Tại</th>
                    <th>Hành động (Chuyển trạng thái)</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(room => (
                    <tr key={room.id}>
                      <td style={{ fontWeight: 'bold' }}>{room.name}</td>
                      <td>{room.price}</td>
                      <td>
                         <span style={{ 
                           padding: '5px 10px', 
                           borderRadius: '12px', 
                           color: 'white', 
                           fontSize: '12px',
                           fontWeight: 'bold',
                           background: statusColors[room.status] 
                         }}>
                           {room.status}
                         </span>
                      </td>
                      <td>
                        <select 
                          value={room.status} 
                          onChange={(e) => handleStatusChange(room.id, e.target.value)}
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                          <option value="Còn phòng">Còn phòng</option>
                          <option value="Đã được cọc">Đã được cọc</option>
                          <option value="Hết phòng">Hết phòng</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="recent-activity">
              <h3>Danh sách Khách Hàng</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Họ và Tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Phòng đang thuê</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Nguyễn Văn A</td>
                    <td>nguyenvana@gmail.com</td>
                    <td>0912345678</td>
                    <td>Phòng 201 - Nhà Tân Xã</td>
                  </tr>
                  <tr>
                    <td>Trần Thị B</td>
                    <td>tranthib@gmail.com</td>
                    <td>0987654321</td>
                    <td>Phòng 305 - Bình Yên</td>
                  </tr>
                  <tr>
                    <td>Lê Thị C</td>
                    <td>lethic@yahoo.com</td>
                    <td>0909123456</td>
                    <td>(Chưa thuê)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: REPORTS */}
          {activeTab === 'reports' && (
            <div className="recent-activity">
              <h3>Báo cáo doanh thu (Quý 1 - 2026)</h3>
              <p style={{color: '#64748b', marginBottom: '25px'}}>Thống kê và sơ đồ tăng trưởng doanh thu theo từng tháng.</p>
              
              <div className="revenue-grid">
                {revenues.slice(0, 3).map((item, index) => {
                  // Calculate percentage difference from previous month
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
                        <span className={`revenue-badge ${item.status === 'Dự kiến' ? 'pending' : 'completed'}`}>
                          {item.status}
                        </span>
                      </div>
                      
                      <div className="revenue-body">
                        <p className="revenue-amount">
                          {item.amount.toLocaleString('vi-VN')}đ
                        </p>
                        
                        {percentChange !== null ? (
                          <div className={`revenue-comparison ${isPositive ? 'positive' : 'negative'}`}>
                            <span className="trend-icon">{isPositive ? '↑' : '↓'}</span>
                            <span className="trend-text">
                              {Math.abs(percentChange)}% so với tháng trước
                            </span>
                          </div>
                        ) : (
                          <div className="revenue-comparison neutral">
                            <span className="trend-text">Dữ liệu gốc (Không so sánh)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* REVENUE CHART SECTION */}
              <div className="chart-container" style={{ marginTop: '40px', padding: '30px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <h4 style={{ marginBottom: '20px', fontSize: '18px', color: '#1e293b' }}>Sơ đồ đường Doanh Thu (VNĐ)</h4>
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <AreaChart data={revenues} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff6a00" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ff6a00" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                      <YAxis 
                        tickFormatter={(value) => `${value / 1000000}M`}
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b' }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value.toLocaleString('vi-VN')} VNĐ`, 'Doanh thu']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#ff6a00" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorAmount)" 
                        activeDot={{ r: 8, strokeWidth: 2, fill: '#fff' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: BREAKEVEN */}
          {activeTab === 'breakeven' && (
            <div className="recent-activity">
              <h3>Phân Tích Điểm Hòa Vốn</h3>
              <p style={{color: '#64748b', marginBottom: '25px'}}>Dự báo số điểm hòa vốn bằng cách tính toán tương quan giữa chi phí cố định, chi phí vận hành và giá thuê.</p>
              
              <div className="stats-grid" style={{ marginBottom: '30px' }}>
                <div className="stat-card" style={{ flexWrap: 'wrap' }}>
                  <div className="stat-details" style={{ width: '100%' }}>
                    <h3>Chi phí cố định (VNĐ/tháng)</h3>
                    <input 
                      type="number" 
                      value={breakevenData.fixedCost}
                      onChange={(e) => setBreakevenData({...breakevenData, fixedCost: Number(e.target.value)})}
                      className="admin-input"
                    />
                  </div>
                </div>
                <div className="stat-card" style={{ flexWrap: 'wrap' }}>
                  <div className="stat-details" style={{ width: '100%' }}>
                    <h3>Chi phí phát sinh (VNĐ/phòng)</h3>
                    <input 
                      type="number" 
                      value={breakevenData.variableCostPerRoom}
                      onChange={(e) => setBreakevenData({...breakevenData, variableCostPerRoom: Number(e.target.value)})}
                      className="admin-input"
                    />
                  </div>
                </div>
                <div className="stat-card" style={{ flexWrap: 'wrap' }}>
                  <div className="stat-details" style={{ width: '100%' }}>
                    <h3>Giá cho thuê TB (VNĐ/phòng)</h3>
                    <input 
                      type="number" 
                      value={breakevenData.rentPricePerRoom}
                      onChange={(e) => setBreakevenData({...breakevenData, rentPricePerRoom: Number(e.target.value)})}
                      className="admin-input"
                    />
                  </div>
                </div>
              </div>

              <div style={{ padding: '20px', background: '#ecfdf5', borderRadius: '8px', borderLeft: '4px solid #10b981', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '40px' }}>🎯</div>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#065f46', fontSize: '18px' }}>Mục Tiêu Hòa Vốn Lợi Nhuận</h4>
                  <p style={{ margin: 0, color: '#047857', fontSize: '15px' }}>
                    Yêu cầu cho thuê tối thiểu <strong>{breakevenRooms > 0 ? breakevenRooms : 'NaN'} phòng</strong> mỗi tháng để đạt điểm hòa vốn. 
                    <br />
                    (Mức doanh thu điểm hòa vốn khoảng {(breakevenRooms * breakevenData.rentPricePerRoom).toLocaleString('vi-VN')} VNĐ)
                  </p>
                </div>
              </div>

              <div className="chart-container" style={{ padding: '30px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <h4 style={{ marginBottom: '20px', fontSize: '18px', color: '#1e293b' }}>Mô hình Tương quan Chi phí & Doanh thu</h4>
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <LineChart data={generateBreakevenChartData()} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="rooms" name="Số phòng" tick={{ fill: '#64748b' }} dy={10} />
                      <YAxis 
                        tickFormatter={(value) => `${value / 1000000}M`}
                        tick={{ fill: '#64748b' }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value.toLocaleString('vi-VN')} VNĐ`]}
                        labelFormatter={(label) => `Số phòng thuê: ${label}`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36}/>
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
