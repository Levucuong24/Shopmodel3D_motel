import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Fix typical Leaflet icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// FPT University Hoa Lac coordinates
const FPT_CAMPUS = [21.0130, 105.5266];

function MapPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => {
        // Map rooms, generate fake coordinates if lat/lng are missing
        const mappedRooms = data.map((room, index) => {
          if (!room.latitude || !room.longitude) {
            // Generate random offset within ~2km of FPT
            const latOffset = (Math.random() - 0.5) * 0.02;
            const lngOffset = (Math.random() - 0.5) * 0.02;
            return {
              ...room,
              latitude: FPT_CAMPUS[0] + latOffset,
              longitude: FPT_CAMPUS[1] + lngOffset
            };
          }
          return room;
        });
        setRooms(mappedRooms);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching rooms for map", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 70px)', width: '100%', position: 'relative' }}>
        <MapContainer 
            center={FPT_CAMPUS} 
            zoom={14} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Main FPT Campus Marker */}
        <Marker position={FPT_CAMPUS}>
            <Popup>
                <div style={{ textAlign: 'center' }}>
                    <strong style={{ color: '#f27124', fontSize: '16px' }}>Đại Học FPT Hoà Lạc</strong>
                    <br/>Trung tâm của chúng ta!
                </div>
            </Popup>
        </Marker>

        {/* Room Markers */}
        {!loading && rooms.map(room => (
            <Marker key={room._id} position={[room.latitude, room.longitude]}>
                <Popup>
                    <div style={{ minWidth: '150px' }}>
                        <img 
                            src={room.images?.[0] || 'https://via.placeholder.com/150'} 
                            alt={room.name}
                            style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }}
                        />
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#333' }}>{room.name}</h4>
                        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#ff4b2b' }}>
                            {room.price.toLocaleString('vi-VN')} {room.price_unit === 'month' ? 'VNĐ/Tháng' : 'VNĐ'}
                        </p>
                        <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666' }}>{room.location}</p>
                        <button 
                            onClick={() => navigate(`/room/${room._id}`)}
                            style={{ width: '100%', padding: '5px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Xem chi tiết
                        </button>
                    </div>
                </Popup>
            </Marker>
        ))}
        </MapContainer>
        
        {/* Instruction overlay */}
        <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000,
            maxWidth: '300px'
        }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Khám phá khu nhà trọ</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                * Bấm vào các biểu tượng để xem chi tiết phòng. Vị trí bản đồ hiện đang được hiển thị ngẫu nhiên quanh trường để thử nghiệm giao diện.
            </p>
        </div>
    </div>
  );
}

export default MapPage;
