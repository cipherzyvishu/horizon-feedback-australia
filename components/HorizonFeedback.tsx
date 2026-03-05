"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "horizon_feedback";
const inMemoryStore: any[] = [];

const C = {
    navy: "#0d182a", navyLight: "#132238", gold: "#ffca63",
    goldDim: "rgba(255,202,99,0.15)", goldBorder: "rgba(255,202,99,0.25)",
    cyan: "#5cc8e4", cyanDim: "rgba(92,200,228,0.12)",
    white: "#ffffff", white60: "rgba(255,255,255,0.6)",
    white40: "rgba(255,255,255,0.4)", white20: "rgba(255,255,255,0.2)",
    white10: "rgba(255,255,255,0.1)", white05: "rgba(255,255,255,0.05)",
};

const ZYCUS_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAnCAIAAADFKJCeAAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAAAUXElEQVR42u1caVQUV9Pu7umZYXAAQUA2WQKRTcEl0RAFNCAo0QiSRFwiHhUXjHHBBdC4xARiSEBEJR41Ick5ogY0jBzXRERUNKIoSILCACKiiOzbrN3fj/py02/PMAwDJL6+1g/O0EvduvdWPVW3bt3GsJ4Ix3Ecx4cMGXLt2jWKopRKJa0rwevNzc1hYWEYhnE4HOwV/c8SSZIYhn300Uc0TUulUkXfSCqV0jRdWFiIYRhBEK+G96VVGw1ABT9omsZxvKioqK2tzcDAoI/tAUpduHABx3GCIGiaBnOcqaXvm8NrbWAXJ6bSFwqtFIKUd9lXqFKRPnBqfHrqCPPb1y+GbSe1ZkJqLLcb3aKEHAbXFAHkRAAG4hCZcjSX+5EQ4EJJgDUZzB1AAAA";
const HORIZON_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjAAAACpCAYAAAA1BwfNAAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAACuxElEQVR42uxdeXxU1fl+zntnJpksmSxkIwtLIBC2iCCoIEsWNEdFUVGrtdrWSrVa21rX0eo2mq1W21o91mqsXoG60e";

/* NPS-style 1–10 Rating Zones — Promoter-first ordering */
const ZONES: { [key: string]: { label: string; emoji: string; color: string; bg: string; border: string; range: number[]; featured: boolean; cls: string } } = {
    promoter: { label: "Loved it!", emoji: "🤩", color: "#16a34a", bg: "rgba(22,163,74,0.14)", border: "rgba(22,163,74,0.4)", range: [8, 9, 10], featured: true, cls: "hf-zone-promoter" },
    neutral: { label: "It was OK", emoji: "😐", color: "#eab308", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.2)", range: [5, 6, 7], featured: false, cls: "hf-zone-neutral" },
    detractor: { label: "Needs work", emoji: "😕", color: "#dc2626", bg: "rgba(220,38,38,0.06)", border: "rgba(220,38,38,0.15)", range: [1, 2, 3, 4], featured: false, cls: "hf-zone-detractor" },
};
const getZone = (r: number) => r <= 4 ? ZONES.detractor : r <= 7 ? ZONES.neutral : ZONES.promoter;
const ZONE_ORDER = [ZONES.detractor, ZONES.neutral, ZONES.promoter];
const ALL_RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const SESSIONS = [
    "Overall Conference Experience",
    "Keynote Sessions",
    "Product Demos & Workshops",
    "Networking & Engagement",
    "Venue & Hospitality",
    "Agentic AI Showcase",
];

const DiamondDivider = ({ color = C.gold }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "14px 0", width: "100%" }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${color}40)` }} />
        <div style={{ width: 8, height: 8, transform: "rotate(45deg)", background: color, margin: "0 6px", flexShrink: 0 }} />
        <div style={{ width: 5, height: 5, transform: "rotate(45deg)", border: `1px solid ${color}`, margin: "0 4px", flexShrink: 0 }} />
        <div style={{ width: 8, height: 8, transform: "rotate(45deg)", background: color, margin: "0 6px", flexShrink: 0 }} />
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${color}40)` }} />
    </div>
);

export default function HorizonFeedback() {
    const [view, setView] = useState("submit");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [session, setSession] = useState(SESSIONS[0]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [feedbackList, setFeedbackList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [adminLoading, setAdminLoading] = useState(false);
    const [hovered, setHovered] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [adminPass, setAdminPass] = useState("");
    const [adminAuth, setAdminAuth] = useState(false);
    const [filterSession, setFilterSession] = useState("All");
    const [animateIn, setAnimateIn] = useState(true);
    const [sheetsStatus, setSheetsStatus] = useState("");
    const [sheetsError, setSheetsError] = useState("");

    useEffect(() => {
        setTimeout(() => setAnimateIn(false), 600);
    }, []);

    const WEBHOOK_URL = "https://zycusmktg.app.n8n.cloud/webhook/c0831485-6525-45e4-9487-cb23c42a6db2";

    const loadFeedback = useCallback(async () => {
        setAdminLoading(true);
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const items = JSON.parse(stored) as any[];
                items.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setFeedbackList(items);
            } else {
                setFeedbackList([...inMemoryStore].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            }
        } catch (e) {
            setFeedbackList([...inMemoryStore].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        }
        setAdminLoading(false);
    }, []);

    const postToSheets = async (entry: any) => {
        setSheetsError("");
        try {
            const resp = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: entry.name, email: entry.email || "", session: entry.session,
                    rating: entry.rating, ratingLabel: entry.ratingLabel, comment: entry.comment || "",
                    timestamp: new Date(entry.timestamp).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                }),
            });
            console.log("Webhook response:", resp.status, resp.statusText);
        } catch (e: any) {
            console.error("Webhook sync failed:", e);
            setSheetsError("Sync failed: " + e.message);
        }
    };

    const testSheetsConnection = async () => {
        setSheetsError("");
        setSheetsStatus("testing");
        try {
            const resp = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "🧪 Test Entry", email: "test@horizon.zycus.com", session: "Test",
                    rating: 10, ratingLabel: "Loved it!", comment: "Connection test — you can delete this row",
                    timestamp: new Date().toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                }),
            });
            if (resp.ok) {
                setSheetsStatus("test-ok");
            } else {
                setSheetsStatus("test-fail");
                setSheetsError(`HTTP ${resp.status} ${resp.statusText}`);
            }
            setTimeout(() => setSheetsStatus(""), 8000);
        } catch (e: any) {
            setSheetsStatus("test-fail");
            setSheetsError(e.name + ": " + e.message);
            setTimeout(() => setSheetsStatus(""), 8000);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim() || rating === 0) return;
        setLoading(true);
        const entry = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            name: name.trim(), email: email.trim(), session, rating,
            ratingLabel: getZone(rating).label, comment: comment.trim(),
            timestamp: new Date().toISOString(),
        };
        // Save to localStorage
        try {
            const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            existing.push(entry);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        } catch (e) { }
        inMemoryStore.push(entry);
        await postToSheets(entry);
        setSubmitted(true);
        setTimeout(() => { setView("thanks"); setLoading(false); }, 400);
    };

    const exportCSV = () => {
        if (filteredFeedback.length === 0) return;
        const headers = ["Name", "Email", "Session", "Rating (1-10)", "Rating Label", "Comment", "Date & Time"];
        const rows = filteredFeedback.map((f: any) => [
            f.name, f.email || "", f.session, f.rating, f.ratingLabel,
            (f.comment || "").replace(/"/g, '""'),
            new Date(f.timestamp).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        ]);
        const csv = [headers, ...rows].map((row) => row.map((cell: any) => `"${cell}"`).join(",")).join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Horizon_EU_2026_Feedback_${filterSession === "All" ? "All" : filterSession.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    const resetForm = () => { setName(""); setEmail(""); setSession(SESSIONS[0]); setRating(0); setComment(""); setSubmitted(false); setView("submit"); };
    const openAdmin = () => { setView("admin"); setAdminAuth(false); setAdminPass(""); };
    const authAdmin = () => { if (adminPass === "horizon2026") { setAdminAuth(true); loadFeedback(); } };

    const filteredFeedback = filterSession === "All" ? feedbackList : feedbackList.filter((f: any) => f.session === filterSession);
    const avgRating = filteredFeedback.length > 0 ? (filteredFeedback.reduce((s: number, f: any) => s + f.rating, 0) / filteredFeedback.length).toFixed(1) : "—";
    const ratingDist = ALL_RATINGS.map((r) => filteredFeedback.filter((f: any) => f.rating === r).length);
    const maxDist = Math.max(...ratingDist, 1);

    const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { (e.target as HTMLElement).style.borderColor = C.gold + "80"; };
    const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { (e.target as HTMLElement).style.borderColor = C.white10; };

    return (
        <div style={S.root}>
            <link href="https://fonts.googleapis.com/css2?family=Caladea:wght@400;700&display=swap" rel="stylesheet" />
            <style>{`
              @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
              button { touch-action: manipulation; }
              @media (max-width: 600px) {
                .hf-container { padding: 24px 14px !important; }
                .hf-card { padding: 24px 16px !important; border-radius: 16px !important; overflow: hidden; }
                .hf-logo { max-width: 240px !important; }
              }
              @media (max-width: 480px) {
                .hf-container { padding: 20px 12px !important; }
                .hf-card { padding: 20px 12px !important; }
                .hf-logo { max-width: 210px !important; }
                .hf-zone-row { gap: 4px !important; overflow: hidden; }
                .hf-zone-card { min-width: 0; padding-left: 4px !important; padding-right: 4px !important; }
                .hf-zone-detractor { flex: 1.2 !important; }
                .hf-zone-neutral   { flex: 0.9 !important; }
                .hf-zone-promoter  { flex: 0.9 !important; }
                .hf-zone-btns { min-width: 0; gap: 2px !important; }
                .hf-zone-btn { min-width: 0; flex-shrink: 1; width: 28px !important; height: 28px !important; font-size: 12px !important; border-radius: 14px !important; }
              }
              @media (max-width: 380px) {
                .hf-zone-row { gap: 3px !important; }
                .hf-zone-detractor { flex: 1.25 !important; }
                .hf-zone-neutral   { flex: 0.85 !important; }
                .hf-zone-promoter  { flex: 0.9  !important; }
                .hf-zone-btns { gap: 1px !important; }
                .hf-zone-btn { width: 24px !important; height: 24px !important; font-size: 11px !important; border-radius: 12px !important; }
                .hf-stats-row { flex-direction: column !important; gap: 8px !important; }
              }
            `}</style>
            <div style={S.bgGrid} />
            <div style={S.bgGlowGold} />
            <div style={S.bgGlowCyan} />

            <div className="hf-container" style={{ ...S.container, opacity: animateIn ? 0 : 1, transform: animateIn ? "translateY(24px)" : "translateY(0)", transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)" }}>

                {/* HEADER with actual logos */}
                <div style={S.header}>
                    <img src={HORIZON_LOGO} alt="Zycus Horizon" className="hf-logo" style={{ width: "100%", maxWidth: 340, marginBottom: 8 }} />
                    <div style={S.editionText}>EU &amp; UK Edition 2026</div>
                    <DiamondDivider />
                    <div style={S.venueLine}>InterContinental Vienna, Austria</div>
                    <div style={{ ...S.venueLine, marginTop: 2 }}>March 10–12, 2026</div>
                </div>

                {/* SUBMIT */}
                {view === "submit" && (
                    <div className="hf-card" style={{ ...S.card, opacity: submitted ? 0 : 1, transform: submitted ? "scale(0.96)" : "scale(1)", transition: "all 0.4s ease" }}>
                        <h2 style={S.cardTitle}>How Amazing Was Your Experience? ✨</h2>
                        <p style={S.cardSub}>We&apos;d love to hear what made Horizon special for you!</p>
                        <div style={S.field}>
                            <label style={S.label}>Your Name <span style={{ color: C.gold }}>*</span></label>
                            <input style={S.input} placeholder="e.g. Sarah Johnson" value={name} onChange={(e) => setName(e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>Email (optional)</label>
                            <input style={S.input} placeholder="sarah@company.com" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
                        </div>

                        <div style={S.field}>
                            <label style={S.label}>How would you rate it? <span style={{ color: C.gold }}>*</span></label>
                            <div className="hf-zone-row" style={{ ...S.zoneRow, alignItems: "flex-end" }}>
                                {ZONE_ORDER.map((z) => {
                                    const isFeatured = z.featured;
                                    const isActive = rating > 0 && z.range.includes(rating);
                                    return (
                                        <div key={z.label} className={`hf-zone-card ${z.cls}`} style={{
                                            ...S.zoneCard,
                                            background: z.bg,
                                            borderColor: isActive ? z.color : z.border,
                                            flex: isFeatured ? "1.3" : "0.85",
                                            padding: isFeatured ? "14px 8px 12px" : "10px 6px 12px",
                                            boxShadow: isFeatured ? `0 0 20px ${z.bg}, 0 0 40px rgba(22,163,74,0.06)` : "none",
                                            transition: "all 0.3s ease",
                                            display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center",
                                        }}>
                                            <div style={{ fontSize: isFeatured ? 36 : 24, lineHeight: 1, transition: "font-size 0.3s", marginBottom: 4 }}>{z.emoji}</div>
                                            <div style={{ fontSize: isFeatured ? 12 : 10, fontWeight: 700, color: z.color, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8, opacity: isFeatured ? 1 : 0.7 }}>{z.label}</div>
                                            <div className="hf-zone-btns" style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                                                {z.range.map((v) => {
                                                    const active = rating === v;
                                                    const hov = hovered === v;
                                                    const btnSize = 34;
                                                    return (
                                                        <button key={v} className="hf-zone-btn" style={{
                                                            ...S.zoneNumBtn,
                                                            width: btnSize,
                                                            height: btnSize,
                                                            fontSize: 14,
                                                            background: active ? z.color : hov ? `${z.color}30` : "transparent",
                                                            borderColor: active ? z.color : hov ? z.color : `${z.color}50`,
                                                            color: active ? "#fff" : hov ? z.color : `${z.color}cc`,
                                                            transform: active ? "scale(1.15)" : hov ? "scale(1.06)" : "scale(1)",
                                                            boxShadow: active && isFeatured ? `0 0 16px ${z.bg}, 0 4px 12px rgba(0,0,0,0.3)` : active ? `0 0 10px ${z.bg}` : "none",
                                                            fontWeight: isFeatured ? 700 : 500,
                                                        }} onClick={() => setRating(v)} onMouseEnter={() => setHovered(v)} onMouseLeave={() => setHovered(0)}>
                                                            {v}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {rating > 0 && (() => {
                                const z = getZone(rating);
                                const msg = rating >= 8 ? `Amazing! You rated ${rating}/10 🎉` : rating >= 5 ? `You rated ${rating}/10` : `You rated ${rating}/10 — we'll do better!`;
                                return (
                                    <div style={{ textAlign: "center", marginTop: 10, fontSize: rating >= 8 ? 15 : 13, color: z.color, fontWeight: rating >= 8 ? 700 : 500, transition: "all 0.3s" }}>
                                        {z.emoji} {msg}
                                    </div>
                                );
                            })()}
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>Comments (optional)</label>
                            <textarea style={S.textarea} placeholder="What was the highlight of your experience? Any moments that stood out?" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} onFocus={inputFocus} onBlur={inputBlur} />
                        </div>
                        <button style={{ ...S.submitBtn, opacity: !name.trim() || rating === 0 ? 0.4 : 1, cursor: !name.trim() || rating === 0 ? "not-allowed" : "pointer" }}
                            onClick={handleSubmit} disabled={!name.trim() || rating === 0 || loading}>
                            {loading ? "Sending your feedback..." : "Share My Experience ✨"}
                        </button>
                    </div>
                )}

                {/* THANKS — Extra celebratory for promoters */}
                {view === "thanks" && (() => {
                    const isPromoter = rating >= 8;
                    const isDetractor = rating <= 4;
                    return (
                        <div className="hf-card" style={S.card}>
                            <div style={{ textAlign: "center", padding: "24px 0" }}>
                                {isPromoter && (
                                    <>
                                        <div style={{ fontSize: 64, marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite" }}>🎉</div>
                                        <h2 style={{ ...S.cardTitle, fontSize: 28, textAlign: "center", color: "#16a34a" }}>You&apos;re Amazing!</h2>
                                        <DiamondDivider color="#16a34a" />
                                        <p style={{ ...S.cardSub, textAlign: "center", maxWidth: 360, margin: "0 auto 12px", fontSize: 15 }}>
                                            Thank you for the incredible rating! Feedback like yours inspires us to keep pushing boundaries.
                                        </p>
                                        <p style={{ fontSize: 13, color: C.gold, marginBottom: 28 }}>🌟 You&apos;re helping shape the future of procurement innovation!</p>

                                    </>
                                )}
                                {!isPromoter && !isDetractor && (
                                    <>
                                        <div style={{ fontSize: 56, marginBottom: 16 }}>🙏</div>
                                        <h2 style={{ ...S.cardTitle, fontSize: 28, textAlign: "center" }}>Thank You!</h2>
                                        <DiamondDivider />
                                        <p style={{ ...S.cardSub, textAlign: "center", maxWidth: 360, margin: "0 auto 28px" }}>Your feedback helps us improve. We&apos;re committed to making the next Horizon even better for you.</p>
                                    </>
                                )}
                                {isDetractor && (
                                    <>
                                        <div style={{ fontSize: 56, marginBottom: 16 }}>💪</div>
                                        <h2 style={{ ...S.cardTitle, fontSize: 28, textAlign: "center" }}>We Hear You</h2>
                                        <DiamondDivider />
                                        <p style={{ ...S.cardSub, textAlign: "center", maxWidth: 360, margin: "0 auto 28px" }}>Thank you for your honesty. Your feedback is invaluable — we&apos;re taking it to heart and will work to improve.</p>
                                    </>
                                )}
                                <button style={S.submitBtn} onClick={resetForm}>Submit Another Response</button>
                            </div>
                        </div>
                    );
                })()}

                {/* ADMIN LOGIN */}
                {view === "admin" && !adminAuth && (
                    <div className="hf-card" style={S.card}>
                        <h2 style={S.cardTitle}>Admin Dashboard</h2>
                        <p style={S.cardSub}>Enter the admin password to access feedback data.</p>
                        <div style={S.field}>
                            <input style={S.input} type="password" placeholder="Admin password" value={adminPass}
                                onChange={(e) => setAdminPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && authAdmin()} onFocus={inputFocus} onBlur={inputBlur} />
                        </div>
                        <button style={S.submitBtn} onClick={authAdmin}>Access Dashboard</button>

                    </div>
                )}

                {/* ADMIN DASHBOARD */}
                {view === "admin" && adminAuth && (
                    <div className="hf-card" style={S.card}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 4 }}>
                            <h2 style={{ ...S.cardTitle, marginBottom: 0 }}>Feedback Dashboard</h2>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button style={S.actionCyan} onClick={loadFeedback}>↻ Refresh</button>
                                <button style={{ ...S.actionGold, opacity: filteredFeedback.length === 0 ? 0.4 : 1, cursor: filteredFeedback.length === 0 ? "not-allowed" : "pointer" }}
                                    onClick={exportCSV} disabled={filteredFeedback.length === 0}>⬇ Export CSV</button>
                            </div>
                        </div>
                        {adminLoading ? <p style={S.cardSub}>Loading feedback data...</p> : (
                            <>
                                <div style={S.sheetsBox}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                        <span style={{ fontSize: 15 }}>⚡</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: C.white60 }}>Webhook Integration (n8n)</span>
                                        <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600, marginLeft: "auto" }}>● Connected</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: C.white40, marginBottom: 8, wordBreak: "break-all" }}>Endpoint: zycusmktg.app.n8n.cloud</div>
                                    {sheetsStatus === "test-ok" && <div style={{ fontSize: 12, color: "#22c55e", marginTop: 6 }}>✓ Test entry sent successfully!</div>}
                                    {sheetsStatus === "test-fail" && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 6 }}>✗ Test failed: {sheetsError}</div>}
                                    {sheetsStatus !== "testing" && (
                                        <button style={{ ...S.actionCyan, marginTop: 4, fontSize: 12 }} onClick={testSheetsConnection}>
                                            🧪 Test Connection
                                        </button>
                                    )}
                                    {sheetsStatus === "testing" && <div style={{ fontSize: 12, color: C.cyan, marginTop: 6 }}>⏳ Sending test entry...</div>}
                                </div>
                                <div className="hf-stats-row" style={S.statsRow}>
                                    <div style={S.statCard}><div style={S.statNum}>{filteredFeedback.length}</div><div style={S.statLabel}>Responses</div></div>
                                    <div style={{ ...S.statCard, borderColor: C.goldBorder }}><div style={{ ...S.statNum, color: C.gold }}>{avgRating}</div><div style={S.statLabel}>Avg Rating</div></div>
                                    <div style={S.statCard}><div style={S.statNum}>{filteredFeedback.length > 0 ? getZone(Math.round(parseFloat(avgRating) || 5)).emoji : "—"}</div><div style={S.statLabel}>Sentiment</div></div>
                                </div>
                                <div style={S.distWrap}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: C.white40, marginBottom: 14 }}>Rating Distribution</div>
                                    {ALL_RATINGS.slice().reverse().map((r) => {
                                        const zone = getZone(r);
                                        return (
                                            <div key={r} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                                <span style={{ fontSize: 13, fontWeight: 700, width: 22, textAlign: "center", color: zone.color }}>{r}</span>
                                                <div style={{ flex: 1, height: 8, background: C.white05, borderRadius: 4, overflow: "hidden" }}>
                                                    <div style={{ height: "100%", borderRadius: 4, width: `${(ratingDist[r - 1] / maxDist) * 100}%`, background: zone.color, transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)" }} />
                                                </div>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: C.white40, width: 20, textAlign: "right" }}>{ratingDist[r - 1]}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={S.field}>
                                    <label style={S.label}>Filter by Session</label>
                                    <select style={S.select} value={filterSession} onChange={(e) => setFilterSession(e.target.value)}>
                                        <option value="All">All Sessions</option>
                                        {SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16, maxHeight: 500, overflowY: "auto" }}>
                                    {filteredFeedback.length === 0 && <p style={S.cardSub}>No feedback collected yet.</p>}
                                    {filteredFeedback.map((f: any) => (
                                        <div key={f.id} style={S.feedbackItem}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
                                                <div>
                                                    <span style={{ fontSize: 15, fontWeight: 600, color: C.white }}>{f.name}</span>
                                                    {f.email && <span style={{ fontSize: 13, color: C.white20 }}> · {f.email}</span>}
                                                </div>
                                                <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, whiteSpace: "nowrap", background: getZone(f.rating).bg, color: getZone(f.rating).color, border: `1px solid ${getZone(f.rating).border}` }}>
                                                    {getZone(f.rating).emoji} {f.rating}/10 · {f.ratingLabel}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 12, color: C.gold, opacity: 0.7, marginBottom: 6 }}>{f.session}</div>
                                            {f.comment && <div style={{ fontSize: 14, color: C.white60, fontStyle: "italic", lineHeight: 1.5, marginBottom: 6 }}>&ldquo;{f.comment}&rdquo;</div>}
                                            <div style={{ fontSize: 11, color: C.white20 }}>
                                                {new Date(f.timestamp).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div style={S.footer}>
                    {view !== "submit" && <button style={S.footerLink} onClick={resetForm}>← Submit Feedback</button>}
                    {view !== "admin" && <button style={S.footerLink} onClick={openAdmin}>Admin Dashboard →</button>}
                </div>
                <div style={S.powered}>Powered by Zycus · Horizon EU &amp; UK 2026</div>
            </div>
        </div>
    );
}

const S: Record<string, React.CSSProperties> = {
    root: { minHeight: "100vh", background: C.navy, fontFamily: "'Caladea', serif", position: "relative", overflow: "hidden" },
    bgGrid: { position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.015) 1px, transparent 0)", backgroundSize: "40px 40px", pointerEvents: "none" },
    bgGlowGold: { position: "fixed", top: "-20%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(ellipse, rgba(255,202,99,0.06) 0%, transparent 60%)", pointerEvents: "none" },
    bgGlowCyan: { position: "fixed", bottom: "-20%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(ellipse, rgba(92,200,228,0.04) 0%, transparent 60%)", pointerEvents: "none" },
    container: { position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto", padding: "32px 20px" },
    header: { textAlign: "center", marginBottom: 28, display: "flex", flexDirection: "column", alignItems: "center" },
    editionText: { fontFamily: "'Caladea', serif", fontSize: 20, fontWeight: 600, color: C.gold, letterSpacing: 2, marginTop: 6 },
    venueLine: { fontSize: 13, color: C.gold, opacity: 0.65, letterSpacing: 0.3 },
    card: { background: `linear-gradient(170deg, ${C.navyLight} 0%, ${C.navy} 100%)`, border: `1px solid ${C.goldBorder}`, borderRadius: 20, padding: "32px 28px", backdropFilter: "blur(20px)", boxShadow: "0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,202,99,0.08)" },
    cardTitle: { fontFamily: "'Caladea', serif", fontSize: 24, fontWeight: 700, color: C.white, marginTop: 0, marginBottom: 8 },
    cardSub: { fontSize: 14, color: C.white40, marginTop: 0, marginBottom: 24, lineHeight: 1.5 },
    field: { marginBottom: 20 },
    label: { display: "block", fontSize: 13, fontWeight: 500, color: C.white60, marginBottom: 8, letterSpacing: 0.3 },
    input: { width: "100%", padding: "12px 16px", fontSize: 16, background: C.white05, border: `1px solid ${C.white10}`, borderRadius: 10, color: C.white, outline: "none", fontFamily: "'Caladea', serif", boxSizing: "border-box", transition: "border-color 0.2s" },
    select: { width: "100%", padding: "12px 16px", fontSize: 16, background: C.white05, border: `1px solid ${C.white10}`, borderRadius: 10, color: C.white, outline: "none", fontFamily: "'Caladea', serif", boxSizing: "border-box", appearance: "none" },
    textarea: { width: "100%", padding: "12px 16px", fontSize: 16, background: C.white05, border: `1px solid ${C.white10}`, borderRadius: 10, color: C.white, outline: "none", fontFamily: "'Caladea', serif", boxSizing: "border-box", resize: "vertical", minHeight: 80, transition: "border-color 0.2s" },
    zoneRow: { display: "flex", gap: 8 },
    zoneCard: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "14px 8px 14px", borderRadius: 14, border: "2px solid", transition: "border-color 0.3s ease" },
    zoneNumBtn: { display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 20, cursor: "pointer", transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)", background: "transparent", fontFamily: "'Caladea', serif", fontSize: 14, fontWeight: 700, padding: 0, border: "2px solid" },
    submitBtn: { width: "100%", padding: "14px 24px", fontSize: 15, fontWeight: 600, fontFamily: "'Caladea', serif", background: `linear-gradient(135deg, ${C.gold}, #e6a830)`, color: C.navy, border: "none", borderRadius: 10, cursor: "pointer", transition: "all 0.2s", letterSpacing: 0.5, marginTop: 8, boxShadow: "0 4px 20px rgba(255,202,99,0.2)" },
    actionCyan: { padding: "8px 14px", fontSize: 13, fontWeight: 500, fontFamily: "'Caladea', serif", background: C.cyanDim, color: C.cyan, border: "1px solid rgba(92,200,228,0.3)", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap" },
    actionGold: { padding: "8px 14px", fontSize: 13, fontWeight: 500, fontFamily: "'Caladea', serif", background: C.goldDim, color: C.gold, border: `1px solid ${C.goldBorder}`, borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap" },
    sheetsBox: { background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 14, padding: "14px 16px", marginTop: 20, marginBottom: 4 },
    statsRow: { display: "flex", gap: 12, margin: "20px 0" },
    statCard: { flex: 1, background: C.white05, border: `1px solid ${C.white10}`, borderRadius: 14, padding: "18px 12px", textAlign: "center" },
    statNum: { fontSize: 28, fontWeight: 700, color: C.white, fontFamily: "'Caladea', serif" },
    statLabel: { fontSize: 10, color: C.white40, marginTop: 4, letterSpacing: 1, textTransform: "uppercase", fontWeight: 500 },
    distWrap: { background: C.white05, borderRadius: 14, padding: "18px 20px", marginBottom: 20, border: `1px solid ${C.white10}` },
    feedbackItem: { background: C.white05, border: `1px solid ${C.white10}`, borderRadius: 14, padding: "14px 16px" },
    footer: { display: "flex", justifyContent: "center", gap: 24, marginTop: 24 },
    footerLink: { fontSize: 13, color: C.gold, opacity: 0.6, background: "none", border: "none", cursor: "pointer", fontFamily: "'Caladea', serif", textDecoration: "underline", textUnderlineOffset: 3 },
    powered: { textAlign: "center", fontSize: 11, color: C.white20, marginTop: 20, letterSpacing: 0.5 },
};
