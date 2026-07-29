import { useState, useEffect, useRef, useCallback } from "react";
import {
  PawPrint, QrCode, Bell, BookOpen, Settings, Home, ChevronRight,
  Plus, Camera, MapPin, Droplets, Utensils, Stethoscope, Trash2,
  Edit3, X, Check, Clock, Calendar, Weight, Ruler, Heart,
  AlertCircle, Phone, Mail, User, ChevronLeft, LogOut, Search,
  Activity, Shield, Syringe, Pill, Scissors, Star, ArrowRight,
  Dog, Cat, Wifi, Battery, Share2, Download, Eye, ThumbsUp,
  MessageCircle, Filter, SortAsc, MoreVertical, Zap, Navigation,
  RefreshCw, CheckCircle, XCircle, Info, TrendingUp, BarChart2,
  Moon, Sun, Flame, Wind, Leaf, Coffee, Loader
} from "lucide-react";
import { supabase } from "./supabaseClient";
import collarixLogo from "./collarix-logo.svg";

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
const PET_EMOJIS = { dog: "🐕", cat: "🐱" };
const inputStyle = {
  border: "1.5px solid #E8EDE4", borderRadius: 11, padding: "12px 14px",
  fontSize: 14, color: "#2C3520", outline: "none", background: "#FAFAF8",
  width: "100%", boxSizing: "border-box"
};

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
  return (
    <div style={{ background: "white", borderRadius: 16, padding: "14px 16px", marginBottom: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
      <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#9AA88A", textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</h4>
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
    fontSize: 13, fontWeight: 600, zIndex: 99999, boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
    maxWidth: "320px", textAlign: "center"
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}
function today() { return new Date().toISOString().slice(0, 10); }

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
    setLoading(true);
    if (tab === "login") {
      const { error: e } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (e) setError(e.message);
    } else {
      if (!fullName) { setError("Please enter your full name."); setLoading(false); return; }
      const { error: e } = await supabase.auth.signUp({
        email, password: pass,
        options: { data: { full_name: fullName } }
      });
      if (e) setError(e.message);
      else setInfo("Account created! Check your email to confirm, then sign in.");
    }
    setLoading(false);
  }

  async function handleForgot() {
    if (!email) { setError("Enter your email first."); return; }
    const { error: e } = await supabase.auth.resetPasswordForEmail(email);
    if (e) setError(e.message);
    else setInfo("Password reset email sent!");
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #F7F5F0 0%, #EBF0E8 50%, #F0EDE8 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", position: "relative", overflow: "hidden" }}>
      {Array.from({ length: 16 }).map((_, i) => {
        const row = Math.floor(i / 4); const col = i % 4;
        return <div key={i} style={{ position: "absolute", left: `${col * 30 - 5 + (row % 2) * 15}%`, top: `${row * 14 - 3}%`, transform: "rotate(-35deg)", fontFamily: "'Georgia', serif", fontSize: 13, fontWeight: 700, color: "#3A5A30", opacity: 0.07, letterSpacing: "3px", textTransform: "uppercase", whiteSpace: "nowrap", userSelect: "none" }}>NovaTech</div>;
      })}
      <div style={{ textAlign: "center", marginBottom: 32, position: "relative", zIndex: 1 }}>
        <img src={collarixLogo} alt="Collarix" style={{ width: 160, height: 160, objectFit: "contain", display: "block", margin: "0 auto 8px", filter: "drop-shadow(0 4px 16px rgba(74,103,65,0.18))" }} />
        <p style={{ color: "#7A8B6A", fontSize: 12, margin: "0", letterSpacing: "2px", textTransform: "uppercase" }}>Smart Pet Care by Saloni Agarwal</p>
      </div>
      <div style={{ background: "white", borderRadius: 20, padding: 28, width: "100%", maxWidth: 380, boxShadow: "0 4px 30px rgba(0,0,0,0.08)", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", background: "#F7F5F0", borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {["login", "signup"].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); setInfo(""); }} style={{ flex: 1, padding: "10px", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 600, fontSize: 13, background: tab === t ? "white" : "transparent", color: tab === t ? "#2C3520" : "#9AA88A", boxShadow: tab === t ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s" }}>
              {t === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>
        {error && <div style={{ background: "#FFEBEE", color: "#C62828", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>{error}</div>}
        {info && <div style={{ background: "#E8F4E8", color: "#2E7D32", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>{info}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tab === "signup" && (
            <input style={inputStyle} placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} />
          )}
          <input style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" />
          <input style={inputStyle} value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" type="password" onKeyDown={e => e.key === "Enter" && handleAuth()} />
          {tab === "login" && (
            <div style={{ textAlign: "right", marginTop: -6 }}>
              <span onClick={handleForgot} style={{ color: "#7A8B6A", fontSize: 12, cursor: "pointer" }}>Forgot password?</span>
            </div>
          )}
          <button onClick={handleAuth} disabled={loading} style={{ background: "#4A6741", color: "white", border: "none", borderRadius: 12, padding: "14px", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginTop: 4, boxShadow: "0 4px 14px #4A674140", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Please wait…" : tab === "login" ? "Sign In" : "Create Account"}
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
  const [form, setForm] = useState({
    name: "", species: "dog", breed: "", age: "", dob: "",
    weight: "", height: "", sex: "Male",
    photo: "🐕", color: "#D4A853",
    owner_name: "", owner_phone: "", owner_email: "", owner_address: "",
    emergency_name: "", emergency_phone: "", emergency_relation: ""
  });
  const [loading, setLoading] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function save() {
    if (!form.name) { toast("Pet name is required"); return; }
    setLoading(true);
    const { data, error } = await supabase.from("pets").insert({
      user_id: user.id,
      name: form.name,
      species: form.species,
      breed: form.breed,
      age: parseInt(form.age) || 0,
      dob: form.dob || null,
      weight: parseFloat(form.weight) || null,
      height: parseFloat(form.height) || null,
      sex: form.sex,
      photo: form.photo || (form.species === "cat" ? "🐱" : "🐕"),
      color: form.color || PET_COLORS[0],
      owner_info: { name: form.owner_name, phone: form.owner_phone, email: form.owner_email, address: form.owner_address },
      emergency_contact: { name: form.emergency_name, phone: form.emergency_phone, relation: form.emergency_relation },
      health: { vaccinations: [], allergies: [], conditions: ["None"], medications: [] }
    }).select().single();
    setLoading(false);
    if (error) { toast("Error: " + error.message); return; }
    toast("🐾 " + form.name + " added!");
    onAdded(data);
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 430, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontFamily: "'Georgia', serif", fontSize: 20, color: "#2C3520" }}>Add New Pet</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color="#9AA88A" /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["dog", "cat"].map(s => (
              <button key={s} onClick={() => { f("species", s); f("photo", s === "cat" ? "🐱" : "🐕"); }} style={{ flex: 1, padding: "10px", border: "2px solid", borderColor: form.species === s ? "#4A6741" : "#E8EDE4", borderRadius: 12, cursor: "pointer", background: form.species === s ? "#F0F4EC" : "white", fontWeight: 600, color: form.species === s ? "#4A6741" : "#9AA88A" }}>
                {s === "dog" ? "🐕 Dog" : "🐱 Cat"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["🐕","🐶","🐕‍🦺","🐩","🐱","🐈","😺","😸"].map(e => (
              <button key={e} onClick={() => f("photo", e)} style={{ fontSize: 22, background: form.photo === e ? "#F0F4EC" : "transparent", border: "2px solid", borderColor: form.photo === e ? "#4A6741" : "transparent", borderRadius: 8, padding: "4px 6px", cursor: "pointer" }}>{e}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PET_COLORS.map(c => (
              <button key={c} onClick={() => f("color", c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: form.color === c ? "3px solid #2C3520" : "3px solid transparent", cursor: "pointer" }} />
            ))}
          </div>
          <input style={inputStyle} placeholder="Pet name *" value={form.name} onChange={e => f("name", e.target.value)} />
          <input style={inputStyle} placeholder="Breed" value={form.breed} onChange={e => f("breed", e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input style={inputStyle} placeholder="Age (years)" type="number" value={form.age} onChange={e => f("age", e.target.value)} />
            <input style={inputStyle} placeholder="DOB (YYYY-MM-DD)" value={form.dob} onChange={e => f("dob", e.target.value)} />
            <input style={inputStyle} placeholder="Weight (kg)" type="number" value={form.weight} onChange={e => f("weight", e.target.value)} />
            <input style={inputStyle} placeholder="Height (cm)" type="number" value={form.height} onChange={e => f("height", e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["Male","Female"].map(s => (
              <button key={s} onClick={() => f("sex", s)} style={{ flex: 1, padding: "10px", border: "2px solid", borderColor: form.sex === s ? "#4A6741" : "#E8EDE4", borderRadius: 12, cursor: "pointer", background: form.sex === s ? "#F0F4EC" : "white", fontWeight: 600, color: form.sex === s ? "#4A6741" : "#9AA88A" }}>{s}</button>
            ))}
          </div>
          <div style={{ padding: "8px 0 4px", fontSize: 12, fontWeight: 700, color: "#9AA88A", textTransform: "uppercase", letterSpacing: "0.5px" }}>Owner Info</div>
          <input style={inputStyle} placeholder="Owner name" value={form.owner_name} onChange={e => f("owner_name", e.target.value)} />
          <input style={inputStyle} placeholder="Phone" value={form.owner_phone} onChange={e => f("owner_phone", e.target.value)} />
          <input style={inputStyle} placeholder="Email" value={form.owner_email} onChange={e => f("owner_email", e.target.value)} />
          <input style={inputStyle} placeholder="Address" value={form.owner_address} onChange={e => f("owner_address", e.target.value)} />
          <div style={{ padding: "8px 0 4px", fontSize: 12, fontWeight: 700, color: "#9AA88A", textTransform: "uppercase", letterSpacing: "0.5px" }}>Emergency Contact</div>
          <input style={inputStyle} placeholder="Name" value={form.emergency_name} onChange={e => f("emergency_name", e.target.value)} />
          <input style={inputStyle} placeholder="Phone" value={form.emergency_phone} onChange={e => f("emergency_phone", e.target.value)} />
          <input style={inputStyle} placeholder="Relation (e.g. Spouse)" value={form.emergency_relation} onChange={e => f("emergency_relation", e.target.value)} />
          <button onClick={save} disabled={loading} style={{ background: "#4A6741", color: "white", border: "none", borderRadius: 12, padding: "14px", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Saving…" : "Add Pet 🐾"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MY PETS ───────────────────────────────────────────────────────────────────
function MyPetsScreen({ pets, user, onSelect, onPetAdded }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const filtered = pets.filter(p =>
    (filter === "all" || p.species === filter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ padding: "0 16px 16px" }}>
      {showAdd && <AddPetModal user={user} onClose={() => setShowAdd(false)} onAdded={onPetAdded} />}
      <div style={{ padding: "20px 0 16px" }}>
        <h2 style={{ fontSize: 22, fontFamily: "'Georgia', serif", color: "#2C3520", margin: "0 0 4px" }}>My Pets</h2>
        <p style={{ color: "#7A8B6A", fontSize: 13, margin: 0 }}>{pets.length} companion{pets.length !== 1 ? "s" : ""} registered</p>
      </div>
      <div style={{ position: "relative", marginBottom: 14 }}>
        <Search size={15} color="#9AA88A" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pets..." style={{ ...inputStyle, paddingLeft: 36 }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[["all","All"],["dog","Dogs 🐕"],["cat","Cats 🐱"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ padding: "6px 16px", borderRadius: 20, border: "1.5px solid", borderColor: filter === val ? "#4A6741" : "#DDE5D8", background: filter === val ? "#4A6741" : "white", color: filter === val ? "white" : "#7A8B6A", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{label}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(pet => {
          const overdueVax = (pet.health?.vaccinations || []).some(v => v.status === "overdue");
          const alerts = overdueVax ? 1 : 0;
          const owner = pet.owner_info || {};
          return (
            <button key={pet.id} onClick={() => onSelect(pet)} style={{ background: "white", border: "none", borderRadius: 16, padding: "16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", textAlign: "left", width: "100%" }}>
              <Avatar pet={pet} size={56} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, color: "#2C3520", fontSize: 16 }}>{pet.name}</span>
                  {alerts > 0 && <span style={{ background: "#FFEBEE", color: "#C62828", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "1px 8px" }}>{alerts} alert{alerts > 1 ? "s" : ""}</span>}
                </div>
                <p style={{ margin: "2px 0 0", color: "#7A8B6A", fontSize: 13 }}>{pet.breed || "—"} • {pet.age || "?"}yr • {pet.sex || "—"}</p>
                <p style={{ margin: "4px 0 0", color: "#B5BFB0", fontSize: 11 }}>{pet.species === "cat" ? "🐱 Cat" : "🐕 Dog"}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4A6741" }} />
                <ChevronRight size={16} color="#C5D0BE" />
              </div>
            </button>
          );
        })}
        <button onClick={() => setShowAdd(true)} style={{ background: "#F7F9F6", border: "1.5px dashed #C5D0BE", borderRadius: 16, padding: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", color: "#7A8B6A", fontWeight: 600 }}>
          <Plus size={18} /> Add New Pet
        </button>
      </div>
    </div>
  );
}

// ── PET PROFILE ───────────────────────────────────────────────────────────────
function PetProfileScreen({ pet, user, onNavigate, onBack }) {
  const health = pet.health || { vaccinations: [], allergies: [], conditions: ["None"], medications: [] };
  const overdueVax = health.vaccinations.filter(v => v.status === "overdue");
  const owner = pet.owner_info || {};
  const emergency = pet.emergency_contact || {};

  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ background: `linear-gradient(135deg, ${pet.color || "#D4A853"}40, ${pet.color || "#D4A853"}15)`, padding: "24px 20px 20px", position: "relative" }}>
        <button onClick={onBack} style={{ background: "white", border: "none", borderRadius: 10, padding: "8px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: 16 }}>
          <ChevronLeft size={18} color="#2C3520" />
        </button>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
          <Avatar pet={pet} size={80} />
          <div>
            <h2 style={{ fontSize: 26, fontFamily: "'Georgia', serif", color: "#2C3520", margin: "0 0 2px" }}>{pet.name}</h2>
            <p style={{ color: "#5A7050", fontSize: 13, margin: "0 0 8px" }}>{pet.breed || "—"} • {pet.age || "?"} years</p>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ background: "white", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 600, color: "#4A6741" }}>{pet.sex}</span>
              <span style={{ background: "white", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 600, color: "#4A6741" }}>{pet.species === "cat" ? "🐱 Cat" : "🐕 Dog"}</span>
            </div>
          </div>
        </div>
        <a href={/iPhone|iPad|iPod/i.test(navigator.userAgent) ? "https://www.apple.com/icloud/find-my/" : "https://www.google.com/android/find"} target="_blank" rel="noopener noreferrer" style={{ position: "absolute", top: 24, right: 20, background: "#4A6741", color: "white", borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, textDecoration: "none", boxShadow: "0 3px 12px #4A674140" }}>
          <Navigation size={14} /> Find Pet
        </a>
      </div>
      <div style={{ padding: "0 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, margin: "16px 0" }}>
          {[[`${pet.weight || "?"}kg`,"Weight",Weight],[`${pet.height || "?"}cm`,"Height",Ruler],[pet.dob ? pet.dob.slice(5).replace("-", "/") : "—","DOB",Calendar]].map(([val, label, Icon]) => (
            <div key={label} style={{ background: "white", borderRadius: 14, padding: "12px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <Icon size={16} color="#7A8B6A" style={{ marginBottom: 4 }} />
              <div style={{ fontWeight: 700, color: "#2C3520", fontSize: 14 }}>{val}</div>
              <div style={{ color: "#9AA88A", fontSize: 11 }}>{label}</div>
            </div>
          ))}
        </div>
        {overdueVax.length > 0 && (
          <div style={{ background: "#FFEBEE", borderRadius: 12, padding: "12px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={18} color="#C62828" />
            <div>
              <div style={{ fontWeight: 600, color: "#C62828", fontSize: 13 }}>Vaccination overdue</div>
              <div style={{ color: "#E57373", fontSize: 12 }}>{overdueVax.map(v => v.name).join(", ")}</div>
            </div>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
          {[["Food","food",Utensils,"#A8C5A0"],["Water","water",Droplets,"#9DB8C8"],["Litter","litter",Trash2,"#D4C5A9"],["Vet","vet",Stethoscope,"#C4956A"],["Reminders","reminders",Bell,"#B8A9C9"],["Health","vet",Activity,"#8B9E6B"]].map(([label, screen, Icon, color]) => (
            <button key={label} onClick={() => onNavigate(screen, pet)} style={{ background: "white", border: "none", borderRadius: 14, padding: "14px 8px", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", textAlign: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}25`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>
                <Icon size={18} color={color} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#5A6A50" }}>{label}</div>
            </button>
          ))}
        </div>
        {health.vaccinations.length > 0 && (
          <SectionCard title="Vaccinations">
            {health.vaccinations.map((v, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < health.vaccinations.length - 1 ? "1px solid #F0F4EC" : "none" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#2C3520", fontSize: 13 }}>{v.name}</div>
                  <div style={{ color: "#9AA88A", fontSize: 11 }}>Next: {v.next}</div>
                </div>
                <StatusBadge status={v.status} />
              </div>
            ))}
          </SectionCard>
        )}
        {health.allergies.length > 0 && (
          <SectionCard title="Allergies">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {health.allergies.map((a, i) => (
                <span key={i} style={{ background: "#FFF3E0", color: "#E65100", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>{a}</span>
              ))}
            </div>
          </SectionCard>
        )}
        {health.medications.length > 0 && (
          <SectionCard title="Medications">
            {health.medications.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <span style={{ fontWeight: 600, color: "#2C3520", fontSize: 13 }}>{m.name}</span>
                <span style={{ color: "#7A8B6A", fontSize: 12 }}>{m.dose} · {m.freq}</span>
              </div>
            ))}
          </SectionCard>
        )}
        <SectionCard title="Owner & Emergency Contact">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[[User, owner.name || "—", "Owner"],[Phone, owner.phone || "—", "Phone"],[Mail, owner.email || "—", "Email"]].map(([Icon, val, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "#F0F4EC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={14} color="#7A8B6A" />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#9AA88A" }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#2C3520" }}>{val}</div>
                </div>
              </div>
            ))}
            {(emergency.name) && (
              <div style={{ marginTop: 4, padding: "10px", background: "#FFF8F0", borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: "#C4956A", fontWeight: 600, marginBottom: 4 }}>EMERGENCY CONTACT</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#2C3520" }}>{emergency.name} · {emergency.relation}</div>
                <div style={{ fontSize: 12, color: "#7A8B6A" }}>{emergency.phone}</div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashboardScreen({ pets, user, onSelectPet }) {
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

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 22, fontFamily: "'Georgia', serif", color: "#2C3520", margin: "0 0 2px" }}>Good morning! 🌿</h2>
          <p style={{ color: "#7A8B6A", fontSize: 13, margin: 0 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <div style={{ background: "#4A6741", borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
          <Wifi size={12} color="white" />
          <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>{pets.length} Active</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[["Total Pets", pets.length, PawPrint, "#4A6741"],["Alerts", alertPets.length, AlertCircle, alertPets.length > 0 ? "#C62828" : "#4A6741"],["Reminders", dashReminders.length, Bell, "#7A6A9A"],["Upcoming Vet", dashVets.length, Stethoscope, "#C4956A"]].map(([label, val, Icon, color]) => (
          <div key={label} style={{ background: "white", borderRadius: 16, padding: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 800, color: "#2C3520", fontSize: 26 }}>{val}</div>
                <div style={{ color: "#9AA88A", fontSize: 12, marginTop: 2 }}>{label}</div>
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
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2C3520", margin: "0 0 10px" }}>⚠️ Needs Attention</h3>
          {alertPets.map(pet => (
            <button key={pet.id} onClick={() => onSelectPet(pet)} style={{ background: "#FFF8F0", border: "1.5px solid #F5D5C0", borderRadius: 14, padding: "12px 14px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, width: "100%", marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>{pet.photo}</span>
              <div>
                <div style={{ fontWeight: 700, color: "#2C3520", fontSize: 14 }}>{pet.name}</div>
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
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2C3520", margin: "0 0 10px" }}>Today's Reminders</h3>
              {dashReminders.slice(0, 5).map((r, i) => {
                const Icon = REMINDER_ICONS[r.type] || Bell;
                const color = REMINDER_COLORS[r.type] || "#8B9E6B";
                return (
                  <div key={r.id || i} style={{ background: "white", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={16} color={color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "#2C3520", fontSize: 13 }}>{r.title}</div>
                      <div style={{ color: "#9AA88A", fontSize: 11 }}>{r.petName} · {r.time}</div>
                    </div>
                    <span style={{ fontSize: 18 }}>{r.petPhoto}</span>
                  </div>
                );
              })}
            </div>
          )}
          {dashVets.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2C3520", margin: "0 0 10px" }}>📅 Upcoming Vet Visits</h3>
              {dashVets.slice(0, 3).map((v, i) => (
                <div key={v.id || i} style={{ background: "white", borderRadius: 12, padding: "12px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{v.petPhoto}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "#2C3520", fontSize: 13 }}>{v.petName} — {v.reason}</div>
                    <div style={{ color: "#9AA88A", fontSize: 11 }}>{v.date} · {v.clinic}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {pets.length > 0 && (
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2C3520", margin: "0 0 10px" }}>All Pets</h3>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
            {pets.map(pet => (
              <button key={pet.id} onClick={() => onSelectPet(pet)} style={{ background: "white", border: "none", borderRadius: 14, padding: "14px 16px", cursor: "pointer", flexShrink: 0, textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", minWidth: 80 }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{pet.photo}</div>
                <div style={{ fontWeight: 600, color: "#2C3520", fontSize: 12 }}>{pet.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      {!pets.length && !loading && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#9AA88A" }}>
          <PawPrint size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: "#5A6A50" }}>No pets yet!</p>
          <p style={{ fontSize: 13 }}>Go to My Pets and add your first companion.</p>
        </div>
      )}
    </div>
  );
}

// ── FOOD TRACKER ──────────────────────────────────────────────────────────────
function FoodScreen({ pet, user }) {
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
      pet_id: pet.id, user_id: user.id,
      time: form.time, meal: form.meal, item: form.item, qty: form.qty, notes: form.notes,
      date: today()
    }).select().single();
    if (error) { toast("Error: " + error.message); return; }
    setMeals([...meals, data]);
    setForm({ time: "", meal: "Breakfast", item: "", qty: "", notes: "" });
    setShowAdd(false);
    toast("Meal logged ✅");
  }

  async function deleteMeal(id) {
    await supabase.from("food_logs").delete().eq("id", id);
    setMeals(meals.filter(m => m.id !== id));
    toast("Meal removed");
  }

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 20, fontFamily: "'Georgia', serif", color: "#2C3520", margin: 0 }}>🍽️ Food Tracker</h2>
          <p style={{ color: "#7A8B6A", fontSize: 12, margin: "2px 0 0" }}>{pet.name} · Today</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: "#4A6741", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Log Meal
        </button>
      </div>
      {showAdd && (
        <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input style={inputStyle} type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            <select style={inputStyle} value={form.meal} onChange={e => setForm({ ...form, meal: e.target.value })}>
              {["Breakfast","Lunch","Dinner","Snack"].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <input style={{ ...inputStyle, marginBottom: 10 }} placeholder="Food item" value={form.item} onChange={e => setForm({ ...form, item: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input style={inputStyle} placeholder="Quantity (e.g. 80g)" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} />
            <input style={inputStyle} placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button onClick={addMeal} style={{ background: "#4A6741", color: "white", border: "none", borderRadius: 10, padding: "11px", fontWeight: 700, cursor: "pointer", width: "100%" }}>Save Meal</button>
        </div>
      )}
      {loading ? <Spinner /> : meals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#9AA88A" }}>
          <Utensils size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 14 }}>No meals logged today</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {meals.map(m => (
            <div key={m.id} style={{ background: "white", borderRadius: 14, padding: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#2C3520", fontSize: 14 }}>{m.meal}</div>
                  <div style={{ color: "#5A6A50", fontSize: 13, marginTop: 2 }}>{m.item} {m.qty && `· ${m.qty}`}</div>
                  {m.notes && <div style={{ color: "#9AA88A", fontSize: 11, marginTop: 2 }}>{m.notes}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#9AA88A", fontSize: 12 }}>{m.time}</span>
                  <button onClick={() => deleteMeal(m.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Trash2 size={14} color="#C5D0BE" /></button>
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
  const [logs, setLogs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ time: "", amount: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("water_logs").select("*").eq("pet_id", pet.id).eq("date", today()).order("time")
      .then(({ data }) => { setLogs(data || []); setLoading(false); });
  }, [pet.id]);

  const totalMl = logs.reduce((s, l) => s + (parseInt(l.amount) || 0), 0);

  async function addLog() {
    if (!form.amount || !form.time) { toast("Enter time and amount"); return; }
    const { data, error } = await supabase.from("water_logs").insert({
      pet_id: pet.id, user_id: user.id,
      time: form.time, amount: form.amount, date: today()
    }).select().single();
    if (error) { toast("Error: " + error.message); return; }
    setLogs([...logs, data]);
    setForm({ time: "", amount: "" });
    setShowAdd(false);
    toast("Water intake logged 💧");
  }

  async function deleteLog(id) {
    await supabase.from("water_logs").delete().eq("id", id);
    setLogs(logs.filter(l => l.id !== id));
  }

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 20, fontFamily: "'Georgia', serif", color: "#2C3520", margin: 0 }}>💧 Water Tracker</h2>
          <p style={{ color: "#7A8B6A", fontSize: 12, margin: "2px 0 0" }}>{pet.name} · Today</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: "#9DB8C8", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Log Water
        </button>
      </div>
      <div style={{ background: "white", borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", textAlign: "center" }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#9DB8C8" }}>{totalMl}<span style={{ fontSize: 18, color: "#B5C8D5" }}>ml</span></div>
        <div style={{ color: "#9AA88A", fontSize: 13, marginTop: 4 }}>Total today · {logs.length} session{logs.length !== 1 ? "s" : ""}</div>
        <div style={{ height: 8, background: "#EDF4F8", borderRadius: 20, marginTop: 12, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "#9DB8C8", borderRadius: 20, width: `${Math.min((totalMl / (pet.species === "dog" ? 800 : 250)) * 100, 100)}%`, transition: "width 0.5s" }} />
        </div>
        <div style={{ color: "#B5C8D5", fontSize: 11, marginTop: 4 }}>Daily goal: {pet.species === "dog" ? "800ml" : "250ml"}</div>
      </div>
      {showAdd && (
        <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input style={inputStyle} type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            <input style={inputStyle} placeholder="Amount (ml)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {["100","150","200","300","400"].map(ml => (
              <button key={ml} onClick={() => setForm({ ...form, amount: ml })} style={{ flex: 1, padding: "8px 4px", border: "1.5px solid", borderColor: form.amount === ml ? "#9DB8C8" : "#E8EDE4", borderRadius: 8, cursor: "pointer", background: form.amount === ml ? "#EDF4F8" : "white", fontSize: 12, fontWeight: 600, color: form.amount === ml ? "#5A8A9A" : "#9AA88A" }}>{ml}</button>
            ))}
          </div>
          <button onClick={addLog} style={{ background: "#9DB8C8", color: "white", border: "none", borderRadius: 10, padding: "11px", fontWeight: 700, cursor: "pointer", width: "100%" }}>Save</button>
        </div>
      )}
      {loading ? <Spinner /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {logs.map(l => (
            <div key={l.id} style={{ background: "white", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EDF4F8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Droplets size={18} color="#9DB8C8" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#2C3520", fontSize: 14 }}>{l.amount}ml</div>
                <div style={{ color: "#9AA88A", fontSize: 12 }}>{l.time}</div>
              </div>
              <button onClick={() => deleteLog(l.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Trash2 size={14} color="#C5D0BE" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── LITTER TRACKER ────────────────────────────────────────────────────────────
function LitterScreen({ pet, user, onPetUpdated }) {
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
    setStatus("clean");
    setHistory([logData, ...history]);
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

  if (pet.species === "dog") {
    return (
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ padding: "20px 0 16px" }}>
          <h2 style={{ fontSize: 20, fontFamily: "'Georgia', serif", color: "#2C3520", margin: 0 }}>🚽 Litter Tracker</h2>
          <p style={{ color: "#7A8B6A", fontSize: 12, margin: "2px 0 0" }}>{pet.name}</p>
        </div>
        <div style={{ background: "white", borderRadius: 16, padding: 24, textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🐕</div>
          <div style={{ fontWeight: 600, color: "#5A6A50", fontSize: 15 }}>Dogs don't use litter boxes!</div>
          <div style={{ color: "#9AA88A", fontSize: 13, marginTop: 8 }}>Track outdoor walks via reminders instead.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <h2 style={{ fontSize: 20, fontFamily: "'Georgia', serif", color: "#2C3520", margin: 0 }}>🚽 Litter Tracker</h2>
        <p style={{ color: "#7A8B6A", fontSize: 12, margin: "2px 0 0" }}>{pet.name}</p>
      </div>
      <div style={{ background: "white", borderRadius: 20, padding: 24, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${sc}20`, border: `3px solid ${sc}40`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          <Trash2 size={32} color={sc} />
        </div>
        <div style={{ fontWeight: 700, color: sc, fontSize: 18, marginBottom: 4 }}>
          {status === "clean" ? "Clean ✓" : status === "needs-cleaning" ? "Needs Cleaning ⚠️" : "N/A"}
        </div>
        {history.length > 0 && (
          <div style={{ color: "#9AA88A", fontSize: 12, marginBottom: 20 }}>
            Last cleaned: {new Date(history[0].cleaned_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={markCleaned} style={{ flex: 1, background: "#4A6741", color: "white", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>✅ Mark Cleaned</button>
          <button onClick={markDirty} style={{ flex: 1, background: "#FFF8F0", color: "#C4956A", border: "1.5px solid #F5D5C0", borderRadius: 12, padding: "12px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>⚠️ Mark Dirty</button>
        </div>
      </div>
      {loading ? <Spinner /> : history.length > 0 && (
        <SectionCard title="Cleaning History">
          {history.map((h, i) => (
            <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < history.length - 1 ? "1px solid #F0F4EC" : "none" }}>
              <Check size={14} color="#4A6741" />
              <span style={{ color: "#5A6A50", fontSize: 13 }}>{new Date(h.cleaned_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>
          ))}
        </SectionCard>
      )}
    </div>
  );
}

// ── VET & HEALTH ──────────────────────────────────────────────────────────────
function VetScreen({ pet, user }) {
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
      pet_id: pet.id, user_id: user.id,
      date: form.date, clinic: form.clinic, reason: form.reason, vet: form.vet, notes: form.notes,
      is_past: false
    }).select().single();
    if (error) { toast("Error: " + error.message); return; }
    setUpcoming([...upcoming, data]);
    setForm({ date: "", clinic: "", reason: "", vet: "", notes: "" });
    setShowAdd(false);
    toast("Appointment saved 📅");
  }

  async function markPast(appt) {
    await supabase.from("vet_appointments").update({ is_past: true }).eq("id", appt.id);
    setUpcoming(upcoming.filter(a => a.id !== appt.id));
    setPast([{ ...appt, is_past: true }, ...past]);
    toast("Marked as past visit");
  }

  const health = pet.health || { vaccinations: [], allergies: [], conditions: ["None"], medications: [] };

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 20, fontFamily: "'Georgia', serif", color: "#2C3520", margin: 0 }}>🏥 Vet & Health</h2>
          <p style={{ color: "#7A8B6A", fontSize: 12, margin: "2px 0 0" }}>{pet.name}</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: "#C4956A", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Add Appt
        </button>
      </div>
      {showAdd && (
        <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input style={inputStyle} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <input style={inputStyle} placeholder="Vet name" value={form.vet} onChange={e => setForm({ ...form, vet: e.target.value })} />
          </div>
          <input style={{ ...inputStyle, marginBottom: 10 }} placeholder="Reason / purpose *" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
          <input style={{ ...inputStyle, marginBottom: 10 }} placeholder="Clinic / hospital" value={form.clinic} onChange={e => setForm({ ...form, clinic: e.target.value })} />
          <input style={{ ...inputStyle, marginBottom: 10 }} placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <button onClick={addAppt} style={{ background: "#C4956A", color: "white", border: "none", borderRadius: 10, padding: "11px", fontWeight: 700, cursor: "pointer", width: "100%" }}>Save Appointment</button>
        </div>
      )}
      {loading ? <Spinner /> : (
        <>
          {upcoming.length > 0 && (
            <SectionCard title="Upcoming Appointments">
              {upcoming.map((v, i) => (
                <div key={v.id} style={{ padding: "10px 0", borderBottom: i < upcoming.length - 1 ? "1px solid #F0F4EC" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: "#2C3520", fontSize: 14 }}>{v.reason}</span>
                    <span style={{ background: "#E8F4E8", color: "#4A6741", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{v.date}</span>
                  </div>
                  <div style={{ color: "#7A8B6A", fontSize: 12 }}>{v.clinic}</div>
                  <div style={{ color: "#9AA88A", fontSize: 11, marginTop: 2 }}>{v.vet}</div>
                  <button onClick={() => markPast(v)} style={{ marginTop: 8, background: "#F0F4EC", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#4A6741", cursor: "pointer" }}>Mark as Past Visit</button>
                </div>
              ))}
            </SectionCard>
          )}
          {health.vaccinations.length > 0 && (
            <SectionCard title="Vaccination Records">
              {health.vaccinations.map((v, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < health.vaccinations.length - 1 ? "1px solid #F0F4EC" : "none" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#2C3520", fontSize: 13 }}>{v.name}</div>
                    <div style={{ color: "#9AA88A", fontSize: 11 }}>Given: {v.date} · Next: {v.next}</div>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
              ))}
            </SectionCard>
          )}
          {past.length > 0 && (
            <SectionCard title="Past Visits">
              {past.map((v, i) => (
                <div key={v.id} style={{ padding: "10px 0", borderBottom: i < past.length - 1 ? "1px solid #F0F4EC" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 600, color: "#2C3520", fontSize: 13 }}>{v.reason}</span>
                    <span style={{ color: "#9AA88A", fontSize: 11 }}>{v.date}</span>
                  </div>
                  <div style={{ color: "#7A8B6A", fontSize: 12, marginTop: 2 }}>{v.clinic}</div>
                  {v.notes && <div style={{ color: "#9AA88A", fontSize: 11, marginTop: 4, fontStyle: "italic" }}>{v.notes}</div>}
                </div>
              ))}
            </SectionCard>
          )}
          {!upcoming.length && !past.length && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9AA88A" }}>
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
      pet_id: pet.id, user_id: user.id,
      type: form.type, title: form.title, time: form.time, active: true
    }).select().single();
    if (error) { toast("Error: " + error.message); return; }
    setReminders([...reminders, data]);
    setForm({ type: "feeding", title: "", time: "" });
    setShowAdd(false);
    toast("Reminder saved 🔔");
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

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 20, fontFamily: "'Georgia', serif", color: "#2C3520", margin: 0 }}>🔔 Reminders</h2>
          <p style={{ color: "#7A8B6A", fontSize: 12, margin: "2px 0 0" }}>{pet.name}</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: "#B8A9C9", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Add
        </button>
      </div>
      {showAdd && (
        <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <select style={{ ...inputStyle, marginBottom: 10 }} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {Object.keys(REMINDER_ICONS).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <input style={{ ...inputStyle, marginBottom: 10 }} placeholder="Reminder title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <input style={{ ...inputStyle, marginBottom: 10 }} type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          <button onClick={addReminder} style={{ background: "#B8A9C9", color: "white", border: "none", borderRadius: 10, padding: "11px", fontWeight: 700, cursor: "pointer", width: "100%" }}>Save Reminder</button>
        </div>
      )}
      {loading ? <Spinner /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reminders.map(r => {
            const Icon = REMINDER_ICONS[r.type] || Bell;
            const color = REMINDER_COLORS[r.type] || "#8B9E6B";
            return (
              <div key={r.id} style={{ background: "white", borderRadius: 14, padding: "14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", opacity: r.active ? 1 : 0.5 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#2C3520", fontSize: 14 }}>{r.title}</div>
                  <div style={{ color: "#9AA88A", fontSize: 12 }}>{r.type} {r.time && `· ${r.time}`}</div>
                </div>
                <button onClick={() => deleteReminder(r.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Trash2 size={14} color="#C5D0BE" /></button>
                <button onClick={() => toggle(r)} style={{ width: 44, height: 26, borderRadius: 20, border: "none", background: r.active ? "#4A6741" : "#E0E0E0", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 4, left: r.active ? 22 : 4, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                </button>
              </div>
            );
          })}
          {reminders.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9AA88A" }}>
              <Bell size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontSize: 14 }}>No reminders yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── BLOG ──────────────────────────────────────────────────────────────────────
function BlogScreen({ user }) {
  const [posts, setPosts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", excerpt: "", category: "Tips", author: "" });
  const [likedIds, setLikedIds] = useState(new Set());
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const categories = ["All","Nutrition","Health","Grooming","Vaccination","Lifestyle","Tips"];

  useEffect(() => {
    async function load() {
      const [{ data: postsData }, { data: likesData }] = await Promise.all([
        supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
        supabase.from("blog_likes").select("post_id").eq("user_id", user.id)
      ]);
      setPosts(postsData || []);
      setLikedIds(new Set((likesData || []).map(l => l.post_id)));
      setLoading(false);
    }
    load();
  }, [user.id]);

  async function addPost() {
    if (!form.title) { toast("Title is required"); return; }
    const { data, error } = await supabase.from("blog_posts").insert({
      user_id: user.id, author: form.author || "Anonymous",
      title: form.title, excerpt: form.excerpt, category: form.category,
      read_time: "3 min read", likes: 0
    }).select().single();
    if (error) { toast("Error: " + error.message); return; }
    setPosts([data, ...posts]);
    setForm({ title: "", excerpt: "", category: "Tips", author: "" });
    setShowAdd(false);
    toast("Post published! 📖");
  }

  async function toggleLike(post) {
    const liked = likedIds.has(post.id);
    if (liked) {
      await supabase.from("blog_likes").delete().eq("user_id", user.id).eq("post_id", post.id);
      await supabase.from("blog_posts").update({ likes: Math.max(0, post.likes - 1) }).eq("id", post.id);
      setLikedIds(prev => { const s = new Set(prev); s.delete(post.id); return s; });
      setPosts(posts.map(p => p.id === post.id ? { ...p, likes: Math.max(0, p.likes - 1) } : p));
    } else {
      await supabase.from("blog_likes").insert({ user_id: user.id, post_id: post.id });
      await supabase.from("blog_posts").update({ likes: post.likes + 1 }).eq("id", post.id);
      setLikedIds(prev => new Set([...prev, post.id]));
      setPosts(posts.map(p => p.id === post.id ? { ...p, likes: p.likes + 1 } : p));
    }
  }

  const catIcons = { Nutrition: "🥗", Health: "❤️", Grooming: "✂️", Vaccination: "💉", Lifestyle: "🌿", Tips: "💡" };
  const filtered = filter === "All" ? posts : posts.filter(p => p.category === filter);

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 22, fontFamily: "'Georgia', serif", color: "#2C3520", margin: 0 }}>📖 Pet Care Blog</h2>
          <p style={{ color: "#7A8B6A", fontSize: 13, margin: "2px 0 0" }}>Tips from vets & fellow owners</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: "#4A6741", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Write
        </button>
      </div>
      {showAdd && (
        <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <input style={{ ...inputStyle, marginBottom: 10 }} placeholder="Post title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea style={{ ...inputStyle, marginBottom: 10, minHeight: 80, resize: "vertical" }} placeholder="Summary / excerpt" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <select style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {categories.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
            </select>
            <input style={inputStyle} placeholder="Your name" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
          </div>
          <button onClick={addPost} style={{ background: "#4A6741", color: "white", border: "none", borderRadius: 10, padding: "11px", fontWeight: 700, cursor: "pointer", width: "100%" }}>Publish Post</button>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18, paddingBottom: 4 }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid", borderColor: filter === c ? "#4A6741" : "#DDE5D8", background: filter === c ? "#4A6741" : "white", color: filter === c ? "white" : "#7A8B6A", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{c}</button>
        ))}
      </div>
      {loading ? <Spinner /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map(post => (
            <div key={post.id} style={{ background: "white", borderRadius: 18, padding: "18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{catIcons[post.category] || "📝"}</span>
                    <span style={{ background: "#F0F4EC", color: "#4A6741", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{post.category}</span>
                    <span style={{ color: "#B5BFB0", fontSize: 11 }}>{post.read_time}</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#2C3520", lineHeight: 1.3 }}>{post.title}</h3>
                </div>
              </div>
              {post.excerpt && <p style={{ color: "#7A8B6A", fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>{post.excerpt}</p>}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ color: "#B5BFB0", fontSize: 11 }}>By {post.author} · {new Date(post.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</div>
                <button onClick={() => toggleLike(post)} style={{ display: "flex", alignItems: "center", gap: 6, background: likedIds.has(post.id) ? "#FFEBEE" : "#F7F9F6", border: "none", borderRadius: 20, padding: "6px 14px", cursor: "pointer", color: likedIds.has(post.id) ? "#E53935" : "#9AA88A", fontWeight: 600, fontSize: 13 }}>
                  <Heart size={14} fill={likedIds.has(post.id) ? "#E53935" : "none"} /> {post.likes}
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9AA88A" }}>
              <BookOpen size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontSize: 14 }}>No posts in this category yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── QR GENERATOR ──────────────────────────────────────────────────────────────
function QRGeneratorScreen({ pets }) {
  const [selected, setSelected] = useState(pets[0] || null);
  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <h2 style={{ fontSize: 22, fontFamily: "'Georgia', serif", color: "#2C3520", margin: 0 }}>🔳 QR Profiles</h2>
        <p style={{ color: "#7A8B6A", fontSize: 13, margin: "4px 0 0" }}>Share your pet's profile instantly</p>
      </div>
      {pets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#9AA88A" }}>
          <QrCode size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>Add a pet to generate its QR profile</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, overflowX: "auto" }}>
            {pets.map(p => (
              <button key={p.id} onClick={() => setSelected(p)} style={{ padding: "8px 16px", borderRadius: 20, border: "1.5px solid", borderColor: selected?.id === p.id ? "#4A6741" : "#DDE5D8", background: selected?.id === p.id ? "#4A6741" : "white", color: selected?.id === p.id ? "white" : "#7A8B6A", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                {p.photo} {p.name}
              </button>
            ))}
          </div>
          {selected && (
            <div style={{ background: "white", borderRadius: 20, padding: 24, textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ width: 160, height: 160, margin: "0 auto 16px", background: "#F0F4EC", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80 }}>
                {selected.photo}
              </div>
              <div style={{ fontFamily: "'Georgia', serif", fontSize: 20, fontWeight: 700, color: "#2C3520" }}>{selected.name}</div>
              <div style={{ color: "#7A8B6A", fontSize: 13, marginTop: 4 }}>{selected.breed} · {selected.species}</div>
              <div style={{ marginTop: 16, padding: "10px 16px", background: "#F7F9F6", borderRadius: 12, fontSize: 12, color: "#9AA88A", wordBreak: "break-all" }}>
                collarix.app/pet/{selected.id}
              </div>
              <button onClick={() => { navigator.clipboard?.writeText(`collarix.app/pet/${selected.id}`); toast("Link copied!"); }} style={{ marginTop: 12, background: "#4A6741", color: "white", border: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                📋 Copy Link
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
function SettingsScreen({ user, onLogout }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.from("profiles").select("*").eq("id", user.id).single()
      .then(({ data }) => setProfile(data));
  }, [user.id]);

  async function handleLogout() {
    await supabase.auth.signOut();
    onLogout();
  }

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <h2 style={{ fontSize: 22, fontFamily: "'Georgia', serif", color: "#2C3520", margin: 0 }}>⚙️ Settings</h2>
      </div>
      <div style={{ background: "white", borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#4A674130", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={24} color="#4A6741" />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#2C3520", fontSize: 16 }}>{profile?.full_name || "Pet Owner"}</div>
            <div style={{ color: "#7A8B6A", fontSize: 13 }}>{user.email}</div>
          </div>
        </div>
      </div>
      <SectionCard title="Account">
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[["Email", user.email],["Member since", new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })]].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F0F4EC" }}>
              <span style={{ color: "#7A8B6A", fontSize: 13 }}>{label}</span>
              <span style={{ color: "#2C3520", fontSize: 13, fontWeight: 600 }}>{val}</span>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="About Collarix">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img src={collarixLogo} alt="Collarix logo" style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 14, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: "#2C3520", fontSize: 16, fontFamily: "'Georgia', serif" }}>Collarix</div>
              <div style={{ color: "#7A8B6A", fontSize: 12, marginTop: 2 }}>Smart Pet Care · v2.0.0</div>
              <div style={{ color: "#9AA88A", fontSize: 11, marginTop: 4 }}>Backed by Supabase</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #F0F4EC", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["👩‍💻 Made by", "Saloni Agarwal"],
              ["📧 Email", "collarix.in@gmail.com"],
              ["📸 Instagram", "@collarix.in"],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9AA88A", fontSize: 12 }}>{label}</span>
                <span style={{ color: "#4A6741", fontSize: 12, fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
          <a href="https://instagram.com/collarix.in" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", color: "white", borderRadius: 12, padding: "10px", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            📸 Follow @collarix.in on Instagram
          </a>
          <a href="mailto:collarix.in@gmail.com" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#F0F4EC", color: "#4A6741", borderRadius: 12, padding: "10px", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            ✉️ collarix.in@gmail.com
          </a>
        </div>
      </SectionCard>
      <button onClick={handleLogout} style={{ width: "100%", background: "#FFEBEE", color: "#C62828", border: "1.5px solid #FFCDD2", borderRadius: 14, padding: "14px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
}

// ── APP HEADER ────────────────────────────────────────────────────────────────
function AppHeader({ screen, pet, onBack, onQR }) {
  const showBack = ["profile","food","water","litter","vet","reminders"].includes(screen);
  const title = { dashboard: "Collarix", pets: "My Pets", scan: "QR Scanner", blog: "Blog", qrgenerator: "QR Profiles", settings: "Settings" }[screen] || pet?.name || "Collarix";
  return (
    <div style={{ background: "white", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F0F4EC", position: "sticky", top: 0, zIndex: 100 }}>
      {showBack ? (
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px 4px 0", display: "flex", alignItems: "center", gap: 6, color: "#4A6741", fontWeight: 600, fontSize: 14 }}>
          <ChevronLeft size={18} /> Back
        </button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src={collarixLogo} alt="Collarix" style={{ width: 32, height: 32, objectFit: "contain" }} />
          <span style={{ fontFamily: "'Georgia', serif", fontWeight: 700, color: "#2C3520", fontSize: 17 }}>{title}</span>
        </div>
      )}
      <button onClick={onQR} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
        <QrCode size={20} color="#7A8B6A" />
      </button>
    </div>
  );
}

// ── BOTTOM NAV ────────────────────────────────────────────────────────────────
function BottomNav({ active, onChange }) {
  const items = [["dashboard",Home,"Home"],["pets",PawPrint,"Pets"],["scan",QrCode,"Scan"],["blog",BookOpen,"Blog"],["settings",Settings,"More"]];
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "white", borderTop: "1px solid #F0F4EC", display: "flex", zIndex: 200 }}>
      {items.map(([id, Icon, label]) => (
        <button key={id} onClick={() => onChange(id)} style={{ flex: 1, padding: "10px 0 12px", border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <Icon size={22} color={active === id ? "#4A6741" : "#C5D0BE"} />
          <span style={{ fontSize: 10, fontWeight: active === id ? 700 : 500, color: active === id ? "#4A6741" : "#C5D0BE" }}>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ── QR SCANNER ────────────────────────────────────────────────────────────────
function QRScannerScreen({ pets, onSelect }) {
  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <h2 style={{ fontSize: 22, fontFamily: "'Georgia', serif", color: "#2C3520", margin: 0 }}>🔳 QR Scanner</h2>
        <p style={{ color: "#7A8B6A", fontSize: 13, margin: "4px 0 0" }}>Tap a pet to view their profile</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {pets.map(pet => (
          <button key={pet.id} onClick={() => onSelect(pet)} style={{ background: "white", border: "none", borderRadius: 14, padding: "14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", textAlign: "left" }}>
            <Avatar pet={pet} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#2C3520", fontSize: 15 }}>{pet.name}</div>
              <div style={{ color: "#9AA88A", fontSize: 11 }}>{pet.id}</div>
            </div>
            <ChevronRight size={16} color="#C5D0BE" />
          </button>
        ))}
      </div>
      <button onClick={() => toast("Open your phone's native camera to scan a QR code")} style={{ marginTop: 14, width: "100%", background: "#4A6741", color: "white", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Camera size={16} /> Open Camera
      </button>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [screen, setScreen] = useState("dashboard");
  const [activePet, setActivePet] = useState(null);
  const [navTab, setNavTab] = useState("dashboard");

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load pets when session changes
  useEffect(() => {
    if (!session) { setPets([]); return; }
    setPetsLoading(true);
    supabase.from("pets").select("*").eq("user_id", session.user.id).order("created_at")
      .then(({ data }) => { setPets(data || []); setPetsLoading(false); });
  }, [session]);

  function handleNavChange(tab) {
    setNavTab(tab);
    setScreen(tab);
    if (tab !== "scan") setActivePet(null);
  }

  function handleSelectPet(pet) {
    setActivePet(pet);
    setScreen("profile");
  }

  function handleNavigate(newScreen, pet) {
    if (pet) setActivePet(pet);
    setScreen(newScreen);
  }

  function handleBack() {
    if (["food","water","litter","vet","reminders"].includes(screen)) {
      setScreen("profile");
    } else {
      setActivePet(null);
      setScreen(navTab);
    }
  }

  function handlePetAdded(newPet) {
    setPets(prev => [...prev, newPet]);
  }

  function handlePetUpdated(updatedPet) {
    setPets(prev => prev.map(p => p.id === updatedPet.id ? updatedPet : p));
    if (activePet?.id === updatedPet.id) setActivePet(updatedPet);
  }

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #F7F5F0 0%, #EBF0E8 50%, #F0EDE8 100%)" }}>
        <div style={{ textAlign: "center" }}>
          <img src={collarixLogo} alt="Collarix" style={{ width: 100, height: 100, objectFit: "contain", marginBottom: 16, animation: "novatech-pulse 1.5s ease-in-out infinite" }} />
          <div style={{ color: "#7A8B6A", fontSize: 14, fontWeight: 600 }}>Loading Collarix…</div>
        </div>
      </div>
    );
  }

  if (!session) return <LoginScreen />;

  const user = session.user;

  function renderScreen() {
    if (petsLoading) return <Spinner />;
    switch (screen) {
      case "dashboard": return <DashboardScreen pets={pets} user={user} onSelectPet={handleSelectPet} />;
      case "pets": return <MyPetsScreen pets={pets} user={user} onSelect={handleSelectPet} onPetAdded={handlePetAdded} />;
      case "scan": return <QRScannerScreen pets={pets} onSelect={handleSelectPet} />;
      case "profile": return activePet ? <PetProfileScreen pet={activePet} user={user} onNavigate={handleNavigate} onBack={handleBack} /> : null;
      case "food": return activePet ? <FoodScreen pet={activePet} user={user} /> : null;
      case "water": return activePet ? <WaterScreen pet={activePet} user={user} /> : null;
      case "litter": return activePet ? <LitterScreen pet={activePet} user={user} onPetUpdated={handlePetUpdated} /> : null;
      case "vet": return activePet ? <VetScreen pet={activePet} user={user} /> : null;
      case "reminders": return activePet ? <RemindersScreen pet={activePet} user={user} /> : null;
      case "blog": return <BlogScreen user={user} />;
      case "qrgenerator": return <QRGeneratorScreen pets={pets} />;
      case "settings": return <SettingsScreen user={user} onLogout={() => setSession(null)} />;
      default: return null;
    }
  }

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", background: "#F7F5F0", minHeight: "100vh", position: "relative", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 0; }
        input, select, textarea { -webkit-appearance: none; }
        @keyframes novatech-pulse { 0%,100%{opacity:0.055} 50%{opacity:0.09} }
      `}</style>
      {/* Collarix watermark */}
      <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, height: "100vh", pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
        {Array.from({ length: 16 }).map((_, i) => {
          const row = Math.floor(i / 4); const col = i % 4;
          return <div key={i} style={{ position: "absolute", left: `${col * 28 - 10 + (row % 2) * 14}%`, top: `${row * 14 - 2}%`, transform: "rotate(-35deg)", fontFamily: "'Georgia', serif", fontSize: 11, fontWeight: 700, color: "#3A5A30", opacity: 0.045, letterSpacing: "3px", textTransform: "uppercase", whiteSpace: "nowrap", userSelect: "none", animation: "novatech-pulse 5s ease-in-out infinite", animationDelay: `${(i * 0.4) % 5}s` }}>collarix</div>;
        })}
        {/* Collarix corner badge */}
        <div style={{ position: "absolute", bottom: 88, right: 12, background: "rgba(74,103,65,0.07)", border: "1px solid rgba(74,103,65,0.12)", borderRadius: 10, padding: "5px 10px", display: "flex", alignItems: "center", gap: 6 }}>
          <img src={collarixLogo} alt="" style={{ width: 18, height: 18, objectFit: "contain" }} />
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: "#4A6741", opacity: 0.6, fontFamily: "-apple-system, sans-serif" }}>Collarix</span>
        </div>
      </div>
      <AppHeader screen={screen} pet={activePet} onBack={handleBack} onQR={() => setScreen("qrgenerator")} />
      <div style={{ paddingBottom: 80, overflowY: "auto", maxHeight: "calc(100vh - 50px)" }}>
        {renderScreen()}
      </div>
      <BottomNav active={navTab} onChange={handleNavChange} />
    </div>
  );
}
