// XRDisplay.tsx

import React from "react";
import { Canvas } from "@react-three/fiber";
import { createXRStore, useXR, XR, XRDomOverlay } from "@react-three/xr";
import { IxButton } from '@siemens/ix-react';
import { IndustrialCoPiolet, Message } from "./IndusrtailCoPiolet/IndustrialCoPiolet";
import { Environment } from "@react-three/drei";
import { Color } from "three";

// Create XR store
const store = createXRStore();


function NonAREnvironment() {
  const inAR = useXR((s) => s.mode === 'immersive-ar');
  return (
    <Environment
      blur={0.2}
      background={!inAR}
      environmentIntensity={2}
      preset="city"
    />
  );
}

export function XRDisplay() {
  return (
     <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '24px', position: 'relative', zIndex: 20 }}>
        <IxButton style={{fontSize: '16px', height:'35px'}} onClick={() =>   store.enterXR('immersive-ar')}>Enter XR</IxButton>
      </div>
      <Canvas gl={{ alpha: true }} style={{ background: 'transparent' }}>
        <XR store={store}>
          <ambientLight intensity={1} />
           <NonAREnvironment />
          <XRDomOverlay style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ padding: '2rem', borderRadius: '10px', zIndex:10 }}>
              <IndustrialCoPiolet  />
            </div>
          </XRDomOverlay>
        </XR>
      </Canvas>
    </>
  );
}
