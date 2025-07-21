import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./XRCopilotUI.css";
import useVoiceAssistant from "../voiceAssistant";
import micIcon from "../../assets/images/white-mic.svg"; 
import onMicIcon from "../../assets/images/on-mic-icon.svg";

interface ChatMessage {
    role: "user" | "bot";
    text: string;
}

const MAX_PREVIEW_LENGTH = 50;

const XRCopilotUI: React.FC = () => {
    const [inputText, setInputText] = useState("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        userMessage,
        assistantMessage,
        toggleMic,
        typedText,
        setTypedText
    } = useVoiceAssistant();

    useEffect(() => {
        // Optional: handle userMessage if needed
    }, [userMessage]);

    useEffect(() => {
        if (assistantMessage) {
            setIsExpanded(false); // Reset dropdown state
            setChatMessages(prev => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;

                if (
                    updated[lastIndex]?.role === "bot" &&
                    updated[lastIndex].text.startsWith("Analyzing")
                ) {
                    updated[lastIndex] = { role: "bot", text: assistantMessage };
                } else {
                    updated.push({ role: "bot", text: assistantMessage });
                }

                return updated;
            });
        }
    }, [assistantMessage]);

    const handleCommandSubmit = () => {
        const command = typedText || inputText;
        if (!command.trim()) return;

        const analyzingMessage = `Analyzing: "${command}"...`;

        setIsExpanded(false);
        setChatMessages([{ role: "bot", text: analyzingMessage }]);
        setInputText("");
        setTypedText("");
    };

    return (
        <div className="xr-interface-container">
            <div className="xr-chat-panel">
                <AnimatePresence initial={false}>
                    {chatMessages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className={`xr-chat-message ${msg.role}`}
                        >
                            <strong className="xr-chat-label">
                                {msg.role === "bot" ? "Output" : ""}
                            </strong>
                            <div className={`xr-chat-bubble ${msg.role}`}>
                                {msg.text.startsWith("Analyzing:") ? (
                                    <>
                                        <motion.span
                                            animate={{ opacity: [0.2, 1, 0.2] }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                        >
                                            {isExpanded || msg.text.length <= MAX_PREVIEW_LENGTH + 20
                                                ? msg.text
                                                : msg.text.slice(0, MAX_PREVIEW_LENGTH) + "..."}
                                        </motion.span>
                                        {msg.text.length > MAX_PREVIEW_LENGTH + 20 && (
                                            <button
                                                className="xr-toggle-button"
                                                onClick={() => setIsExpanded(prev => !prev)}
                                            >
                                                {isExpanded ? "Show Less ▲" : "Show More ▼"}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="xr-command-box">
                <input
                    className="xr-command-input"
                    type="text"
                    value={typedText || inputText}
                    onChange={(e) => {
                        setInputText(e.target.value);
                        setTypedText("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleCommandSubmit()}
                    placeholder="Typing commands"
                />

                <motion.button
                    className="xr-send-button"
                    onClick={handleCommandSubmit}
                    whileTap={{ scale: 0.9 }}
                    disabled={!inputText.trim() && !typedText.trim()}
                >
                    ➤
                </motion.button>

                <motion.button
                    className="xr-mic-button"
                    onClick={toggleMic}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    <img
                        src={micIcon}
                        alt="Microphone"
                        width="20"
                        height="20"
                    />
                    </motion.button>
            </div>
        </div>
    );
};

export default XRCopilotUI;
