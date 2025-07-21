import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { createXRStore, XR, XRDomOverlay } from "@react-three/xr";
import { IxButton } from '@siemens/ix-react';
import { IndustrialCoPiolet, Message } from "./IndusrtailCoPiolet/IndustrialCoPiolet";
import { ChartTexture } from "./ChartTexture";
import ChartCanvas from "./ChartCanvas";




const store = createXRStore();

export function XRDisplay() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [arStarted, setARStarted] = useState(false);

  const handleNewMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  return (
     <>
      <ChartCanvas ref={canvasRef} />

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '24px', position: 'relative', zIndex: 20 }}>
        <IxButton style={{fontSize: '12px', height:'23px'}} onClick={() => store.enterAR()}>Enter AR</IxButton>
      </div>
        <IndustrialCoPiolet />
      <Canvas>
        <XR store={store}>
          <ambientLight intensity={1} />
          <XRDomOverlay style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ padding: '2rem', fontFamily: 'Arial', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '10px', zIndex:10 }}>
            
            </div>
          </XRDomOverlay>
           <ChartTexture canvasRef={canvasRef} position={[0, 1.6, -1]} />
        </XR>

  
        
      </Canvas>
    </>
  )
};