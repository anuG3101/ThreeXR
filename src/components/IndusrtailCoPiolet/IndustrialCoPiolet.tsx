import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./IndustrialCoPiolet.css";
import { IxIcon, IxIconButton } from "@siemens/ix-react";
import roboSVG from '../../assets/images/robot.svg'; // Adjust the path as necessary

export type Message = { role: "user" | "assistant"; content: string };

interface VoiceControlProps {
    onNewMessage?: (message: Message) => void;
}

const SpeechRecognitionClass =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function IndustrialCoPiolet({ onNewMessage }: VoiceControlProps) {
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [typedText, setTypedText] = useState("");
    const [userMessage, setUserMessage] = useState<Message | null>(null);
    const [assistantMessage, setAssistantMessage] = useState<Message | null>(null);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [speaking, setSpeaking] = useState(false);
    const [paused, setPaused] = useState(false);

    const recognition = useMemo(() => {
        if (!SpeechRecognitionClass) return null;
        const rec = new SpeechRecognitionClass();
        rec.lang = "en-US";
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.continuous = true;
        return rec;
    }, []);

    const askOpenAI = useCallback(
        async (question: string) => {
            const userMsg: Message = { role: "user", content: question };
            setUserMessage(userMsg);
            setAssistantMessage(null);
            onNewMessage?.(userMsg);

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
                onNewMessage?.(assistantMsg);
                speakMessage(answer);
            } catch (err) {
                console.error("OpenAI error:", err);
                const fallback: Message = { role: "assistant", content: "Sorry, no answer." };
                setAssistantMessage(fallback);
                onNewMessage?.(fallback);
                speakMessage(fallback.content);
            }
        },
        [onNewMessage]
    );

    useEffect(() => {
        if (transcript) {
            askOpenAI(transcript);
            setTranscript("");
        }
    }, [transcript, askOpenAI]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (typedText.trim() === "") return;
        askOpenAI(typedText);
        setTypedText("");
    };

    const speakMessage = (message: string) => {
        if ("speechSynthesis" in window && isSpeakerOn) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.onstart = () => setSpeaking(true);
            utterance.onend = () => {
                setSpeaking(false);
                setPaused(false);
            };
            window.speechSynthesis.speak(utterance);
        }
    };

    const pauseSpeech = () => {
        if (window.speechSynthesis.speaking && !paused) {
            window.speechSynthesis.pause();
            setPaused(true);
        }
    };

    const resumeSpeech = () => {
        if (paused) {
            window.speechSynthesis.resume();
            setPaused(false);
        }
    };

    const toggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn);
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel(); // stop if muted
        }
    };

    const clearChats = () => {
        setUserMessage(null);
        setAssistantMessage(null);
        setTypedText("");
    };

    const toggleListening = () => {
        if (!recognition) {
            alert("Speech recognition not supported.");
            return;
        }

        if (listening) {
            recognition.stop();
            setListening(false);
        } else {
            recognition.onresult = (event: any) => {
                const transcriptResult = Array.from(event.results)
                    .map((result) => (result as SpeechRecognitionResult)[0].transcript)
                    .join("");
                setTranscript(transcriptResult);
            };

            recognition.onend = () => {
                if (listening) recognition.start();
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                setListening(false);
            };

            recognition.start();
            setListening(true);
        }
    };

    return (
        <div className="assistant-container">
            <div className="assistant-card">
                <div className="assistant-header">
                    <div className="assistant-bot-icon"> <img src={roboSVG} alt="Robo" /></div>
                    <h2>How can I assist you today?</h2>
                </div>

                <form className="assistant-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Ask something..."
                        value={typedText}
                        onChange={(e) => setTypedText(e.target.value)}
                    />
                    <IxIconButton className="mic-button" icon="microphone-filled" onClick={toggleListening} variant="primary"></IxIconButton>

                </form>

                <div className="message-log">
                    {userMessage && (
                        <div className="message user">
                            <strong>You:</strong> {userMessage.content}
                        </div>
                    )}
                    {assistantMessage && (
                        <div className="message assistant">
                            <strong>Assistant:</strong> {assistantMessage.content}
                        </div>
                    )}
                </div>
            </div>
        </div>


    );
}
