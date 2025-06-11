import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { createXRStore, XR, XRDomOverlay } from "@react-three/xr";
import { IxButton } from '@siemens/ix-react';
import { IndustrialCoPiolet, Message } from "./IndusrtailCoPiolet/IndustrialCoPiolet";
import { Html } from "@react-three/drei";


const store = createXRStore();

export function XRDisplay() {


  return (
     <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '24px', position: 'relative', zIndex: 20 }}>
        <IxButton style={{fontSize: '16px', height:'35px'}} onClick={() => store.enterAR()}>Enter AR</IxButton>
      </div>
      <Canvas>
        <XR store={store}>
          <ambientLight intensity={1} />
          {/* <XRDomOverlay style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ padding: '2rem', borderRadius: '10px', zIndex:10 }}>
              <IndustrialCoPiolet  />
            </div>
          </XRDomOverlay> */}

            <pointLight position={[10, 10, 10]} />

          {/* Mesh for IndustrialCoPiolet as a 3D object with Html */}
      
          <mesh position={[0, 0, -2]}>
            <planeGeometry args={[3, 3]} />
            <meshBasicMaterial color={"#eeeeee"} transparent opacity={0.0} />
            <Html transform>
              <IndustrialCoPiolet />
            </Html>
          </mesh>
      

        </XR>
      </Canvas> 
    </>
  )
};