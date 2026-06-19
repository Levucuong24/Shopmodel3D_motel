import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix typical Leaflet icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons for different amenities
const createCustomIcon = (emoji, bgColor) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${bgColor}; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 16px;">${emoji}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const ICONS = {
  room: createCustomIcon('🏠', '#ef4444'),
  bus: createCustomIcon('🚌', '#3b82f6'),
  market: createCustomIcon('🛒', '#10b981'),
  gym: createCustomIcon('🏋️', '#f59e0b'),
  cafe: createCustomIcon('☕', '#8b5cf6')
};

// Generate mock amenities around a center point
const generateMockAmenities = (centerLat, centerLng) => {
  const generateOffset = (maxDistance) => (Math.random() - 0.5) * maxDistance;

  return [
    { id: 1, type: 'bus', name: 'Trạm xe buýt ngã 4', distance: '150m', lat: centerLat + generateOffset(0.003), lng: centerLng + generateOffset(0.003) },
    { id: 2, type: 'bus', name: 'Trạm đối diện trường', distance: '300m', lat: centerLat + generateOffset(0.005), lng: centerLng + generateOffset(0.005) },
    { id: 3, type: 'market', name: 'Winmart+', distance: '200m', lat: centerLat + generateOffset(0.004), lng: centerLng + generateOffset(0.004) },
    { id: 4, type: 'market', name: 'Chợ dân sinh', distance: '800m', lat: centerLat + generateOffset(0.01), lng: centerLng + generateOffset(0.01) },
    { id: 5, type: 'gym', name: 'California Fitness', distance: '1.2km', lat: centerLat + generateOffset(0.015), lng: centerLng + generateOffset(0.015) },
    { id: 6, type: 'cafe', name: 'The Coffee House', distance: '500m', lat: centerLat + generateOffset(0.008), lng: centerLng + generateOffset(0.008) },
    { id: 7, type: 'cafe', name: 'Highlands Coffee', distance: '1km', lat: centerLat + generateOffset(0.012), lng: centerLng + generateOffset(0.012) },
  ];
};

function NeighborhoodMap({ latitude, longitude, roomName }) {
  // If no coordinates provided, fallback to FPT Hoa Lac
  const center = [latitude || 21.0130, longitude || 105.5266];
  const amenities = generateMockAmenities(center[0], center[1]);

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
      <MapContainer 
        center={center} 
        zoom={15} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Highlight 1km radius */}
        <Circle 
          center={center} 
          radius={1000} 
          pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.05, weight: 1 }}
        />

        {/* Room Marker */}
        <Marker position={center} icon={ICONS.room}>
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <strong style={{ color: '#ef4444', fontSize: '14px' }}>{roomName || 'Phòng trọ này'}</strong>
            </div>
          </Popup>
        </Marker>

        {/* Amenities Markers */}
        {amenities.map(item => (
          <Marker key={item.id} position={[item.lat, item.lng]} icon={ICONS[item.type]}>
            <Popup>
              <div style={{ minWidth: '120px' }}>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{item.name}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                  Khoảng cách: <strong>{item.distance}</strong>
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
        zIndex: 1000,
        color: '#fff',
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>🏠</span> Vị trí phòng</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>🚌</span> Trạm xe buýt</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>🛒</span> Siêu thị / Chợ</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>🏋️</span> Phòng Gym</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>☕</span> Quán Cafe</div>
      </div>
    </div>
  );
}

export default NeighborhoodMap;
