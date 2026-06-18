import { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAuthToken, getUserRole } from "../utils/authStorage.js";
import StudentHouse3D from "../components/3d/StudentHouse3D.jsx";
import "../css/RoomBuilder.css";

const FURNITURE_LIBRARY = [
  { type: "bed", name: "Giường ngủ", icon: "🛏️", size: [3, 2], desc: "Giường ngủ hiện đại" },
  { type: "desk", name: "Bàn làm việc", icon: "💻", size: [2, 1], desc: "Bàn làm việc đa năng" },
  { type: "chair", name: "Ghế xoay", icon: "🪑", size: [1, 1], desc: "Ghế công thái học" },
  { type: "fridge", name: "Tủ lạnh", icon: "❄️", size: [1, 1], desc: "Tủ lạnh Inverter" },
  { type: "wardrobe", name: "Tủ quần áo", icon: "🚪", size: [2, 1], desc: "Tủ quần áo cỡ lớn" },
  { type: "kitchen", name: "Bàn bếp", icon: "🍳", size: [3, 1], desc: "Bếp nấu chữ L" },
  { type: "bathroom", name: "Phòng tắm", icon: "🚿", size: [3, 3], desc: "Không gian khép kín" },
];

const GRID_COLS = 10;
const GRID_ROWS = 7;

function RoomBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const authToken = getAuthToken();
  const userRole = getUserRole();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedLibraryItem, setSelectedLibraryItem] = useState(null);
  const [placedItems, setPlacedItems] = useState([]);
  const [selectedPlacedIndex, setSelectedPlacedIndex] = useState(null);

  const isEditable = authToken && (userRole === "admin" || userRole === "staff");


  // Load room data
  useEffect(() => {
    setLoading(true);
    fetch(`/api/rooms/${id}`, {
      headers: authToken ? { Authorization: authToken } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tìm thấy phòng");
        return res.json();
      })
      .then((data) => {
        setRoom(data);
        if (data.layout3d && Array.isArray(data.layout3d)) {
          // Convert database layout3d back to placedItems state
          const converted = data.layout3d.map((item) => {
            const libItem = FURNITURE_LIBRARY.find((f) => f.type === item.type);
            
            // Map 3D pos [x, y, z] back to 2D grid [col, row]
            const w = libItem ? libItem.size[0] : 1;
            const h = libItem ? libItem.size[1] : 1;
            
            // x = (col + w/2 - 0.5) - 4.5 => col = x + 4.5 + 0.5 - w/2
            const col = Math.round(item.position[0] + 5.0 - w / 2);
            const row = Math.round(item.position[2] + 3.5 - h / 2);
            
            // Rotation in radians to degrees (0, 90, 180, 270)
            const rotationDeg = Math.round((item.rotation[1] * 180) / Math.PI);

            return {
              type: item.type,
              name: libItem ? libItem.name : item.type,
              icon: libItem ? libItem.icon : "📦",
              col: Math.max(0, Math.min(GRID_COLS - 1, col)),
              row: Math.max(0, Math.min(GRID_ROWS - 1, row)),
              size: libItem ? libItem.size : [1, 1],
              rotation: rotationDeg,
            };
          });
          setPlacedItems(converted);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, authToken]);

  // Map 2D grid items to 3D layout data
  const getLayout3D = () => {
    return placedItems.map((item) => {
      const w = item.size[0];
      const h = item.size[1];
      
      // Map 2D grid [col, row] to 3D [x, y, z] centered on grid cell
      const x = item.col + w / 2 - 0.5 - 4.5;
      const z = item.row + h / 2 - 0.5 - 3.0;
      
      // Convert rotation degrees to radians
      const rotationRad = (item.rotation * Math.PI) / 180;

      return {
        type: item.type,
        position: [x, 0, z],
        rotation: [0, rotationRad, 0],
        scale: [1, 1, 1],
        metadata: {},
      };
    });
  };

  const handleCellClick = (col, row) => {
    if (selectedLibraryItem) {
      // Check boundaries
      const w = selectedLibraryItem.size[0];
      const h = selectedLibraryItem.size[1];
      if (col + w > GRID_COLS || row + h > GRID_ROWS) {
        setError("Vật dụng vượt ra ngoài diện tích phòng!");
        setTimeout(() => setError(""), 3000);
        return;
      }

      // Place item
      const newItem = {
        ...selectedLibraryItem,
        col,
        row,
        rotation: 0,
      };
      setPlacedItems([...placedItems, newItem]);
      setSelectedLibraryItem(null);
      setSuccess("Đã thêm vật dụng vào phòng!");
      setTimeout(() => setSuccess(""), 2000);
    } else {
      // Select existing item
      const idx = placedItems.findIndex((item) => {
        const w = item.rotation % 180 === 0 ? item.size[0] : item.size[1];
        const h = item.rotation % 180 === 0 ? item.size[1] : item.size[0];
        return (
          col >= item.col &&
          col < item.col + w &&
          row >= item.row &&
          row < item.row + h
        );
      });
      if (idx !== -1) {
        setSelectedPlacedIndex(idx);
      } else {
        setSelectedPlacedIndex(null);
      }
    }
  };

  const handleRotate = () => {
    if (selectedPlacedIndex === null) return;
    const updated = [...placedItems];
    const item = updated[selectedPlacedIndex];
    
    // Rotate 90 degrees clockwise
    const newRotation = (item.rotation + 90) % 360;
    
    // Check boundaries with new rotation
    const w = newRotation % 180 === 0 ? item.size[0] : item.size[1];
    const h = newRotation % 180 === 0 ? item.size[1] : item.size[0];
    if (item.col + w > GRID_COLS || item.row + h > GRID_ROWS) {
      setError("Không thể xoay vì vật dụng sẽ vượt ra ngoài!");
      setTimeout(() => setError(""), 3000);
      return;
    }

    updated[selectedPlacedIndex] = { ...item, rotation: newRotation };
    setPlacedItems(updated);
  };

  const handleDelete = () => {
    if (selectedPlacedIndex === null) return;
    const updated = placedItems.filter((_, i) => i !== selectedPlacedIndex);
    setPlacedItems(updated);
    setSelectedPlacedIndex(null);
  };

  const handleClear = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ thiết kế hiện tại?")) {
      setPlacedItems([]);
      setSelectedPlacedIndex(null);
    }
  };

  const handleSave = () => {
    setSaving(true);
    const layout = getLayout3D();
    
    fetch(`/api/rooms/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify({
        layout3d: layout,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Không thể lưu thiết kế phòng");
        return res.json();
      })
      .then(() => {
        setSuccess("Lưu thiết kế phòng thành công!");
        setSaving(false);
        setTimeout(() => setSuccess(""), 4000);
      })
      .catch((err) => {
        setError(err.message);
        setSaving(false);
        setTimeout(() => setError(""), 4000);
      });
  };

  if (loading) {
    return (
      <div className="builder-loading-container">
        <div className="builder-spinner"></div>
        <p>Đang tải trình thiết kế phòng...</p>
      </div>
    );
  }

  const currentLayout = getLayout3D();

  return (
    <div className="room-builder-page">
      {/* Top Header */}
      <header className="builder-header">
        <div className="header-left">
          <Link to={isEditable ? (userRole === "admin" ? "/admin" : "/staff") : `/product/${id}`} className="back-btn">
            ← Quay lại
          </Link>
          <div className="header-title">
            <h1>Thiết kế phòng 3D</h1>
            <p className="room-name">{room?.name || room?.title || "Không có tên phòng"}</p>
          </div>
        </div>
        <div className="header-right">
          {error && <span className="error-toast">{error}</span>}
          {success && <span className="success-toast">{success}</span>}
          
          <button type="button" className="clear-btn" onClick={handleClear}>
            Xóa hết
          </button>
          {isEditable ? (
            <button type="button" className="save-btn" disabled={saving} onClick={handleSave}>
              {saving ? "Đang lưu..." : "Lưu thiết kế"}
            </button>
          ) : (
            <span className="sandbox-badge" style={{
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "600",
              boxShadow: "0 2px 8px rgba(217, 119, 6, 0.3)",
              display: "inline-flex",
              alignItems: "center"
            }}>
              Chế độ tự sắp xếp (Dùng thử)
            </span>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="builder-workspace">
        {/* Left Library */}
        <aside className="builder-sidebar">
          <h3>Thư viện nội thất</h3>
          <p className="sidebar-instruction">Chọn một vật dụng bên dưới rồi nhấp vào lưới để đặt vào phòng.</p>
          <div className="library-grid">
            {FURNITURE_LIBRARY.map((item) => {
              const isSelected = selectedLibraryItem?.type === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  className={`library-item-card ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedLibraryItem(item);
                    setSelectedPlacedIndex(null);
                  }}
                >
                  <span className="library-item-icon">{item.icon}</span>
                  <span className="library-item-name">{item.name}</span>
                  <span className="library-item-size">
                    {item.size[0]}m x {item.size[1]}m
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* Item Control Panel */}
          {selectedPlacedIndex !== null && (
            <div className="item-controls-panel">
              <h4>Vật dụng đang chọn</h4>
              <div className="selected-item-info">
                <span className="info-icon">
                  {placedItems[selectedPlacedIndex].icon}
                </span>
                <div>
                  <p className="info-name">{placedItems[selectedPlacedIndex].name}</p>
                  <p className="info-rotation">
                    Góc xoay: {placedItems[selectedPlacedIndex].rotation}°
                  </p>
                </div>
              </div>
              <div className="action-buttons">
                <button type="button" className="rotate-btn" onClick={handleRotate}>
                  🔄 Xoay 90°
                </button>
                <button type="button" className="delete-btn" onClick={handleDelete}>
                  🗑️ Xóa bỏ
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Center Grid Editor */}
        <main className="editor-area">
          <div className="editor-card">
            <h3>Sơ đồ phòng 2D (Lưới $10 \times 7$ mét)</h3>
            {!isEditable && (
              <div className="sandbox-notice" style={{
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "8px",
                padding: "8px 12px",
                marginBottom: "12px",
                fontSize: "13px",
                color: "#f59e0b",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>💡</span>
                <span>Bạn đang ở chế độ thiết kế thử. Hãy thỏa thích di chuyển, xoay và đặt thêm đồ đạc để xem có phù hợp với nhu cầu của bạn không! Thiết kế này không ghi đè lên phòng gốc.</span>
              </div>
            )}
            <p className="editor-instruction">
              {selectedLibraryItem
                ? `👉 Nhấp vào ô bất kỳ để đặt "${selectedLibraryItem.name}"`
                : "👉 Nhấp vào vật dụng trên lưới để chỉnh sửa, xoay hoặc xóa."}
            </p>
            
            <div className="grid-container">
              {/* Grid Cells */}
              <div className="grid-base">
                {Array.from({ length: GRID_ROWS }).map((_, r) => (
                  <div key={r} className="grid-row">
                    {Array.from({ length: GRID_COLS }).map((_, c) => (
                      <div
                        key={c}
                        className="grid-cell"
                        onClick={() => handleCellClick(c, r)}
                      ></div>
                    ))}
                  </div>
                ))}

                {/* Placed Items Overlay */}
                {placedItems.map((item, idx) => {
                  const isSelected = selectedPlacedIndex === idx;
                  const w = item.rotation % 180 === 0 ? item.size[0] : item.size[1];
                  const h = item.rotation % 180 === 0 ? item.size[1] : item.size[0];
                  
                  return (
                    <div
                      key={idx}
                      className={`placed-grid-item ${isSelected ? "selected" : ""}`}
                      style={{
                        left: `${(item.col / GRID_COLS) * 100}%`,
                        top: `${(item.row / GRID_ROWS) * 100}%`,
                        width: `${(w / GRID_COLS) * 100}%`,
                        height: `${(h / GRID_ROWS) * 100}%`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlacedIndex(idx);
                        setSelectedLibraryItem(null);
                      }}
                    >
                      <span className="placed-icon">{item.icon}</span>
                      <span className="placed-name">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        {/* Right 3D Preview */}
        <section className="preview-area">
          <div className="preview-card">
            <h3>Xem trước 3D thời gian thực</h3>
            <div className="canvas-wrapper">
              <Suspense
                fallback={
                  <div className="preview-loading">
                    <div className="builder-spinner"></div>
                    <p>Đang dựng hình 3D...</p>
                  </div>
                }
              >
                <StudentHouse3D layout3d={currentLayout} />
              </Suspense>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default RoomBuilder;
