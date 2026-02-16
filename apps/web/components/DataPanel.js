export default function DataPanel({ result }) {
  return (
    <aside style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Data</div>
      {!result ? (
        <div style={{ opacity: 0.7 }}>Send a question to see structured output.</div>
      ) : (
        <pre style={{ fontSize: 12, background: "#fafafa", padding: 10, borderRadius: 10, overflow: "auto" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </aside>
  );
}
