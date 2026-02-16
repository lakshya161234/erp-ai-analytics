export async function POST(req) {
  const body = await req.json();
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

  const resp = await fetch(`${base}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await resp.json();
  return Response.json(json, { status: resp.status });
}
