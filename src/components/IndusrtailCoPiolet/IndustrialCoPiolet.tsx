import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./IndustrialCoPiolet.css";

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

  const recognition = useMemo(() => {
    if (!SpeechRecognitionClass) return null;
    const rec = new SpeechRecognitionClass();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    return rec;
  }, []);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setTranscript(speechToText);
    };

    recognition.onend = () => {
      setListening(false);
    };
  }, [recognition]);

  const askOpenAI = useCallback(
    async (question: string) => {
      const userMsg: Message = { role: "user", content: question };
      setUserMessage(userMsg);
      setAssistantMessage(null);
      onNewMessage?.(userMsg);

       const url = "http://127.0.0.1:5000/generate";  



      try {
        // const res = await fetch(url, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //      "api-key": api_key
        //   },
        //   body: JSON.stringify({
        //     model: deployment,
        //     messages: [
        //       { role: "system", content: "You are a helpful assistant." },
        //       { role: "user", content: question },
        //     ],
        //   }),
        // });

        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: question
          }),
        });

        const data = await res.json();
        const answer = data?.response || "Sorry, no answer.";
        const assistantMsg: Message = { role: "assistant", content: answer };

        setAssistantMessage(assistantMsg);
        onNewMessage?.(assistantMsg);

        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(answer);
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        console.error("OpenAI error:", err);
        const fallback: Message = { role: "assistant", content: "Sorry, no answer." };
        setAssistantMessage(fallback);
        onNewMessage?.(fallback);
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

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition not supported.");
      return;
    }
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
      setListening(true);
    }
  };

  return (
    <>
      <form className="voice-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask something..."
          value={typedText}
          onChange={(e) => setTypedText(e.target.value)}
        />
        <button
          type="button"
          className={`mic-button ${listening ? "listening" : ""}`}
          onClick={toggleListening}
          title="Speak"
        >
          <span className="material-icons">mic</span>
        </button>
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
    </>
  );
}