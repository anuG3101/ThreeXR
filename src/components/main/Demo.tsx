import React from "react";
import "./Demo.css";

const ARInterface: React.FC = () => {
  return (
    <div className="ar-container">
      <div className="ar-label ar-header">AR Mode</div>

      <div className="ar-output">
        <div className="ar-label">Output</div>
        <div className="ar-text-bubble">
          Text aɏouabler reportions d'extèrier ?
        </div>
      </div>

      <div className="ar-command-box">
        <input
          className="ar-command-input"
          type="text"
          placeholder="Typing commands"
        />
        <button className="ar-mic-button">🎤</button>
      </div>
    </div>
  );
};

export default ARInterface;
