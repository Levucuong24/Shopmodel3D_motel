const fs = require('fs');

const adminPath = 'c:/Users/Windows/Desktop/EWE_NHOM4/my-frontend/src/pages/AdminDashboard.jsx';
let code = fs.readFileSync(adminPath, 'utf8');

// 1. Add handleViewingStatus
const handleViewingStatus = `
  const handleViewingStatus = async (id, newStatus) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const response = await fetch(\`/api/viewings/\${id}/status\`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Could not update status");
      
      const updated = await response.json();
      setViewings(prev => prev.map(v => v._id === id ? updated : v));
    } catch (error) {
      alert(error.message);
    }
  };
`;

code = code.replace(
  'const handleConfirmRental = async (paymentId) => {',
  handleViewingStatus + '\n\n  const handleConfirmRental = async (paymentId) => {'
);


// 2. Add action column to the viewing table
const oldViewingStatusHtml = `                        <td>
                          <span className={\`viewing-status viewing-\${item.status || "pending"}\`}>
                            {item.status === "confirmed" ? "Đã xác nhận" : item.status === "cancelled" ? "Đã hủy" : "Chờ xác nhận"}
                          </span>
                        </td>`;
                        
const newViewingStatusHtml = `                        <td>
                          <select 
                            value={item.status || "pending"} 
                            onChange={(e) => handleViewingStatus(item._id, e.target.value)}
                            style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
                          >
                            <option value="pending">Chờ xác nhận</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>`;

code = code.replace(
  oldViewingStatusHtml,
  newViewingStatusHtml
);

fs.writeFileSync(adminPath, code);
console.log("Successfully patched AdminDashboard.jsx");
