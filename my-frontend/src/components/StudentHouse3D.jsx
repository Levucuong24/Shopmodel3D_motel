import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';

function HouseScene() {
  return (
    <group>
      {/* Lights */}
      <directionalLight position={[1, 2, 1]} castShadow intensity={1} color={0xffffff} />
      <ambientLight intensity={1} color={0x666666} />

      {/* House Body */}
      <mesh position={[0, 0.12 / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.12, 0.2]} />
        <meshStandardMaterial color={0xffeb3b} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 0.12 + 0.05, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.18, 0.1, 4]} />
        <meshStandardMaterial color={0xc62828} />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.04, 0.2 / 2 + 0.005]}>
        <boxGeometry args={[0.05, 0.08, 0.01]} />
        <meshStandardMaterial color={0x6d4c41} />
      </mesh>

      {/* Door Frame */}
      <mesh position={[0, 0.05, 0.2 / 2]}>
        <boxGeometry args={[0.07, 0.1, 0.005]} />
        <meshStandardMaterial color={0x3e2723} />
      </mesh>

      {/* Window 1 */}
      <group position={[-0.07, 0.08, 0]}>
        <mesh position={[0, 0, 0.2 / 2]}>
          <boxGeometry args={[0.06, 0.05, 0.005]} />
          <meshStandardMaterial color={0x4e342e} />
        </mesh>
        <mesh position={[0, 0, 0.2 / 2 + 0.003]}>
          <planeGeometry args={[0.04, 0.03]} />
          <meshStandardMaterial color={0x81d4fa} />
        </mesh>
      </group>

      {/* Window 2 */}
      <group position={[0.07, 0.08, 0]}>
        <mesh position={[0, 0, 0.2 / 2]}>
          <boxGeometry args={[0.06, 0.05, 0.005]} />
          <meshStandardMaterial color={0x4e342e} />
        </mesh>
        <mesh position={[0, 0, 0.2 / 2 + 0.003]}>
          <planeGeometry args={[0.04, 0.03]} />
          <meshStandardMaterial color={0x81d4fa} />
        </mesh>
      </group>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color={0x4caf50} />
      </mesh>
    </group>
  );
}

export default function StudentHouse3D() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 60, position: [0.5, 0.35, 0.5] }}>
        <color attach="background" args={['#aed6f1']} />
        <Suspense fallback={null}>
          <HouseScene />
        </Suspense>
        <OrbitControls autoRotate={false} makeDefault enableDamping={true} />
      </Canvas>
    </div>
  );
}
