// XRDisplay.tsx

import React from "react";
import { Canvas } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import { IxButton } from '@siemens/ix-react';
import { Html, OrbitControls } from "@react-three/drei";
import { IndustrialCoPiolet } from "./IndusrtailCoPiolet/IndustrialCoPiolet";

// Create XR store
const store = createXRStore();

export function XRDisplay() {
  return (
    <>
      {/* AR Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '24px',
          position: 'relative',
          zIndex: 20,
        }}
      >
        <IxButton style={{ fontSize: '16px', height: '35px' }} onClick={() => store.enterAR()}>
          Enter AR
        </IxButton>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
        <XR store={store}>
          {/* Lighting */}
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 5, 5]} intensity={0.5} />

          {/* Optional Controls for Desktop Testing */}
          <OrbitControls />

          {/* Floor or surrounding scene if needed */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#dddddd" />
          </mesh>

          {/* Panel with Embedded IndustrialCoPiolet */}
          <group position={[0, 1.5, -2]}>
            {/* Panel Mesh (like a screen) */}
            <mesh>
              <planeGeometry args={[1, 2]} />
              <meshStandardMaterial color="black" />
            </mesh>

            {/* Embedded HTML UI */}
            <Html transform occlude position={[0, 0, 0.01]}>
              <div
                style={{
                  width: '350px',
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1rem',
                  boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                  maxHeight: '600px',
                  overflowY: 'auto'
                }}
              >
                <IndustrialCoPiolet />
              </div>
            </Html>
          </group>
        </XR>
      </Canvas>
    </>
  );
}
