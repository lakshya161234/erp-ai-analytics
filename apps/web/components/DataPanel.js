export default function DataPanel({ result }) {
  return (
    <aside className="card">
      <div className="cardHeader">
        <div>
          <div className="cardHeaderTitle">Structured Output</div>
          <div className="cardHeaderHint">Useful for debugging + frontend integration</div>
        </div>
      </div>

      <div style={{ padding: 12 }}>
        {!result ? (
          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            Send a message to see the raw JSON response (tool used, args, data rows, etc.).
          </div>
        ) : (
          <pre
            style={{
              fontSize: 12,
              background: "rgba(0,0,0,0.25)",
              padding: 12,
              borderRadius: 14,
              border: "1px solid var(--border)",
              overflow: "auto",
              maxHeight: "calc(100vh - 220px)",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </aside>
  );
}
