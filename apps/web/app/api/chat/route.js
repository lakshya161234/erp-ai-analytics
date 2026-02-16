export async function POST(req) {
  try {
    const body = await req.json();
    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";

    const resp = await fetch(`${base}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await resp.text(); // <-- read as text first
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { ok: false, error: text || "Non-JSON response from backend" };
    }

    return new Response(JSON.stringify(json), {
      status: resp.ok ? 200 : resp.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e?.message || e) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
