import fs from 'fs';

const adminPath = 'c:/Users/Windows/Desktop/EWE_NHOM4/my-frontend/src/pages/AdminDashboard.jsx';
let code = fs.readFileSync(adminPath, 'utf8');

// 1. Add states for gallery
code = code.replace(
  /const \[viewingsLoading, setViewingsLoading\] = useState\(true\);/,
  \`const [viewingsLoading, setViewingsLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");\`
);

// 2. Add fetch logic inside useEffect
code = code.replace(
  /fetch\("\/api\/payments", \{ headers \}\)/,
  \`fetch("/api/payments", { headers })
        .then((res) => res.json())
        .then((data) => setPayments(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error fetching payments:", err));
        
      fetch("/api/gallery", { headers })
        .then((res) => res.json())
        .then((data) => setGalleryImages(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error fetching gallery:", err));

      // dummy replacement to fix duplicated payments\`
);

// wait the previous step might replace incorrectly, let me be very precise.
code = code.replace(
  /fetch\("\/api\/payments", \{ headers \}\)[\s\S]*?\.catch\(\(err\) => console\.error\("Error fetching payments:", err\)\);/,
  \`fetch("/api/payments", { headers })
        .then((res) => res.json())
        .then((data) => setPayments(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error fetching payments:", err));

      fetch("/api/gallery", { headers })
        .then((res) => res.json())
        .then((data) => setGalleryImages(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error fetching gallery:", err));\`
);


// 3. Add handle functions for gallery
const galleryHandlers = \`
  const handleGalleryUpload = async (e) => {
    const file = e.target.files?.[0];
    const token = localStorage.getItem("authToken");
    if (!file || !token) return;

    setUploadingGallery(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/gallery/upload-image", {
        method: "POST",
        headers: { Authorization: token },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Lỗi tải ảnh");

      // Now add to gallery
      const addRes = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ imageUrl: data.imageUrl })
      });
      const addedData = await addRes.json();
      if (!addRes.ok) throw new Error(addedData.message || "Lỗi lưu ảnh gallery");

      setGalleryImages(prev => [addedData, ...prev]);
      alert("Thêm ảnh thành công");
    } catch (error) {
      alert(error.message);
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  };

  const handleAddGalleryUrl = async (e) => {
    e.preventDefault();
    if (!newGalleryUrl.trim()) return;
    const token = localStorage.getItem("authToken");

    try {
      const addRes = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ imageUrl: newGalleryUrl.trim() })
      });
      const addedData = await addRes.json();
      if (!addRes.ok) throw new Error(addedData.message || "Lỗi lưu ảnh gallery");

      setGalleryImages(prev => [addedData, ...prev]);
      setNewGalleryUrl("");
      alert("Thêm ảnh thành công");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteGalleryUrl = async (id) => {
    if (!window.confirm("Xóa ảnh này khỏi Gallery?")) return;
    const token = localStorage.getItem("authToken");

    try {
      const res = await fetch(\`/api/gallery/\${id}\`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (!res.ok) throw new Error("Lỗi xóa ảnh");

      setGalleryImages(prev => prev.filter(img => img._id !== id));
    } catch (error) {
      alert(error.message);
    }
  };
\`;

code = code.replace(
  /const handleCancelEdit = \(\) => \{/,
  \`\${galleryHandlers}\n\n  const handleCancelEdit = () => {\`
);


// 4. Add the menu item
code = code.replace(
  /<li className=\{activeTab === "breakeven" \? "active" : ""\}>/,
  \`<li className={activeTab === "gallery" ? "active" : ""}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("gallery"); }}>Quản lý Gallery</a>
          </li>
          <li className={activeTab === "breakeven" ? "active" : ""}>\`
);


// 5. Add the activeTab === "gallery" content logic
const galleryTabHtml = \`
          {activeTab === "gallery" && (
            <div className="recent-activity">
              <h3>Quản lý Gallery (3D Renderings)</h3>
              
              <div style={{ marginBottom: "20px", padding: "15px", background: "#f8fafc", borderRadius: "8px" }}>
                <div style={{ marginBottom: "15px" }}>
                  <label>
                    <span style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Tải ảnh từ máy tính:</span>
                    <input type="file" accept="image/*" onChange={handleGalleryUpload} disabled={uploadingGallery} />
                  </label>
                  {uploadingGallery && <span style={{ marginLeft: "10px", color: "#64748b" }}>Đang tải lên...</span>}
                </div>
                
                <h4 style={{ margin: "10px 0" }}>Hoặc thêm bằng URL</h4>
                <form onSubmit={handleAddGalleryUrl} style={{ display: "flex", gap: "10px" }}>
                  <input type="text" placeholder="https://..." value={newGalleryUrl} onChange={e => setNewGalleryUrl(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
                  <button type="submit" style={{ padding: "8px 15px", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Thêm</button>
                </form>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px" }}>
                {galleryImages.map(img => (
                  <div key={img._id} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", position: "relative" }}>
                    <img src={img.imageUrl} alt="Gallery" style={{ width: "100%", height: "150px", objectFit: "cover", display: "block" }} />
                    <button 
                      onClick={() => handleDeleteGalleryUrl(img._id)}
                      style={{ position: "absolute", top: "5px", right: "5px", background: "rgba(239, 68, 68, 0.9)", color: "white", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {galleryImages.length === 0 && <p style={{ color: "#64748b" }}>Chưa có hình ảnh nào trong Gallery.</p>}
            </div>
          )}
\`;

code = code.replace(
  /\{activeTab === "breakeven" && \(/,
  \`\${galleryTabHtml}\n\n          {activeTab === "breakeven" && (\`
);

fs.writeFileSync(adminPath, code);
console.log("Successfully patched AdminDashboard.jsx");
