import { createXRStore, XR, XRDomOverlay } from "@react-three/xr";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import XRCopilotUI from "./XRCopilotUI";
import ARInterface from "./Demo";
import { ChatCreation } from "../redux/slices/localClientSlice";
import { RotatingBox } from "../threeDobjects/rotatingBox";
import ThreeDmodelHandler from "../threeDobjects/theeDmodelHandler";

const store = createXRStore();

const WebXrCopilot = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [arSupported, setArSupported] = useState<boolean | null>(null);
    const [isARActive, setIsARActive] = useState(false);
    const [showModel, setShowModel] = useState(false);

    useEffect(() => {
        const chatTitle = `Copilot @ ${new Date().toLocaleString()}`;
        const userId = '00000000-0000-0000-0000-000000000000';
        // ChatCreation(chatTitle, userId)
    }, []);

    useEffect(() => {
        const checkSupport = async () => {
            if (navigator.xr) {
                const isSupported = await navigator.xr.isSessionSupported("immersive-ar");
                setArSupported(isSupported);
            } else {
                setArSupported(false);
            }
        };
        checkSupport();

        const sessionStart = () => setIsARActive(true);
        const sessionEnd = () => setIsARActive(false);

        const onSessionStart = () => sessionStart();
        const onSessionEnd = () => sessionEnd();

        navigator.xr?.addEventListener?.("sessionstart", onSessionStart);
        navigator.xr?.addEventListener?.("sessionend", onSessionEnd);

        return () => {
            navigator.xr?.removeEventListener?.("sessionstart", onSessionStart);
            navigator.xr?.removeEventListener?.("sessionend", onSessionEnd);
        };
    }, []);

    const handleEnterAR = () => {
        if (arSupported) {
            store.enterAR();
        } else {
            alert("AR not supported in this browser or device.");
        }
    };

    return (
        <>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: "1rem",
                    position: "relative",
                }}
            >
                {arSupported === false ? (
                    <div style={{ color: "red", fontSize: "14px" }}>
                        ❌ WebXR AR not supported on this device.
                    </div>
                ) : (
                    <button
                        style={{
                            fontSize: "14px",
                            padding: "6px 12px",
                            backgroundColor: "#00CCCC",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                            transition: "background-color 0.2s",
                        }}
                        onClick={handleEnterAR}
                        onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor = "#00FFB9")
                        }
                        onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor = "#00CCCC")
                        }
                    >
                        Enter AR
                    </button>
                )}
            </div>

            <Canvas ref={canvasRef}>
                <XR store={store}>
                    <ambientLight intensity={1} />
                    <XRDomOverlay>
                        {!showModel && <XRCopilotUI onShowModel={() => setShowModel(true)} />}
                    </XRDomOverlay>

                    {/* <RotatingBox position={[0, 1.6, -1]} /> */}

                    {showModel && <ThreeDmodelHandler onBackToChat={() => setShowModel(false)}
                        position={[0, 1.5, -2]}
                    ></ThreeDmodelHandler>}


                </XR>
            </Canvas>
        </>
    );
};

export default WebXrCopilot;
