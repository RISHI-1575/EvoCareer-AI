import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { Button, Badge, ScoreRing, LoadingDots } from "../components/ui";

interface Profile {
  id: number;
  intent_label: string;
  confidence_score: number;
  skills: string[];
  roles: string[];
  domains: string[];
  created_at: string;
}

interface Milestone {
  year: number;
  title: string;
  role: string;
  skills_needed: string[];
  salary_range: string;
  probability: number;
}

interface SimResult {
  simulation_id: number;
  output: {
    simulation_type: string;
    summary: string;
    milestones: Milestone[];
    risks: string[];
    opportunities: string[];
    feasibility_score: number;
    recommended_actions: string[];
  };
}

const SIM_TYPES = [
  { value: "5_year_plan",    label: "5-Year Career Plan", icon: "🎯" },
  { value: "career_switch",  label: "Career Switch",      icon: "🔄" },
  { value: "promotion_path", label: "Promotion Path",     icon: "📈" },
  { value: "freelance_path", label: "Freelance Path",     icon: "💼" },
];

export default function SimulatePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
  const [simType, setSimType] = useState("5_year_plan");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/profile/list").then((res) => {
      setProfiles(res.data);
      if (res.data.length > 0) setSelectedProfile(res.data[0].id);
    }).catch(() => {});
  }, []);

  const run = async () => {
    if (!selectedProfile) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await api.post("/simulation/run", {
        profile_id: selectedProfile,
        simulation_type: simType,
        additional_context: context || undefined,
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Simulation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f0f2ff", marginBottom: 4 }}>
          Career Simulator
        </h2>
        <p style={{ color: "#8892b0", fontSize: 14 }}>
          Model your professional trajectory with AI-powered path analysis
        </p>
      </motion.div>

      {/* Config Card */}
      <div
        style={{
          background: "#0d1117",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Profile selector */}
          <div>
            <div style={{ fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              Select Profile
            </div>
            {profiles.length === 0 ? (
              <div style={{ padding: "12px 14px", background: "#131720", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, fontSize: 13, color: "#4a5568" }}>
                No profiles yet — create one on the Dashboard first
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProfile(p.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: `1px solid ${selectedProfile === p.id ? "rgba(124,109,255,.4)" : "rgba(255,255,255,0.07)"}`,
                      background: selectedProfile === p.id ? "rgba(124,109,255,.1)" : "#131720",
                      color: selectedProfile === p.id ? "#c4b5fd" : "#8892b0",
                      cursor: "pointer",
                      fontSize: 13,
                      fontFamily: "inherit",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: selectedProfile === p.id ? "#7c6dff" : "#4a5568", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div>{p.intent_label?.replace(/_/g, " ") || "Career Profile"}</div>
                      <div style={{ fontSize: 11, color: "#4a5568", marginTop: 1 }}>
                        {p.skills?.slice(0, 3).join(", ")}
                      </div>
                    </div>
                    {selectedProfile === p.id && <Badge variant="brand">Active</Badge>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sim type selector */}
          <div>
            <div style={{ fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              Simulation Type
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SIM_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSimType(t.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: `1px solid ${simType === t.value ? "rgba(124,109,255,.4)" : "rgba(255,255,255,0.07)"}`,
                    background: simType === t.value ? "rgba(124,109,255,.1)" : "#131720",
                    color: simType === t.value ? "#c4b5fd" : "#8892b0",
                    cursor: "pointer",
                    fontSize: 13,
                    fontFamily: "inherit",
                  }}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Optional context */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Additional Context (optional)
          </div>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
            placeholder="e.g. I want to eventually lead a team of 10+ engineers..."
            style={{
              width: "100%",
              background: "#131720",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              color: "#f0f2ff",
              fontFamily: "inherit",
              fontSize: 13,
              outline: "none",
              padding: "10px 14px",
              resize: "none",
            }}
          />
        </div>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {error && <span style={{ fontSize: 13, color: "#f87171" }}>{error}</span>}
          <div style={{ marginLeft: "auto" }}>
            <Button onClick={run} loading={loading} disabled={!selectedProfile}>
              ◎ Run Simulation
            </Button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 0" }}>
          <LoadingDots />
          <p style={{ color: "#8892b0", fontSize: 14 }}>Modeling your career trajectory...</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Summary */}
            <div
              style={{
                background: "#0d1117",
                border: "1px solid rgba(124,109,255,.2)",
                borderRadius: 16,
                padding: 24,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 16,
                boxShadow: "0 0 30px rgba(124,109,255,.05)",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <Badge variant="brand">{result.output.simulation_type}</Badge>
                  <Badge variant="success">Validated ✓</Badge>
                </div>
                <p style={{ fontSize: 14, color: "#8892b0", lineHeight: 1.7 }}>
                  {result.output.summary}
                </p>
              </div>
              <ScoreRing
                value={result.output.feasibility_score * 100}
                label="Feasibility"
                color="#34d399"
              />
            </div>

            {/* Timeline */}
            <div
              style={{
                background: "#0d1117",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 20, color: "#8892b0" }}>
                Career Timeline
              </div>
              <div style={{ position: "relative", paddingLeft: 36 }}>
                <div style={{ position: "absolute", left: 11, top: 0, bottom: 0, width: 1, background: "#1a2030" }} />
                {result.output.milestones.map((m, i) => (
                  <motion.div
                    key={m.year}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      position: "relative",
                      marginBottom: i < result.output.milestones.length - 1 ? 24 : 0,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: -36,
                        top: 2,
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: "rgba(124,109,255,.15)",
                        border: "1px solid rgba(124,109,255,.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        fontFamily: "monospace",
                        color: "#c4b5fd",
                        fontWeight: 700,
                      }}
                    >
                      {m.year}y
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                      <Badge variant="brand">{m.role}</Badge>
                      <Badge variant="success">{m.salary_range}</Badge>
                      <Badge variant="cyan">{Math.round(m.probability * 100)}% likely</Badge>
                    </div>
                    <div style={{ fontSize: 13, color: "#8892b0" }}>
                      Skills needed: {m.skills_needed.join(", ")}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Risks & Opportunities */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#fbbf24" }}>⚠ Risks</div>
                {result.output.risks.map((r) => (
                  <div key={r} style={{ fontSize: 13, color: "#8892b0", marginBottom: 6 }}>· {r}</div>
                ))}
              </div>
              <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#34d399" }}>✦ Opportunities</div>
                {result.output.opportunities.map((o) => (
                  <div key={o} style={{ fontSize: 13, color: "#8892b0", marginBottom: 6 }}>· {o}</div>
                ))}
              </div>
            </div>

            {/* Recommended Actions */}
            <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#c4b5fd" }}>Recommended Actions</div>
              {result.output.recommended_actions.map((a, i) => (
                <div key={a} style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: "#7c6dff", minWidth: 24 }}>
                    0{i + 1}
                  </span>
                  <span style={{ fontSize: 13, color: "#8892b0" }}>{a}</span>
                </div>
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
