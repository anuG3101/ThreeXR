import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { createXRStore, XR, XRDomOverlay } from "@react-three/xr";
import { IxButton } from '@siemens/ix-react';
import { IndustrialCoPiolet, Message } from "./IndusrtailCoPiolet/IndustrialCoPiolet";


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
          <XRDomOverlay style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ padding: '2rem', borderRadius: '10px', zIndex:10 }}>
              <IndustrialCoPiolet  />
            </div>
          </XRDomOverlay>
        </XR>
      </Canvas> 
    </>
  )
};