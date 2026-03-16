import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import {
  Zap, LayoutDashboard, TrendingUp, Rocket,
  MessageSquare, LogOut, User, Menu, X,
} from "lucide-react";

const NAV = [
  { to: "/dashboard",           icon: LayoutDashboard, label: "Career DNA",       end: true  },
  { to: "/dashboard/simulate",  icon: TrendingUp,      label: "Career Simulator", end: false },
  { to: "/dashboard/startup",   icon: Rocket,          label: "Startup Builder",  end: false },
  { to: "/dashboard/interview", icon: MessageSquare,   label: "Interview Coach",  end: false },
];

const S: Record<string, React.CSSProperties> = {
  root:    { display:"flex", height:"100vh", background:"#060810", fontFamily:"Inter,system-ui,sans-serif", overflow:"hidden" },
  sidebar: { width:220, flexShrink:0, display:"flex", flexDirection:"column", background:"#0a0d16", borderRight:"1px solid rgba(255,255,255,0.06)" },
  logo:    { padding:"20px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:10, flexShrink:0 },
  logoIcon:{ width:34, height:34, background:"linear-gradient(135deg,#7c6dff,#a78bfa)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 16px rgba(124,109,255,0.35)", flexShrink:0 },
  logoText:{ fontWeight:800, fontSize:15, color:"#f0f2ff", letterSpacing:-0.3, whiteSpace:"nowrap" },
  nav:     { flex:1, padding:"12px 10px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" },
  footer:  { padding:"12px 10px", borderTop:"1px solid rgba(255,255,255,0.06)", flexShrink:0 },
  userRow: { display:"flex", alignItems:"center", gap:10, padding:"10px 12px", marginBottom:4 },
  avatar:  { width:32, height:32, background:"rgba(124,109,255,0.15)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  main:    { flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 },
  topbar:  { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"#0a0d16", flexShrink:0 },
  content: { flex:1, overflowY:"auto", background:"#060810" },
};

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  const navLink = (item: typeof NAV[0]) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      onClick={() => setOpen(false)}
      style={({ isActive }) => ({
        display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
        borderRadius:10, fontSize:13, fontWeight:600, textDecoration:"none",
        fontFamily:"Inter,system-ui,sans-serif", transition:"all .15s",
        background: isActive ? "rgba(124,109,255,0.12)" : "transparent",
        color:      isActive ? "#c4b5fd" : "#8892b0",
        border:     isActive ? "1px solid rgba(124,109,255,0.2)" : "1px solid transparent",
      })}
    >
      <item.icon size={15} style={{ flexShrink:0 }} />
      {item.label}
    </NavLink>
  );

  const SidebarInner = () => (
    <>
      {/* Logo */}
      <div style={S.logo}>
        <div style={S.logoIcon}><Zap size={17} color="white" /></div>
        <span style={S.logoText}>EvoCareer AI</span>
      </div>

      {/* Nav links */}
      <nav style={S.nav}>
        {NAV.map(navLink)}
      </nav>

      {/* User + logout */}
      <div style={S.footer}>
        <div style={S.userRow}>
          <div style={S.avatar}><User size={15} color="#a78bfa" /></div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#f0f2ff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {user?.full_name || "User"}
            </div>
            <div style={{ fontSize:11, color:"#4a5568", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {user?.email || ""}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 12px", borderRadius:10, border:"none", background:"transparent", color:"#8892b0", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"Inter,system-ui,sans-serif", transition:"all .15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background="rgba(248,113,113,0.08)"; (e.currentTarget as HTMLButtonElement).style.color="#f87171"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background="transparent"; (e.currentTarget as HTMLButtonElement).style.color="#8892b0"; }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div style={S.root}>

      {/* ── Desktop sidebar ── */}
      <aside style={{ ...S.sidebar, display:"flex", flexDirection:"column" }} className="ec-desktop-sidebar">
        <SidebarInner />
      </aside>

      {/* ── Mobile overlay + drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setOpen(false)}
              style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:40 }}
            />
            <motion.aside
              key="drawer"
              initial={{ x:-224 }} animate={{ x:0 }} exit={{ x:-224 }}
              transition={{ type:"spring", damping:26, stiffness:220 }}
              style={{ position:"fixed", left:0, top:0, bottom:0, width:220, zIndex:50, display:"flex", flexDirection:"column", background:"#0a0d16", borderRight:"1px solid rgba(255,255,255,0.06)" }}
            >
              <SidebarInner />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div style={S.main}>

        {/* Mobile topbar */}
        <div style={S.topbar} className="ec-mobile-topbar">
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ ...S.logoIcon, width:28, height:28 }}><Zap size={13} color="white" /></div>
            <span style={{ fontWeight:800, fontSize:14, color:"#f0f2ff" }}>EvoCareer AI</span>
          </div>
          <button onClick={() => setOpen(!open)}
            style={{ background:"none", border:"none", color:"#8892b0", cursor:"pointer", padding:6, borderRadius:8 }}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Page */}
        <main style={S.content}>
          <Outlet />
        </main>
      </div>

      {/* Responsive rules */}
      <style>{`
        .ec-desktop-sidebar { display: flex !important; }
        .ec-mobile-topbar   { display: none  !important; }
        @media (max-width: 768px) {
          .ec-desktop-sidebar { display: none  !important; }
          .ec-mobile-topbar   { display: flex  !important; }
        }
      `}</style>
    </div>
  );
}