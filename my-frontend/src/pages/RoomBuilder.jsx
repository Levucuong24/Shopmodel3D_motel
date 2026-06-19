import { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAuthToken, getUserRole } from "../utils/authStorage.js";
import StudentHouse3D from "../components/3d/StudentHouse3D.jsx";
import "../css/RoomBuilder.css";

const FURNITURE_LIBRARY = [
  // --- Phòng ngủ ---
  { type: "bed", name: "Giường ngủ", icon: "🛏️", size: [3, 2], desc: "Giường ngủ hiện đại", category: "bedroom" },
  { type: "wardrobe", name: "Tủ quần áo", icon: "🚪", size: [2, 1], desc: "Tủ quần áo cỡ lớn", category: "bedroom" },
  { type: "nightstand", name: "Tủ đầu giường", icon: "🗄️", size: [1, 1], desc: "Tủ đầu giường nhỏ gọn", category: "bedroom" },
  { type: "mirror", name: "Gương đứng", icon: "🪞", size: [1, 1], desc: "Gương soi toàn thân", category: "bedroom" },
  // --- Làm việc ---
  { type: "desk", name: "Bàn làm việc", icon: "💻", size: [2, 1], desc: "Bàn làm việc đa năng", category: "work" },
  { type: "chair", name: "Ghế xoay", icon: "🪑", size: [1, 1], desc: "Ghế công thái học", category: "work" },
  { type: "bookshelf", name: "Kệ sách", icon: "📚", size: [1, 2], desc: "Kệ sách cao 4 tầng", category: "work" },
  { type: "lamp", name: "Đèn bàn", icon: "💡", size: [1, 1], desc: "Đèn bàn LED chống cận", category: "work" },
  // --- Phòng khách ---
  { type: "sofa", name: "Ghế sofa", icon: "🛋️", size: [3, 1], desc: "Sofa vải bọc êm ái", category: "living" },
  { type: "tv", name: "Kệ TV", icon: "📺", size: [2, 1], desc: "Kệ TV treo tường", category: "living" },
  { type: "coffeetable", name: "Bàn trà", icon: "☕", size: [2, 1], desc: "Bàn trà gỗ Nhật Bản", category: "living" },
  { type: "plant", name: "Chậu cây", icon: "🌿", size: [1, 1], desc: "Cây xanh trang trí", category: "living" },
  // --- Nhà bếp & Phòng tắm ---
  { type: "kitchen", name: "Bàn bếp", icon: "🍳", size: [3, 1], desc: "Bếp nấu chữ L", category: "kitchen" },
  { type: "fridge", name: "Tủ lạnh", icon: "❄️", size: [1, 1], desc: "Tủ lạnh Inverter", category: "kitchen" },
  { type: "washer", name: "Máy giặt", icon: "🫧", size: [1, 1], desc: "Máy giặt cửa trước", category: "kitchen" },
  { type: "bathroom", name: "Phòng tắm", icon: "🚿", size: [3, 3], desc: "Không gian khép kín", category: "kitchen" },
  // --- Tiện ích ---
  { type: "aircon", name: "Máy lạnh", icon: "🌬️", size: [2, 1], desc: "Máy lạnh treo tường", category: "utility" },
  { type: "fan", name: "Quạt trần", icon: "🌀", size: [1, 1], desc: "Quạt trần trang trí", category: "utility" },
  { type: "shoerack", name: "Kệ giày", icon: "👟", size: [2, 1], desc: "Kệ giày 3 tầng", category: "utility" },
  { type: "curtain", name: "Rèm cửa", icon: "🪟", size: [2, 1], desc: "Rèm cửa sổ thanh lịch", category: "utility" },
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
  const [activeCategory, setActiveCategory] = useState("all");

  const isFreeMode = id === "free";
  const isEditable = !isFreeMode && authToken && (userRole === "admin" || userRole === "staff");

  // Load room data
  useEffect(() => {
    if (isFreeMode) {
      setRoom({
        name: "Phòng trống thiết kế tự do",
        title: "Thiết kế phòng từ con số 0"
      });
      setPlacedItems([]);
      setLoading(false);
      return;
    }

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
          // Keep 3D layout data directly
          const converted = data.layout3d.map((item) => {
            const libItem = FURNITURE_LIBRARY.find((f) => f.type === item.type);
            return {
              ...item,
              name: libItem ? libItem.name : item.type,
              icon: libItem ? libItem.icon : "📦",
              size: libItem ? libItem.size : [1, 1],
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
  }, [id, authToken, isFreeMode]);

  const getLayout3D = () => {
    return placedItems.map((item) => ({
      type: item.type,
      position: item.position,
      rotation: item.rotation,
      scale: item.scale || [1, 1, 1],
      metadata: item.metadata || {},
    }));
  };

  const handlePlaceFurniture = (itemTemplate, position) => {
    const newItem = {
      type: itemTemplate.type,
      name: itemTemplate.name,
      icon: itemTemplate.icon,
      size: itemTemplate.size,
      position: position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };
    setPlacedItems([...placedItems, newItem]);
    setSelectedLibraryItem(null); // Clear selection after placing
    setSuccess("Đã thêm vật dụng vào phòng!");
    setTimeout(() => setSuccess(""), 2000);
  };

  const handleUpdateFurniture = (idx, newPosition, newRotation) => {
    const updated = [...placedItems];
    updated[idx] = { ...updated[idx], position: newPosition, rotation: newRotation };
    setPlacedItems(updated);
  };

  const handleSelectFurniture = (idx) => {
    setSelectedPlacedIndex(idx);
    setSelectedLibraryItem(null);
  };
  const handleRotate = () => {
    if (selectedPlacedIndex === null) return;
    const updated = [...placedItems];
    const item = updated[selectedPlacedIndex];
    
    // Rotate 90 degrees around Y axis (radians)
    const newRotation = [...(item.rotation || [0, 0, 0])];
    newRotation[1] = newRotation[1] + (Math.PI / 2);

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
          <Link to={isFreeMode ? "/welcome" : (isEditable ? (userRole === "admin" ? "/admin" : "/staff") : `/product/${id}`)} className="back-btn">
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
          
          {/* Category Filter Tabs */}
          <div className="category-tabs">
            {[
              { key: "all", label: "Tất cả" },
              { key: "bedroom", label: "🛏️ Ngủ" },
              { key: "work", label: "💻 Làm việc" },
              { key: "living", label: "🛋️ Khách" },
              { key: "kitchen", label: "🍳 Bếp" },
              { key: "utility", label: "⚡ Tiện ích" },
            ].map((cat) => (
              <button
                key={cat.key}
                type="button"
                className={`category-tab ${activeCategory === cat.key ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="library-grid">
            {FURNITURE_LIBRARY.filter((item) => activeCategory === "all" || item.category === activeCategory).map((item) => {
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

        {/* Main 3D Editor Area */}
        <main className="editor-area" style={{ gridColumn: 'span 2' }}>
          <div className="editor-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Không gian 3D tương tác (Thử Nội Thất)</h3>
            </div>
            
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
                <span>Bạn đang ở chế độ thiết kế 3D tương tác. Hãy chọn đồ từ danh sách bên trái, sau đó <strong>nhấp vào mặt sàn 3D</strong> để đặt. Bạn có thể <strong>kéo thả trực tiếp</strong> các vật dụng 3D!</span>
              </div>
            )}
            
            <p className="editor-instruction">
              {selectedLibraryItem
                ? `👉 Nhấp vào mặt sàn 3D để đặt "${selectedLibraryItem.name}"`
                : "👉 Nhấp vào vật dụng trong không gian 3D để di chuyển, xoay hoặc xóa."}
            </p>
            
            <div className="canvas-wrapper" style={{ flex: 1, minHeight: '600px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
              <Suspense
                fallback={
                  <div className="preview-loading">
                    <div className="builder-spinner"></div>
                    <p>Đang dựng môi trường 3D...</p>
                  </div>
                }
              >
                <StudentHouse3D 
                  layout3d={getLayout3D()} 
                  isEditMode={true}
                  selectedPlacedIndex={selectedPlacedIndex}
                  onSelectFurniture={handleSelectFurniture}
                  onUpdateFurniture={handleUpdateFurniture}
                  activeTool={selectedLibraryItem}
                  onPlaceFurniture={handlePlaceFurniture}
                />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default RoomBuilder;
