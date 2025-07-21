import { useState, useMemo, useEffect } from 'react';
import { ChatResponse } from '../redux/slices/localClientSlice';


const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const synthRef = window.speechSynthesis;

const useVoiceAssistant = () => {
    const [typedText, setTypedText] = useState("");
    const [userMessage, setUserMessage] = useState<string | null>(null);
    const [assistantMessage, setAssistantMessage] = useState<string | null>(null);
    const [speaking, setSpeaking] = useState(false);
    const [listening, setListening] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [paused, setPaused] = useState(false);

    const recognition = useMemo(() => {
        if (!SpeechRecognitionClass) return null;
        const rec = new SpeechRecognitionClass();
        rec.lang = "en-US";
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.continuous = false;
        return rec;
    }, []);

    const listenReply = (text: string) => {
        if (!synthRef) return;
        synthRef.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setListening(true);
        utterance.onend = () => {
            setListening(false);
            setPaused(false);
        };
        synthRef.speak(utterance);
    };


    const pauseListening = () => {
        if (synthRef.speaking && !paused) {
            synthRef.pause();
            setPaused(true);
            setListening(false);
        }
    };

    const resumeListening = () => {
        if (paused) {
            synthRef.resume();
            setPaused(false);
            setListening(true);
        } else {
            listenReply(assistantMessage || "");
            setSpeaking(false);
        }
    };


    useEffect(() => {
        const stopOnUnload = () => {
            recognition?.stop();
            window.speechSynthesis.cancel(); 
        };
        window.addEventListener("beforeunload", stopOnUnload);
        return () => window.removeEventListener("beforeunload", stopOnUnload);
    }, [recognition]);


    const askOpenAI = async (prompt: string): Promise<void> => {
        setGenerating(true);
        setUserMessage(prompt);
        setAssistantMessage(null);

        const chatId = localStorage.getItem("chatId");
        if (!chatId) {
            setAssistantMessage("Chat session not found.");
            setGenerating(false);
            return;
        }

        try {
            const reply = await ChatResponse(
                chatId,
                prompt,
                "00000000-0000-0000-0000-000000000000",
                "NoAuthRequired"
            );

            setAssistantMessage(reply);
            listenReply(reply);
        } catch (error) {
            console.error("Error sending message:", error);
            setAssistantMessage("Something went wrong. Try again later.");
        } finally {
            setGenerating(false);
        }
    };




    const toggleMic = () => {
        if (!recognition) return;
        if (speaking) {
            recognition.stop();
            setSpeaking(false);
        } else {

            recognition.onresult = (event: any) => {
                let interimTranscript = "";
                let finalTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (interimTranscript) {
                    setTypedText(interimTranscript); 
                }

                if (finalTranscript) {
                    setTypedText(finalTranscript); 
                    setTimeout(() => {
                        askOpenAI(finalTranscript);
                        setTypedText(""); 
                    }, 500); 
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                alert("An error occurred during speech recognition: " + event.error);;
            }
            recognition.onend = () => setSpeaking(false);
            recognition.start();
            setSpeaking(true);
        }
    };

    return {
        typedText,
        setTypedText,
        userMessage,
        assistantMessage,
        toggleMic,
        askOpenAI,
        speaking,
        listening,
        pauseListening,
        resumeListening,
        generating,
        stopSpeaking: () => {
            recognition?.stop();
            setSpeaking(false);
        }
    };

};

export default useVoiceAssistant;
