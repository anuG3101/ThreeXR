import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./IndustrialCoPiolet.css";
import { IxIcon, IxIconButton } from "@siemens/ix-react";
import roboSVG from '../../assets/images/robot.svg';

export type Message = { role: "user" | "assistant"; content: string; speaking: boolean };

interface VoiceControlProps {
    onNewMessage?: (message: Message) => void;
}

const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function IndustrialCoPiolet({ onNewMessage }: VoiceControlProps) {
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [typedText, setTypedText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);

    const recognition = useMemo(() => {
        if (!SpeechRecognitionClass) return null;
        const rec = new SpeechRecognitionClass();
        rec.lang = "en-US";
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.continuous = true;
        return rec;
    }, []);

    const askOpenAI = useCallback(async (question: string) => {
        const userMsg: Message = { role: "user", content: question, speaking: false };
        setMessages((prev) => [...prev, userMsg]);
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
            const assistantMsg: Message = { role: "assistant", content: answer, speaking: false };

            setMessages((prev) => [...prev, assistantMsg]);
            onNewMessage?.(assistantMsg);
            speakMessage(assistantMsg);
        } catch (err) {
            console.error("OpenAI error:", err);
            const fallback: Message = { role: "assistant", content: "Sorry, no answer.", speaking: false };
            setMessages((prev) => [...prev, fallback]);
            onNewMessage?.(fallback);
            speakMessage(fallback);
        }
    }, [onNewMessage]);

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

    const speakMessage = (message: Message) => {
        if ("speechSynthesis" in window && isSpeakerOn) {
            const utterance = new SpeechSynthesisUtterance(message.content);
            utterance.onstart = () => updateMessageSpeaking(message.content, true);
            utterance.onend = () => updateMessageSpeaking(message.content, false);
            window.speechSynthesis.speak(utterance);
        }
    };

    const pauseSpeech = (messageContent: string) => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            updateMessageSpeaking(messageContent, false);
        }
    };

    const resumeSpeech = (messageContent: string) => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            updateMessageSpeaking(messageContent, true);
        }
    };

    const updateMessageSpeaking = (messageContent: string, isSpeaking: boolean) => {
        setMessages(prevMessages => 
            prevMessages.map(msg => 
                msg.content === messageContent ? { ...msg, speaking: isSpeaking } : msg
            )
        );
    };

    const toggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn);
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
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
                    <h3>How can I assist you today?</h3>
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
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.role}`}>
                            <strong>{message.role === "user" ? "You" : "Assistant"}:</strong> {message.content}
                            {message.role === "assistant" && (
                                <IxIconButton
                                    className="speech-control-button"
                                    icon={message.speaking ? "circle-pause" : "play"} // Replace with actual icon classes or Font Awesome icons
                                    onClick={() => message.speaking ? pauseSpeech(message.content) : resumeSpeech(message.content)}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}