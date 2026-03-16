import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, TrendingUp, Rocket, MessageSquare, Brain, ArrowRight, CheckCircle, Star } from "lucide-react";
import { WavyBackground } from "../components/ui/wavy-background";

const FEATURES = [
  { icon: Brain,         title: "Career DNA Profiler",  desc: "NLP extracts your skills, domains, archetypes, and confidence patterns instantly.",     color: "#a78bfa", bg: "rgba(167,139,250,0.1)"  },
  { icon: TrendingUp,    title: "Career Simulator",     desc: "Model 10-year trajectories with salary ranges, milestones, and probability scores.",    color: "#67e8f9", bg: "rgba(103,232,249,0.1)"  },
  { icon: Rocket,        title: "Startup Blueprint",    desc: "TAM/SAM/SOM, revenue models, MVP plans, and investor pitch — all in one click.",        color: "#34d399", bg: "rgba(52,211,153,0.1)"   },
  { icon: MessageSquare, title: "Interview Coach",      desc: "Detects hedging and passive voice, then rewrites answers into executive-level responses.", color: "#fbbf24", bg: "rgba(251,191,36,0.1)"  },
];

const STATS = [
  { value: "4",    label: "AI-Powered Tools" },
  { value: "Free", label: "Forever, No Card" },
  { value: "10s",  label: "To First Insight" },
  { value: "GPT",  label: "Grade AI Quality" },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#060810", color: "#f0f2ff", fontFamily: "Inter, system-ui, sans-serif", overflowX: "hidden" }}>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", borderBottom: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", background: "rgba(6,8,16,0.8)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#7c6dff,#a78bfa)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(124,109,255,0.4)" }}>
            <Zap size={17} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.5 }}>EvoCareer AI</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link to="/login" style={{ color: "#8892b0", textDecoration: "none", fontSize: 14, fontWeight: 500, padding: "8px 16px", borderRadius: 8, transition: "color .15s" }}>Sign In</Link>
          <Link to="/register" style={{ background: "linear-gradient(135deg,#7c6dff,#6b5ce7)", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "10px 20px", borderRadius: 10, boxShadow: "0 4px 16px rgba(124,109,255,0.35)", display: "flex", alignItems: "center", gap: 6 }}>
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero with Wavy Background */}
      <WavyBackground
        containerClassName=""
        backgroundFill="#060810"
        colors={["#7c6dff", "#a78bfa", "#67e8f9", "#34d399", "#6b5ce7"]}
        waveOpacity={0.35}
        blur={8}
        speed="slow"
        style={{ paddingTop: 80 }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 40px", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,109,255,0.12)", border: "1px solid rgba(124,109,255,0.25)", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: "#c4b5fd", marginBottom: 32, backdropFilter: "blur(10px)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399", animation: "pulse 2s ease infinite" }} />
              Powered by Gemini AI — 100% Free, No Credit Card
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
            style={{ fontSize: "clamp(40px,7vw,76px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, marginBottom: 24 }}>
            Simulate Your<br />
            <span style={{ background: "linear-gradient(135deg,#a78bfa,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Career Future
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ fontSize: 18, color: "rgba(136,146,176,0.9)", maxWidth: 520, margin: "0 auto 16px", lineHeight: 1.7 }}>
            Profile your identity, simulate trajectories, build startup blueprints, and ace interviews — all with AI, all free.
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
            {["No credit card", "Free forever", "Instant results", "Gemini AI"].map(b => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(136,146,176,0.8)" }}>
                <CheckCircle size={13} color="#34d399" /> {b}
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" style={{ background: "linear-gradient(135deg,#7c6dff,#6b5ce7)", color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 700, padding: "16px 32px", borderRadius: 14, boxShadow: "0 4px 24px rgba(124,109,255,0.45)", display: "flex", alignItems: "center", gap: 8, backdropFilter: "blur(10px)" }}>
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" style={{ background: "rgba(255,255,255,0.06)", color: "#8892b0", textDecoration: "none", fontSize: 16, fontWeight: 500, padding: "16px 32px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
              Sign In →
            </Link>
          </motion.div>
        </div>
      </WavyBackground>

      {/* Stats bar */}
      <div style={{ background: "rgba(13,17,23,0.8)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 40px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#a78bfa", letterSpacing: -1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#4a5568", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 20, padding: "5px 14px", fontSize: 12, color: "#34d399", marginBottom: 16, fontWeight: 600 }}>
            <Star size={11} /> Four Powerful Tools
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, marginBottom: 12 }}>Everything for your career, in one place</h2>
          <p style={{ color: "#8892b0", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>Free AI-powered tools that actually help you make career decisions</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              whileHover={{ y: -6 }}
              style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 24, cursor: "default", transition: "border-color .2s, box-shadow .2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${f.color}30`; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${f.color}12`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
              <div style={{ width: 46, height: 46, background: f.bg, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <f.icon size={22} color={f.color} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: "#f0f2ff" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#8892b0", lineHeight: 1.65 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 900, margin: "0 auto 80px", padding: "0 40px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", padding: "56px 40px", background: "linear-gradient(135deg, rgba(124,109,255,0.08), rgba(103,232,249,0.04))", border: "1px solid rgba(124,109,255,0.15)", borderRadius: 28, position: "relative", overflow: "hidden" }}>
          {/* Background glow */}
          <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 400, height: 200, background: "radial-gradient(ellipse, rgba(124,109,255,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10, letterSpacing: -0.5 }}>Ready to simulate your future?</h3>
            <p style={{ color: "#8892b0", marginBottom: 28, fontSize: 15 }}>Create your free account in 30 seconds. No credit card, no catch.</p>
            <Link to="/register" style={{ background: "linear-gradient(135deg,#7c6dff,#6b5ce7)", color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 700, padding: "15px 32px", borderRadius: 13, boxShadow: "0 4px 20px rgba(124,109,255,0.4)", display: "inline-flex", alignItems: "center", gap: 8 }}>
              Create Free Account <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "24px 40px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 24, height: 24, background: "linear-gradient(135deg,#7c6dff,#a78bfa)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={12} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#f0f2ff" }}>EvoCareer AI</span>
        </div>
        <p style={{ fontSize: 12, color: "#4a5568" }}>Free AI career intelligence. No credit card required.</p>
      </footer>

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }`}</style>
    </div>
  );
}