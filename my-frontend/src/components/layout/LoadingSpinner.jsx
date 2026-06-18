import React from 'react';
import loadingImage from '../../assets/loading-3d.webp';

const LoadingSpinner = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(15, 23, 42, 0.75)', // Elegant dark translucent overlay
      backdropFilter: 'blur(10px)', // Modern glassmorphic blur
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif"
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px 32px',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
      }}>
        <img 
          src={loadingImage} 
          alt="Loading..." 
          style={{ 
            width: '160px', 
            height: '160px', 
            objectFit: 'contain',
            borderRadius: '12px'
          }} 
        />
        <p style={{
          marginTop: '20px',
          color: '#ff6a00',
          fontSize: '15px',
          fontWeight: '700',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          margin: '20px 0 4px 0'
        }}>
          Đang kết nối Homie...
        </p>
        <span style={{
          color: '#94a3b8',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          Vui lòng đợi trong giây lát
        </span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
