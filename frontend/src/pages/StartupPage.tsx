import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { Button, Badge, ScoreRing, LoadingDots } from "../components/ui";

interface StartupResult {
  startup_id: number;
  blueprint: {
    problem_statement: string;
    solution: string;
    target_customer: string;
    market: {
      tam: string;
      sam: string;
      som: string;
      competitors: string[];
      differentiators: string[];
    };
    revenue: {
      primary: string;
      streams: string[];
      pricing_strategy: string;
      unit_economics: string;
    };
    mvp: {
      core_features: string[];
      tech_stack: string[];
      timeline_weeks: number;
      estimated_cost: string;
      success_metrics: string[];
    };
    risks: string[];
    feasibility_score: number;
  };
  validation: {
    is_feasible: boolean;
    feasibility_score: number;
    validation_notes: string[];
    red_flags: string[];
    confidence: string;
    adjusted_timeline_weeks: number;
  };
}

interface PitchResult {
  narrative: {
    elevator_pitch: string;
    investor_narrative: string;
    tagline: string;
    unique_insight: string;
  };
}

export default function StartupPage() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StartupResult | null>(null);
  const [pitch, setPitch] = useState<PitchResult | null>(null);
  const [pitchLoading, setPitchLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (idea.trim().length < 20) return;
    setLoading(true);
    setError("");
    setResult(null);
    setPitch(null);
    try {
      const res = await api.post("/startup/generate", { idea });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Blueprint generation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const generatePitch = async () => {
    if (!result) return;
    setPitchLoading(true);
    try {
      const res = await api.post(`/startup/${result.startup_id}/pitch`);
      setPitch(res.data);
    } catch {
      // silent
    } finally {
      setPitchLoading(false);
    }
  };

  const bp = result?.blueprint;
  const val = result?.validation;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f0f2ff", marginBottom: 4 }}>
          Startup Blueprint Builder
        </h2>
        <p style={{ color: "#8892b0", fontSize: 14 }}>
          Transform your idea into a validated startup blueprint with market analysis
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
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={4}
          placeholder="e.g. A B2B SaaS platform that helps small accounting firms automate client onboarding and document collection using AI, targeting 5–50 person firms still relying on email and manual processes..."
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#4a5568" }}>{idea.length} characters</span>
          <Button onClick={generate} loading={loading} disabled={idea.trim().length < 20}>
            ⬡ Generate Blueprint
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
          <p style={{ color: "#8892b0", fontSize: 14 }}>Building your startup blueprint...</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {bp && val && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Header card */}
            <div
              style={{
                background: "#0d1117",
                border: "1px solid rgba(124,109,255,.2)",
                borderRadius: 16,
                padding: 24,
                display: "flex",
                gap: 20,
                flexWrap: "wrap",
                justifyContent: "space-between",
                boxShadow: "0 0 30px rgba(124,109,255,.05)",
              }}
            >
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  <Badge variant="success">✓ Feasible</Badge>
                  <Badge variant="brand">{val.confidence} confidence</Badge>
                  {val.red_flags.length === 0 && <Badge variant="cyan">No red flags</Badge>}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f0f2ff", marginBottom: 6 }}>
                  {bp.problem_statement}
                </h3>
                <p style={{ fontSize: 13, color: "#8892b0", lineHeight: 1.6, marginBottom: 8 }}>
                  {bp.solution}
                </p>
                <p style={{ fontSize: 12, color: "#4a5568" }}>
                  <span style={{ color: "#c4b5fd" }}>Target: </span>
                  {bp.target_customer}
                </p>
              </div>
              <ScoreRing value={val.feasibility_score * 100} label="Feasibility" color="#34d399" />
            </div>

            {/* Market Analysis */}
            <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: "#67e8f9" }}>
                ◈ Market Analysis
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
                {[["TAM", bp.market.tam], ["SAM", bp.market.sam], ["SOM", bp.market.som]].map(([l, v]) => (
                  <div key={l} style={{ background: "#131720", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, color: "#4a5568", textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f2ff", marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 6 }}>Competitors</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {bp.market.competitors.map((c) => (
                      <Badge key={c} variant="warning">{c}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 6 }}>Differentiators</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {bp.market.differentiators.map((d) => (
                      <Badge key={d} variant="success">{d}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue + MVP */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {/* Revenue */}
              <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: "#34d399" }}>💰 Revenue Model</div>
                {[
                  ["Primary", bp.revenue.primary],
                  ["Pricing", bp.revenue.pricing_strategy],
                  ["Unit Economics", bp.revenue.unit_economics],
                ].map(([label, value]) => (
                  <div key={label} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 13, color: "#f0f2ff" }}>{value}</div>
                  </div>
                ))}
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 6 }}>Revenue Streams</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {bp.revenue.streams.map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* MVP */}
              <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: "#a78bfa" }}>⚙ MVP Plan</div>
                <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#4a5568" }}>Timeline</div>
                    <div style={{ fontFamily: "monospace", color: "#a78bfa", fontWeight: 700, fontSize: 22 }}>
                      {bp.mvp.timeline_weeks}w
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#4a5568" }}>Est. Cost</div>
                    <div style={{ fontFamily: "monospace", color: "#34d399", fontWeight: 600, fontSize: 14, marginTop: 4 }}>
                      {bp.mvp.estimated_cost}
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 6 }}>Core Features</div>
                  {bp.mvp.core_features.slice(0, 4).map((f) => (
                    <div key={f} style={{ fontSize: 12, color: "#8892b0", marginBottom: 4, display: "flex", gap: 6 }}>
                      <span style={{ color: "#34d399" }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 6 }}>Tech Stack</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {bp.mvp.tech_stack.map((t) => (
                      <Badge key={t} variant="cyan">{t}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Notes */}
            {(val.validation_notes.length > 0 || val.red_flags.length > 0) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {val.validation_notes.length > 0 && (
                  <div style={{ background: "#0d1117", border: "1px solid rgba(52,211,153,.15)", borderRadius: 16, padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#34d399" }}>✓ Validation Notes</div>
                    {val.validation_notes.map((n) => (
                      <div key={n} style={{ fontSize: 13, color: "#8892b0", marginBottom: 6 }}>· {n}</div>
                    ))}
                  </div>
                )}
                {val.red_flags.length > 0 && (
                  <div style={{ background: "#0d1117", border: "1px solid rgba(248,113,113,.15)", borderRadius: 16, padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#f87171" }}>⚠ Red Flags</div>
                    {val.red_flags.map((f) => (
                      <div key={f} style={{ fontSize: 13, color: "#8892b0", marginBottom: 6 }}>· {f}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Generate Pitch Button */}
            {!pitch && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Button variant="secondary" onClick={generatePitch} loading={pitchLoading}>
                  ✦ Generate Investor Pitch
                </Button>
              </div>
            )}

            {/* Pitch */}
            {pitch && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "#0d1117",
                  border: "1px solid rgba(124,109,255,.2)",
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: "0 0 30px rgba(124,109,255,.05)",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: "#c4b5fd" }}>
                  🚀 Investor Pitch
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#a78bfa", marginBottom: 16, fontStyle: "italic" }}>
                  "{pitch.narrative.tagline}"
                </div>
                <div style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 11, color: "#c4b5fd", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                    Elevator Pitch
                  </span>
                  <p style={{ fontSize: 14, color: "#8892b0", lineHeight: 1.7, marginTop: 6 }}>
                    {pitch.narrative.elevator_pitch}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: "#c4b5fd", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                    Unique Insight
                  </span>
                  <p style={{ fontSize: 14, color: "#8892b0", lineHeight: 1.7, marginTop: 6 }}>
                    {pitch.narrative.unique_insight}
                  </p>
                </div>
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
