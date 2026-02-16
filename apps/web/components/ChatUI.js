"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function tsNow() {
  return new Date().toISOString();
}

function formatTs(ts) {
  try {
    // Stable formatting: avoid locale mismatch between SSR and browser
    // Shows: YYYY-MM-DD HH:mm:ss (local time)
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch {
    return "";
  }
}

const bubbleSafeStyle = {
  maxWidth: "100%",
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

export default function ChatUI() {
  const [mounted, setMounted] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [history, setHistory] = useState([
    {
      role: "assistant",
      text:
        "Hi! I can answer analytics questions (sales, revenue, customers, materials) and I can also draft emails/reminders.\n\nTry: \n• Top 5 sold products this month\n• Material usage trends last 30 days\n• Draft a payment reminder email to a client",
      ts: tsNow(),
    },
  ]);

  const [factoryId, setFactoryId] = useState("");
  const listRef = useRef(null);

  const quickPrompts = useMemo(
    () => [
      "Top 5 sold products this month",
      "Revenue summary this year",
      "Monthly seasonal trend for last 12 months",
      "Customer repeat stats last 90 days",
      "Material usage by day last 30 days",
      "Draft a polite payment reminder email for overdue invoice",
    ],
    []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Auto-scroll when new messages arrive
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [history, loading]);

  async function send(textOverride) {
    const m = (textOverride ?? message).trim();
    if (!m || loading) return;

    const userMsg = { role: "user", text: m, ts: tsNow() };

    setLoading(true);
    setResult(null);
    setMessage("");

    // Compute nextHistory once (avoid stale closure history usage)
    const nextHistory = [...history, userMsg].slice(-20);

    // Optimistic update UI
    setHistory((h) => [...h, userMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: m,
          context: { factory_id: factoryId ? Number(factoryId) : undefined },
          history: nextHistory,
        }),
      });

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        json = { ok: false, error: text || "Non-JSON response" };
      }

      setResult(json);

      let assistantText;

      if (json?.data?.draft) {
        assistantText = json.data.draft;
      } else if (json?.answer) {
        assistantText = String(json.answer);
      } else {
        assistantText = JSON.stringify(json, null, 2);
      }

      setHistory((h) => [...h, { role: "assistant", text: assistantText, ts: tsNow() }]);
    } catch (e) {
      const errText = e?.message ? String(e.message) : String(e);
      setResult({ ok: false, error: errText });
      setHistory((h) => [...h, { role: "assistant", text: `Error: ${errText}`, ts: tsNow() }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <div style={{ width: "100%", maxWidth: 1100 }}>
        <section className="card">
          <div className="cardHeader">
            <div>
              <div className="cardHeaderTitle">Chat</div>
              <div className="cardHeaderHint">
                Ask questions in natural language • Press Enter to send
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Factory</div>
              <select
                value={factoryId}
                onChange={(e) => setFactoryId(e.target.value)}
                className="input"
                style={{ padding: "8px 10px", borderRadius: 12 }}
              >
                <option value="">All</option>
                <option value="1">Factory 1</option>
                <option value="2">Factory 2</option>
              </select>
            </div>
          </div>

          <div className="chatBody">
            <div className="messages" ref={listRef} style={{ overflowX: "hidden" }}>
              <div className="pillRow" style={{ marginBottom: 12 }}>
                {quickPrompts.map((p) => (
                  <button key={p} className="pill" onClick={() => send(p)} disabled={loading}>
                    {p}
                  </button>
                ))}
              </div>

              {history.map((h, idx) => (
                <div key={`${h.ts}-${idx}`} className={`row ${h.role}`}>
                  <div>
                    <div className={`bubble ${h.role}`} style={bubbleSafeStyle}>
                      {h.text}
                    </div>

                    {/* Avoid hydration mismatch: render timestamp only after mount */}
                    <div className="meta">
                      {h.role === "user" ? "You" : "Assistant"}
                      {mounted ? ` • ${formatTs(h.ts || tsNow())}` : ""}
                    </div>
                  </div>
                </div>
              ))}

              {loading ? (
                <div className="row assistant">
                  <div>
                    <div className="bubble assistant" style={bubbleSafeStyle}>
                      Thinking…
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="composer">
              <input
                className="input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. What were the top products this year?"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <button className="btn" onClick={() => send()} disabled={loading}>
                {loading ? "…" : "Send"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
