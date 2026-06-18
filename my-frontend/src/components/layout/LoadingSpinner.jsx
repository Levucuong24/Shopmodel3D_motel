import React from 'react';
import loadingVideo from '../../assets/loading-3d.webm';

const LoadingSpinner = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#090d16', // Dark background fallback
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif",
      overflow: 'hidden'
    }}>
      {/* Fullscreen Video Background */}
      <video 
        src={loadingVideo} 
        autoPlay 
        loop 
        muted 
        playsInline 
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
          zIndex: 1
        }} 
      />

      {/* Translucent Dark Overlay to make the text readable */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(9, 13, 22, 0.4)', // Subtle dark overlay
        backdropFilter: 'blur(3px)', // Light blur for premium feel
        WebkitBackdropFilter: 'blur(3px)',
        zIndex: 2
      }} />

      {/* Floating Info Text on top */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        textAlign: 'center',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '16px 28px',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        <p style={{
          color: '#ff6a00',
          fontSize: '16px',
          fontWeight: '700',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          margin: '0 0 4px 0'
        }}>
          Đang kết nối Homie...
        </p>
        <span style={{
          color: '#e2e8f0',
          fontSize: '11px',
          fontWeight: '500'
        }}>
          Hệ thống đang tải dữ liệu phòng trọ 3D
        </span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
