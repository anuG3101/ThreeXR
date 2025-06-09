import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { createXRStore, XR, XRDomOverlay } from "@react-three/xr";
import { IxButton } from '@siemens/ix-react';
import { IndustrialCoPiolet, Message } from "./IndusrtailCoPiolet/IndustrialCoPiolet";




const store = createXRStore();

export function XRDisplay() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [arStarted, setARStarted] = useState(false);

  const handleNewMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  };


  return (
     <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '24px', position: 'relative', zIndex: 20 }}>
        <IxButton style={{fontSize: '12px', height:'23px'}} onClick={() => store.enterAR()}>Enter AR</IxButton>
      </div>
      <Canvas>
        <XR store={store}>
          <ambientLight intensity={1} />
          <XRDomOverlay style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ padding: '2rem', fontFamily: 'Arial', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '10px', zIndex:10 }}>
              <IndustrialCoPiolet onNewMessage={handleNewMessage} />
            </div>
          </XRDomOverlay>
        </XR>
      </Canvas>
    </>
  )
};