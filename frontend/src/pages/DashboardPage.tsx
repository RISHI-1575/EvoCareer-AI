

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { AILoader } from "../components/ui/ai-loader";
import {
  Brain, Sparkles, ChevronRight, Github, Linkedin,
  Upload, X, FileText, CheckCircle, AlertCircle, BarChart3, Target, Zap,
} from "lucide-react";

interface Result {
  profile_id: number;
  intent_label: string;
  intent_confidence: number;
  confidence_analysis: {
    confidence_score: number;
    hesitation_score: number;
    vocabulary_richness: number;
    sentiment_score: number;
    hedging_phrases: string[];
    filler_words: string[];
    passive_voice_count: number;
    power_word_count?: number;
    quantification_count?: number;
    readability_score?: number;
    avg_sentence_length?: number;
    word_count?: number;
    semantic_density?: number;
  };
  entities: {
    skills: string[];
    tools: string[];
    roles: string[];
    domains: string[];
    organizations?: string[];
  };
  persona: {
    persona_title: string;
    career_archetype: string;
    strengths: string[];
    growth_areas: string[];
    recommended_paths: string[];
    unique_value_proposition: string;
  };
  sources?: {
    has_resume: boolean;
    has_github: boolean;
    has_linkedin: boolean;
    github_data?: any;
    linkedin_data?: any;
  };
}

function Tag({ children, color = "#7c6dff", bg = "rgba(124,109,255,0.12)" }: any) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, color, background:bg, border:`1px solid ${color}30`, marginRight:4, marginBottom:4, whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
}

function ScoreRing({ value, label, size = 84 }: any) {
  const r = (size-8)/2, circ = 2*Math.PI*r, dash = circ*(Math.min(value,100)/100);
  const color = value >= 65 ? "#34d399" : value >= 35 ? "#fbbf24" : "#f87171";
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition:"stroke-dasharray 1s ease" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontWeight:800, fontSize:size*0.22, color, lineHeight:1 }}>{Math.round(value)}</span>
        {label && <span style={{ fontSize:9, color:"#4a5568", marginTop:2 }}>{label}</span>}
      </div>
    </div>
  );
}

function Bar({ value, label }: any) {
  const color = value >= 65 ? "#34d399" : value >= 35 ? "#fbbf24" : "#f87171";
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:12, color:"#8892b0" }}>{label}</span>
        <span style={{ fontSize:12, fontFamily:"monospace", color:"#f0f2ff", fontWeight:700 }}>{Math.round(value)}</span>
      </div>
      <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
        <motion.div initial={{ width:0 }} animate={{ width:`${Math.min(value,100)}%` }} transition={{ duration:0.8, ease:"easeOut" }}
          style={{ height:"100%", background:color, borderRadius:3 }}/>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [text,        setText]        = useState("");
  const [githubUrl,   setGithubUrl]   = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [resumeFile,  setResumeFile]  = useState<File|null>(null);
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState<Result|null>(null);
  const [error,       setError]       = useState("");
  const [activeTab,   setActiveTab]   = useState<"overview"|"communication"|"sources">("overview");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyze = async () => {
    if (text.trim().length < 20) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const formData = new FormData();
      formData.append("raw_text", text);
      if (githubUrl.trim())   formData.append("github_url",   githubUrl.trim());
      if (linkedinUrl.trim()) formData.append("linkedin_url", linkedinUrl.trim());
      if (resumeFile)         formData.append("resume",       resumeFile);

      const res = await api.post("/profile/analyze", formData);
      setResult(res.data);
      setActiveTab("overview");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg || JSON.stringify(e)).join(", "));
      } else {
        setError("Analysis failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AILoader text="Analyzing" size={160} />;

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 24px", fontFamily:"Inter,system-ui,sans-serif" }}>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:42, height:42, background:"rgba(167,139,250,0.12)", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Brain size={21} color="#a78bfa"/>
          </div>
          <div>
            <h2 style={{ fontSize:22, fontWeight:800, color:"#f0f2ff", letterSpacing:-0.5 }}>Career DNA Profiler</h2>
            <p style={{ fontSize:13, color:"#8892b0" }}>Add resume + LinkedIn + GitHub for the most accurate analysis</p>
          </div>
        </div>
      </motion.div>

      {/* Input Card */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        style={{ background:"#0d1117", border:"1px solid rgba(124,109,255,0.2)", borderRadius:20, padding:24, marginBottom:20, boxShadow:"0 0 40px rgba(124,109,255,0.05)" }}>

        {/* Text area */}
        <div style={{ fontSize:10, color:"#4a5568", fontWeight:700, textTransform:"uppercase", letterSpacing:1.2, marginBottom:8 }}>Your Background *</div>
        <textarea value={text} onChange={e=>setText(e.target.value)} rows={4}
          placeholder="e.g. I'm a software engineer with 6 years building full-stack products in React and Python. I've led a team of 4 at a fintech startup using Agile/Scrum, shipped 3 major products, and I'm now considering starting my own SaaS company..."
          style={{ width:"100%", background:"rgba(19,23,32,0.6)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, color:"#f0f2ff", fontFamily:"inherit", fontSize:14, outline:"none", padding:"13px 15px", lineHeight:1.7, marginBottom:16, resize:"none", boxSizing:"border-box", transition:"border-color .2s" }}
          onFocus={e=>e.target.style.borderColor="rgba(124,109,255,0.5)"}
          onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.07)"}/>

        {/* GitHub + LinkedIn */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
          {[
            { icon:<Github size={14} color="#8892b0"/>, label:"GitHub URL", placeholder:"https://github.com/username", value:githubUrl, set:setGithubUrl },
            { icon:<Linkedin size={14} color="#8892b0"/>, label:"LinkedIn URL", placeholder:"https://linkedin.com/in/username", value:linkedinUrl, set:setLinkedinUrl },
          ].map(f=>(
            <div key={f.label}>
              <div style={{ fontSize:10, color:"#4a5568", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>{f.label} <span style={{ color:"#4a5568", fontWeight:400 }}>(optional)</span></div>
              <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(19,23,32,0.6)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"9px 13px" }}>
                {f.icon}
                <input value={f.value} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder}
                  style={{ background:"none", border:"none", color:"#f0f2ff", fontFamily:"inherit", fontSize:13, outline:"none", flex:1, minWidth:0 }}/>
                {f.value && <button onClick={()=>f.set("")} style={{ background:"none", border:"none", color:"#4a5568", cursor:"pointer", padding:0, fontSize:16, lineHeight:1 }}>×</button>}
              </div>
            </div>
          ))}
        </div>

        {/* Resume upload */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, color:"#4a5568", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Resume — PDF or DOCX <span style={{ fontWeight:400 }}>(optional)</span></div>
          <label style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(19,23,32,0.4)", border:`1.5px dashed ${resumeFile?"rgba(52,211,153,0.4)":"rgba(255,255,255,0.1)"}`, borderRadius:11, padding:"11px 15px", cursor:"pointer", transition:"all .2s" }}>
            {resumeFile
              ? <><FileText size={16} color="#34d399"/><span style={{ fontSize:13, color:"#34d399", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{resumeFile.name}</span><button onClick={e=>{e.preventDefault();setResumeFile(null);}} style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer", flexShrink:0 }}><X size={14}/></button></>
              : <><Upload size={16} color="#8892b0"/><span style={{ fontSize:13, color:"#8892b0" }}>Click to upload resume (PDF or DOCX, max 5MB)</span></>
            }
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" onChange={e=>setResumeFile(e.target.files?.[0]||null)} style={{ display:"none" }}/>
          </label>
        </div>

        {/* Source badges + button */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, color:"#4a5568" }}>{text.length}/5000</span>
            {resumeFile   && <Tag color="#34d399" bg="rgba(52,211,153,0.1)">✓ Resume</Tag>}
            {githubUrl    && <Tag color="#67e8f9" bg="rgba(103,232,249,0.1)">✓ GitHub</Tag>}
            {linkedinUrl  && <Tag color="#a78bfa" bg="rgba(167,139,250,0.1)">✓ LinkedIn</Tag>}
          </div>
          <button onClick={analyze} disabled={text.trim().length<20}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 22px", background:text.trim().length<20?"rgba(124,109,255,0.3)":"linear-gradient(135deg,#7c6dff,#6b5ce7)", border:"none", borderRadius:12, color:"white", fontSize:14, fontWeight:700, cursor:text.trim().length<20?"not-allowed":"pointer", fontFamily:"inherit", boxShadow:"0 4px 16px rgba(124,109,255,0.3)", transition:"all .2s" }}>
            <Sparkles size={15}/> Analyze Profile
          </button>
        </div>

        {error && (
          <div style={{ marginTop:12, padding:"10px 14px", background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:10, fontSize:13, color:"#f87171", display:"flex", alignItems:"center", gap:8 }}>
            <AlertCircle size={14}/> {typeof error === "string" ? error : "Analysis failed. Please try again."}
          </div>
        )}
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* Persona Hero */}
            <div style={{ background:"#0d1117", border:"1px solid rgba(124,109,255,0.2)", borderRadius:20, padding:24, display:"flex", gap:18, alignItems:"flex-start", flexWrap:"wrap", boxShadow:"0 0 40px rgba(124,109,255,0.05)" }}>
              <div style={{ width:52, height:52, background:"rgba(124,109,255,0.12)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>⚡</div>
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:8 }}>
                  <Tag color="#a78bfa" bg="rgba(167,139,250,0.12)">{result.persona.career_archetype}</Tag>
                  <Tag color="#67e8f9" bg="rgba(103,232,249,0.1)">{result.intent_label.replace(/_/g," ")}</Tag>
                  <Tag color="#34d399" bg="rgba(52,211,153,0.1)">{Math.round(result.intent_confidence*100)}% match</Tag>
                  {result.sources?.has_resume   && <Tag color="#34d399"  bg="rgba(52,211,153,0.08)">📄 Resume</Tag>}
                  {result.sources?.has_github   && <Tag color="#67e8f9"  bg="rgba(103,232,249,0.08)">🐙 GitHub</Tag>}
                  {result.sources?.has_linkedin && <Tag color="#a78bfa"  bg="rgba(167,139,250,0.08)">💼 LinkedIn</Tag>}
                </div>
                <h3 style={{ fontSize:19, fontWeight:800, color:"#f0f2ff", marginBottom:6 }}>{result.persona.persona_title}</h3>
                <p style={{ fontSize:14, color:"#8892b0", lineHeight:1.65, marginBottom:10 }}>{result.persona.unique_value_proposition}</p>
                <div style={{ display:"flex", flexWrap:"wrap" }}>
                  {result.persona.recommended_paths.map(p=><Tag key={p}>{p}</Tag>)}
                </div>
              </div>
              <ScoreRing value={result.confidence_analysis.confidence_score} label="Confidence" size={86}/>
            </div>

            {/* Tab Nav */}
            <div style={{ display:"flex", gap:4, background:"rgba(13,17,23,0.8)", borderRadius:12, padding:4, border:"1px solid rgba(255,255,255,0.06)" }}>
              {([
                { id:"overview",      icon:<Target size={13}/>,   label:"Overview"      },
                { id:"communication", icon:<BarChart3 size={13}/>, label:"Communication" },
                { id:"sources",       icon:<Zap size={13}/>,       label:"Data Sources"  },
              ] as const).map(tab=>(
                <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                  style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 12px", borderRadius:9, border:"none", background:activeTab===tab.id?"rgba(124,109,255,0.15)":"transparent", color:activeTab===tab.id?"#c4b5fd":"#8892b0", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab==="overview" && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {/* Entities */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12 }}>
                  {[
                    { label:"Skills",  items:result.entities.skills,  color:"#a78bfa", bg:"rgba(167,139,250,0.1)" },
                    { label:"Tools",   items:result.entities.tools,   color:"#67e8f9", bg:"rgba(103,232,249,0.1)" },
                    { label:"Domains", items:result.entities.domains, color:"#34d399", bg:"rgba(52,211,153,0.1)"  },
                    { label:"Roles",   items:result.entities.roles,   color:"#fbbf24", bg:"rgba(251,191,36,0.1)"  },
                  ].map(({ label, items, color, bg })=>(
                    <div key={label} style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:18 }}>
                      <div style={{ fontSize:10, color:color, textTransform:"uppercase", letterSpacing:1.2, fontWeight:700, marginBottom:10 }}>{label} · {items.length}</div>
                      <div style={{ display:"flex", flexWrap:"wrap" }}>
                        {items.length>0 ? items.map(i=><Tag key={i} color={color} bg={bg}>{i}</Tag>) : <span style={{ fontSize:12, color:"#4a5568" }}>None detected</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Strengths & Growth */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:20 }}>
                    <div style={{ fontSize:11, color:"#34d399", fontWeight:700, marginBottom:10 }}>✓ Key Strengths</div>
                    {result.persona.strengths.slice(0,5).map(s=>(
                      <div key={s} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                        <ChevronRight size={12} color="#34d399" style={{ flexShrink:0 }}/>
                        <span style={{ fontSize:13, color:"#8892b0" }}>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:20 }}>
                    <div style={{ fontSize:11, color:"#fbbf24", fontWeight:700, marginBottom:10 }}>⚡ Growth Areas</div>
                    {result.persona.growth_areas.map(g=>(
                      <div key={g} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                        <ChevronRight size={12} color="#fbbf24" style={{ flexShrink:0 }}/>
                        <span style={{ fontSize:13, color:"#8892b0" }}>{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Communication Tab */}
            {activeTab==="communication" && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                  {[
                    { label:"Confidence",  value:result.confidence_analysis.confidence_score },
                    { label:"Sentiment",   value:result.confidence_analysis.sentiment_score*100 },
                    { label:"Readability", value:result.confidence_analysis.readability_score ?? 60 },
                    { label:"Vocabulary",  value:result.confidence_analysis.vocabulary_richness*100 },
                  ].map(s=>(
                    <div key={s.label} style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:16, textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                      <ScoreRing value={s.value} size={70}/>
                      <span style={{ fontSize:11, color:"#4a5568" }}>{s.label}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:20 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#8892b0", textTransform:"uppercase", letterSpacing:0.8, marginBottom:14 }}>Scores</div>
                    <Bar value={result.confidence_analysis.confidence_score}      label="Overall Confidence"/>
                    <Bar value={result.confidence_analysis.vocabulary_richness*100} label="Vocabulary Richness"/>
                    <Bar value={result.confidence_analysis.sentiment_score*100}   label="Positive Tone"/>
                    {result.confidence_analysis.readability_score != null &&
                      <Bar value={result.confidence_analysis.readability_score} label="Readability"/>}
                    {result.confidence_analysis.semantic_density != null &&
                      <Bar value={result.confidence_analysis.semantic_density*100} label="Semantic Density"/>}
                  </div>
                  <div style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:20 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#8892b0", textTransform:"uppercase", letterSpacing:0.8, marginBottom:14 }}>Patterns</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
                      {[
                        { label:"Power Words",   val:result.confidence_analysis.power_word_count??0,              good:true  },
                        { label:"Quantified",    val:result.confidence_analysis.quantification_count??0,           good:true  },
                        { label:"Hedging",        val:result.confidence_analysis.hedging_phrases.length,           good:false },
                        { label:"Passive Voice",  val:result.confidence_analysis.passive_voice_count,              good:false },
                      ].map(s=>(
                        <div key={s.label} style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"10px 12px" }}>
                          <div style={{ fontSize:10, color:"#4a5568", marginBottom:3 }}>{s.label}</div>
                          <div style={{ fontFamily:"monospace", fontSize:22, fontWeight:800, color: s.good?(s.val>0?"#34d399":"#f87171"):(s.val>2?"#f87171":s.val>0?"#fbbf24":"#34d399") }}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                    {result.confidence_analysis.hedging_phrases.length>0 && (
                      <div>
                        <div style={{ fontSize:11, color:"#fbbf24", fontWeight:600, marginBottom:6 }}>Hedging phrases:</div>
                        <div style={{ display:"flex", flexWrap:"wrap" }}>
                          {result.confidence_analysis.hedging_phrases.map(h=><Tag key={h} color="#fbbf24" bg="rgba(251,191,36,0.08)">"{h}"</Tag>)}
                        </div>
                      </div>
                    )}
                    <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.05)", fontSize:11, color:"#4a5568", display:"flex", gap:16 }}>
                      {result.confidence_analysis.word_count != null && <span>Words: <strong style={{ color:"#f0f2ff" }}>{result.confidence_analysis.word_count}</strong></span>}
                      {result.confidence_analysis.avg_sentence_length != null && <span>Avg sentence: <strong style={{ color:"#f0f2ff" }}>{result.confidence_analysis.avg_sentence_length}w</strong></span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Sources Tab */}
            {activeTab==="sources" && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                  {[
                    { label:"Resume",   icon:<FileText size={22}/>,  active:result.sources?.has_resume??false,   color:"#34d399" },
                    { label:"GitHub",   icon:<Github size={22}/>,    active:result.sources?.has_github??false,   color:"#67e8f9" },
                    { label:"LinkedIn", icon:<Linkedin size={22}/>,  active:result.sources?.has_linkedin??false, color:"#a78bfa" },
                  ].map(s=>(
                    <div key={s.label} style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:24, textAlign:"center" }}>
                      <div style={{ color:s.active?s.color:"#4a5568", marginBottom:10 }}>{s.icon}</div>
                      <div style={{ fontSize:14, fontWeight:600, color:s.active?s.color:"#4a5568", marginBottom:4 }}>{s.label}</div>
                      <div style={{ fontSize:12, color:s.active?"#34d399":"#4a5568", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                        {s.active ? <><CheckCircle size={12}/> Used</> : "Not provided"}
                      </div>
                    </div>
                  ))}
                </div>

                {result.sources?.github_data && (
                  <div style={{ background:"#0d1117", border:"1px solid rgba(103,232,249,0.15)", borderRadius:16, padding:20 }}>
                    <div style={{ fontSize:11, color:"#67e8f9", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:14 }}>🐙 GitHub Data</div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
                      {[
                        { label:"Repos", val:result.sources.github_data.public_repos },
                        { label:"Stars",  val:result.sources.github_data.total_stars  },
                        { label:"Followers", val:result.sources.github_data.followers },
                      ].map(s=>(
                        <div key={s.label} style={{ background:"rgba(103,232,249,0.05)", border:"1px solid rgba(103,232,249,0.1)", borderRadius:10, padding:"12px", textAlign:"center" }}>
                          <div style={{ fontSize:22, fontWeight:800, color:"#67e8f9" }}>{s.val}</div>
                          <div style={{ fontSize:11, color:"#4a5568" }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {result.sources.github_data.top_languages?.length>0 && (
                      <div>
                        <div style={{ fontSize:11, color:"#4a5568", marginBottom:6 }}>Top Languages</div>
                        <div style={{ display:"flex", flexWrap:"wrap" }}>
                          {result.sources.github_data.top_languages.map((l:string)=><Tag key={l} color="#67e8f9" bg="rgba(103,232,249,0.08)">{l}</Tag>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!result.sources?.has_github && !result.sources?.has_linkedin && !result.sources?.has_resume && (
                  <div style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:32, textAlign:"center" }}>
                    <div style={{ fontSize:28, marginBottom:10 }}>💡</div>
                    <p style={{ fontSize:14, color:"#8892b0", marginBottom:4 }}>Add more sources for a richer analysis</p>
                    <p style={{ fontSize:12, color:"#4a5568" }}>Upload resume, add GitHub URL or LinkedIn profile above and re-analyze</p>
                  </div>
                )}
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}