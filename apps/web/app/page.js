import ChatUI from "../components/ChatUI";

export default function Page() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 6 }}>ERP AI Analytics PoC</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Ask analytics questions. The backend routes to safe Postgres tools and Gemini summarizes the result.
      </p>
      <ChatUI />
    </main>
  );
}
