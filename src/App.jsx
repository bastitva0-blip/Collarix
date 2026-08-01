import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import {
  PawPrint, QrCode, Bell, BookOpen, Settings, Home, ChevronRight,
  Plus, Camera, MapPin, Droplets, Utensils, Stethoscope, Trash2,
  Edit3, X, Check, Clock, Calendar, Weight, Ruler, Heart,
  AlertCircle, Phone, Mail, User, ChevronLeft, LogOut, Search,
  Activity, Shield, Syringe, Pill, Scissors, Star, ArrowRight,
  Dog, Cat, Wifi, Battery, Share2, Download, Eye, ThumbsUp,
  MessageCircle, Filter, SortAsc, MoreVertical, Zap, Navigation,
  RefreshCw, CheckCircle, XCircle, Info, TrendingUp, BarChart2,
  Moon, Sun, Flame, Wind, Leaf, Coffee, Loader, Lock, FileText,
  Cookie, Bell as BellIcon, ExternalLink
} from "lucide-react";
import { supabase } from "./supabaseClient";
import collarixLogo from "./collarix-logo.svg";
import QRCodeStyling from "qr-code-styling";

// ── THEME SYSTEM ──────────────────────────────────────────────────────────────
const ThemeCtx = createContext({ dark: false, t: {} });
const useTheme = () => useContext(ThemeCtx);

function getTheme(dark) {
  return dark ? {
    bg: "#101410", card: "#181E16", card2: "#131711",
    border: "#1F2B1C", borderInput: "#263222",
    text: "#D8E4D4", textSub: "#6A9062", textMuted: "#3A5032",
    inputBg: "#101410", accentBg: "#1A2818",
    shadow: "0 2px 12px rgba(0,0,0,0.55)", shadowMd: "0 6px 24px rgba(0,0,0,0.65)",
    overlay: "rgba(0,0,0,0.72)", errBg: "#2C1414", errText: "#EF9090",
    okBg: "#122412", okText: "#5DBF5D", warnBg: "#2A1E0A", warnText: "#C9A040",
    pillBg: "#1A2818", pillText: "#68A060", sepLine: "#1C271A",
  } : {
    bg: "#F7F5F0", card: "#FFFFFF", card2: "#F7F9F6",
    border: "#F0F4EC", borderInput: "#E8EDE4",
    text: "#2C3520", textSub: "#7A8B6A", textMuted: "#9AA88A",
    inputBg: "#FAFAF8", accentBg: "#F0F4EC",
    shadow: "0 2px 10px rgba(0,0,0,0.05)", shadowMd: "0 4px 20px rgba(0,0,0,0.08)",
    overlay: "rgba(0,0,0,0.5)", errBg: "#FFEBEE", errText: "#C62828",
    okBg: "#E8F4E8", okText: "#2E7D32", warnBg: "#FFF3E0", warnText: "#E65100",
    pillBg: "#F0F4EC", pillText: "#4A6741", sepLine: "#F0F4EC",
  };
}

function iStyle(t) {
  return {
    border: `1.5px solid ${t.borderInput}`, borderRadius: 11, padding: "12px 14px",
    fontSize: 14, color: t.text, outline: "none", background: t.inputBg,
    width: "100%", boxSizing: "border-box",
  };
}

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const REMINDER_ICONS = {
  feeding: Utensils, water: Droplets, litter: Trash2,
  medication: Pill, vaccination: Syringe, vet: Stethoscope,
  grooming: Scissors, custom: Bell
};
const REMINDER_COLORS = {
  feeding: "#A8C5A0", water: "#9DB8C8", litter: "#D4C5A9",
  medication: "#C9A84C", vaccination: "#B8A9C9", vet: "#C4956A",
  grooming: "#D4B8C0", custom: "#8B9E6B"
};
const PET_COLORS = ["#D4A853","#A8C5A0","#9DB8C8","#B8A9C9","#C4956A","#8B9E6B","#D4B8C0","#C9A84C"];

// ── UTILITIES ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    "up-to-date": { label: "Up to date", bg: "#E8F4E8", color: "#3A7A3A" },
    "due-soon": { label: "Due soon", bg: "#FFF3E0", color: "#E65100" },
    "overdue": { label: "Overdue", bg: "#FFEBEE", color: "#B71C1C" },
  };
  const s = map[status] || { label: status, bg: "#F5F5F5", color: "#555" };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

function Avatar({ pet, size = 52 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `${pet.color || "#D4A853"}30`, border: `2px solid ${pet.color || "#D4A853"}60`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.45, flexShrink: 0
    }}>
      {pet.photo || (pet.species === "cat" ? "🐱" : "🐕")}
    </div>
  );
}

function SectionCard({ title, children }) {
  const { t } = useTheme();
  return (
    <div style={{ background: t.card, borderRadius: 16, padding: "14px 16px", marginBottom: 12, boxShadow: t.shadow }}>
      <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: t.textSub, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</h4>
      {children}
    </div>
  );
}

function Spinner() {
  return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Loader size={28} color="#4A6741" style={{ animation: "spin 1s linear infinite" }} /></div>;
}

function toast(msg) {
  const el = document.createElement("div");
  el.textContent = msg;
  Object.assign(el.style, {
    position: "fixed", bottom: "90px", left: "50%", transform: "translateX(-50%)",
    background: "#2C3520", color: "white", padding: "10px 20px", borderRadius: 12,
    fontSize: 13, fontWeight: 600, zIndex: 99999, boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
    maxWidth: "320px", textAlign: "center", animation: "fadeInUp 0.25s ease"
  });
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity 0.3s"; setTimeout(() => el.remove(), 300); }, 2200);
}

function today() { return new Date().toISOString().slice(0, 10); }

// ── BOTTOM SHEET MODAL ────────────────────────────────────────────────────────
function Sheet({ onClose, children, maxH = "90vh" }) {
  const { t } = useTheme();
  return (
    <div style={{ position: "fixed", inset: 0, background: t.overlay, zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: t.card, borderRadius: "22px 22px 0 0", padding: "8px 0 0", width: "100%", maxWidth: 430, maxHeight: maxH, overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: t.borderInput, margin: "0 auto 16px" }} />
        {children}
      </div>
    </div>
  );
}

function SheetTitle({ children, onClose }) {
  const { t } = useTheme();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 20px 18px" }}>
      <h3 style={{ margin: 0, fontFamily: "'Georgia', serif", fontSize: 20, color: t.text }}>{children}</h3>
      <button onClick={onClose} style={{ background: t.accentBg, border: "none", borderRadius: 20, padding: "6px 10px", cursor: "pointer" }}>
        <X size={16} color={t.textSub} />
      </button>
    </div>
  );
}

// ── TOGGLE SWITCH ─────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button onClick={onChange} style={{ width: 44, height: 26, borderRadius: 20, border: "none", background: value ? "#4A6741" : "#9AA88A", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 4, left: value ? 22 : 4, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

// ── PWA INSTALL ───────────────────────────────────────────────────────────────
function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) { setIsInstalled(true); return; }
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setCanInstall(true); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => { setIsInstalled(true); setCanInstall(false); });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  async function promptInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null); setCanInstall(false);
  }
  return { canInstall, isInstalled, promptInstall };
}

function InstallBanner({ onInstall, onDismiss }) {
  return (
    <div style={{
      position: "fixed", bottom: 88, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 32px)", maxWidth: 398,
      background: "linear-gradient(135deg, #2C3520 0%, #4A6741 100%)",
      borderRadius: 18, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 8px 32px rgba(44,53,32,0.35)", zIndex: 99998, animation: "slideUp 0.35s cubic-bezier(.22,.68,0,1.2)"
    }}>
      <img src={collarixLogo} alt="" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: "#F7F5F0", padding: 4 }} />
      <div style={{ flex: 1 }}>
        <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>Install Collarix</div>
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 2 }}>Add to home screen for quick access</div>
      </div>
      <button onClick={onInstall} style={{ background: "#F7F5F0", color: "#2C3520", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 800, fontSize: 12, cursor: "pointer", flexShrink: 0 }}>Install</button>
      <button onClick={onDismiss} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 4 }}><X size={16} /></button>
    </div>
  );
}

function IOSInstallModal({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999999, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: "24px 24px 0 0", padding: "24px 24px 40px", width: "100%", maxWidth: 430, boxShadow: "0 -8px 40px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={collarixLogo} alt="" style={{ width: 36, height: 36, borderRadius: 8, background: "#F7F5F0", padding: 3 }} />
            <div style={{ fontWeight: 800, fontSize: 16, color: "#2C3520" }}>Install Collarix</div>
          </div>
          <button onClick={onClose} style={{ background: "#F0F4EC", border: "none", borderRadius: 20, padding: "6px 10px", cursor: "pointer" }}><X size={16} color="#7A8B6A" /></button>
        </div>
        {[{ num: 1, icon: "⬆️", text: <>Tap the <strong>Share</strong> button at the bottom of Safari</> }, { num: 2, icon: "➕", text: <>Scroll down and tap <strong>"Add to Home Screen"</strong></> }, { num: 3, icon: "🐾", text: <>Tap <strong>"Add"</strong> — Collarix will appear on your home screen!</> }].map(({ num, icon, text }) => (
          <div key={num} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F0F5EE", border: "1.5px solid #D0DEC8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#4A6741", flexShrink: 0 }}>{num}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 6 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ color: "#2C3520", fontSize: 14, lineHeight: 1.4 }}>{text}</span>
            </div>
          </div>
        ))}
        <button onClick={onClose} style={{ width: "100%", background: "#4A6741", color: "white", border: "none", borderRadius: 14, padding: "14px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Got it!</button>
      </div>
    </div>
  );
}

// ── LOGIN SCREEN ──────────────────────────────────────────────────────────────
function LoginScreen() {
  const [tab, setTab] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleAuth() {
    setError(""); setInfo("");
    if (!email || !pass) { setError("Please enter email and password."); return; }
    if (pass.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      if (tab === "login") {
        const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
        if (e) setError(e.message || "Login failed. Please check your credentials.");
      } else {
        if (!fullName.trim()) { setError("Please enter your full name."); setLoading(false); return; }
        const { data, error: e } = await supabase.auth.signUp({ email: email.trim(), password: pass, options: { data: { full_name: fullName.trim() } } });
        if (e) setError(e.message || "Signup failed.");
        else if (data?.user) { setInfo("Account created! Signing you in..."); setTab("login"); }
      }
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
  }

  async function handleForgot() {
    if (!email) { setError("Enter your email first."); return; }
    const redirectTo = `${window.location.origin.includes("localhost") ? "https://collarix.vercel.app" : window.location.origin}/reset-password`;
    const { error: e } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (e) setError(e.message);
    else setInfo("Password reset email sent! Check your inbox.");
  }

  const inp = { border: "1.5px solid #E8EDE4", borderRadius: 11, padding: "12px 14px", fontSize: 14, color: "#2C3520", outline: "none", background: "#FAFAF8", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #F7F5F0 0%, #EBF0E8 50%, #F0EDE8 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", position: "relative", overflow: "hidden" }}>
      {Array.from({ length: 16 }).map((_, i) => { const row = Math.floor(i / 4); const col = i % 4; return <div key={i} style={{ position: "absolute", left: `${col * 30 - 5 + (row % 2) * 15}%`, top: `${row * 14 - 3}%`, transform: "rotate(-35deg)", fontFamily: "'Georgia', serif", fontSize: 13, fontWeight: 700, color: "#3A5A30", opacity: 0.07, letterSpacing: "3px", textTransform: "uppercase", whiteSpace: "nowrap", userSelect: "none" }}>collarix</div>; })}
      <div style={{ textAlign: "center", marginBottom: 32, position: "relative", zIndex: 1 }}>
        <img src={collarixLogo} alt="Collarix" style={{ width: 160, height: 160, objectFit: "contain", display: "block", margin: "0 auto 8px", filter: "drop-shadow(0 4px 16px rgba(74,103,65,0.18))" }} />
        <p style={{ color: "#7A8B6A", fontSize: 12, margin: 0, letterSpacing: "2px", textTransform: "uppercase" }}>Smart Pet Care by Saloni Agarwal</p>
      </div>
      <div style={{ background: "white", borderRadius: 20, padding: 28, width: "100%", maxWidth: 380, boxShadow: "0 4px 30px rgba(0,0,0,0.08)", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", background: "#F7F5F0", borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {["login", "signup"].map(t2 => (
            <button key={t2} onClick={() => { setTab(t2); setError(""); setInfo(""); }} style={{ flex: 1, padding: "10px", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 600, fontSize: 13, background: tab === t2 ? "white" : "transparent", color: tab === t2 ? "#2C3520" : "#9AA88A", boxShadow: tab === t2 ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s" }}>
              {t2 === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>
        {error && <div style={{ background: "#FFEBEE", color: "#C62828", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>{error}</div>}
        {info && <div style={{ background: "#E8F4E8", color: "#2E7D32", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>{info}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tab === "signup" && <input style={inp} placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" />}
          <input style={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" autoComplete="email" />
          <input style={inp} value={pass} onChange={e => setPass(e.target.value)} placeholder="Password (min 6 chars)" type="password" autoComplete={tab === "signup" ? "new-password" : "current-password"} onKeyDown={e => e.key === "Enter" && handleAuth()} />
          {tab === "login" && <div style={{ textAlign: "right", marginTop: -6 }}><span onClick={handleForgot} style={{ color: "#7A8B6A", fontSize: 12, cursor: "pointer" }}>Forgot password?</span></div>}
          <button onClick={handleAuth} disabled={loading} style={{ background: "#4A6741", color: "white", border: "none", borderRadius: 12, padding: "14px", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginTop: 4, boxShadow: "0 4px 14px #4A674140", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Please wait…" : tab === "login" ? "Log In" : "Create Account"}
          </button>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#4A6741", opacity: 0.4 }} />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", color: "#4A6741", opacity: 0.5 }}>collarix.in@gmail.com</span>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#4A6741", opacity: 0.4 }} />
        </div>
        <span style={{ fontSize: 10, color: "#7A8B6A", opacity: 0.6, letterSpacing: "1px" }}>📸 @collarix.in</span>
      </div>
    </div>
  );
}

// ── ADD PET MODAL ─────────────────────────────────────────────────────────────
function AddPetModal({ user, onClose, onAdded }) {
  const { t } = useTheme();
  const [form, setForm] = useState({ name: "", species: "dog", breed: "", age: "", dob: "", weight: "", height: "", sex: "Male", photo: "🐕", color: "#D4A853", owner_name: "", owner_phone: "", owner_email: "", owner_address: "", emergency_name: "", emergency_phone: "", emergency_relation: "" });
  const [loading, setLoading] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const is = iStyle(t);

  async function save() {
    if (!form.name) { toast("Pet name is required"); return; }
    setLoading(true);
    const { data, error } = await supabase.from("pets").insert({
      user_id: user.id, name: form.name, species: form.species, breed: form.breed,
      age: parseInt(form.age) || 0, dob: form.dob || null,
      weight: parseFloat(form.weight) || null, height: parseFloat(form.height) || null,
      sex: form.sex, photo: form.photo || (form.species === "cat" ? "🐱" : "🐕"),
      color: form.color || PET_COLORS[0],
      owner_info: { name: form.owner_name, phone: form.owner_phone, email: form.owner_email, address: form.owner_address },
      emergency_contact: { name: form.emergency_name, phone: form.emergency_phone, relation: form.emergency_relation },
      health: { vaccinations: [], allergies: [], conditions: ["None"], medications: [] }
    }).select().single();
    setLoading(false);
    if (error) { toast("Error: " + error.message); return; }
    toast("🐾 " + form.name + " added!");
    onAdded(data); onClose();
  }

  const chipBtn = (active, onClick, children) => (
    <button onClick={onClick} style={{ flex: 1, padding: "10px", border: "2px solid", borderColor: active ? "#4A6741" : t.borderInput, borderRadius: 12, cursor: "pointer", background: active ? t.accentBg : t.card, fontWeight: 600, color: active ? "#4A6741" : t.textSub }}>{children}</button>
  );

  return (
    <Sheet onClose={onClose}>
      <SheetTitle onClose={onClose}>Add New Pet</SheetTitle>
      <div style={{ padding: "0 20px 32px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>{["dog","cat"].map(s => chipBtn(form.species === s, () => { f("species", s); f("photo", s === "cat" ? "🐱" : "🐕"); }, s === "dog" ? "🐕 Dog" : "🐱 Cat"))}</div>
        <div style={{ display: "flex", gap: 8 }}>{["🐕","🐶","🐕‍🦺","🐩","🐱","🐈","😺","😸"].map(e => <button key={e} onClick={() => f("photo", e)} style={{ fontSize: 22, background: form.photo === e ? t.accentBg : "transparent", border: "2px solid", borderColor: form.photo === e ? "#4A6741" : "transparent", borderRadius: 8, padding: "4px 6px", cursor: "pointer" }}>{e}</button>)}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{PET_COLORS.map(c => <button key={c} onClick={() => f("color", c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: form.color === c ? "3px solid #4A6741" : "3px solid transparent", cursor: "pointer" }} />)}</div>
        <input style={is} placeholder="Pet name *" value={form.name} onChange={e => f("name", e.target.value)} />
        <input style={is} placeholder="Breed" value={form.breed} onChange={e => f("breed", e.target.value)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input style={is} placeholder="Age (years)" type="number" value={form.age} onChange={e => f("age", e.target.value)} />
          <input style={is} placeholder="DOB (YYYY-MM-DD)" value={form.dob} onChange={e => f("dob", e.target.value)} />
          <input style={is} placeholder="Weight (kg)" type="number" value={form.weight} onChange={e => f("weight", e.target.value)} />
          <input style={is} placeholder="Height (cm)" type="number" value={form.height} onChange={e => f("height", e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>{["Male","Female"].map(s => chipBtn(form.sex === s, () => f("sex", s), s))}</div>
        <div style={{ padding: "8px 0 4px", fontSize: 12, fontWeight: 700, color: t.textSub, textTransform: "uppercase", letterSpacing: "0.5px" }}>Owner Info</div>
        <input style={is} placeholder="Owner name" value={form.owner_name} onChange={e => f("owner_name", e.target.value)} />
        <input style={is} placeholder="Phone" value={form.owner_phone} onChange={e => f("owner_phone", e.target.value)} />
        <input style={is} placeholder="Email" value={form.owner_email} onChange={e => f("owner_email", e.target.value)} />
        <input style={is} placeholder="Address" value={form.owner_address} onChange={e => f("owner_address", e.target.value)} />
        <div style={{ padding: "8px 0 4px", fontSize: 12, fontWeight: 700, color: t.textSub, textTransform: "uppercase", letterSpacing: "0.5px" }}>Emergency Contact</div>
        <input style={is} placeholder="Name" value={form.emergency_name} onChange={e => f("emergency_name", e.target.value)} />
        <input style={is} placeholder="Phone" value={form.emergency_phone} onChange={e => f("emergency_phone", e.target.value)} />
        <input style={is} placeholder="Relation (e.g. Spouse)" value={form.emergency_relation} onChange={e => f("emergency_relation", e.target.value)} />
        <button onClick={save} disabled={loading} style={{ background: "#4A6741", color: "white", border: "none", borderRadius: 12, padding: "14px", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginTop: 8, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Saving…" : "Add Pet 🐾"}
        </button>
      </div>
    </Sheet>
  );
}

// ── MY PETS ───────────────────────────────────────────────────────────────────
function MyPetsScreen({ pets, user, onSelect, onPetAdded }) {
  const { t } = useTheme();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const filtered = pets.filter(p => (filter === "all" || p.species === filter) && p.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ padding: "0 16px 16px" }}>
      {showAdd && <AddPetModal user={user} onClose={() => setShowAdd(false)} onAdded={onPetAdded} />}
      <div style={{ padding: "20px 0 16px" }}>
        <h2 style={{ fontSize: 22, fontFamily: "'Georgia', serif", color: t.text, margin: "0 0 4px" }}>My Pets</h2>
        <p style={{ color: t.textSub, fontSize: 13, margin: 0 }}>{pets.length} companion{pets.length !== 1 ? "s" : ""} registered</p>
      </div>
      <div style={{ position: "relative", marginBottom: 14 }}>
        <Search size={15} color={t.textMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pets..." style={{ ...iStyle(t), paddingLeft: 36 }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[["all","All"],["dog","Dogs 🐕"],["cat","Cats 🐱"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ padding: "6px 16px", borderRadius: 20, border: "1.5px solid", borderColor: filter === val ? "#4A6741" : t.borderInput, background: filter === val ? "#4A6741" : t.card, color: filter === val ? "white" : t.textSub, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{label}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(pet => {
          const alerts = (pet.health?.vaccinations || []).some(v => v.status === "overdue") ? 1 : 0;
          return (
            <button key={pet.id} onClick={() => onSelect(pet)} style={{ background: t.card, border: "none", borderRadius: 16, padding: "16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", boxShadow: t.shadow, textAlign: "left", width: "100%" }}>
              <Avatar pet={pet} size={56} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, color: t.text, fontSize: 16 }}>{pet.name}</span>
                  {alerts > 0 && <span style={{ background: "#FFEBEE", color: "#C62828", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "1px 8px" }}>{alerts} alert</span>}
                </div>
                <p style={{ margin: "2px 0 0", color: t.textSub, fontSize: 13 }}>{pet.breed || "—"} • {pet.age || "?"}yr • {pet.sex || "—"}</p>
                <p style={{ margin: "4px 0 0", color: t.textMuted, fontSize: 11 }}>{pet.species === "cat" ? "🐱 Cat" : "🐕 Dog"}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4A6741" }} />
                <ChevronRight size={16} color={t.textMuted} />
              </div>
            </button>
          );
        })}
        <button onClick={() => setShowAdd(true)} style={{ background: t.card2, border: `1.5px dashed ${t.borderInput}`, borderRadius: 16, padding: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", color: t.textSub, fontWeight: 600 }}>
          <Plus size={18} /> Add New Pet
        </button>
      </div>
    </div>
  );
}

// ── PET PROFILE ───────────────────────────────────────────────────────────────
function PetProfileScreen({ pet, user, onNavigate, onBack }) {
  const { t } = useTheme();
  const health = pet.health || { vaccinations: [], allergies: [], conditions: ["None"], medications: [] };
  const overdueVax = health.vaccinations.filter(v => v.status === "overdue");
  const owner = pet.owner_info || {};
  const emergency = pet.emergency_contact || {};

  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ background: `linear-gradient(135deg, ${pet.color || "#D4A853"}40, ${pet.color || "#D4A853"}15)`, padding: "24px 20px 20px", position: "relative" }}>
        <button onClick={onBack} style={{ background: t.card, border: "none", borderRadius: 10, padding: "8px", cursor: "pointer", boxShadow: t.shadow, marginBottom: 16 }}>
          <ChevronLeft size={18} color={t.text} />
        </button>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
          <Avatar pet={pet} size={80} />
          <div>
            <h2 style={{ fontSize: 26, fontFamily: "'Georgia', serif", color: t.text, margin: "0 0 2px" }}>{pet.name}</h2>
            <p style={{ color: t.textSub, fontSize: 13, margin: "0 0 8px" }}>{pet.breed || "—"} • {pet.age || "?"} years</p>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ background: t.card, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 600, color: "#4A6741" }}>{pet.sex}</span>
              <span style={{ background: t.card, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 600, color: "#4A6741" }}>{pet.species === "cat" ? "🐱 Cat" : "🐕 Dog"}</span>
            </div>
          </div>
        </div>
        <a href={/iPhone|iPad|iPod/i.test(navigator.userAgent) ? "https://www.apple.com/icloud/find-my/" : "https://www.google.com/android/find"} target="_blank" rel="noopener noreferrer" style={{ position: "absolute", top: 24, right: 20, background: "#4A6741", color: "white", borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
          <Navigation size={14} /> Find Pet
        </a>
      </div>
      <div style={{ padding: "0 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, margin: "16px 0" }}>
          {[[`${pet.weight || "?"}kg`,"Weight",Weight],[`${pet.height || "?"}cm`,"Height",Ruler],[pet.dob ? pet.dob.slice(5).replace("-","/") : "—","DOB",Calendar]].map(([val, label, Icon]) => (
            <div key={label} style={{ background: t.card, borderRadius: 14, padding: "12px", textAlign: "center", boxShadow: t.shadow }}>
              <Icon size={16} color={t.textSub} style={{ marginBottom: 4 }} />
              <div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{val}</div>
              <div style={{ color: t.textMuted, fontSize: 11 }}>{label}</div>
            </div>
          ))}
        </div>
        {overdueVax.length > 0 && (
          <div style={{ background: t.errBg, borderRadius: 12, padding: "12px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={18} color={t.errText} />
            <div>
              <div style={{ fontWeight: 600, color: t.errText, fontSize: 13 }}>Vaccination overdue</div>
              <div style={{ color: t.errText, fontSize: 12, opacity: 0.8 }}>{overdueVax.map(v => v.name).join(", ")}</div>
            </div>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
          {[["Food","food",Utensils,"#A8C5A0"],["Water","water",Droplets,"#9DB8C8"],["Litter","litter",Trash2,"#D4C5A9"],["Vet","vet",Stethoscope,"#C4956A"],["Reminders","reminders",Bell,"#B8A9C9"],["Health","vet",Activity,"#8B9E6B"]].map(([label, screen, Icon, color]) => (
            <button key={label} onClick={() => onNavigate(screen, pet)} style={{ background: t.card, border: "none", borderRadius: 14, padding: "14px 8px", cursor: "pointer", boxShadow: t.shadow, textAlign: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}25`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>
                <Icon size={18} color={color} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.textSub }}>{label}</div>
            </button>
          ))}
        </div>
        {health.vaccinations.length > 0 && (
          <SectionCard title="Vaccinations">
            {health.vaccinations.map((v, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < health.vaccinations.length - 1 ? `1px solid ${t.sepLine}` : "none" }}>
                <div>
                  <div style={{ fontWeight: 600, color: t.text, fontSize: 13 }}>{v.name}</div>
                  <div style={{ color: t.textMuted, fontSize: 11 }}>Next: {v.next}</div>
                </div>
                <StatusBadge status={v.status} />
              </div>
            ))}
          </SectionCard>
        )}
        {health.allergies.length > 0 && (
          <SectionCard title="Allergies">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {health.allergies.map((a, i) => <span key={i} style={{ background: t.warnBg, color: t.warnText, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>{a}</span>)}
            </div>
          </SectionCard>
        )}
        {health.medications.length > 0 && (
          <SectionCard title="Medications">
            {health.medications.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <span style={{ fontWeight: 600, color: t.text, fontSize: 13 }}>{m.name}</span>
                <span style={{ color: t.textSub, fontSize: 12 }}>{m.dose} · {m.freq}</span>
              </div>
            ))}
          </SectionCard>
        )}
        <SectionCard title="Owner & Emergency Contact">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[[User, owner.name || "—","Owner"],[Phone, owner.phone || "—","Phone"],[Mail, owner.email || "—","Email"]].map(([Icon, val, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: t.accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={14} color={t.textSub} /></div>
                <div>
                  <div style={{ fontSize: 11, color: t.textMuted }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{val}</div>
                </div>
              </div>
            ))}
            {emergency.name && (
              <div style={{ marginTop: 4, padding: "10px", background: t.warnBg, borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: "#C4956A", fontWeight: 600, marginBottom: 4 }}>EMERGENCY CONTACT</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{emergency.name} · {emergency.relation}</div>
                <div style={{ fontSize: 12, color: t.textSub }}>{emergency.phone}</div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashboardScreen({ pets, user, onSelectPet, onOpenQR }) {
  const { t } = useTheme();
  const [dashReminders, setDashReminders] = useState([]);
  const [dashVets, setDashVets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pets.length) { setLoading(false); return; }
    async function load() {
      const petIds = pets.map(p => p.id);
      const [{ data: remData }, { data: vetData }] = await Promise.all([
        supabase.from("reminders").select("*").in("pet_id", petIds).eq("active", true),
        supabase.from("vet_appointments").select("*").in("pet_id", petIds).eq("is_past", false)
      ]);
      const petMap = Object.fromEntries(pets.map(p => [p.id, p]));
      setDashReminders((remData || []).map(r => ({ ...r, petName: petMap[r.pet_id]?.name || "", petPhoto: petMap[r.pet_id]?.photo || "🐾" })));
      setDashVets((vetData || []).map(v => ({ ...v, petName: petMap[v.pet_id]?.name || "", petPhoto: petMap[v.pet_id]?.photo || "🐾" })));
      setLoading(false);
    }
    load();
  }, [pets]);

  const alertPets = pets.filter(p => (p.health?.vaccinations || []).some(v => v.status === "overdue"));
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 22, fontFamily: "'Georgia', serif", color: t.text, margin: "0 0 2px" }}>{greeting}! 🌿</h2>
          <p style={{ color: t.textSub, fontSize: 13, margin: 0 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <div style={{ background: "#4A6741", borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
          <Wifi size={12} color="white" />
          <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>{pets.length} Active</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[["Total Pets", pets.length, PawPrint, "#4A6741"],["Alerts", alertPets.length, AlertCircle, alertPets.length > 0 ? "#C62828" : "#4A6741"],["Reminders", dashReminders.length, Bell, "#7A6A9A"],["Upcoming Vet", dashVets.length, Stethoscope, "#C4956A"]].map(([label, val, Icon, color]) => (
          <div key={label} style={{ background: t.card, borderRadius: 16, padding: "14px", boxShadow: t.shadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 800, color: t.text, fontSize: 26 }}>{val}</div>
                <div style={{ color: t.textMuted, fontSize: 12, marginTop: 2 }}>{label}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={18} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {alertPets.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: "0 0 10px" }}>⚠️ Needs Attention</h3>
          {alertPets.map(pet => (
            <button key={pet.id} onClick={() => onSelectPet(pet)} style={{ background: t.warnBg, border: `1.5px solid ${t.warnText}40`, borderRadius: 14, padding: "12px 14px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, width: "100%", marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>{pet.photo}</span>
              <div>
                <div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{pet.name}</div>
                <div style={{ color: "#C4956A", fontSize: 12 }}>• Vaccination overdue</div>
              </div>
              <ChevronRight size={16} color="#C4956A" style={{ marginLeft: "auto" }} />
            </button>
          ))}
        </div>
      )}

      {loading ? <Spinner /> : (
        <>
          {dashReminders.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: "0 0 10px" }}>Today's Reminders</h3>
              {dashReminders.slice(0, 5).map((r, i) => {
                const Icon = REMINDER_ICONS[r.type] || Bell;
                const color = REMINDER_COLORS[r.type] || "#8B9E6B";
                return (
                  <div key={r.id || i} style={{ background: t.card, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: t.shadow, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={16} color={color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: t.text, fontSize: 13 }}>{r.title}</div>
                      <div style={{ color: t.textMuted, fontSize: 11 }}>{r.petName} · {r.time}</div>
                    </div>
                    <span style={{ fontSize: 18 }}>{r.petPhoto}</span>
                  </div>
                );
              })}
            </div>
          )}
          {dashVets.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: "0 0 10px" }}>📅 Upcoming Vet Visits</h3>
              {dashVets.slice(0, 3).map((v, i) => (
                <div key={v.id || i} style={{ background: t.card, borderRadius: 12, padding: "12px 14px", boxShadow: t.shadow, display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{v.petPhoto}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: t.text, fontSize: 13 }}>{v.petName} — {v.reason}</div>
                    <div style={{ color: t.textMuted, fontSize: 11 }}>{v.date} · {v.clinic}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {pets.length > 0 && <AllPetsQRBox pets={pets} onOpenQR={onOpenQR} />}

      {pets.length > 0 && (
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: "0 0 10px" }}>All Pets</h3>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
            {pets.map(pet => (
              <button key={pet.id} onClick={() => onSelectPet(pet)} style={{ background: t.card, border: "none", borderRadius: 14, padding: "14px 16px", cursor: "pointer", flexShrink: 0, textAlign: "center", boxShadow: t.shadow, minWidth: 80 }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{pet.photo}</div>
                <div style={{ fontWeight: 600, color: t.text, fontSize: 12 }}>{pet.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      {!pets.length && !loading && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: t.textMuted }}>
          <PawPrint size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: t.textSub }}>No pets yet!</p>
          <p style={{ fontSize: 13 }}>Go to My Pets and add your first companion.</p>
        </div>
      )}
    </div>
  );
}

// ── FOOD TRACKER ──────────────────────────────────────────────────────────────
function FoodScreen({ pet, user }) {
  const { t } = useTheme();
  const [meals, setMeals] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ time: "", meal: "Breakfast", item: "", qty: "", notes: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("food_logs").select("*").eq("pet_id", pet.id).eq("date", today()).order("time")
      .then(({ data }) => { setMeals(data || []); setLoading(false); });
  }, [pet.id]);

  async function addMeal() {
    if (!form.item || !form.time) { toast("Enter time and food item"); return; }
    const { data, error } = await supabase.from("food_logs").insert({
      pet_id: pet.id, user_id: user.id, time: form.time, meal: form.meal,
      item: form.item, qty: form.qty, notes: form.notes, date: today()
    }).select().single();
    if (error) { toast("Error: " + error.message); return; }
    setMeals([...meals, data]);
    setForm({ time: "", meal: "Breakfast", item: "", qty: "", notes: "" });
    setShowAdd(false); toast("Meal logged ✅");
  }

  async function deleteMeal(id) {
    await supabase.from("food_logs").delete().eq("id", id);
    setMeals(meals.filter(m => m.id !== id));
    toast("Meal removed");
  }

  const is = iStyle(t);
  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 20, fontFamily: "'Georgia', serif", color: t.text, margin: 0 }}>🍽️ Food Tracker</h2>
          <p style={{ color: t.textSub, fontSize: 12, margin: "2px 0 0" }}>{pet.name} · Today</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: "#4A6741", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Log Meal
        </button>
      </div>
      {showAdd && (
        <div style={{ background: t.card, borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: t.shadowMd }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input style={is} type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            <select style={is} value={form.meal} onChange={e => setForm({ ...form, meal: e.target.value })}>
              {["Breakfast","Lunch","Dinner","Snack"].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <input style={{ ...is, marginBottom: 10 }} placeholder="Food item" value={form.item} onChange={e => setForm({ ...form, item: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input style={is} placeholder="Quantity (e.g. 80g)" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} />
            <input style={is} placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button onClick={addMeal} style={{ background: "#4A6741", color: "white", border: "none", borderRadius: 10, padding: "11px", fontWeight: 700, cursor: "pointer", width: "100%" }}>Save Meal</button>
        </div>
      )}
      {loading ? <Spinner /> : meals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: t.textMuted }}>
          <Utensils size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 14 }}>No meals logged today</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {meals.map(m => (
            <div key={m.id} style={{ background: t.card, borderRadius: 14, padding: "14px", boxShadow: t.shadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{m.meal}</div>
                  <div style={{ color: t.textSub, fontSize: 13, marginTop: 2 }}>{m.item} {m.qty && `· ${m.qty}`}</div>
                  {m.notes && <div style={{ color: t.textMuted, fontSize: 11, marginTop: 2 }}>{m.notes}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: t.textMuted, fontSize: 12 }}>{m.time}</span>
                  <button onClick={() => deleteMeal(m.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Trash2 size={14} color={t.textMuted} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── WATER TRACKER ─────────────────────────────────────────────────────────────
function WaterScreen({ pet, user }) {
  const { t } = useTheme();
  const [logs, setLogs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ time: "", amount: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("water_logs").select("*").eq("pet_id", pet.id).eq("date", today()).order("time")
      .then(({ data }) => { setLogs(data || []); setLoading(false); });
  }, [pet.id]);

  const totalMl = logs.reduce((s, l) => s + (parseInt(l.amount) || 0), 0);
  const goal = pet.species === "dog" ? 800 : 250;
  const pct = Math.min((totalMl / goal) * 100, 100);

  async function addLog() {
    if (!form.amount || !form.time) { toast("Enter time and amount"); return; }
    const { data, error } = await supabase.from("water_logs").insert({
      pet_id: pet.id, user_id: user.id, time: form.time, amount: form.amount, date: today()
    }).select().single();
    if (error) { toast("Error: " + error.message); return; }
    setLogs([...logs, data]);
    setForm({ time: "", amount: "" });
    setShowAdd(false); toast("Water intake logged 💧");
  }

  async function deleteLog(id) {
    await supabase.from("water_logs").delete().eq("id", id);
    setLogs(logs.filter(l => l.id !== id));
  }

  const is = iStyle(t);
  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 20, fontFamily: "'Georgia', serif", color: t.text, margin: 0 }}>💧 Water Tracker</h2>
          <p style={{ color: t.textSub, fontSize: 12, margin: "2px 0 0" }}>{pet.name} · Today</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: "#9DB8C8", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Log Water
        </button>
      </div>
      <div style={{ background: t.card, borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: t.shadow, textAlign: "center" }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#9DB8C8" }}>{totalMl}<span style={{ fontSize: 18, color: t.textMuted }}>ml</span></div>
        <div style={{ color: t.textSub, fontSize: 13, marginTop: 4 }}>Total today · {logs.length} session{logs.length !== 1 ? "s" : ""}</div>
        <div style={{ height: 8, background: t.accentBg, borderRadius: 20, marginTop: 12, overflow: "hidden" }}>
          <div style={{ height: "100%", background: pct >= 100 ? "#4A6741" : "#9DB8C8", borderRadius: 20, width: `${pct}%`, transition: "width 0.5s" }} />
        </div>
        <div style={{ color: t.textMuted, fontSize: 11, marginTop: 4 }}>Daily goal: {goal}ml {pct >= 100 ? "✅" : ""}</div>
      </div>
      {showAdd && (
        <div style={{ background: t.card, borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: t.shadowMd }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input style={is} type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            <input style={is} placeholder="Amount (ml)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {["100","150","200","300","400"].map(ml => (
              <button key={ml} onClick={() => setForm({ ...form, amount: ml })} style={{ flex: 1, padding: "8px 4px", border: "1.5px solid", borderColor: form.amount === ml ? "#9DB8C8" : t.borderInput, borderRadius: 8, cursor: "pointer", background: form.amount === ml ? t.accentBg : t.card, fontSize: 12, fontWeight: 600, color: form.amount === ml ? "#9DB8C8" : t.textMuted }}>{ml}</button>
            ))}
          </div>
          <button onClick={addLog} style={{ background: "#9DB8C8", color: "white", border: "none", borderRadius: 10, padding: "11px", fontWeight: 700, cursor: "pointer", width: "100%" }}>Save</button>
        </div>
      )}
      {loading ? <Spinner /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {logs.map(l => (
            <div key={l.id} style={{ background: t.card, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: t.shadow }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Droplets size={18} color="#9DB8C8" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{l.amount}ml</div>
                <div style={{ color: t.textMuted, fontSize: 12 }}>{l.time}</div>
              </div>
              <button onClick={() => deleteLog(l.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Trash2 size={14} color={t.textMuted} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── LITTER TRACKER ────────────────────────────────────────────────────────────
function LitterScreen({ pet, user, onPetUpdated }) {
  const { t } = useTheme();
  const [status, setStatus] = useState(pet.litter_status || "clean");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("litter_history").select("*").eq("pet_id", pet.id).order("cleaned_at", { ascending: false }).limit(10)
      .then(({ data }) => { setHistory(data || []); setLoading(false); });
  }, [pet.id]);

  async function markCleaned() {
    const now = new Date().toISOString();
    const [{ data: logData }, { error: petErr }] = await Promise.all([
      supabase.from("litter_history").insert({ pet_id: pet.id, user_id: user.id, cleaned_at: now }).select().single(),
      supabase.from("pets").update({ litter_status: "clean", litter_last_cleaned: now }).eq("id", pet.id)
    ]);
    if (petErr) { toast("Error: " + petErr.message); return; }
    setStatus("clean"); setHistory([logData, ...history]);
    onPetUpdated({ ...pet, litter_status: "clean", litter_last_cleaned: now });
    toast("Litter marked as clean ✅");
  }

  async function markDirty() {
    await supabase.from("pets").update({ litter_status: "needs-cleaning" }).eq("id", pet.id);
    setStatus("needs-cleaning");
    onPetUpdated({ ...pet, litter_status: "needs-cleaning" });
    toast("Litter status updated");
  }

  const statusColors = { "clean": "#4A6741", "needs-cleaning": "#C62828", "N/A": "#9AA88A" };
  const sc = statusColors[status] || "#9AA88A";

  if (pet.species === "dog") return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <h2 style={{ fontSize: 20, fontFamily: "'Georgia', serif", color: t.text, margin: 0 }}>🚽 Litter Tracker</h2>
        <p style={{ color: t.textSub, fontSize: 12, margin: "2px 0 0" }}>{pet.name}</p>
      </div>
      <div style={{ background: t.card, borderRadius: 16, padding: 24, textAlign: "center", boxShadow: t.shadow }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🐕</div>
        <div style={{ fontWeight: 600, color: t.textSub, fontSize: 15 }}>Dogs don't use litter boxes!</div>
        <div style={{ color: t.textMuted, fontSize: 13, marginTop: 8 }}>Track outdoor walks via reminders instead.</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <h2 style={{ fontSize: 20, fontFamily: "'Georgia', serif", color: t.text, margin: 0 }}>🚽 Litter Tracker</h2>
        <p style={{ color: t.textSub, fontSize: 12, margin: "2px 0 0" }}>{pet.name}</p>
      </div>
      <div style={{ background: t.card, borderRadius: 20, padding: 24, marginBottom: 16, boxShadow: t.shadow, textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${sc}20`, border: `3px solid ${sc}40`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          <Trash2 size={32} color={sc} />
        </div>
        <div style={{ fontWeight: 700, color: sc, fontSize: 18, marginBottom: 4 }}>
          {status === "clean" ? "Clean ✓" : status === "needs-cleaning" ? "Needs Cleaning ⚠️" : "N/A"}
        </div>
        {history.length > 0 && (
          <div style={{ color: t.textMuted, fontSize: 12, marginBottom: 20 }}>
            Last cleaned: {new Date(history[0].cleaned_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={markCleaned} style={{ flex: 1, background: "#4A6741", color: "white", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>✅ Mark Cleaned</button>
          <button onClick={markDirty} style={{ flex: 1, background: t.warnBg, color: t.warnText, border: `1.5px solid ${t.warnText}40`, borderRadius: 12, padding: "12px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>⚠️ Mark Dirty</button>
        </div>
      </div>
      {loading ? <Spinner /> : history.length > 0 && (
        <SectionCard title="Cleaning History">
          {history.map((h, i) => (
            <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < history.length - 1 ? `1px solid ${t.sepLine}` : "none" }}>
              <Check size={14} color="#4A6741" />
              <span style={{ color: t.textSub, fontSize: 13 }}>{new Date(h.cleaned_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>
          ))}
        </SectionCard>
      )}
    </div>
  );
}

// ── VET & HEALTH ──────────────────────────────────────────────────────────────
function VetScreen({ pet, user }) {
  const { t } = useTheme();
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ date: "", clinic: "", reason: "", vet: "", notes: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("vet_appointments").select("*").eq("pet_id", pet.id).order("date")
      .then(({ data }) => {
        const all = data || [];
        setUpcoming(all.filter(a => !a.is_past));
        setPast(all.filter(a => a.is_past));
        setLoading(false);
      });
  }, [pet.id]);

  async function addAppt() {
    if (!form.date || !form.reason) { toast("Date and reason are required"); return; }
    const { data, error } = await supabase.from("vet_appointments").insert({
      pet_id: pet.id, user_id: user.id, date: form.date, clinic: form.clinic,
      reason: form.reason, vet: form.vet, notes: form.notes, is_past: false
    }).select().single();
    if (error) { toast("Error: " + error.message); return; }
    setUpcoming([...upcoming, data]);
    setForm({ date: "", clinic: "", reason: "", vet: "", notes: "" });
    setShowAdd(false); toast("Appointment saved 📅");
  }

  async function markPast(appt) {
    await supabase.from("vet_appointments").update({ is_past: true }).eq("id", appt.id);
    setUpcoming(upcoming.filter(a => a.id !== appt.id));
    setPast([{ ...appt, is_past: true }, ...past]);
    toast("Marked as past visit");
  }

  const health = pet.health || { vaccinations: [], allergies: [], conditions: ["None"], medications: [] };
  const is = iStyle(t);

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 20, fontFamily: "'Georgia', serif", color: t.text, margin: 0 }}>🏥 Vet & Health</h2>
          <p style={{ color: t.textSub, fontSize: 12, margin: "2px 0 0" }}>{pet.name}</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: "#C4956A", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Add Appt
        </button>
      </div>
      {showAdd && (
        <div style={{ background: t.card, borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: t.shadowMd }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input style={is} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <input style={is} placeholder="Vet name" value={form.vet} onChange={e => setForm({ ...form, vet: e.target.value })} />
          </div>
          <input style={{ ...is, marginBottom: 10 }} placeholder="Reason / purpose *" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
          <input style={{ ...is, marginBottom: 10 }} placeholder="Clinic / hospital" value={form.clinic} onChange={e => setForm({ ...form, clinic: e.target.value })} />
          <input style={{ ...is, marginBottom: 10 }} placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <button onClick={addAppt} style={{ background: "#C4956A", color: "white", border: "none", borderRadius: 10, padding: "11px", fontWeight: 700, cursor: "pointer", width: "100%" }}>Save Appointment</button>
        </div>
      )}
      {loading ? <Spinner /> : (
        <>
          {upcoming.length > 0 && (
            <SectionCard title="Upcoming Appointments">
              {upcoming.map((v, i) => (
                <div key={v.id} style={{ padding: "10px 0", borderBottom: i < upcoming.length - 1 ? `1px solid ${t.sepLine}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{v.reason}</span>
                    <span style={{ background: t.okBg, color: t.okText, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{v.date}</span>
                  </div>
                  <div style={{ color: t.textSub, fontSize: 12 }}>{v.clinic}</div>
                  <div style={{ color: t.textMuted, fontSize: 11, marginTop: 2 }}>{v.vet}</div>
                  <button onClick={() => markPast(v)} style={{ marginTop: 8, background: t.accentBg, border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#4A6741", cursor: "pointer" }}>Mark as Past Visit</button>
                </div>
              ))}
            </SectionCard>
          )}
          {health.vaccinations.length > 0 && (
            <SectionCard title="Vaccination Records">
              {health.vaccinations.map((v, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < health.vaccinations.length - 1 ? `1px solid ${t.sepLine}` : "none" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: t.text, fontSize: 13 }}>{v.name}</div>
                    <div style={{ color: t.textMuted, fontSize: 11 }}>Given: {v.date} · Next: {v.next}</div>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
              ))}
            </SectionCard>
          )}
          {past.length > 0 && (
            <SectionCard title="Past Visits">
              {past.map((v, i) => (
                <div key={v.id} style={{ padding: "10px 0", borderBottom: i < past.length - 1 ? `1px solid ${t.sepLine}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 600, color: t.text, fontSize: 13 }}>{v.reason}</span>
                    <span style={{ color: t.textMuted, fontSize: 11 }}>{v.date}</span>
                  </div>
                  <div style={{ color: t.textSub, fontSize: 12, marginTop: 2 }}>{v.clinic}</div>
                  {v.notes && <div style={{ color: t.textMuted, fontSize: 11, marginTop: 4, fontStyle: "italic" }}>{v.notes}</div>}
                </div>
              ))}
            </SectionCard>
          )}
          {!upcoming.length && !past.length && (
            <div style={{ textAlign: "center", padding: "40px 0", color: t.textMuted }}>
              <Stethoscope size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontSize: 14 }}>No appointments yet</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── REMINDERS ─────────────────────────────────────────────────────────────────
function RemindersScreen({ pet, user }) {
  const { t } = useTheme();
  const [reminders, setReminders] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: "feeding", title: "", time: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("reminders").select("*").eq("pet_id", pet.id).order("time")
      .then(({ data }) => { setReminders(data || []); setLoading(false); });
  }, [pet.id]);

  async function addReminder() {
    if (!form.title) { toast("Enter a title"); return; }
    const { data, error } = await supabase.from("reminders").insert({
      pet_id: pet.id, user_id: user.id, type: form.type, title: form.title, time: form.time, active: true
    }).select().single();
    if (error) { toast("Error: " + error.message); return; }
    setReminders([...reminders, data]);
    setForm({ type: "feeding", title: "", time: "" });
    setShowAdd(false); toast("Reminder saved 🔔");
  }

  async function toggle(r) {
    await supabase.from("reminders").update({ active: !r.active }).eq("id", r.id);
    setReminders(reminders.map(rem => rem.id === r.id ? { ...rem, active: !rem.active } : rem));
  }

  async function deleteReminder(id) {
    await supabase.from("reminders").delete().eq("id", id);
    setReminders(reminders.filter(r => r.id !== id));
    toast("Reminder deleted");
  }

  const is = iStyle(t);
  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 20, fontFamily: "'Georgia', serif", color: t.text, margin: 0 }}>🔔 Reminders</h2>
          <p style={{ color: t.textSub, fontSize: 12, margin: "2px 0 0" }}>{pet.name}</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: "#B8A9C9", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Add
        </button>
      </div>
      {showAdd && (
        <div style={{ background: t.card, borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: t.shadowMd }}>
          <select style={{ ...is, marginBottom: 10 }} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {Object.keys(REMINDER_ICONS).map(tp => <option key={tp} value={tp}>{tp.charAt(0).toUpperCase() + tp.slice(1)}</option>)}
          </select>
          <input style={{ ...is, marginBottom: 10 }} placeholder="Reminder title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <input style={{ ...is, marginBottom: 10 }} type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          <button onClick={addReminder} style={{ background: "#B8A9C9", color: "white", border: "none", borderRadius: 10, padding: "11px", fontWeight: 700, cursor: "pointer", width: "100%" }}>Save Reminder</button>
        </div>
      )}
      {loading ? <Spinner /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reminders.map(r => {
            const Icon = REMINDER_ICONS[r.type] || Bell;
            const color = REMINDER_COLORS[r.type] || "#8B9E6B";
            return (
              <div key={r.id} style={{ background: t.card, borderRadius: 14, padding: "14px", display: "flex", alignItems: "center", gap: 12, boxShadow: t.shadow, opacity: r.active ? 1 : 0.5 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{r.title}</div>
                  <div style={{ color: t.textMuted, fontSize: 12 }}>{r.type}{r.time && ` · ${r.time}`}</div>
                </div>
                <button onClick={() => deleteReminder(r.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Trash2 size={14} color={t.textMuted} /></button>
                <Toggle value={r.active} onChange={() => toggle(r)} />
              </div>
            );
          })}
          {reminders.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: t.textMuted }}>
              <Bell size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontSize: 14 }}>No reminders yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── BLOG SCREEN ───────────────────────────────────────────────────────────────
function BlogScreen() {
  const { t } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [selected, setSelected] = useState(null);

  const CATS = ["All","Nutrition","Health","Training","Grooming","Behaviour"];

  useEffect(() => {
    supabase.from("blog_posts").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoading(false); });
  }, []);

  const filtered = posts.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || p.summary?.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === "All" || p.category === cat;
    return matchSearch && matchCat;
  });

  if (selected) return (
    <div style={{ padding: "0 0 20px" }}>
      <div style={{ padding: "16px 16px 0" }}>
        <button onClick={() => setSelected(null)} style={{ background: t.card, border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: t.shadow }}>
          <ChevronLeft size={16} color={t.text} />
          <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Back</span>
        </button>
      </div>
      {selected.cover_url && <img src={selected.cover_url} alt={selected.title} style={{ width: "100%", height: 200, objectFit: "cover", marginTop: 14 }} />}
      <div style={{ padding: "20px 16px" }}>
        {selected.category && <span style={{ background: "#4A6741", color: "white", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700 }}>{selected.category}</span>}
        <h2 style={{ fontSize: 22, fontFamily: "'Georgia', serif", color: t.text, margin: "12px 0 8px", lineHeight: 1.3 }}>{selected.title}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ color: t.textMuted, fontSize: 12 }}>{selected.author || "Collarix Team"}</span>
          <span style={{ color: t.textMuted, fontSize: 12 }}>·</span>
          <span style={{ color: t.textMuted, fontSize: 12 }}>{selected.created_at ? new Date(selected.created_at).toLocaleDateString("en-IN", { year:"numeric", month:"short", day:"numeric" }) : ""}</span>
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.7, color: t.textSub, whiteSpace: "pre-wrap" }}>{selected.content || selected.summary}</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <h2 style={{ fontSize: 22, fontFamily: "'Georgia', serif", color: t.text, margin: "0 0 4px" }}>📚 Pet Insights</h2>
        <p style={{ color: t.textSub, fontSize: 13, margin: 0 }}>Expert care tips for your companions</p>
      </div>
      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search size={15} color={t.textMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..." style={{ ...iStyle(t), paddingLeft: 36 }} />
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid", borderColor: cat === c ? "#4A6741" : t.borderInput, background: cat === c ? "#4A6741" : t.card, color: cat === c ? "white" : t.textSub, fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>{c}</button>
        ))}
      </div>
      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: t.textMuted }}>
          <BookOpen size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 14 }}>No articles found</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((post, i) => (
            <button key={post.id || i} onClick={() => setSelected(post)} style={{ background: t.card, border: "none", borderRadius: 16, overflow: "hidden", textAlign: "left", cursor: "pointer", boxShadow: t.shadow, width: "100%" }}>
              {post.cover_url && <img src={post.cover_url} alt={post.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />}
              <div style={{ padding: "14px" }}>
                {post.category && <span style={{ background: t.accentBg, color: "#4A6741", borderRadius: 20, padding: "2px 10px", fontSize: 10, fontWeight: 700 }}>{post.category}</span>}
                <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: "8px 0 6px", lineHeight: 1.3 }}>{post.title}</h3>
                {post.summary && <p style={{ color: t.textSub, fontSize: 13, margin: "0 0 10px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.summary}</p>}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: t.textMuted, fontSize: 11 }}>{post.author || "Collarix Team"} · {post.read_time || "3 min read"}</span>
                  <ArrowRight size={14} color={t.textMuted} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ALL PETS QR BOX ───────────────────────────────────────────────────────────
function PetQRMini({ pet, onOpen }) {
  const { t } = useTheme();
  const ref = useRef(null);
  const qrInst = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    qrInst.current = new QRCodeStyling({
      width: 90, height: 90, type: "svg",
      data: `https://collarix.vercel.app/pet/${pet.id}`,
      dotsOptions: { color: "#2C3520", type: "rounded" },
      cornersSquareOptions: { type: "extra-rounded", color: "#4A6741" },
      cornersDotOptions: { type: "dot", color: "#4A6741" },
      backgroundOptions: { color: "transparent" },
    });
    qrInst.current.append(ref.current);
  }, [pet.id]);

  return (
    <button onClick={onOpen} style={{ background: t.card, border: `1.5px solid ${t.border}`, borderRadius: 16, padding: "14px 12px", cursor: "pointer", textAlign: "center", flexShrink: 0, width: 126, boxShadow: t.shadow }}>
      <div style={{ background: "white", borderRadius: 10, padding: 6, display: "inline-block", marginBottom: 8 }}>
        <div ref={ref} />
      </div>
      <div style={{ fontSize: 16, marginBottom: 2 }}>{pet.photo}</div>
      <div style={{ fontWeight: 700, color: t.text, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pet.name}</div>
      <div style={{ color: "#4A6741", fontSize: 10, fontWeight: 600, marginTop: 3 }}>Tap to open →</div>
    </button>
  );
}

function AllPetsQRBox({ pets, onOpenQR }) {
  const { t } = useTheme();
  if (!pets.length) return null;
  return (
    <div style={{ background: t.card, borderRadius: 20, padding: "16px 16px 20px", marginBottom: 20, boxShadow: t.shadow }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.text }}>🐾 Pet QR Tags</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: t.textMuted }}>Tap to view or download each tag</p>
        </div>
        <div style={{ background: t.accentBg, borderRadius: 10, padding: "4px 10px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#4A6741" }}>{pets.length} tag{pets.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
        {pets.map(pet => (
          <PetQRMini key={pet.id} pet={pet} onOpen={() => onOpenQR(pet)} />
        ))}
      </div>
    </div>
  );
}

// ── QR GENERATOR ──────────────────────────────────────────────────────────────
function QRGeneratorScreen({ pet, user }) {
  const { t } = useTheme();
  const qrRef = useRef(null);
  const qrInstance = useRef(null);
  const [petData, setPetData] = useState({ ...pet });
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: pet.name, breed: pet.breed || "", age: pet.age || "", owner: pet.owner_info?.name || "", phone: pet.owner_info?.phone || "", address: pet.owner_info?.address || "" });

  const qrText = `https://collarix.vercel.app/pet/${pet.id}`;

  useEffect(() => {
    if (!qrRef.current) return;
    qrRef.current.innerHTML = "";
    qrInstance.current = new QRCodeStyling({
      width: 200, height: 200, type: "svg",
      data: qrText,
      dotsOptions: { color: "#2C3520", type: "rounded" },
      cornersSquareOptions: { type: "extra-rounded", color: "#4A6741" },
      cornersDotOptions: { type: "dot", color: "#4A6741" },
      backgroundOptions: { color: "transparent" },
      imageOptions: { crossOrigin: "anonymous", margin: 6 },
    });
    qrInstance.current.append(qrRef.current);
  }, [pet.id]);

  function downloadQR() {
    if (qrInstance.current) qrInstance.current.download({ name: `${pet.name}-collarix-qr`, extension: "png" });
  }

  async function saveEdit() {
    const ownerInfo = { ...pet.owner_info, name: form.owner, phone: form.phone, address: form.address };
    const { error } = await supabase.from("pets").update({ name: form.name, breed: form.breed, age: parseInt(form.age) || 0, owner_info: ownerInfo }).eq("id", pet.id);
    if (error) { toast("Error: " + error.message); return; }
    setPetData({ ...petData, name: form.name, breed: form.breed, age: form.age, owner_info: ownerInfo });
    setEditMode(false); toast("Pet info updated ✅");
  }

  const is = iStyle(t);
  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <h2 style={{ fontSize: 20, fontFamily: "'Georgia', serif", color: t.text, margin: 0 }}>📱 QR Tag</h2>
        <p style={{ color: t.textSub, fontSize: 12, margin: "2px 0 0" }}>{pet.name}'s digital ID tag</p>
      </div>
      <div style={{ background: t.card, borderRadius: 20, padding: 24, marginBottom: 16, textAlign: "center", boxShadow: t.shadow }}>
        <div style={{ background: "white", borderRadius: 16, padding: 20, display: "inline-block", marginBottom: 16 }}>
          <div ref={qrRef} />
        </div>
        <div style={{ fontWeight: 700, color: t.text, fontSize: 16, marginBottom: 4 }}>{petData.name}</div>
        <div style={{ color: t.textSub, fontSize: 13, marginBottom: 4 }}>{petData.breed} · {petData.age} years</div>
        <div style={{ color: t.textMuted, fontSize: 12, marginBottom: 20 }}>Scan to view full profile</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={downloadQR} style={{ flex: 1, background: "#4A6741", color: "white", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Download size={16} /> Download QR
          </button>
          <button onClick={async () => {
            try {
              if (navigator.share) { await navigator.share({ title: `${pet.name}'s Collarix ID`, url: qrText }); }
              else { await navigator.clipboard.writeText(qrText); toast("Link copied!"); }
            } catch { toast("Could not share"); }
          }} style={{ flex: 1, background: t.accentBg, color: "#4A6741", border: `1.5px solid ${t.borderInput}`, borderRadius: 12, padding: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>
      <div style={{ background: t.card, borderRadius: 16, padding: 16, boxShadow: t.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h4 style={{ margin: 0, color: t.text, fontSize: 14, fontWeight: 700 }}>Tag Information</h4>
          <button onClick={() => setEditMode(!editMode)} style={{ background: t.accentBg, border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 600, color: "#4A6741", cursor: "pointer", fontSize: 12 }}>
            {editMode ? "Cancel" : "✏️ Edit"}
          </button>
        </div>
        {editMode ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input style={is} placeholder="Pet name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input style={is} placeholder="Breed" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} />
            <input style={is} placeholder="Age" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
            <input style={is} placeholder="Owner name" value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} />
            <input style={is} placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <input style={is} placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <button onClick={saveEdit} style={{ background: "#4A6741", color: "white", border: "none", borderRadius: 10, padding: "11px", fontWeight: 700, cursor: "pointer", width: "100%" }}>Save Changes</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[[PawPrint, "Pet", `${petData.name} · ${petData.breed}`],[User, "Owner", petData.owner_info?.name || "—"],[Phone, "Phone", petData.owner_info?.phone || "—"],[MapPin, "Address", petData.owner_info?.address || "—"]].map(([Icon, label, val]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: t.accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={14} color={t.textSub} /></div>
                <div>
                  <div style={{ fontSize: 11, color: t.textMuted }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{val}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── QR SCANNER ────────────────────────────────────────────────────────────────
function QRScannerScreen({ pets, onSelectPet }) {
  const { t } = useTheme();
  const fileRef = useRef(null);
  const [scanned, setScanned] = useState(null);

  function openCamera() { fileRef.current?.click(); }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setScanned({ url, name: file.name });
    toast("📷 Image captured! Use the pet list below to navigate.");
    e.target.value = "";
  }

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <h2 style={{ fontSize: 22, fontFamily: "'Georgia', serif", color: t.text, margin: "0 0 4px" }}>🔍 QR Scanner</h2>
        <p style={{ color: t.textSub, fontSize: 13, margin: 0 }}>Scan a Collarix pet tag</p>
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFile} />
      <div style={{ background: t.card, borderRadius: 20, padding: 28, textAlign: "center", marginBottom: 20, boxShadow: t.shadow }}>
        {scanned ? (
          <>
            <img src={scanned.url} alt="Scanned" style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 14, marginBottom: 14 }} />
            <p style={{ color: t.textSub, fontSize: 13, margin: "0 0 16px" }}>Image captured. Select the matching pet below to view their profile.</p>
          </>
        ) : (
          <>
            <div style={{ width: 120, height: 120, borderRadius: 20, background: t.accentBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: `2px dashed ${t.borderInput}` }}>
              <QrCode size={52} color="#4A6741" opacity={0.6} />
            </div>
            <p style={{ color: t.textSub, fontSize: 14, margin: "0 0 6px", fontWeight: 600 }}>Open your camera to scan a QR tag</p>
            <p style={{ color: t.textMuted, fontSize: 12, margin: "0 0 20px" }}>Point your camera at any Collarix pet tag</p>
          </>
        )}
        <button onClick={openCamera} style={{ background: "#4A6741", color: "white", border: "none", borderRadius: 14, padding: "13px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "0 4px 14px #4A674140" }}>
          <Camera size={18} /> {scanned ? "Scan Another" : "Open Camera"}
        </button>
      </div>
      {pets.length > 0 && (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: "0 0 12px" }}>Your Pets</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pets.map(pet => (
              <button key={pet.id} onClick={() => onSelectPet(pet)} style={{ background: t.card, border: "none", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", boxShadow: t.shadow, textAlign: "left", width: "100%" }}>
                <Avatar pet={pet} size={46} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{pet.name}</div>
                  <div style={{ color: t.textSub, fontSize: 12, marginTop: 2 }}>{pet.breed || "—"} · {pet.age}yr · {pet.sex}</div>
                </div>
                <ChevronRight size={16} color={t.textMuted} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── NOTIFICATION SETTINGS MODAL ───────────────────────────────────────────────
function NotificationModal({ onClose }) {
  const { t } = useTheme();
  const [permission, setPermission] = useState(typeof Notification !== "undefined" ? Notification.permission : "default");
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("collarix-notif-prefs") || "{}"); }
    catch { return {}; }
  });

  const types = [
    { key: "feeding", icon: "🍽️", label: "Feeding Reminders", desc: "Meal time alerts for your pet" },
    { key: "water", icon: "💧", label: "Water Intake", desc: "Hydration check-ins" },
    { key: "vet", icon: "🏥", label: "Vet Appointments", desc: "Upcoming visit reminders" },
    { key: "vaccination", icon: "💉", label: "Vaccination Alerts", desc: "Due date notifications" },
    { key: "grooming", icon: "✂️", label: "Grooming Schedule", desc: "Grooming session reminders" },
    { key: "litter", icon: "🚽", label: "Litter Cleaning", desc: "Daily litter reminders" },
  ];

  async function requestPermission() {
    if (typeof Notification === "undefined") { toast("Notifications not supported in this browser"); return; }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      new Notification("🐾 Collarix Notifications Enabled!", { body: "You'll now receive pet care reminders.", icon: "/favicon.ico" });
      toast("Notifications enabled ✅");
    } else {
      toast("Permission denied. Enable in browser settings.");
    }
  }

  function togglePref(key) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem("collarix-notif-prefs", JSON.stringify(next));
  }

  function sendTest() {
    if (permission !== "granted") { toast("Enable notifications first"); return; }
    new Notification("🐾 Test from Collarix", { body: "Your pet reminders are working perfectly!", icon: "/favicon.ico" });
    toast("Test notification sent!");
  }

  return (
    <Sheet onClose={onClose}>
      <SheetTitle onClose={onClose}>Notification Settings</SheetTitle>
      <div style={{ padding: "0 20px 32px" }}>
        <div style={{ background: permission === "granted" ? t.okBg : t.warnBg, borderRadius: 14, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 28 }}>{permission === "granted" ? "🔔" : "🔕"}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>
              {permission === "granted" ? "Notifications Active" : permission === "denied" ? "Notifications Blocked" : "Notifications Off"}
            </div>
            <div style={{ color: t.textSub, fontSize: 12, marginTop: 2 }}>
              {permission === "granted" ? "You'll receive timely pet care alerts" : permission === "denied" ? "Go to browser settings to unblock" : "Enable to get reminders for your pets"}
            </div>
          </div>
        </div>
        {permission !== "granted" && permission !== "denied" && (
          <button onClick={requestPermission} style={{ width: "100%", background: "#4A6741", color: "white", border: "none", borderRadius: 12, padding: "13px", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 20 }}>
            🔔 Enable Notifications
          </button>
        )}
        {permission === "denied" && (
          <div style={{ background: t.errBg, borderRadius: 12, padding: "12px 14px", marginBottom: 20 }}>
            <p style={{ color: t.errText, fontSize: 13, margin: 0, lineHeight: 1.5 }}>Notifications are blocked. To fix this, go to your browser settings → Site Settings → Notifications → allow for this site.</p>
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: t.textSub, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>Notification Types</h4>
          {types.map((type, i) => (
            <div key={type.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < types.length - 1 ? `1px solid ${t.sepLine}` : "none" }}>
              <span style={{ fontSize: 22, width: 32, textAlign: "center" }}>{type.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: t.text, fontSize: 14 }}>{type.label}</div>
                <div style={{ color: t.textMuted, fontSize: 12 }}>{type.desc}</div>
              </div>
              <Toggle value={prefs[type.key] !== false} onChange={() => togglePref(type.key)} />
            </div>
          ))}
        </div>
        {permission === "granted" && (
          <button onClick={sendTest} style={{ width: "100%", background: t.accentBg, color: "#4A6741", border: `1.5px solid ${t.borderInput}`, borderRadius: 12, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            Send Test Notification
          </button>
        )}
      </div>
    </Sheet>
  );
}

// ── COOKIE PREFERENCES MODAL ──────────────────────────────────────────────────
function CookieModal({ onClose }) {
  const { t } = useTheme();
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("collarix-cookies") || '{"functional":true,"analytics":false,"marketing":false}'); }
    catch { return { functional: true, analytics: false, marketing: false }; }
  });

  function toggle(key) {
    if (key === "functional") return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem("collarix-cookies", JSON.stringify(next));
  }

  function acceptAll() {
    const all = { functional: true, analytics: true, marketing: true };
    setPrefs(all);
    localStorage.setItem("collarix-cookies", JSON.stringify(all));
    toast("All cookies accepted ✅");
    onClose();
  }

  function savePrefs() {
    localStorage.setItem("collarix-cookies", JSON.stringify(prefs));
    toast("Preferences saved ✅");
    onClose();
  }

  const cookies = [
    { key: "functional", icon: "⚙️", label: "Functional Cookies", desc: "Essential for the app to work — login, sessions, preferences. Cannot be disabled.", locked: true },
    { key: "analytics", icon: "📊", label: "Analytics Cookies", desc: "Help us understand how you use Collarix so we can improve the experience." },
    { key: "marketing", icon: "📣", label: "Marketing Cookies", desc: "Used to show you relevant content and promotions from Collarix." },
  ];

  return (
    <Sheet onClose={onClose}>
      <SheetTitle onClose={onClose}>Cookie Preferences</SheetTitle>
      <div style={{ padding: "0 20px 32px" }}>
        <p style={{ color: t.textSub, fontSize: 13, lineHeight: 1.6, margin: "0 0 20px" }}>We use cookies to personalise your experience and improve Collarix. You can choose which cookies to allow below.</p>
        <div style={{ marginBottom: 20 }}>
          {cookies.map((c, i) => (
            <div key={c.key} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: i < cookies.length - 1 ? `1px solid ${t.sepLine}` : "none" }}>
              <span style={{ fontSize: 22, marginTop: 2 }}>{c.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{c.label}</span>
                  {c.locked && <span style={{ background: t.accentBg, color: "#4A6741", borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>Always On</span>}
                </div>
                <div style={{ color: t.textMuted, fontSize: 12, lineHeight: 1.5 }}>{c.desc}</div>
              </div>
              <Toggle value={prefs[c.key]} onChange={() => toggle(c.key)} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={savePrefs} style={{ flex: 1, background: t.accentBg, color: "#4A6741", border: `1.5px solid ${t.borderInput}`, borderRadius: 12, padding: "12px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Save Preferences</button>
          <button onClick={acceptAll} style={{ flex: 1, background: "#4A6741", color: "white", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Accept All</button>
        </div>
      </div>
    </Sheet>
  );
}

// ── PRIVACY POLICY MODAL ──────────────────────────────────────────────────────
function PrivacyModal({ onClose }) {
  const { t } = useTheme();
  const sections = [
    { title: "Information We Collect", content: "We collect information you provide directly: your name, email address, pet details (name, breed, age, health records), and usage data within the app. We also collect device information and app usage analytics to improve our service." },
    { title: "How We Use Your Data", content: "Your data is used solely to provide Collarix services — managing your pet profiles, sending reminders, and personalising your experience. We never sell your personal data to third parties." },
    { title: "Data Storage & Security", content: "All data is stored securely on Supabase-powered servers with industry-standard encryption. Pet health records and personal information are encrypted in transit and at rest." },
    { title: "Pet Health Records", content: "Vaccination records, vet visits, medication logs, and health data belong to you. You can export or delete this data at any time from the app settings." },
    { title: "Third-Party Services", content: "Collarix uses Supabase for database and authentication, and may use analytics tools to understand app usage. These services have their own privacy policies that we encourage you to review." },
    { title: "Your Rights", content: "You have the right to access, correct, or delete your data at any time. You can request a data export by emailing collarix.in@gmail.com. Accounts can be deleted from the Settings screen." },
    { title: "Contact", content: "For privacy concerns or data requests, contact us at collarix.in@gmail.com or via Instagram @collarix.in. We aim to respond within 48 hours." },
  ];
  return (
    <Sheet onClose={onClose} maxH="92vh">
      <SheetTitle onClose={onClose}>Privacy Policy</SheetTitle>
      <div style={{ padding: "0 20px 32px" }}>
        <div style={{ background: t.accentBg, borderRadius: 12, padding: "10px 14px", marginBottom: 20 }}>
          <p style={{ color: t.textSub, fontSize: 12, margin: 0 }}>Last updated: January 2025 · Effective for all Collarix users</p>
        </div>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: "0 0 6px" }}>{i + 1}. {s.title}</h4>
            <p style={{ color: t.textSub, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{s.content}</p>
          </div>
        ))}
        <button onClick={onClose} style={{ width: "100%", background: "#4A6741", color: "white", border: "none", borderRadius: 12, padding: "13px", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 8 }}>Got it</button>
      </div>
    </Sheet>
  );
}

// ── TERMS OF SERVICE MODAL ────────────────────────────────────────────────────
function ToSModal({ onClose }) {
  const { t } = useTheme();
  const sections = [
    { title: "Acceptance of Terms", content: "By using Collarix, you agree to these Terms of Service. If you do not agree, please do not use the app. These terms apply to all users, including pet owners and emergency contacts listed in profiles." },
    { title: "Use of the Service", content: "Collarix is a pet care management app for personal use. You agree not to misuse the service, attempt to access data of other users, or use the app for any commercial purpose without written consent." },
    { title: "Account Responsibility", content: "You are responsible for maintaining the security of your account credentials. Do not share your login details. You are responsible for all activity that occurs under your account." },
    { title: "Pet Data Accuracy", content: "You are responsible for the accuracy of pet health records, vaccination data, and emergency contact information entered into Collarix. Always consult a licensed veterinarian for medical decisions." },
    { title: "Medical Disclaimer", content: "Collarix is not a substitute for professional veterinary advice. All health tracking features are informational tools only. Always consult a qualified vet for medical guidance regarding your pet." },
    { title: "QR Tags & Pet IDs", content: "QR codes generated by Collarix are linked to your pet's profile. Ensure the contact information in the profile is accurate and up to date, as this data is accessible to anyone who scans the tag." },
    { title: "Termination", content: "We reserve the right to terminate accounts that violate these terms. You may delete your account at any time from the Settings screen, which permanently removes all your data from our servers." },
    { title: "Changes to Terms", content: "We may update these terms from time to time. Continued use of Collarix after changes constitutes acceptance of the updated terms. We'll notify you of significant changes via the app." },
  ];
  return (
    <Sheet onClose={onClose} maxH="92vh">
      <SheetTitle onClose={onClose}>Terms of Service</SheetTitle>
      <div style={{ padding: "0 20px 32px" }}>
        <div style={{ background: t.accentBg, borderRadius: 12, padding: "10px 14px", marginBottom: 20 }}>
          <p style={{ color: t.textSub, fontSize: 12, margin: 0 }}>Last updated: January 2025 · Please read carefully before using Collarix</p>
        </div>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: "0 0 6px" }}>{i + 1}. {s.title}</h4>
            <p style={{ color: t.textSub, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{s.content}</p>
          </div>
        ))}
        <button onClick={onClose} style={{ width: "100%", background: "#4A6741", color: "white", border: "none", borderRadius: 12, padding: "13px", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 8 }}>I Understand</button>
      </div>
    </Sheet>
  );
}

// ── RATE COLLARIX MODAL ───────────────────────────────────────────────────────
function RateModal({ onClose }) {
  const { t } = useTheme();
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const messages = ["", "Needs improvement", "It's okay", "Pretty good!", "Really love it!", "Absolutely amazing! 🐾"];

  async function submit() {
    if (stars === 0) { toast("Please select a rating"); return; }
    try {
      await supabase.from("app_ratings").insert({ stars, feedback, created_at: new Date().toISOString() });
    } catch {}
    localStorage.setItem("collarix-rated", "true");
    setSubmitted(true);
  }

  if (submitted) return (
    <Sheet onClose={onClose}>
      <div style={{ padding: "16px 20px 40px", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🐾</div>
        <h3 style={{ fontFamily: "'Georgia', serif", fontSize: 22, color: t.text, margin: "0 0 8px" }}>Thank you!</h3>
        <p style={{ color: t.textSub, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>Your feedback helps us make Collarix better for pet owners everywhere. We truly appreciate it!</p>
        <button onClick={onClose} style={{ background: "#4A6741", color: "white", border: "none", borderRadius: 12, padding: "13px 32px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Close</button>
      </div>
    </Sheet>
  );

  return (
    <Sheet onClose={onClose}>
      <SheetTitle onClose={onClose}>Rate Collarix</SheetTitle>
      <div style={{ padding: "0 20px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>⭐</div>
        <p style={{ color: t.textSub, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>How would you rate your Collarix experience? Your feedback helps us improve!</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 12 }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setStars(n)} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, transform: (hovered || stars) >= n ? "scale(1.2)" : "scale(1)", transition: "transform 0.15s" }}>
              <Star size={36} color={(hovered || stars) >= n ? "#F4C430" : t.borderInput} fill={(hovered || stars) >= n ? "#F4C430" : "none"} strokeWidth={1.5} />
            </button>
          ))}
        </div>
        {(hovered || stars) > 0 && (
          <div style={{ color: "#F4C430", fontWeight: 700, fontSize: 15, marginBottom: 16, height: 22 }}>{messages[hovered || stars]}</div>
        )}
        <textarea
          placeholder="Tell us what you love or what we can improve (optional)"
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          style={{ ...iStyle(t), resize: "none", height: 80, marginBottom: 16, textAlign: "left" }}
        />
        <button onClick={submit} style={{ width: "100%", background: stars > 0 ? "#4A6741" : t.borderInput, color: "white", border: "none", borderRadius: 12, padding: "13px", fontWeight: 700, fontSize: 14, cursor: stars > 0 ? "pointer" : "not-allowed", transition: "background 0.2s" }}>
          Submit Rating
        </button>
      </div>
    </Sheet>
  );
}

// ── APP HEADER ─────────────────────────────────────────────────────────────────
function AppHeader({ currentScreen, currentPet, onBack, onInstall, canInstall, showInstallIOS, darkMode, onToggleDark }) {
  const { t } = useTheme();
  const showBack = ["food","water","litter","vet","reminders","qr","pet-profile"].includes(currentScreen);

  const titles = {
    home: null, pets: "My Pets", qr: currentPet?.name ? `${currentPet.name}'s QR Tag` : "QR Tag",
    blog: "Pet Insights", settings: "Settings", scanner: "QR Scanner",
    food: `🍽️ Food · ${currentPet?.name || ""}`, water: `💧 Water · ${currentPet?.name || ""}`,
    litter: `🚽 Litter · ${currentPet?.name || ""}`, vet: `🏥 Vet & Health · ${currentPet?.name || ""}`,
    reminders: `🔔 Reminders · ${currentPet?.name || ""}`, "pet-profile": currentPet?.name || "Pet Profile",
  };

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100, background: t.card, borderBottom: `1px solid ${t.border}`, padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {showBack ? (
          <button onClick={onBack} style={{ background: t.accentBg, border: "none", borderRadius: 10, padding: "7px", cursor: "pointer", display: "flex" }}>
            <ChevronLeft size={18} color={t.text} />
          </button>
        ) : (
          <img src={collarixLogo} alt="Collarix" style={{ width: 30, height: 30, objectFit: "contain" }} />
        )}
        {titles[currentScreen] ? (
          <span style={{ fontFamily: showBack ? "inherit" : "'Georgia', serif", fontSize: showBack ? 15 : 17, fontWeight: showBack ? 600 : 700, color: t.text, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{titles[currentScreen]}</span>
        ) : (
          <span style={{ fontFamily: "'Georgia', serif", fontSize: 18, fontWeight: 700, color: t.text }}>Collarix</span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {canInstall && (
          <button onClick={onInstall} style={{ background: t.accentBg, border: "none", borderRadius: 10, padding: "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#4A6741" }}>Install</button>
        )}
        {showInstallIOS && (
          <button onClick={onInstall} style={{ background: t.accentBg, border: "none", borderRadius: 10, padding: "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#4A6741" }}>Install</button>
        )}
        <button onClick={onToggleDark} style={{ background: t.accentBg, border: "none", borderRadius: 10, padding: "7px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {darkMode ? <Sun size={16} color="#F4C430" /> : <Moon size={16} color={t.textSub} />}
        </button>
      </div>
    </div>
  );
}

// ── BOTTOM NAV ────────────────────────────────────────────────────────────────
function BottomNav({ current, onChange }) {
  const { t, dark } = useTheme();
  const tabs = [
    { id: "home", label: "Home", Icon: Home },
    { id: "pets", label: "Pets", Icon: PawPrint },
    { id: "scanner", label: "Scan", Icon: QrCode },
    { id: "blog", label: "Blog", Icon: BookOpen },
    { id: "settings", label: "Settings", Icon: Settings },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: t.card, borderTop: `1px solid ${t.border}`, display: "flex", padding: "6px 0 max(env(safe-area-inset-bottom),6px)", zIndex: 100 }}>
      {tabs.map(({ id, label, Icon }) => {
        const active = current === id;
        return (
          <button key={id} onClick={() => onChange(id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
            <div style={{ width: 40, height: 28, borderRadius: 12, background: active ? "#4A6741" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
              <Icon size={18} color={active ? "white" : t.textMuted} strokeWidth={active ? 2.5 : 2} />
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? "#4A6741" : t.textMuted }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── SETTINGS SCREEN ───────────────────────────────────────────────────────────
function SettingsScreen({ user, pets, darkMode, onToggleDark, onSignOut }) {
  const { t } = useTheme();
  const [showNotif, setShowNotif] = useState(false);
  const [showCookie, setShowCookie] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showToS, setShowToS] = useState(false);
  const [showRate, setShowRate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  function SettingRow({ icon: Icon, label, subtitle, rightEl, onClick, destructive }) {
    return (
      <button onClick={onClick} disabled={!onClick} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", background: "none", border: "none", cursor: onClick ? "pointer" : "default", width: "100%", textAlign: "left" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: destructive ? "#FFEBEE" : t.accentBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={18} color={destructive ? "#C62828" : "#4A6741"} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: destructive ? "#C62828" : t.text, fontSize: 14 }}>{label}</div>
          {subtitle && <div style={{ color: t.textMuted, fontSize: 12, marginTop: 1 }}>{subtitle}</div>}
        </div>
        {rightEl || (onClick && <ChevronRight size={16} color={t.textMuted} />)}
      </button>
    );
  }

  async function deleteAccount() {
    try {
      for (const pet of pets) await supabase.from("pets").delete().eq("id", pet.id);
      await supabase.auth.admin?.deleteUser?.(user.id);
      await supabase.auth.signOut();
      toast("Account deleted. Goodbye 🐾");
    } catch {
      await supabase.auth.signOut();
      toast("Signed out. Contact us to fully delete your data.");
    }
  }

  const sep = <div style={{ height: 1, background: t.sepLine, margin: "2px 0" }} />;

  return (
    <div style={{ padding: "0 16px 16px" }}>
      {showNotif && <NotificationModal onClose={() => setShowNotif(false)} />}
      {showCookie && <CookieModal onClose={() => setShowCookie(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showToS && <ToSModal onClose={() => setShowToS(false)} />}
      {showRate && <RateModal onClose={() => setShowRate(false)} />}

      <div style={{ padding: "20px 0 16px" }}>
        <h2 style={{ fontSize: 22, fontFamily: "'Georgia', serif", color: t.text, margin: "0 0 4px" }}>Settings</h2>
        <p style={{ color: t.textSub, fontSize: 13, margin: 0 }}>Manage your Collarix account</p>
      </div>

      {/* Profile Card */}
      <div style={{ background: `linear-gradient(135deg, #2C3520, #4A6741)`, borderRadius: 20, padding: "20px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid rgba(255,255,255,0.3)" }}>
          <User size={24} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: "white", fontSize: 16 }}>{user.user_metadata?.full_name || "Pet Parent"}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 }}>{user.email}</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4 }}>{pets.length} pet{pets.length !== 1 ? "s" : ""} registered</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "6px 12px" }}>
          <PawPrint size={20} color="white" />
        </div>
      </div>

      {/* Appearance */}
      <SectionCard title="Appearance">
        <SettingRow icon={darkMode ? Sun : Moon} label={darkMode ? "Light Mode" : "Dark Mode"} subtitle={darkMode ? "Switch to light theme" : "Switch to dark theme"} onClick={onToggleDark}
          rightEl={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {darkMode ? <Sun size={14} color="#F4C430" /> : <Moon size={14} color="#7A8B6A" />}
              <Toggle value={darkMode} onChange={onToggleDark} />
            </div>
          }
        />
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notifications">
        <SettingRow icon={Bell} label="Notification Settings" subtitle="Manage reminders & alert types" onClick={() => setShowNotif(true)} />
      </SectionCard>

      {/* Pet Management */}
      <SectionCard title="Pets">
        <SettingRow icon={PawPrint} label="My Pets" subtitle={`${pets.length} companion${pets.length !== 1 ? "s" : ""} registered`} />
        {sep}
        <SettingRow icon={Activity} label="Health Overview" subtitle="All pets vaccination status" />
      </SectionCard>

      {/* Privacy */}
      <SectionCard title="Privacy & Legal">
        <SettingRow icon={Cookie} label="Cookie Preferences" subtitle="Manage analytics & marketing cookies" onClick={() => setShowCookie(true)} />
        {sep}
        <SettingRow icon={Lock} label="Privacy Policy" subtitle="How we handle your data" onClick={() => setShowPrivacy(true)} />
        {sep}
        <SettingRow icon={FileText} label="Terms of Service" subtitle="Our usage terms and conditions" onClick={() => setShowToS(true)} />
      </SectionCard>

      {/* About */}
      <SectionCard title="About Collarix">
        <SettingRow icon={Star} label="Rate Collarix" subtitle="Tell us what you think ⭐" onClick={() => setShowRate(true)} />
        {sep}
        <SettingRow icon={Mail} label="Contact Support" subtitle="collarix.in@gmail.com" onClick={() => window.open("mailto:collarix.in@gmail.com", "_blank")} />
        {sep}
        <SettingRow icon={ExternalLink} label="Follow Us on Instagram" subtitle="@collarix.in" onClick={() => window.open("https://instagram.com/collarix.in", "_blank")} />
        {sep}
        <SettingRow icon={Info} label="Version" subtitle="Collarix v2.0.0 · Made with 🐾 by Saloni" />
      </SectionCard>

      {/* Account */}
      <SectionCard title="Account">
        <SettingRow icon={LogOut} label="Sign Out" subtitle="Sign out of your account" onClick={onSignOut} />
        {sep}
        {!deleteConfirm ? (
          <SettingRow icon={Trash2} label="Delete Account" subtitle="Permanently remove all your data" onClick={() => setDeleteConfirm(true)} destructive />
        ) : (
          <div style={{ padding: "12px 0" }}>
            <div style={{ background: t.errBg, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: t.errText, fontSize: 14, marginBottom: 4 }}>⚠️ Delete Account?</div>
              <div style={{ color: t.errText, fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>This will permanently delete all your pets, health records, and data. This cannot be undone.</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(false)} style={{ flex: 1, background: t.accentBg, color: t.textSub, border: "none", borderRadius: 10, padding: "11px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={deleteAccount} style={{ flex: 1, background: "#C62828", color: "white", border: "none", borderRadius: 10, padding: "11px", fontWeight: 700, cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        )}
      </SectionCard>
      <div style={{ height: 20 }} />
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const [currentScreen, setCurrentScreen] = useState("home");
  const [currentPet, setCurrentPet] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("collarix-dark") === "true"; } catch { return false; }
  });
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const { canInstall, promptInstall, isInstalled } = useInstallPrompt();

  const theme = getTheme(darkMode);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.navigator.standalone;

  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
  }, [darkMode]);

  function toggleDark() {
    setDarkMode(d => {
      const next = !d;
      try { localStorage.setItem("collarix-dark", String(next)); } catch {}
      return next;
    });
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) { setPets([]); setCurrentScreen("home"); setCurrentPet(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    supabase.from("pets").select("*").eq("user_id", session.user.id).order("created_at")
      .then(({ data }) => setPets(data || []));
  }, [session]);

  useEffect(() => {
    if (isInstalled) return;
    const dismissed = sessionStorage.getItem("collarix-install-dismissed");
    if (dismissed) return;
    const t = setTimeout(() => {
      if (canInstall) setShowInstallBanner(true);
      else if (isIOS) setShowInstallBanner(true);
    }, 3000);
    return () => clearTimeout(t);
  }, [canInstall, isIOS, isInstalled]);

  async function handleInstall() {
    if (canInstall) {
      setShowInstallBanner(false);
      await promptInstall();
    } else if (isIOS) {
      setShowInstallBanner(false);
      setShowIOSModal(true);
    }
  }

  function dismissInstall() {
    setShowInstallBanner(false);
    sessionStorage.setItem("collarix-install-dismissed", "true");
  }

  function navigate(screen, pet = null) {
    setCurrentScreen(screen);
    if (pet) setCurrentPet(pet);
  }

  function goBack() {
    const backMap = {
      food: "pet-profile", water: "pet-profile", litter: "pet-profile",
      vet: "pet-profile", reminders: "pet-profile", qr: "pet-profile",
      "pet-profile": "pets",
    };
    const dest = backMap[currentScreen] || "pets";
    setCurrentScreen(dest);
    if (dest !== "pet-profile") setCurrentPet(null);
  }

  function handleSelectPet(pet) {
    setCurrentPet(pet);
    setCurrentScreen("pet-profile");
  }

  function handlePetNavigation(screen, pet) {
    setCurrentPet(pet);
    setCurrentScreen(screen);
  }

  function handlePetAdded(pet) {
    setPets(prev => [...prev, pet]);
  }

  function handlePetUpdated(updatedPet) {
    setPets(prev => prev.map(p => p.id === updatedPet.id ? updatedPet : p));
    if (currentPet?.id === updatedPet.id) setCurrentPet(updatedPet);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setCurrentScreen("home");
    setCurrentPet(null);
  }

  function renderScreen() {
    if (!session) return <LoginScreen />;
    switch (currentScreen) {
      case "home": return <DashboardScreen pets={pets} user={session.user} onSelectPet={handleSelectPet} onOpenQR={pet => { setCurrentPet(pet); setCurrentScreen("qr"); }} />;
      case "pets": return <MyPetsScreen pets={pets} user={session.user} onSelect={handleSelectPet} onPetAdded={handlePetAdded} />;
      case "pet-profile": return currentPet ? <PetProfileScreen pet={currentPet} user={session.user} onNavigate={handlePetNavigation} onBack={goBack} /> : <MyPetsScreen pets={pets} user={session.user} onSelect={handleSelectPet} onPetAdded={handlePetAdded} />;
      case "food": return currentPet ? <FoodScreen pet={currentPet} user={session.user} /> : null;
      case "water": return currentPet ? <WaterScreen pet={currentPet} user={session.user} /> : null;
      case "litter": return currentPet ? <LitterScreen pet={currentPet} user={session.user} onPetUpdated={handlePetUpdated} /> : null;
      case "vet": return currentPet ? <VetScreen pet={currentPet} user={session.user} /> : null;
      case "reminders": return currentPet ? <RemindersScreen pet={currentPet} user={session.user} /> : null;
      case "qr": return currentPet ? <QRGeneratorScreen pet={currentPet} user={session.user} /> : null;
      case "scanner": return <QRScannerScreen pets={pets} onSelectPet={handleSelectPet} />;
      case "blog": return <BlogScreen />;
      case "settings": return <SettingsScreen user={session.user} pets={pets} darkMode={darkMode} onToggleDark={toggleDark} onSignOut={handleSignOut} />;
      default: return <DashboardScreen pets={pets} user={session.user} onSelectPet={handleSelectPet} />;
    }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F7F5F0" }}>
      <img src={collarixLogo} alt="Collarix" style={{ width: 100, height: 100, objectFit: "contain", marginBottom: 20, filter: "drop-shadow(0 4px 12px rgba(74,103,65,0.2))" }} />
      <Loader size={24} color="#4A6741" style={{ animation: "spin 1s linear infinite" }} />
    </div>
  );

  const isLoggedIn = !!session;
  const navScreen = ["food","water","litter","vet","reminders","qr","pet-profile"].includes(currentScreen) ? "pets" : currentScreen;

  return (
    <ThemeCtx.Provider value={{ dark: darkMode, t: theme }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0; height: 0; }
        textarea { font-family: inherit; }
        select option { background: ${theme.card}; color: ${theme.text}; }
      `}</style>
      <div style={{ background: theme.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        {isLoggedIn && (
          <AppHeader
            currentScreen={currentScreen} currentPet={currentPet}
            onBack={goBack} canInstall={canInstall && !isIOS}
            showInstallIOS={isIOS && !isInstalled}
            onInstall={handleInstall} darkMode={darkMode} onToggleDark={toggleDark}
          />
        )}
        <div style={{ paddingBottom: isLoggedIn ? 80 : 0, minHeight: isLoggedIn ? "calc(100vh - 56px)" : "100vh" }}>
          {renderScreen()}
        </div>
        {isLoggedIn && (
          <BottomNav current={navScreen} onChange={s => { setCurrentScreen(s); if (!["pets","scanner","blog","settings"].includes(s)) setCurrentPet(null); }} />
        )}
        {showInstallBanner && !isInstalled && (
          <InstallBanner onInstall={handleInstall} onDismiss={dismissInstall} />
        )}
        {showIOSModal && <IOSInstallModal onClose={() => setShowIOSModal(false)} />}
      </div>
    </ThemeCtx.Provider>
  );
}
