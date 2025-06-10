import React, { useState, useEffect, useMemo, useRef } from "react";
import "./IndustrialCoPiolet.css";
import { IxIcon, IxIconButton } from "@siemens/ix-react";
import roboSVG from '../../assets/images/robot.svg'; // Adjust the path if needed

export type Message = { role: "user" | "assistant"; content: string };

const SpeechRecognitionClass =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function IndustrialCoPiolet() {
    const [speaking, setSpeaking] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [typedText, setTypedText] = useState("");
    const [userMessage, setUserMessage] = useState<Message | null>(null);
    const [assistantMessage, setAssistantMessage] = useState<Message | null>(null);
    const [isListenerOn, setIsListenerOn] = useState(true);
    const [listening, setListening] = useState(false);
    const [paused, setPaused] = useState(false);

    const synthRef = useRef(window.speechSynthesis);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const recognition = useMemo(() => {
        if (!SpeechRecognitionClass) return null;
        const rec = new SpeechRecognitionClass();
        rec.lang = "en-US";
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.continuous = false;
        return rec;
    }, []);

    const askOpenAI = async (question: string) => {
        const userMsg: Message = { role: "user", content: question };
        setUserMessage(userMsg);
        setAssistantMessage(null);

        const url = "http://127.0.0.1:5000/generate";

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: question }),
            });

            const data = await res.json();
            const answer = data?.response || "Sorry, no answer.";
            const assistantMsg: Message = { role: "assistant", content: answer };

            setAssistantMessage(assistantMsg);
            listenMessage(answer);
        } catch (err) {
            console.error("OpenAI error:", err);
            const fallback: Message = { role: "assistant", content: "Sorry, no answer." };
            setAssistantMessage(fallback);
            listenMessage(fallback.content);
        }
    };

    useEffect(() => {
        if (transcript) {
            askOpenAI(transcript);
            setTranscript("");
        }
    }, [transcript]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (typedText.trim() === "") return;
        askOpenAI(typedText);
        setTypedText("");
    };

    const listenMessage = (message: string) => {
        if ("speechSynthesis" in window && isListenerOn) {
            synthRef.current.cancel(); // Cancel any ongoing speech
            const utterance = new SpeechSynthesisUtterance(message);
            utteranceRef.current = utterance;
            utterance.onstart = () => {
                setListening(true);
                setPaused(false);
            };
            utterance.onend = () => {
                setListening(false);
                setSpeaking(false);
                setPaused(false);
            };
            synthRef.current.speak(utterance);
        }
    };

    const pauseListening = () => {
        if (synthRef.current.speaking && !paused) {
            synthRef.current.pause();
            setPaused(true);
            setListening(false);
        }
    };

    const resumeListening = () => {
        if (paused) {
            synthRef.current.resume();
            setPaused(false);
            setListening(true);
        }
    };

    const clearChats = () => {
        setUserMessage(null);
        setAssistantMessage(null);
        setTypedText("");
        synthRef.current.cancel();
    };

    const toggleSpeaking = () => {
        if (!recognition) {
            alert("Speech recognition not supported.");
            return;
        }

        if (speaking) {
            recognition.stop();
            setSpeaking(false);
        } else {
            recognition.onresult = (event: any) => {
                const transcriptResult = Array.from(event.results)
                    .map((result) => (result as SpeechRecognitionResult)[0].transcript)
                    .join("");
                setTranscript(transcriptResult);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                alert("An error occurred during speech recognition: " + event.error);
                setSpeaking(false);
            };

            recognition.onend = () => {
                setSpeaking(false);
            };

            recognition.start();
            setSpeaking(true);
        }
    };

    const handlePlayPause = (message: string) => {
        if (listening && !paused) {
            pauseListening();
        } else if (paused) {
            resumeListening();
        } else {
            listenMessage(message);
        }
    };

    return (
        <div className="assistant-container">
            <div className="assistant-card">
                <div className="assistant-header">
                    <div className="assistant-bot-icon">
                        <img src={roboSVG} alt="Robo" />
                    </div>
                    <h3>How can I assist you today?</h3>
                </div>

                <form className="assistant-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Ask something..."
                        value={typedText}
                        onChange={(e) => setTypedText(e.target.value)}
                    />
                    <IxIconButton disabled={listening}
                        className={`mic-button${speaking ? " listening" : ""}`}
                        icon="microphone-filled"
                        onClick={toggleSpeaking}
                        variant={speaking ? "danger" : "primary"}
                    />
                </form>

                <div className="message-log">
                    {userMessage && (
                        <div className="message-user">
                            <div className="user-icon">
                                <IxIcon name="user-profile" />
                            </div>
                            <div style={{ flex: 1 }}>{userMessage.content}</div>
                        </div>
                    )}
                    {assistantMessage && (
                        <div
                            className="message assistant"
                            style={{
                                marginBottom: "16px",
                                display: "flex",
                                alignItems: "flex-start", // Align items to the top
                                gap: "10px"
                            }}
                        >
                            <div className="assistant-bot-icon">
                                <img src={roboSVG} alt="Robo" style={{ width: 32, height: 32 }} />
                            </div>

                            <div style={{ flex: 1 }}>
                                {assistantMessage.content}
                            </div>
                            <IxIconButton
                                className="speech-control-button"
                                icon={listening && !paused ? "circle-pause" : "circle-play"}
                                onClick={() => handlePlayPause(assistantMessage.content)}
                                style={{ marginTop: 0 }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
