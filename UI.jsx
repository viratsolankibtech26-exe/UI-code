import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Users, CalendarCheck, Wallet, Award, LayoutDashboard,
  LogOut, Plus, Pencil, Trash2, X, GraduationCap, ShieldCheck
} from "lucide-react";

/* ---------------------------------------------------------------
   DESIGN TOKENS
   Navy (#334463) header/nav, warm parchment (#F2E9D8) surface,
   clay-orange (#E38A54) + slate-teal (#3F8C8C) as the two accents
   pulled directly from the one-pager's two dot colors.
   Display face: "Fraunces" (the pager's serif headline) for H1/H2,
   "Inter" for everything functional (numbers, tables, labels).
----------------------------------------------------------------- */
const COLORS = {
  navy: "#334463",
  navyDark: "#26344C",
  parchment: "#F2E9D8",
  parchmentDeep: "#E9DCC2",
  ink: "#2A2620",
  orange: "#E38A54",
  teal: "#3F8C8C",
  green: "#4C8C5B",
  red: "#C1554B",
  muted: "#8A8271",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');`;

/* Responsive layout rules — sidebar collapses to a horizontal, scrollable
   top bar under ~720px so this behaves on Android/phone widths. */
const RESPONSIVE_CSS = `
  * { box-sizing: border-box; }
  .app-shell { display: flex; min-height: 100vh; }
  .sidebar {
    width: 210px; flex-shrink: 0; background: ${COLORS.navyDark}; color: #fff;
    padding: 22px 14px; display: flex; flex-direction: column;
  }
  .sidebar-brand { display: flex; gap: 6px; align-items: center; padding: 0 8px 20px; flex-shrink: 0; }
  .nav-btn {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-bottom: 4px;
    border-radius: 8px; border: none; cursor: pointer; text-align: left; width: 100%;
    font-size: 13.5px; font-weight: 600; background: transparent; color: #B9C2D4;
    font-family: 'Inter', sans-serif;
  }
  .nav-btn.active { background: rgba(255,255,255,0.14); color: #fff; }
  .sidebar-spacer { flex: 1; }
  .sidebar-footer { border-top: 1px solid rgba(255,255,255,0.12); padding-top: 14px; font-size: 12.5px; }
  .logout-btn {
    display: flex; align-items: center; gap: 6px; background: transparent; border: none;
    color: #B9C2D4; cursor: pointer; font-size: 12.5px; padding: 0; font-family: 'Inter', sans-serif;
  }
  .main-content { flex: 1; min-width: 0; padding: 26px 32px; overflow-x: auto; }
  .mobile-topbar { display: none; }

  @media (max-width: 720px) {
    .app-shell { flex-direction: column; }
    .sidebar {
      width: 100%; flex-direction: row; align-items: center; padding: 10px 10px;
      overflow-x: auto; position: sticky; top: 0; z-index: 30; gap: 2px;
    }
    .sidebar-brand { padding: 0 10px 0 0; }
    .nav-btn { flex-direction: column; gap: 3px; width: auto; padding: 7px 10px; font-size: 10.5px; white-space: nowrap; margin-bottom: 0; }
    .sidebar-spacer, .sidebar-footer { display: none; }
    .main-content { padding: 14px; }
    .mobile-topbar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid ${COLORS.parchmentDeep};
    }
  }
`;

/* ---------------------------------------------------------------
   SEED DATA
----------------------------------------------------------------- */
const SEED_STUDENTS = [
  { id: "s1", name: "Aarav Mehta", roll: "CS101", cls: "CSE-3A", email: "aarav.m@campus.edu", phone: "98200 11223", admission: "2024-07-12", gpa: 8.6 },
  { id: "s2", name: "Diya Shah", roll: "CS102", cls: "CSE-3A", email: "diya.s@campus.edu", phone: "98200 22334", admission: "2024-07-12", gpa: 9.1 },
  { id: "s3", name: "Kabir Rao", roll: "CS103", cls: "CSE-3A", email: "kabir.r@campus.edu", phone: "98200 33445", admission: "2024-07-12", gpa: 7.4 },
  { id: "s4", name: "Ananya Iyer", roll: "CS104", cls: "CSE-3B", email: "ananya.i@campus.edu", phone: "98200 44556", admission: "2024-07-13", gpa: 8.9 },
  { id: "s5", name: "Vihaan Joshi", roll: "CS105", cls: "CSE-3B", email: "vihaan.j@campus.edu", phone: "98200 55667", admission: "2024-07-13", gpa: 6.8 },
  { id: "s6", name: "Ishita Nair", roll: "CS106", cls: "CSE-3B", email: "ishita.n@campus.edu", phone: "98200 66778", admission: "2024-07-14", gpa: 9.4 },
  { id: "s7", name: "Reyansh Gupta", roll: "CS107", cls: "CSE-3A", email: "reyansh.g@campus.edu", phone: "98200 77889", admission: "2024-07-14", gpa: 7.9 },
  { id: "s8", name: "Myra Desai", roll: "CS108", cls: "CSE-3B", email: "myra.d@campus.edu", phone: "98200 88990", admission: "2024-07-15", gpa: 8.2 },
];

const DATES = ["09-08", "09-09", "09-10", "09-11", "09-12", "09-13", "09-15"];
function seedAttendance() {
  const rows = [];
  let i = 0;
  SEED_STUDENTS.forEach((s) => {
    DATES.forEach((d) => {
      const present = Math.random() > (s.id === "s5" ? 0.4 : 0.12);
      rows.push({ id: `a${i++}`, studentId: s.id, date: `2026-${d}`, status: present ? "present" : "absent" });
    });
  });
  return rows;
}

const SEED_FEES = SEED_STUDENTS.map((s, i) => ({
  id: `f${i}`,
  studentId: s.id,
  term: "Autumn 2026",
  amount: 45000,
  status: i % 4 === 0 ? "pending" : i % 5 === 0 ? "partial" : "paid",
  dueDate: "2026-09-30",
}));

const SUBJECTS = ["Data Structures", "Operating Systems", "DBMS", "Computer Networks"];
function seedResults() {
  const rows = [];
  let i = 0;
  SEED_STUDENTS.forEach((s) => {
    SUBJECTS.forEach((subj) => {
      const marks = Math.round(45 + Math.random() * 50);
      rows.push({ id: `r${i++}`, studentId: s.id, subject: subj, term: "Autumn 2026", marks, max: 100 });
    });
  });
  return rows;
}

const DEMO_USERS = [
  { id: "u1", role: "admin", name: "Bunty (Admin)", studentId: null },
  { id: "u2", role: "faculty", name: "Prof. Raj Aryan", studentId: null },
  { id: "u3", role: "faculty", name: "Prof. Kartik Shah", studentId: null },
  { id: "u4", role: "student", name: "Aarav Mehta", studentId: "s1" },
  { id: "u5", role: "student", name: "Ishita Nair", studentId: "s6" },
];

function grade(pct) {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}
const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------------------------------------------------------------
   PERSISTENCE
----------------------------------------------------------------- */
const STORE_KEY = "erp-sms-data-v1";
async function loadData() {
  try {
    const res = await window.storage.get(STORE_KEY, false);
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) { /* no saved data yet */ }
  return null;
}
async function saveData(data) {
  try { await window.storage.set(STORE_KEY, JSON.stringify(data), false); } catch (e) { /* ignore */ }
}

/* ---------------------------------------------------------------
   SMALL UI PRIMITIVES
----------------------------------------------------------------- */
function Card({ children, style, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: COLORS.parchment,
        border: `1px solid ${COLORS.parchmentDeep}`,
        borderRadius: 14,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <Card style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 180 }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10, background: accent,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={20} color="#fff" />
      </div>
      <div>
        <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, letterSpacing: 0.2 }}>{label}</div>
        <div style={{ fontSize: 24, fontFamily: "Fraunces, serif", fontWeight: 600, color: COLORS.ink }}>{value}</div>
      </div>
    </Card>
  );
}

function Pill({ children, tone = "muted" }) {
  const map = {
    paid: { bg: "#DCEBDD", fg: COLORS.green },
    partial: { bg: "#FBEBD9", fg: COLORS.orange },
    pending: { bg: "#F6DCDA", fg: COLORS.red },
    muted: { bg: "#E9E2D2", fg: COLORS.muted },
  };
  const c = map[tone] || map.muted;
  return (
    <span style={{
      background: c.bg, color: c.fg, fontSize: 12, fontWeight: 600,
      padding: "3px 10px", borderRadius: 999, textTransform: "capitalize",
    }}>{children}</span>
  );
}

function Button({ children, onClick, variant = "solid", style, type = "button" }) {
  const base = {
    fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13.5,
    padding: "9px 16px", borderRadius: 9, cursor: "pointer", border: "none",
    display: "inline-flex", alignItems: "center", gap: 6, transition: "opacity .15s",
  };
  const variants = {
    solid: { background: COLORS.navy, color: "#fff" },
    orange: { background: COLORS.orange, color: "#fff" },
    ghost: { background: "transparent", color: COLORS.navy, border: `1px solid ${COLORS.parchmentDeep}` },
    danger: { background: "transparent", color: COLORS.red, border: `1px solid #E9C7C3` },
  };
  return (
    <button type={type} onClick={onClick} style={{ ...base, ...variants[variant], ...style }}
      onMouseOver={(e) => (e.currentTarget.style.opacity = 0.85)}
      onMouseOut={(e) => (e.currentTarget.style.opacity = 1)}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(38,52,76,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 14, padding: 24, width: 460, maxWidth: "100%",
        maxHeight: "88vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 19, margin: 0, color: COLORS.ink }}>{title}</h3>
          <X size={18} style={{ cursor: "pointer", color: COLORS.muted }} onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.muted, marginBottom: 5 }}>{label}</div>
      {children}
    </label>
  );
}
const inputStyle = {
  width: "100%", padding: "9px 11px", borderRadius: 8, border: "1px solid #DDD3BC",
  fontFamily: "Inter, sans-serif", fontSize: 13.5, boxSizing: "border-box", background: "#FCFAF4",
};

/* ---------------------------------------------------------------
   LOGIN SCREEN
----------------------------------------------------------------- */
function Login({ onLogin }) {
  const [role, setRole] = useState("admin");
  const roleUsers = DEMO_USERS.filter((u) => u.role === role);
  const [picked, setPicked] = useState(roleUsers[0]?.id);

  useEffect(() => {
    const first = DEMO_USERS.filter((u) => u.role === role)[0];
    setPicked(first?.id);
  }, [role]);

  const roles = [
    { key: "admin", label: "Admin", icon: ShieldCheck },
    { key: "faculty", label: "Faculty", icon: GraduationCap },
    { key: "student", label: "Student", icon: Users },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: `linear-gradient(160deg, ${COLORS.navyDark}, ${COLORS.navy})`,
      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", padding: 16,
    }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ width: 400, maxWidth: "100%", background: COLORS.parchment, borderRadius: 18, padding: 32 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: COLORS.orange, display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.teal, display: "inline-block" }} />
        </div>
        <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 26, margin: "4px 0 2px", color: COLORS.ink, lineHeight: 1.15 }}>
          ERP Student<br />Management System
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 13.5, margin: "0 0 24px" }}>One dashboard. Admin, Faculty and Student views.</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {roles.map((r) => (
            <button key={r.key} onClick={() => setRole(r.key)} style={{
              flex: 1, padding: "10px 6px", borderRadius: 9, cursor: "pointer",
              border: role === r.key ? `2px solid ${COLORS.navy}` : "1px solid #DDD3BC",
              background: role === r.key ? "#fff" : "transparent",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}>
              <r.icon size={17} color={role === r.key ? COLORS.navy : COLORS.muted} />
              <span style={{ fontSize: 12, fontWeight: 600, color: role === r.key ? COLORS.navy : COLORS.muted }}>{r.label}</span>
            </button>
          ))}
        </div>

        <Field label="Sign in as">
          <select style={inputStyle} value={picked} onChange={(e) => setPicked(e.target.value)}>
            {roleUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>

        <Button variant="orange" style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: "11px 16px" }}
          onClick={() => onLogin(DEMO_USERS.find((u) => u.id === picked))}>
          Log in
        </Button>
        <p style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 14, textAlign: "center" }}>
          Demo auth — pick any seeded account, no password needed.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   MAIN APP
----------------------------------------------------------------- */
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [students, setStudents] = useState(SEED_STUDENTS);
  const [attendance, setAttendance] = useState(seedAttendance);
  const [fees, setFees] = useState(SEED_FEES);
  const [results, setResults] = useState(seedResults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadData().then((d) => {
      if (d) {
        setStudents(d.students || SEED_STUDENTS);
        setAttendance(d.attendance || seedAttendance());
        setFees(d.fees || SEED_FEES);
        setResults(d.results || seedResults());
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveData({ students, attendance, fees, results });
  }, [students, attendance, fees, results, loaded]);

  if (!user) return <Login onLogin={setUser} />;

  const isAdmin = user.role === "admin";
  const isFaculty = user.role === "faculty";
  const isStudent = user.role === "student";

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "students", label: "Students", icon: Users },
    { key: "attendance", label: "Attendance", icon: CalendarCheck },
    { key: "fees", label: "Fees & Results", icon: Wallet },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FBF8F1", fontFamily: "Inter, sans-serif", color: COLORS.ink }}>
      <style>{FONT_IMPORT}{RESPONSIVE_CSS}</style>
      <div className="app-shell">
        {/* Sidebar / mobile top bar */}
        <div className="sidebar">
          <div className="sidebar-brand">
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.orange, display: "inline-block" }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.teal, display: "inline-block" }} />
            <span style={{ fontFamily: "Fraunces, serif", fontSize: 15, marginLeft: 4, whiteSpace: "nowrap" }}>Campus ERP</span>
          </div>
          {navItems.map((n) => (
            <button key={n.key} onClick={() => setTab(n.key)} className={`nav-btn${tab === n.key ? " active" : ""}`}>
              <n.icon size={16} /> <span>{n.label}</span>
            </button>
          ))}
          <div className="sidebar-spacer" />
          <div className="sidebar-footer">
            <div style={{ fontWeight: 600 }}>{user.name}</div>
            <div style={{ color: "#9AA6BC", textTransform: "capitalize", marginBottom: 10 }}>{user.role}</div>
            <button onClick={() => setUser(null)} className="logout-btn"><LogOut size={13} /> Log out</button>
          </div>
        </div>

        {/* Main */}
        <div className="main-content">
          <div className="mobile-topbar">
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{user.name}</div>
              <div style={{ color: COLORS.muted, textTransform: "capitalize", fontSize: 11.5 }}>{user.role}</div>
            </div>
            <button onClick={() => setUser(null)} style={{
              display: "flex", alignItems: "center", gap: 6, background: "transparent",
              border: `1px solid ${COLORS.parchmentDeep}`, borderRadius: 8, padding: "6px 10px",
              color: COLORS.navy, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif",
            }}><LogOut size={13} /> Log out</button>
          </div>
          {tab === "dashboard" && <Dashboard students={students} attendance={attendance} fees={fees} results={results} user={user} />}
          {tab === "students" && <StudentsPage students={students} setStudents={setStudents} canEdit={isAdmin || isFaculty} canDelete={isAdmin} user={user} />}
          {tab === "attendance" && <AttendancePage students={students} attendance={attendance} setAttendance={setAttendance} canEdit={isAdmin || isFaculty} user={user} />}
          {tab === "fees" && <FeesResultsPage students={students} fees={fees} setFees={setFees} results={results} setResults={setResults} canEdit={isAdmin || isFaculty} user={user} />}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   DASHBOARD
----------------------------------------------------------------- */
function Dashboard({ students, attendance, fees, results, user }) {
  const scopedStudents = user.role === "student" ? students.filter((s) => s.id === user.studentId) : students;
  const scopedIds = new Set(scopedStudents.map((s) => s.id));

  const attByStudent = useMemo(() => {
    const map = {};
    attendance.filter((a) => scopedIds.has(a.studentId)).forEach((a) => {
      map[a.studentId] = map[a.studentId] || { p: 0, t: 0 };
      map[a.studentId].t++;
      if (a.status === "present") map[a.studentId].p++;
    });
    return map;
  }, [attendance, students, user]);

  const avgAttendance = useMemo(() => {
    const vals = Object.values(attByStudent);
    if (!vals.length) return 0;
    return Math.round((vals.reduce((s, v) => s + v.p / v.t, 0) / vals.length) * 100);
  }, [attByStudent]);

  const feesScoped = fees.filter((f) => scopedIds.has(f.studentId));
  const paidCount = feesScoped.filter((f) => f.status === "paid").length;
  const feesPct = feesScoped.length ? Math.round((paidCount / feesScoped.length) * 100) : 0;

  const resultsScoped = results.filter((r) => scopedIds.has(r.studentId));
  const avgResult = resultsScoped.length
    ? Math.round(resultsScoped.reduce((s, r) => s + (r.marks / r.max) * 100, 0) / resultsScoped.length)
    : 0;

  const trend = DATES.map((d) => {
    const dayRows = attendance.filter((a) => a.date === `2026-${d}` && scopedIds.has(a.studentId));
    const present = dayRows.filter((a) => a.status === "present").length;
    return { date: d, pct: dayRows.length ? Math.round((present / dayRows.length) * 100) : 0 };
  });

  const feeBreakdown = ["paid", "partial", "pending"].map((status) => ({
    name: status, value: feesScoped.filter((f) => f.status === status).length,
  })).filter((x) => x.value > 0);
  const FEE_COLORS = { paid: COLORS.green, partial: COLORS.orange, pending: COLORS.red };

  const byClass = useMemo(() => {
    const map = {};
    scopedStudents.forEach((s) => {
      map[s.cls] = map[s.cls] || { cls: s.cls, total: 0, count: 0 };
    });
    resultsScoped.forEach((r) => {
      const st = scopedStudents.find((s) => s.id === r.studentId);
      if (!st) return;
      map[st.cls].total += (r.marks / r.max) * 100;
      map[st.cls].count += 1;
    });
    return Object.values(map).map((c) => ({ cls: c.cls, avg: c.count ? Math.round(c.total / c.count) : 0 }));
  }, [scopedStudents, resultsScoped]);

  return (
    <div>
      <PageHeader title={user.role === "student" ? `Welcome back, ${user.name.split(" ")[0]}` : "Dashboard"}
        subtitle="Live snapshot across students, attendance, fees and results." />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard icon={Users} label={user.role === "student" ? "Your Class" : "Total Students"} value={user.role === "student" ? scopedStudents[0]?.cls || "-" : students.length} accent={COLORS.navy} />
        <StatCard icon={CalendarCheck} label="Avg. Attendance" value={`${avgAttendance}%`} accent={COLORS.teal} />
        <StatCard icon={Wallet} label="Fees Paid" value={`${feesPct}%`} accent={COLORS.orange} />
        <StatCard icon={Award} label="Avg. Result" value={`${avgResult}%`} accent={COLORS.green} />
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Card style={{ flex: 2, minWidth: 340 }}>
          <SectionLabel>Attendance trend</SectionLabel>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid stroke="#E9DCC2" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: COLORS.muted }} />
              <YAxis tick={{ fontSize: 12, fill: COLORS.muted }} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="pct" name="Present %" stroke={COLORS.teal} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ flex: 1, minWidth: 240 }}>
          <SectionLabel>Fee status</SectionLabel>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={feeBreakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                {feeBreakdown.map((entry, i) => <Cell key={i} fill={FEE_COLORS[entry.name]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12, textTransform: "capitalize" }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {user.role !== "student" && (
        <Card style={{ marginTop: 16 }}>
          <SectionLabel>Class-wise average result</SectionLabel>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byClass}>
              <CartesianGrid stroke="#E9DCC2" strokeDasharray="3 3" />
              <XAxis dataKey="cls" tick={{ fontSize: 12, fill: COLORS.muted }} />
              <YAxis tick={{ fontSize: 12, fill: COLORS.muted }} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="avg" name="Avg %" fill={COLORS.orange} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 24, margin: "0 0 4px", color: COLORS.ink }}>{title}</h2>
      <p style={{ color: COLORS.muted, fontSize: 13.5, margin: 0 }}>{subtitle}</p>
    </div>
  );
}
function SectionLabel({ children }) {
  return <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.navy, marginBottom: 10, letterSpacing: 0.2 }}>{children}</div>;
}

/* ---------------------------------------------------------------
   STUDENTS PAGE
----------------------------------------------------------------- */
function StudentsPage({ students, setStudents, canEdit, canDelete, user }) {
  const [modal, setModal] = useState(null); // {mode:'add'|'edit', data}
  const visible = user.role === "student" ? students.filter((s) => s.id === user.studentId) : students;

  function save(form) {
    if (modal.mode === "add") {
      setStudents([...students, { ...form, id: uid(), gpa: parseFloat(form.gpa) || 0 }]);
    } else {
      setStudents(students.map((s) => (s.id === modal.data.id ? { ...s, ...form, gpa: parseFloat(form.gpa) || 0 } : s)));
    }
    setModal(null);
  }
  function remove(id) {
    setStudents(students.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <PageHeader title="Student Management" subtitle="Centralized records and academic details." />
        {canEdit && (
          <Button variant="orange" onClick={() => setModal({ mode: "add", data: {} })}>
            <Plus size={15} /> Add student
          </Button>
        )}
      </div>

      <Card style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 720 }}>
          <thead>
            <tr style={{ textAlign: "left", background: COLORS.parchmentDeep }}>
              {["Roll", "Name", "Class", "Email", "Phone", "GPA", ""].map((h) => (
                <th key={h} style={{ padding: "10px 14px", fontSize: 11.5, color: COLORS.muted, fontWeight: 700, letterSpacing: 0.3 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.id} style={{ borderTop: `1px solid ${COLORS.parchmentDeep}` }}>
                <td style={{ padding: "10px 14px", color: COLORS.muted }}>{s.roll}</td>
                <td style={{ padding: "10px 14px", fontWeight: 600 }}>{s.name}</td>
                <td style={{ padding: "10px 14px" }}>{s.cls}</td>
                <td style={{ padding: "10px 14px", color: COLORS.muted }}>{s.email}</td>
                <td style={{ padding: "10px 14px", color: COLORS.muted }}>{s.phone}</td>
                <td style={{ padding: "10px 14px" }}>{s.gpa}</td>
                <td style={{ padding: "10px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                  {canEdit && <Pencil size={15} style={{ cursor: "pointer", color: COLORS.navy, marginRight: 12 }} onClick={() => setModal({ mode: "edit", data: s })} />}
                  {canDelete && <Trash2 size={15} style={{ cursor: "pointer", color: COLORS.red }} onClick={() => remove(s.id)} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {modal && (
        <Modal title={modal.mode === "add" ? "Add student" : "Edit student"} onClose={() => setModal(null)}>
          <StudentForm initial={modal.data} onSave={save} />
        </Modal>
      )}
    </div>
  );
}

function StudentForm({ initial, onSave }) {
  const [form, setForm] = useState({
    name: initial.name || "", roll: initial.roll || "", cls: initial.cls || "CSE-3A",
    email: initial.email || "", phone: initial.phone || "", admission: initial.admission || "2026-01-01",
    gpa: initial.gpa ?? "",
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <Field label="Full name"><input style={inputStyle} value={form.name} onChange={set("name")} required /></Field>
      <Field label="Roll number"><input style={inputStyle} value={form.roll} onChange={set("roll")} required /></Field>
      <Field label="Class / section">
        <select style={inputStyle} value={form.cls} onChange={set("cls")}>
          <option>CSE-3A</option><option>CSE-3B</option>
        </select>
      </Field>
      <Field label="Email"><input type="email" style={inputStyle} value={form.email} onChange={set("email")} required /></Field>
      <Field label="Phone"><input style={inputStyle} value={form.phone} onChange={set("phone")} /></Field>
      <Field label="GPA"><input type="number" step="0.1" min="0" max="10" style={inputStyle} value={form.gpa} onChange={set("gpa")} /></Field>
      <Button type="submit" variant="orange" style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>Save student</Button>
    </form>
  );
}

/* ---------------------------------------------------------------
   ATTENDANCE PAGE
----------------------------------------------------------------- */
function AttendancePage({ students, attendance, setAttendance, canEdit, user }) {
  const [date, setDate] = useState("2026-09-15");
  const visible = user.role === "student" ? students.filter((s) => s.id === user.studentId) : students;

  function statusFor(studentId, d) {
    return attendance.find((a) => a.studentId === studentId && a.date === d)?.status || null;
  }
  function toggle(studentId) {
    const existing = attendance.find((a) => a.studentId === studentId && a.date === date);
    if (existing) {
      setAttendance(attendance.map((a) => a.id === existing.id ? { ...a, status: a.status === "present" ? "absent" : "present" } : a));
    } else {
      setAttendance([...attendance, { id: uid(), studentId, date, status: "present" }]);
    }
  }

  const pctByStudent = (id) => {
    const rows = attendance.filter((a) => a.studentId === id);
    if (!rows.length) return 0;
    return Math.round((rows.filter((a) => a.status === "present").length / rows.length) * 100);
  };

  const trend = DATES.map((d) => {
    const dayRows = attendance.filter((a) => a.date === `2026-${d}` && visible.some((s) => s.id === a.studentId));
    const present = dayRows.filter((a) => a.status === "present").length;
    return { date: d, pct: dayRows.length ? Math.round((present / dayRows.length) * 100) : 0 };
  });

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Record attendance and track percentage trends." />

      {canEdit && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
            <SectionLabel>Mark attendance for</SectionLabel>
            <select style={{ ...inputStyle, width: 160 }} value={date} onChange={(e) => setDate(e.target.value)}>
              {DATES.map((d) => <option key={d} value={`2026-${d}`}>{`2026-${d}`}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {students.map((s) => {
              const st = statusFor(s.id, date);
              return (
                <button key={s.id} onClick={() => toggle(s.id)} style={{
                  padding: "8px 12px", borderRadius: 9, cursor: "pointer", fontSize: 12.5, fontWeight: 600,
                  border: `1px solid ${st === "present" ? "#BFE0BF" : st === "absent" ? "#EFC6C1" : COLORS.parchmentDeep}`,
                  background: st === "present" ? "#E4F3E4" : st === "absent" ? "#FBE7E5" : "#fff",
                  color: st === "present" ? COLORS.green : st === "absent" ? COLORS.red : COLORS.muted,
                }}>
                  {s.name} {st ? `· ${st}` : "· unmarked"}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 16 }}>
        <SectionLabel>Attendance trend</SectionLabel>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trend}>
            <CartesianGrid stroke="#E9DCC2" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: COLORS.muted }} />
            <YAxis tick={{ fontSize: 12, fill: COLORS.muted }} domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="pct" name="Present %" fill={COLORS.teal} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 480 }}>
          <thead>
            <tr style={{ textAlign: "left", background: COLORS.parchmentDeep }}>
              <th style={{ padding: "10px 14px", fontSize: 11.5, color: COLORS.muted, fontWeight: 700 }}>Student</th>
              <th style={{ padding: "10px 14px", fontSize: 11.5, color: COLORS.muted, fontWeight: 700 }}>Class</th>
              <th style={{ padding: "10px 14px", fontSize: 11.5, color: COLORS.muted, fontWeight: 700 }}>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => {
              const pct = pctByStudent(s.id);
              return (
                <tr key={s.id} style={{ borderTop: `1px solid ${COLORS.parchmentDeep}` }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: "10px 14px" }}>{s.cls}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <Pill tone={pct >= 75 ? "paid" : pct >= 60 ? "partial" : "pending"}>{pct}%</Pill>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------
   FEES & RESULTS PAGE
----------------------------------------------------------------- */
function FeesResultsPage({ students, fees, setFees, results, setResults, canEdit, user }) {
  const [gradeModal, setGradeModal] = useState(null);
  const visibleStudents = user.role === "student" ? students.filter((s) => s.id === user.studentId) : students;

  function updateFeeStatus(feeId, status) {
    setFees(fees.map((f) => (f.id === feeId ? { ...f, status } : f)));
  }
  function saveGrade(form) {
    setResults([...results.filter((r) => !(r.studentId === form.studentId && r.subject === form.subject && r.term === form.term)),
      { id: uid(), studentId: form.studentId, subject: form.subject, term: form.term, marks: parseInt(form.marks, 10), max: 100 }]);
    setGradeModal(null);
  }

  const perfByClass = useMemo(() => {
    const map = {};
    visibleStudents.forEach((s) => (map[s.cls] = map[s.cls] || []));
    results.filter((r) => visibleStudents.some((s) => s.id === r.studentId)).forEach((r) => {
      const st = visibleStudents.find((s) => s.id === r.studentId);
      map[st.cls] = map[st.cls] || [];
      map[st.cls].push((r.marks / r.max) * 100);
    });
    return Object.entries(map).map(([cls, arr]) => ({
      subject: cls, avg: arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0,
    }));
  }, [results, visibleStudents]);

  return (
    <div>
      <PageHeader title="Fees & Results" subtitle="Track fee status, enter grades, review performance." />

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <Card style={{ flex: 1, minWidth: 320, padding: 0, overflowX: "auto" }}>
          <div style={{ padding: "16px 16px 0" }}><SectionLabel>Fee status</SectionLabel></div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={{ padding: "8px 14px", fontSize: 11, color: COLORS.muted }}>Student</th>
                <th style={{ padding: "8px 14px", fontSize: 11, color: COLORS.muted }}>Amount</th>
                <th style={{ padding: "8px 14px", fontSize: 11, color: COLORS.muted }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.filter((f) => visibleStudents.some((s) => s.id === f.studentId)).map((f) => {
                const st = students.find((s) => s.id === f.studentId);
                return (
                  <tr key={f.id} style={{ borderTop: `1px solid ${COLORS.parchmentDeep}` }}>
                    <td style={{ padding: "9px 14px", fontWeight: 600 }}>{st?.name}</td>
                    <td style={{ padding: "9px 14px" }}>₹{f.amount.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "9px 14px" }}>
                      {canEdit ? (
                        <select value={f.status} onChange={(e) => updateFeeStatus(f.id, e.target.value)}
                          style={{ ...inputStyle, padding: "4px 8px", width: 110, fontSize: 12.5 }}>
                          <option value="paid">paid</option>
                          <option value="partial">partial</option>
                          <option value="pending">pending</option>
                        </select>
                      ) : <Pill tone={f.status}>{f.status}</Pill>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card style={{ flex: 1, minWidth: 280 }}>
          <SectionLabel>Performance overview</SectionLabel>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={perfByClass}>
              <CartesianGrid stroke="#E9DCC2" strokeDasharray="3 3" />
              <XAxis dataKey="subject" tick={{ fontSize: 12, fill: COLORS.muted }} />
              <YAxis tick={{ fontSize: 12, fill: COLORS.muted }} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="avg" name="Avg %" fill={COLORS.green} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <SectionLabel>Grades — {SUBJECTS.join(", ")}</SectionLabel>
        {canEdit && <Button variant="orange" onClick={() => setGradeModal({})}><Plus size={14} /> Enter grade</Button>}
      </div>
      <Card style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 640 }}>
          <thead>
            <tr style={{ textAlign: "left", background: COLORS.parchmentDeep }}>
              <th style={{ padding: "10px 14px", fontSize: 11.5, color: COLORS.muted, fontWeight: 700 }}>Student</th>
              <th style={{ padding: "10px 14px", fontSize: 11.5, color: COLORS.muted, fontWeight: 700 }}>Subject</th>
              <th style={{ padding: "10px 14px", fontSize: 11.5, color: COLORS.muted, fontWeight: 700 }}>Marks</th>
              <th style={{ padding: "10px 14px", fontSize: 11.5, color: COLORS.muted, fontWeight: 700 }}>Grade</th>
            </tr>
          </thead>
          <tbody>
            {results.filter((r) => visibleStudents.some((s) => s.id === r.studentId)).map((r) => {
              const st = students.find((s) => s.id === r.studentId);
              const pct = Math.round((r.marks / r.max) * 100);
              return (
                <tr key={r.id} style={{ borderTop: `1px solid ${COLORS.parchmentDeep}` }}>
                  <td style={{ padding: "9px 14px", fontWeight: 600 }}>{st?.name}</td>
                  <td style={{ padding: "9px 14px" }}>{r.subject}</td>
                  <td style={{ padding: "9px 14px" }}>{r.marks}/{r.max}</td>
                  <td style={{ padding: "9px 14px" }}><Pill tone={pct >= 60 ? "paid" : pct >= 40 ? "partial" : "pending"}>{grade(pct)}</Pill></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {gradeModal && (
        <Modal title="Enter grade" onClose={() => setGradeModal(null)}>
          <GradeForm students={students} onSave={saveGrade} />
        </Modal>
      )}
    </div>
  );
}

function GradeForm({ students, onSave }) {
  const [form, setForm] = useState({ studentId: students[0]?.id, subject: SUBJECTS[0], term: "Autumn 2026", marks: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <Field label="Student">
        <select style={inputStyle} value={form.studentId} onChange={set("studentId")}>
          {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </Field>
      <Field label="Subject">
        <select style={inputStyle} value={form.subject} onChange={set("subject")}>
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Marks (out of 100)">
        <input type="number" min="0" max="100" style={inputStyle} value={form.marks} onChange={set("marks")} required />
      </Field>
      <Button type="submit" variant="orange" style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>Save grade</Button>
    </form>
  );
}
