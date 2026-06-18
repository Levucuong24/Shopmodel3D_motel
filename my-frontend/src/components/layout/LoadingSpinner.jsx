import React from 'react';
import loadingVideo from '../../assets/loading-3d.mp4';

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
    </div>
  );
};

export default LoadingSpinner;
