"use client";

import { useState } from "react";
import DataPanel from "./DataPanel";

export default function ChatUI() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  async function send() {
    const m = message.trim();
    if (!m) return;

    setLoading(true);
    setResult(null);
    setHistory((h) => [...h, { role: "user", text: m }]);
    setMessage("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: m }),
      });
      const json = await res.json();
      setResult(json);
      setHistory((h) => [...h, { role: "assistant", text: json.answer || JSON.stringify(json) }]);
    } catch (e) {
      setResult({ ok: false, error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16, marginTop: 16 }}>
      <section style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='e.g. "What was last month\'s most sold product?"'
            style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
          />
          <button
            onClick={send}
            disabled={loading}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>

        <div style={{ marginTop: 12, maxHeight: 360, overflow: "auto" }}>
          {history.map((h, idx) => (
            <div key={idx} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{h.role}</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{h.text}</div>
            </div>
          ))}
        </div>
      </section>

      <DataPanel result={result} />
    </div>
  );
}
