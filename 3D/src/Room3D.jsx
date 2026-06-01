import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// ==========================================
// 1. PROCEDURAL WOOD TEXTURE GENERATOR
// ==========================================
const useWoodTexture = () => {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Base wood color (warm beige/light oak)
    ctx.fillStyle = '#e8cfa9';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle grain variation
    for (let y = 0; y < 1024; y += 4) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(196, 171, 132, 0.08)' : 'rgba(232, 207, 169, 0.08)';
      ctx.fillRect(0, y, 1024, 4);
    }

    // Plank outlines
    ctx.strokeStyle = 'rgba(120, 95, 60, 0.25)';
    ctx.lineWidth = 3;

    // Draw vertical planks (every 128px)
    const plankWidth = 128;
    for (let x = 0; x <= 1024; x += plankWidth) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();

      // Draw staggered horizontal seams
      const colIndex = x / plankWidth;
      const offset = (colIndex % 2) * 256;
      for (let y = offset; y <= 1024 + 256; y += 512) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + plankWidth, y);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.5, 2.5); // Tiling factor
    return texture;
  }, []);
};

// ==========================================
// 2. DETAILED FURNITURE SUB-COMPONENTS
// ==========================================

// Floor
const Floor = () => {
  const woodTexture = useWoodTexture();
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[10, 7]} />
      {woodTexture ? (
        <meshStandardMaterial map={woodTexture} roughness={0.5} metalness={0.05} />
      ) : (
        <meshStandardMaterial color="#e5cbb1" roughness={0.6} />
      )}
    </mesh>
  );
};

// Window Frames and Glass Panes (3-pane layout)
const Window = ({ position, rotation = [0, 0, 0] }) => {
  const frameColor = '#1f2937'; // Slate-dark frames
  const glassColor = '#bce6ff';

  return (
    <group position={position} rotation={rotation}>
      {/* Outer frame */}
      {/* Bottom */}
      <mesh position={[0, -0.85, 0]} castShadow>
        <boxGeometry args={[2.0, 0.1, 0.15]} />
        <meshStandardMaterial color={frameColor} roughness={0.8} />
      </mesh>
      {/* Top */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[2.0, 0.1, 0.15]} />
        <meshStandardMaterial color={frameColor} roughness={0.8} />
      </mesh>
      {/* Left */}
      <mesh position={[-0.95, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 1.8, 0.15]} />
        <meshStandardMaterial color={frameColor} roughness={0.8} />
      </mesh>
      {/* Right */}
      <mesh position={[0.95, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 1.8, 0.15]} />
        <meshStandardMaterial color={frameColor} roughness={0.8} />
      </mesh>

      {/* 3 panels divided by vertical bars */}
      <mesh position={[-0.31, 0, 0]} castShadow>
        <boxGeometry args={[0.04, 1.7, 0.1]} />
        <meshStandardMaterial color={frameColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.31, 0, 0]} castShadow>
        <boxGeometry args={[0.04, 1.7, 0.1]} />
        <meshStandardMaterial color={frameColor} roughness={0.8} />
      </mesh>

      {/* Glass Pane */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.8, 1.7, 0.02]} />
        <meshStandardMaterial
          color={glassColor}
          transparent
          opacity={0.25}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
};

// Wooden Entrance Door (closed, with handle and marble threshold)
const EntranceDoor = ({ position }) => {
  const frameColor = '#a88561';
  const woodColor = '#d2b48c';
  const handleColor = '#374151';

  return (
    <group position={position}>
      {/* Door Frame */}
      <mesh position={[-0.75, 1.2, 0]} castShadow>
        <boxGeometry args={[0.1, 2.4, 0.15]} />
        <meshStandardMaterial color={frameColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.75, 1.2, 0]} castShadow>
        <boxGeometry args={[0.1, 2.4, 0.15]} />
        <meshStandardMaterial color={frameColor} roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.35, 0]} castShadow>
        <boxGeometry args={[1.6, 0.1, 0.15]} />
        <meshStandardMaterial color={frameColor} roughness={0.7} />
      </mesh>

      {/* Door panel (closed) */}
      <group position={[0, 1.15, -0.02]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.4, 2.3, 0.05]} />
          <meshStandardMaterial color={woodColor} roughness={0.65} />
        </mesh>

        {/* Door handle lever */}
        <group position={[0.55, -0.1, 0.04]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.04, 8]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color={handleColor} metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0.04, 0, 0.01]} castShadow>
            <boxGeometry args={[0.1, 0.02, 0.015]} />
            <meshStandardMaterial color={handleColor} metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
        {/* Inside handle */}
        <group position={[0.55, -0.1, -0.04]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.04, 8]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color={handleColor} metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0.04, 0, -0.01]} castShadow>
            <boxGeometry args={[0.1, 0.02, 0.015]} />
            <meshStandardMaterial color={handleColor} metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

// ==========================================
// 3. DYNAMIC WALL SYSTEM
// ==========================================

const LeftWall = () => {
  const ref = useRef();
  useFrame(({ camera }) => {
    if (ref.current) {
      // Hide when camera is looking from the left side to avoid blocking interior
      const isInside = Math.abs(camera.position.x) < 5 && Math.abs(camera.position.z) < 3.5;
      ref.current.visible = camera.position.x > -4.8 || isInside;
    }
  });

  return (
    <mesh ref={ref} position={[-5.1, 1.75, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.2, 3.5, 7.2]} />
      <meshStandardMaterial color="#fdfdfd" roughness={0.8} />
    </mesh>
  );
};

const RightWall = () => {
  const ref = useRef();
  useFrame(({ camera }) => {
    if (ref.current) {
      // Hide when camera is looking from the right side
      const isInside = Math.abs(camera.position.x) < 5 && Math.abs(camera.position.z) < 3.5;
      ref.current.visible = camera.position.x < 4.8 || isInside;
    }
  });

  return (
    <group ref={ref}>
      {/* Back segment */}
      <mesh position={[5.1, 1.75, -2.0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 3.5, 3.0]} />
        <meshStandardMaterial color="#fdfdfd" roughness={0.8} />
      </mesh>
      {/* Front segment */}
      <mesh position={[5.1, 1.75, 2.5]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 3.5, 2.0]} />
        <meshStandardMaterial color="#fdfdfd" roughness={0.8} />
      </mesh>
      {/* Top segment */}
      <mesh position={[5.1, 3.0, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 1.0, 2.0]} />
        <meshStandardMaterial color="#fdfdfd" roughness={0.8} />
      </mesh>
      {/* Bottom segment */}
      <mesh position={[5.1, 0.35, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.7, 2.0]} />
        <meshStandardMaterial color="#fdfdfd" roughness={0.8} />
      </mesh>
      {/* Window */}
      <Window position={[5.1, 1.6, 0.5]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
};

const BackWall = () => {
  const ref = useRef();
  useFrame(({ camera }) => {
    if (ref.current) {
      // Hide when camera is looking from behind
      const isInside = Math.abs(camera.position.x) < 5 && Math.abs(camera.position.z) < 3.5;
      ref.current.visible = camera.position.z > -3.3 || isInside;
    }
  });

  return (
    <group ref={ref}>
      {/* Left segment behind bathroom */}
      <mesh position={[-3.75, 1.75, -3.6]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 3.5, 0.2]} />
        <meshStandardMaterial color="#fdfdfd" roughness={0.8} />
      </mesh>
      {/* Right segment */}
      <mesh position={[2.05, 1.75, -3.6]} castShadow receiveShadow>
        <boxGeometry args={[5.9, 3.5, 0.2]} />
        <meshStandardMaterial color="#fdfdfd" roughness={0.8} />
      </mesh>
      {/* Top segment above door */}
      <mesh position={[-1.7, 2.95, -3.6]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.1, 0.2]} />
        <meshStandardMaterial color="#fdfdfd" roughness={0.8} />
      </mesh>
      {/* Door Frame & Closed Wood Door */}
      <EntranceDoor position={[-1.7, 0, -3.6]} />
      {/* Grey Marble Door Threshold */}
      <mesh position={[-1.7, 0.01, -3.45]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 0.3]} />
        <meshStandardMaterial color="#7f8c8d" roughness={0.4} />
      </mesh>
    </group>
  );
};

const FrontWall = () => {
  const ref = useRef();
  useFrame(({ camera }) => {
    if (ref.current) {
      // Hide when camera is looking from front
      const isInside = Math.abs(camera.position.x) < 5 && Math.abs(camera.position.z) < 3.5;
      ref.current.visible = camera.position.z < 3.3 || isInside;
    }
  });

  return (
    <group ref={ref}>
      {/* Left segment */}
      <mesh position={[-3.0, 1.75, 3.6]} castShadow receiveShadow>
        <boxGeometry args={[4.0, 3.5, 0.2]} />
        <meshStandardMaterial color="#fdfdfd" roughness={0.8} />
      </mesh>
      {/* Right segment */}
      <mesh position={[3.0, 1.75, 3.6]} castShadow receiveShadow>
        <boxGeometry args={[4.0, 3.5, 0.2]} />
        <meshStandardMaterial color="#fdfdfd" roughness={0.8} />
      </mesh>
      {/* Top segment */}
      <mesh position={[0, 3.0, 3.6]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 1.0, 0.2]} />
        <meshStandardMaterial color="#fdfdfd" roughness={0.8} />
      </mesh>
      {/* Bottom segment */}
      <mesh position={[0, 0.35, 3.6]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.7, 0.2]} />
        <meshStandardMaterial color="#fdfdfd" roughness={0.8} />
      </mesh>
      {/* Window */}
      <Window position={[0, 1.6, 3.6]} rotation={[0, 0, 0]} />
    </group>
  );
};

// ==========================================
// 4. BATHROOM (TOILET & SHOWER ROOM)
// ==========================================

const Toilet = ({ position }) => {
  const ceramicMaterial = <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.1} />;
  const chromeMaterial = <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.1} />;

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.2, 0.1]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.4, 16]} />
        {ceramicMaterial}
      </mesh>
      {/* Bowl Rim */}
      <mesh position={[0, 0.4, 0.05]} castShadow>
        <cylinderGeometry args={[0.18, 0.16, 0.06, 16]} />
        {ceramicMaterial}
      </mesh>
      {/* Seat Lid (Closed) */}
      <mesh position={[0, 0.43, 0.04]} castShadow>
        <boxGeometry args={[0.36, 0.02, 0.4]} />
        {ceramicMaterial}
      </mesh>
      {/* Water Tank */}
      <mesh position={[0, 0.65, -0.16]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.18]} />
        {ceramicMaterial}
      </mesh>
      {/* Flush button */}
      <mesh position={[0.1, 0.91, -0.16]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.02, 8]} />
        {chromeMaterial}
      </mesh>
    </group>
  );
};

const Shower = ({ position }) => {
  const blackMetal = <meshStandardMaterial color="#1a1a1a" roughness={0.85} metalness={0.2} />;

  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      {/* Vertical Pipe */}
      <mesh position={[0, 1.2, 0.05]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 2.0, 8]} />
        {blackMetal}
      </mesh>
      {/* Horizontal Shower Head Arm */}
      <mesh position={[0.15, 2.15, 0.05]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.3, 8]} />
        {blackMetal}
      </mesh>
      {/* Overhead Shower Disc */}
      <mesh position={[0.3, 2.12, 0.05]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.018, 16]} />
        {blackMetal}
      </mesh>
      {/* Mixer Panel */}
      <mesh position={[0, 0.9, 0.05]} castShadow>
        <boxGeometry args={[0.06, 0.14, 0.1]} />
        {blackMetal}
      </mesh>
      {/* Control Lever */}
      <mesh position={[0.04, 0.9, 0.05]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.07, 8]} />
        {blackMetal}
      </mesh>
      {/* Handheld shower holder & wand */}
      <mesh position={[0.05, 1.15, 0.08]} rotation={[0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.018, 0.12, 8]} />
        {blackMetal}
      </mesh>
    </group>
  );
};

const BathroomDoor = ({ position }) => {
  const frameColor = '#1f2937';
  const glassColor = '#b2ebf2';

  // Hinge is at the right edge of the door (X = +0.55 locally)
  // The door is slightly open (rotated by 0.15 radians) to look premium
  return (
    <group position={[position[0] - 0.55, position[1], position[2]]}>
      <group position={[0.55, 0, 0]} rotation={[0, 0.25, 0]}>
        <group position={[-0.55, 0, 0]}>
          {/* Frame */}
          {/* Left vertical */}
          <mesh position={[-0.525, 1.2, 0]} castShadow>
            <boxGeometry args={[0.05, 2.4, 0.05]} />
            <meshStandardMaterial color={frameColor} roughness={0.8} />
          </mesh>
          {/* Right vertical */}
          <mesh position={[0.525, 1.2, 0]} castShadow>
            <boxGeometry args={[0.05, 2.4, 0.05]} />
            <meshStandardMaterial color={frameColor} roughness={0.8} />
          </mesh>
          {/* Top horizontal */}
          <mesh position={[0, 2.375, 0]} castShadow>
            <boxGeometry args={[1.1, 0.05, 0.05]} />
            <meshStandardMaterial color={frameColor} roughness={0.8} />
          </mesh>
          {/* Bottom horizontal */}
          <mesh position={[0, 0.025, 0]} castShadow>
            <boxGeometry args={[1.1, 0.05, 0.05]} />
            <meshStandardMaterial color={frameColor} roughness={0.8} />
          </mesh>

          {/* Glass Pane */}
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[1.0, 2.3, 0.015]} />
            <meshStandardMaterial
              color={glassColor}
              transparent
              opacity={0.2}
              roughness={0.1}
              metalness={0.85}
            />
          </mesh>

          {/* Handle */}
          <group position={[-0.45, 1.1, 0.035]}>
            <mesh castShadow>
              <boxGeometry args={[0.02, 0.18, 0.015]} />
              <meshStandardMaterial color={frameColor} roughness={0.8} />
            </mesh>
          </group>
          <group position={[-0.45, 1.1, -0.035]}>
            <mesh castShadow>
              <boxGeometry args={[0.02, 0.18, 0.015]} />
              <meshStandardMaterial color={frameColor} roughness={0.8} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

const Bathroom = () => {
  return (
    <group>
      {/* Right partition wall */}
      <mesh position={[-2.5, 1.75, -2.25]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 3.5, 2.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>

      {/* Bottom partition wall segments */}
      {/* Left piece */}
      <mesh position={[-4.55, 1.75, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 3.5, 0.1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      {/* Right piece */}
      <mesh position={[-2.7, 1.75, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 3.5, 0.1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      {/* Top piece above door */}
      <mesh position={[-3.5, 2.95, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.1, 0.1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>

      {/* Black Frame Glass Door */}
      <BathroomDoor position={[-3.5, 0, -1.0]} />

      {/* Toilet */}
      <Toilet position={[-3.75, 0, -2.9]} />

      {/* Shower head set */}
      <Shower position={[-4.9, 0, -2.0]} />
    </group>
  );
};

// ==========================================
// 5. KITCHEN (L-SHAPED COUNTER & UTENSILS)
// ==========================================

const Kitchen = () => {
  const cabinetWood = '#ebd6bf';
  const counterWhite = '#ffffff';
  const cabinetWhite = '#ffffff';
  const metalColor = '#d1d5db';

  return (
    <group>
      {/* ==========================================
          1. MAIN CABINET (ALONG LEFT WALL)
          ========================================== */}
      {/* Base Cabinet */}
      <mesh position={[-4.6, 0.425, 1.85]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.85, 2.7]} />
        <meshStandardMaterial color={cabinetWood} roughness={0.6} />
      </mesh>

      {/* Handles */}
      {[0.8, 1.4, 2.0, 2.6].map((zPos, idx) => (
        <group key={idx} position={[-4.19, 0.425, zPos]}>
          <mesh castShadow>
            <boxGeometry args={[0.02, 0.03, 0.15]} />
            <meshStandardMaterial color="#4b5563" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Countertop */}
      <mesh position={[-4.6, 0.87, 1.85]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.04, 2.7]} />
        <meshStandardMaterial color={counterWhite} roughness={0.3} />
      </mesh>

      {/* Upper Cabinets */}
      <mesh position={[-4.8, 2.5, 1.85]} castShadow>
        <boxGeometry args={[0.4, 1.0, 2.7]} />
        <meshStandardMaterial color={cabinetWhite} roughness={0.7} />
      </mesh>

      {/* LED Strip */}
      <mesh position={[-4.7, 1.99, 1.85]}>
        <boxGeometry args={[0.2, 0.02, 2.6]} />
        <meshStandardMaterial color="#fffcf0" emissive="#ffeaad" emissiveIntensity={0.6} />
      </mesh>

      {/* Cooktop */}
      <group position={[-4.6, 0.895, 1.0]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.01, 0.7]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.1} />
        </mesh>
        {/* Burners */}
        <mesh position={[0, 0.006, -0.15]}>
          <cylinderGeometry args={[0.15, 0.15, 0.001, 16]} />
          <meshStandardMaterial color="#333333" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.006, 0.15]}>
          <cylinderGeometry args={[0.12, 0.12, 0.001, 16]} />
          <meshStandardMaterial color="#333333" roughness={0.5} />
        </mesh>
        {/* Stainless Steel Pan */}
        <group position={[0, 0.08, -0.15]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.12, 16]} />
            <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.01, 16]} />
            <meshStandardMaterial color="#6b7280" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0.22, 0.03, 0]} rotation={[0, 0, 0.1]} castShadow>
            <boxGeometry args={[0.18, 0.015, 0.03]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* Sink */}
      <group position={[-4.6, 0.895, 2.0]}>
        <mesh castShadow>
          <boxGeometry args={[0.45, 0.01, 0.55]} />
          <meshStandardMaterial color="#4b5563" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.001, 0]}>
          <boxGeometry args={[0.39, 0.002, 0.49]} />
          <meshStandardMaterial color="#1f2937" roughness={0.7} />
        </mesh>
        {/* Curved Chrome Faucet */}
        <group position={[0.2, 0.01, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.24, 8]} />
            <meshStandardMaterial color={metalColor} metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0.06, 0.23, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.15, 8]} />
            <meshStandardMaterial color={metalColor} metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* Cutting Board */}
      <group position={[-4.8, 0.9, 2.7]} rotation={[0, 0.1, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.06, 0.2, 0.28]} />
          <meshStandardMaterial color="#b45309" roughness={0.8} />
        </mesh>
      </group>

      {/* ==========================================
          2. RETURN LEG (BAR COUNTER ALONG BOTTOM WALL)
          ========================================== */}
      {/* Base */}
      <mesh position={[-3.3, 0.425, 3.1]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.85, 0.8]} />
        <meshStandardMaterial color={cabinetWood} roughness={0.6} />
      </mesh>
      {/* Bar Countertop */}
      <mesh position={[-3.3, 0.87, 3.1]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.04, 0.8]} />
        <meshStandardMaterial color={counterWhite} roughness={0.3} />
      </mesh>

      {/* Items on Bar Counter */}
      {/* Tablet */}
      <group position={[-3.4, 0.98, 3.1]} rotation={[0.1, -0.4, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.16, 0.02]} />
          <meshStandardMaterial color="#111111" roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.011]}>
          <planeGeometry args={[0.2, 0.14]} />
          <meshStandardMaterial color="#1e293b" emissive="#1e1b4b" emissiveIntensity={0.2} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.06, -0.06]} rotation={[-0.4, 0, 0]} castShadow>
          <boxGeometry args={[0.08, 0.12, 0.01]} />
          <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Coffee Mug */}
      <mesh position={[-2.8, 0.94, 3.0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.09, 12]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.4} />
      </mesh>

      {/* Plates stack */}
      <group position={[-2.9, 0.89, 3.2]}>
        <mesh position={[0, 0.005, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.01, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.018, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.01, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};

// ==========================================
// 6. STUDY DESK & SWIVEL CHAIR
// ==========================================

const Desk = () => {
  const woodColor = '#968270';
  const darkWoodColor = '#706050';

  return (
    <group position={[0.4, 0, 2.7]}>
      {/* Tabletop */}
      <mesh position={[0, 0.73, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.04, 0.7]} />
        <meshStandardMaterial color={woodColor} roughness={0.7} />
      </mesh>

      {/* Left Side Panel */}
      <mesh position={[-0.88, 0.355, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 0.71, 0.68]} />
        <meshStandardMaterial color={woodColor} roughness={0.7} />
      </mesh>
      
      {/* Right Side Panel */}
      <mesh position={[0.88, 0.355, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 0.71, 0.68]} />
        <meshStandardMaterial color={woodColor} roughness={0.7} />
      </mesh>

      {/* Back reinforcement Panel */}
      <mesh position={[0, 0.45, 0.3]} castShadow>
        <boxGeometry args={[1.72, 0.4, 0.02]} />
        <meshStandardMaterial color={darkWoodColor} roughness={0.8} />
      </mesh>

      {/* Open Drawer Cabinet Unit (Right side) */}
      <group position={[0.55, 0.33, -0.02]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.6, 0.6]} />
          <meshStandardMaterial color={darkWoodColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.46, 0.02, 0.58]} />
          <meshStandardMaterial color={woodColor} roughness={0.7} />
        </mesh>
        {/* Inside items: Books/Files */}
        <group position={[-0.1, -0.18, 0.05]}>
          <mesh position={[0, 0, 0]} rotation={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.06, 0.2, 0.3]} />
            <meshStandardMaterial color="#3b82f6" roughness={0.8} />
          </mesh>
          <mesh position={[0.08, 0, 0.02]} rotation={[0, -0.05, 0]} castShadow>
            <boxGeometry args={[0.05, 0.22, 0.28]} />
            <meshStandardMaterial color="#ef4444" roughness={0.8} />
          </mesh>
          <mesh position={[0.15, -0.05, 0]} rotation={[0, 0.15, -Math.PI / 12]} castShadow>
            <boxGeometry args={[0.06, 0.18, 0.3]} />
            <meshStandardMaterial color="#eab308" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* Open Laptop */}
      <group position={[0, 0.75, 0.05]}>
        <mesh castShadow>
          <boxGeometry args={[0.36, 0.015, 0.26]} />
          <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
        </mesh>
        <group position={[0, 0.007, 0.12]} rotation={[-1.9, 0, 0]}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <boxGeometry args={[0.36, 0.24, 0.01]} />
            <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.12, -0.006]}>
            <planeGeometry args={[0.34, 0.22]} />
            <meshStandardMaterial color="#111827" emissive="#111827" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* Black Desk Lamp */}
      <group position={[-0.6, 0.75, 0.1]} rotation={[0, 0.4, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.01, 16]} />
          <meshStandardMaterial color="#1f2937" roughness={0.8} />
        </mesh>
        <mesh position={[-0.02, 0.15, 0]} rotation={[0, 0, -0.2]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.3, 8]} />
          <meshStandardMaterial color="#1f2937" roughness={0.8} />
        </mesh>
        <mesh position={[0.04, 0.35, -0.02]} rotation={[0, 0, 0.5]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.25, 8]} />
          <meshStandardMaterial color="#1f2937" roughness={0.8} />
        </mesh>
        <mesh position={[0.13, 0.43, -0.04]} rotation={[0, 0, 1.2]} castShadow>
          <cylinderGeometry args={[0.05, 0.04, 0.08, 12]} />
          <meshStandardMaterial color="#1f2937" roughness={0.8} />
        </mesh>
      </group>

      {/* Plant Pot */}
      <group position={[0.6, 0.75, -0.15]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.03, 0.08, 12]} />
          <meshStandardMaterial color="#f3f4f6" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.038, 0]}>
          <cylinderGeometry args={[0.038, 0.038, 0.002, 12]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
        {[-0.04, 0, 0.04].map((xOffset, i) => (
          <mesh key={i} position={[xOffset, 0.08 + Math.abs(xOffset) * 0.2, (i % 2 === 0 ? 0.02 : -0.02)]} castShadow>
            <sphereGeometry args={[0.03 + (i % 2) * 0.01, 8, 8]} />
            <meshStandardMaterial color="#15803d" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const Chair = () => {
  const plasticColor = '#374151';
  const cushionColor = '#9ca3af';
  const chromeColor = '#d1d5db';

  return (
    <group position={[0.4, 0, 1.9]} rotation={[0, -0.2, 0]}>
      {/* Base wheels & star */}
      <group position={[0, 0.05, 0]}>
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * 2 * Math.PI) / 5;
          const x = Math.cos(angle) * 0.28;
          const z = Math.sin(angle) * 0.28;
          return (
            <group key={i}>
              <mesh position={[x / 2, 0, z / 2]} rotation={[0, -angle, 0]} castShadow>
                <boxGeometry args={[0.28, 0.02, 0.03]} />
                <meshStandardMaterial color={chromeColor} metalness={0.9} roughness={0.1} />
              </mesh>
              <mesh position={[x, -0.02, z]} castShadow>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color="#111111" roughness={0.9} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Hydraulic Shaft */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.025, 0.3, 12]} />
        <meshStandardMaterial color={chromeColor} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Seat Cushion */}
      <group position={[0, 0.38, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.46, 0.06, 0.46]} />
          <meshStandardMaterial color={cushionColor} roughness={0.8} />
        </mesh>
        {/* Backrest Connector */}
        <mesh position={[0, 0.18, 0.2]} rotation={[0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.06, 0.3, 0.03]} />
          <meshStandardMaterial color={plasticColor} roughness={0.7} />
        </mesh>
        {/* Backrest cushion */}
        <mesh position={[0, 0.42, 0.22]} rotation={[0.05, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 0.36, 0.04]} />
          <meshStandardMaterial color={cushionColor} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

// ==========================================
// 7. BED (DARK WOOD FRAME & GREY BEDDING)
// ==========================================

const Bed = () => {
  const frameColor = '#3a2e2b'; // Dark wood
  const mattressColor = '#d6cfc7'; // Light grey/beige bedding
  const pillowColor = '#8c8380'; // Darker grey pillows

  return (
    <group position={[3.5, 0, 0.5]}>
      {/* Bed Base */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.36, 1.95]} />
        <meshStandardMaterial color={frameColor} roughness={0.8} />
      </mesh>

      {/* Headboard */}
      <mesh position={[1.2, 0.6, 0]} castShadow>
        <boxGeometry args={[0.15, 1.2, 1.95]} />
        <meshStandardMaterial color={frameColor} roughness={0.8} />
      </mesh>

      {/* Mattress */}
      <mesh position={[-0.05, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.45, 0.25, 1.85]} />
        <meshStandardMaterial color={mattressColor} roughness={0.9} />
      </mesh>

      {/* Two Cushioned Pillows */}
      <mesh position={[0.8, 0.58, 0.4]} rotation={[0, 0, -0.08]} castShadow>
        <boxGeometry args={[0.35, 0.08, 0.6]} />
        <meshStandardMaterial color={pillowColor} roughness={0.85} />
      </mesh>
      <mesh position={[0.8, 0.58, -0.4]} rotation={[0, 0, -0.08]} castShadow>
        <boxGeometry args={[0.35, 0.08, 0.6]} />
        <meshStandardMaterial color={pillowColor} roughness={0.85} />
      </mesh>
    </group>
  );
};

// ==========================================
// 8. COMBINED ROOM ASSEMBLY
// ==========================================
const Room = () => {
  return (
    <group position={[0, 0, 0]}>
      <Floor />
      <LeftWall />
      <RightWall />
      <BackWall />
      <FrontWall />
      <Bathroom />
      <Kitchen />
      <Desk />
      <Chair />
      <Bed />
    </group>
  );
};

// ==========================================
// 9. MAIN CONTAINER & CANVAS ENVIRONMENT
// ==========================================
const RoomScene = () => {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#f5f6f8', // Clean solid light background to match screenshots
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        fontFamily: 'sans-serif',
      }}
    >
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [-8.5, 7.0, 9.0], fov: 40 }}
      >
        {/* Background Color of the 3D Scene */}
        <color attach="background" args={["#f5f6f8"]} />

        {/* Soft Ambient Light for overall brightness */}
        <ambientLight intensity={0.7} color="#fffcf5" />

        {/* Primary Sunlight casting shadows through the windows */}
        <directionalLight
          castShadow
          position={[-10, 8, -4]}
          intensity={1.5}
          color="#fff5e6"
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={25}
          shadow-camera-left={-7}
          shadow-camera-right={7}
          shadow-camera-top={7}
          shadow-camera-bottom={-7}
          shadow-bias={-0.0005}
        />

        {/* Soft Cool Fill Light from opposite direction */}
        <directionalLight
          position={[8, 5, 8]}
          intensity={0.4}
          color="#e0f2fe"
        />

        {/* Soft Ground Bounce Light */}
        <hemisphereLight skyColor="#ffffff" groundColor="#7f7f7f" intensity={0.2} />

        {/* Assembly Room */}
        <Room />

        {/* Ground grid helper surrounding the room */}
        <gridHelper args={[40, 40, '#d1d5db', '#e5e7eb']} position={[0, -0.01, 0]} />

        {/* Orbit Camera Controls (360-degree viewing) */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2 - 0.05} // Stops camera from going under the floor
          target={[0, 1.2, 0]}
        />
      </Canvas>
    </div>
  );
};

export default RoomScene;
