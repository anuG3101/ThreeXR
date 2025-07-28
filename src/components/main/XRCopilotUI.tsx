import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as echarts from "echarts";
import "./XRCopilotUI.css";
import useVoiceAssistant from "../voiceAssistant";
import micIcon from "../../assets/images/white-mic.svg";
import onMicIcon from "../../assets/images/on-mic.svg";
import { ChatResponse } from "../redux/slices/localClientSlice";
import ChartContainer from "../charts/ChartContainer";

interface ChatMessage {
    role: "user" | "bot";
    text: string;
}

const MAX_PREVIEW_LENGTH = 50;

interface XRCopilotUIProps {
    onShowModel: () => void;
}

const XRCopilotUI: React.FC<XRCopilotUIProps> = ({ onShowModel }) => {
    const [inputText, setInputText] = useState("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);
    const [showChart, setShowChart] = useState(false);
    const [chartType, setChartType] = useState<"bar" | "gauge" | "line">("bar");

    const {
        typedText,
        setTypedText,
        userMessage,
        assistantMessage,
        toggleMic,
        speaking,
        stopSpeaking
    } = useVoiceAssistant();

    // const renderChart = () => {
    //     const barChartContainer = document.getElementById("bar-chart");
    //     const gaugeChartContainer = document.getElementById("gauge-chart");

    //     if (barChartContainer) {
    //         const barChart = echarts.init(barChartContainer);
    //         barChart.setOption({
    //             title: { text: "Bar Chart" },
    //             tooltip: {},
    //             xAxis: {
    //                 type: "category",
    //                 data: ["A", "B", "C", "D", "E"]
    //             },
    //             yAxis: {
    //                 type: "value"
    //             },
    //             series: [
    //                 {
    //                     name: "Demo",
    //                     type: "bar",
    //                     data: [5, 20, 36, 10, 10]
    //                 }
    //             ]
    //         });
    //     }

    //     if (gaugeChartContainer) {
    //         const gaugeChart = echarts.init(gaugeChartContainer);
    //         gaugeChart.setOption({
    //             title: { text: "Gauge Chart" },
    //             series: [
    //                 {
    //                     type: "gauge",
    //                     progress: { show: true },
    //                     detail: {
    //                         valueAnimation: true,
    //                         formatter: '{value}%'
    //                     },
    //                     data: [
    //                         { value: 60, name: 'Performance' }
    //                     ]
    //                 }
    //             ]
    //         });
    //     }
    // };

    // useEffect(() => {
    //     if (showChart) {
    //         setTimeout(renderChart, 100);
    //     }
    // }, [showChart]);

    useEffect(() => {
        if (userMessage) {
            setChatMessages(prev => [
                ...prev,
                { role: "user", text: userMessage },
                { role: "bot", text: `Analyzing: "${userMessage}"...` }
            ]);
        }
    }, [userMessage]);

    useEffect(() => {
        if (assistantMessage) {
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

    const handleCommandSubmit = async () => {
        setInputText("");
        setTypedText("");
        const command = (typedText || inputText).trim();
        if (!command) return;

        const chatId = localStorage.getItem("chatId") ?? "0";
        // if (!chatId) {
        //     setChatMessages(prev => [...prev, { role: "bot", text: "Chat session not found." }]);
        //     return;
        // }

        if ((command.toLowerCase().includes("show") || command.toLowerCase().includes("create")) &&
            (command.toLowerCase().includes("chart") || command.toLowerCase().includes("meter"))) {

            setShowChart(true);

            const chartMap: Record<string, "bar" | "gauge" | "line"> = {
                bar: "bar",
                gauge: "gauge",
                "gauge meter": "gauge",
                line: "line",
                linear: "line"
            };

            const matchedKey = Object.keys(chartMap).find(key => command.toLowerCase().includes(key));
            const chartType = matchedKey ? chartMap[matchedKey] : "bar";

            setChartType(chartType);
        }


        if (command.toLowerCase().includes('show') && (command.toLowerCase().includes('robotic arm') || command.toLowerCase().includes('plc'))) {
            onShowModel(); // Notify parent to show 3D model
        }


        setChatMessages(prev => [
            ...prev,
            { role: "user", text: command },
            { role: "bot", text: `Analyzing: "${command}"...` }
        ]);

        try {
            const reply = await ChatResponse(
                chatId, // Use chatId from localStorage or default to 0
                command,
                "00000000-0000-0000-0000-000000000000",
                "NoAuthRequired"
            );

            setChatMessages(prev => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                if (updated[lastIndex]?.text.startsWith("Analyzing")) {
                    updated[lastIndex] = { role: "bot", text: reply };
                } else {
                    updated.push({ role: "bot", text: reply });
                }
                return updated;
            });
        } catch {
            setChatMessages(prev => [...prev, { role: "bot", text: "Failed to get response." }]);
        }
    };




    return (
        <div className="xr-interface-container">
            <div className={`xr-chat-panel ${showChart ? "half" : "full"}`}>
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
                            <div className="xr-chat-label-row">
                                {msg.role === "bot" && <strong className="xr-chat-label">Output</strong>}
                            </div>

                            <div className={`xr-chat-bubble ${msg.role}`}>
                                {msg.text.startsWith("Analyzing:") ? (
                                    <>
                                        <motion.span
                                            animate={{ opacity: [0.2, 1, 0.2] }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                        >
                                            {expandedIndexes.includes(idx) || msg.text.length <= MAX_PREVIEW_LENGTH
                                                ? msg.text
                                                : msg.text.slice(0, MAX_PREVIEW_LENGTH) + "..."}
                                        </motion.span>
                                        {msg.text.length > MAX_PREVIEW_LENGTH && (
                                            <button
                                                className="xr-toggle-button"
                                                onClick={() =>
                                                    setExpandedIndexes(prev =>
                                                        prev.includes(idx)
                                                            ? prev.filter(i => i !== idx)
                                                            : [...prev, idx]
                                                    )
                                                }
                                            >
                                                {expandedIndexes.includes(idx) ? "Show Less ▲" : "Show More ▼"}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    msg.text
                                )}
                            </div>

                            <div>
                                <button className="xr-stop-button" onClick={stopSpeaking}>
                                    <strong>Stop</strong> 🔇
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

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
                            src={speaking ? onMicIcon : micIcon}
                            alt="Microphone"
                            width="20"
                            height="20"
                        />
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {showChart && (
                    <motion.div
                        className="xr-chart-panel"
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    >
                        <div className="xr-chart-header">
                            <button className="xr-close-button" onClick={() => setShowChart(false)}>
                                ✖ Close
                            </button>
                        </div>

                        <div className="xr-chart-container">
                            {/* <div id="bar-chart" className="xr-chart-box" />
                            <div id="gauge-chart" className="xr-chart-box" /> */}

                            <ChartContainer
                                chartType={chartType}
                                chartId={`${chartType}-chart`}
                                title={`${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`}
                                width="100%"
                                height="250px"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default XRCopilotUI;
