import React from "react";

interface LoaderProps {
  size?: number;
  text?: string;
}

export const AILoader: React.FC<LoaderProps> = ({ size = 160, text = "Analyzing" }) => {
  const letters = text.split("");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #060810 0%, #0d1117 50%, #060810 100%)" }}>
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(124,109,255,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", animation: "loaderCircle 3s linear infinite" }} />
        <div style={{ display: "flex", gap: 2, zIndex: 1 }}>
          {letters.map((letter, index) => (
            <span key={index} style={{ display: "inline-block", color: "#f0f2ff", fontSize: size * 0.13, fontWeight: 700, fontFamily: "Inter, system-ui, sans-serif", opacity: 0.4, animation: "loaderLetter 2s infinite", animationDelay: `${index * 0.1}s` }}>
              {letter}
            </span>
          ))}
        </div>
      </div>
      <p style={{ color: "#4a5568", fontSize: 13, fontFamily: "Inter, system-ui, sans-serif", letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>Please wait</p>
      <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c6dff", animation: "dotPulse 1.4s ease infinite", animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
      <style>{`
        @keyframes loaderCircle {
          0%   { box-shadow: 0 6px 12px 0 #7c6dff inset, 0 12px 18px 0 #a78bfa inset, 0 0 4px 2px rgba(124,109,255,0.3); transform: rotate(0deg); }
          50%  { box-shadow: 0 6px 12px 0 #a78bfa inset, 0 12px 6px 0 #67e8f9 inset, 0 0 4px 2px rgba(103,232,249,0.3); transform: rotate(180deg); }
          100% { box-shadow: 0 6px 12px 0 #67e8f9 inset, 0 12px 18px 0 #7c6dff inset, 0 0 4px 2px rgba(124,109,255,0.3); transform: rotate(360deg); }
        }
        @keyframes loaderLetter {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          20%       { opacity: 1; transform: translateY(-6px) scale(1.1); }
          40%       { opacity: 0.6; transform: translateY(0); }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%           { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
};


