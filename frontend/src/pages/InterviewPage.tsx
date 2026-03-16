import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { Button, Badge, ScoreRing, LoadingDots } from "../components/ui";

interface InterviewResult {
  session_id: number;
  analysis: {
    confidence_score: number;
    hesitation_score: number;
    vocabulary_richness: number;
    sentiment_score: number;
    hedging_phrases: string[];
    filler_words: string[];
    passive_voice_count: number;
  };
  strong_rewrite: string;
  leadership_rewrite: string;
  key_improvements: string[];
  coaching_notes: string;
}

const EXAMPLES = [
  "I think I was kind of responsible for managing the team, and I basically tried to sort of keep everyone on track, you know?",
  "I worked on the product and I believe I made some improvements. It was maybe a challenging project but I guess it went okay.",
  "I'm not really sure but I possibly led a few initiatives and they hopefully went well for the most part.",
];

export default function InterviewPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [tab, setTab] = useState<"strong" | "leadership">("strong");
  const [error, setError] = useState("");

  const analyze = async () => {
    if (text.trim().length < 10) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await api.post("/interview/analyze", { text });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f0f2ff", marginBottom: 4 }}>
          Interview Coach
        </h2>
        <p style={{ color: "#8892b0", fontSize: 14 }}>
          Paste an interview answer to detect hesitation patterns and get confident rewrites
        </p>
      </motion.div>

      {/* Input Card */}
      <div
        style={{
          background: "#0d1117",
          border: "1px solid rgba(124,109,255,.2)",
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          boxShadow: "0 0 30px rgba(124,109,255,.05)",
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Paste your interview answer here..."
          style={{
            width: "100%",
            background: "#131720",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            color: "#f0f2ff",
            fontFamily: "inherit",
            fontSize: 14,
            outline: "none",
            padding: "14px 16px",
            lineHeight: 1.6,
            marginBottom: 12,
            resize: "none",
          }}
        />

        {/* Example buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: "#4a5568", alignSelf: "center" }}>Try an example:</span>
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => setText(ex)}
              style={{
                fontSize: 11,
                color: "#c4b5fd",
                background: "rgba(124,109,255,.08)",
                border: "1px solid rgba(124,109,255,.2)",
                borderRadius: 6,
                padding: "4px 12px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Example {i + 1}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#4a5568" }}>{text.length} characters</span>
          <Button onClick={analyze} loading={loading} disabled={text.trim().length < 10}>
            ⚡ Analyze Response
          </Button>
        </div>
        {error && (
          <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.2)", borderRadius: 8, fontSize: 13, color: "#f87171" }}>
            {error}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 0" }}>
          <LoadingDots />
          <p style={{ color: "#8892b0", fontSize: 14 }}>Analyzing communication patterns...</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Score rings */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[
                { label: "Confidence",  value: result.analysis.confidence_score,           color: "#7c6dff" },
                { label: "Sentiment",   value: result.analysis.sentiment_score * 100,       color: "#67e8f9" },
                { label: "Vocabulary",  value: result.analysis.vocabulary_richness * 100,   color: "#34d399" },
                { label: "Composure",   value: Math.max(0, 100 - result.analysis.hesitation_score), color: "#fbbf24" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "#0d1117",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 16,
                    padding: 16,
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <ScoreRing
                    value={s.value}
                    size={72}
                    color={s.value >= 60 ? "#34d399" : s.value >= 35 ? "#fbbf24" : "#f87171"}
                  />
                  <div style={{ fontSize: 11, color: "#4a5568" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Patterns Detected */}
            {(result.analysis.hedging_phrases.length > 0 || result.analysis.filler_words.length > 0) && (
              <div
                style={{
                  background: "#0d1117",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: "#f0f2ff" }}>
                  Patterns Detected
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {result.analysis.hedging_phrases.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: "#fbbf24", marginBottom: 8, fontWeight: 600 }}>
                        ⚠ Hedging Language ({result.analysis.hedging_phrases.length})
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {result.analysis.hedging_phrases.map((h) => (
                          <Badge key={h} variant="warning">"{h}"</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.analysis.filler_words.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: "#f87171", marginBottom: 8, fontWeight: 600 }}>
                        ✗ Filler Words ({result.analysis.filler_words.length})
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {result.analysis.filler_words.map((f) => (
                          <Badge key={f} variant="danger">"{f}"</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {result.analysis.passive_voice_count > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <span style={{ fontSize: 12, color: "#8892b0" }}>
                      <span style={{ color: "#f87171" }}>{result.analysis.passive_voice_count}</span> passive voice construction{result.analysis.passive_voice_count > 1 ? "s" : ""} detected — use active voice to sound more confident.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Rewrite Tabs */}
            <div
              style={{
                background: "#0d1117",
                border: "1px solid rgba(124,109,255,.2)",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 0 30px rgba(124,109,255,.05)",
              }}
            >
              {/* Tab buttons */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {[
                  { key: "strong",     label: "💪 Strong Rewrite" },
                  { key: "leadership", label: "🌟 Leadership Rewrite" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key as "strong" | "leadership")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "none",
                      background: tab === t.key ? "#7c6dff" : "#1a2030",
                      color: tab === t.key ? "#fff" : "#8892b0",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: "inherit",
                      transition: "all .15s",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Side-by-side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#f87171", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    ✗ Original
                  </div>
                  <div
                    style={{
                      background: "rgba(248,113,113,.04)",
                      border: "1px solid rgba(248,113,113,.15)",
                      borderRadius: 10,
                      padding: 16,
                      fontSize: 13,
                      color: "#8892b0",
                      lineHeight: 1.7,
                      minHeight: 100,
                    }}
                  >
                    {text}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#34d399", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    ✓ {tab === "strong" ? "Confident" : "Leadership"} Version
                  </div>
                  <div
                    style={{
                      background: "rgba(52,211,153,.04)",
                      border: "1px solid rgba(52,211,153,.15)",
                      borderRadius: 10,
                      padding: 16,
                      fontSize: 13,
                      color: "#f0f2ff",
                      lineHeight: 1.7,
                      minHeight: 100,
                    }}
                  >
                    {tab === "strong" ? result.strong_rewrite : result.leadership_rewrite}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Improvements */}
            <div
              style={{
                background: "#0d1117",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#c4b5fd" }}>
                Key Improvements Made
              </div>
              {result.key_improvements.map((imp, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <span style={{ color: "#34d399", flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 13, color: "#8892b0" }}>{imp}</span>
                </div>
              ))}
              {result.coaching_notes && (
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <span style={{ fontSize: 11, color: "#c4b5fd", fontWeight: 600 }}>
                    Coach's Note:{" "}
                  </span>
                  <span style={{ fontSize: 13, color: "#8892b0" }}>{result.coaching_notes}</span>
                </div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
