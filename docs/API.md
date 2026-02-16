# API

Base URL: `http://localhost:8080`

## GET /health
Returns `{ ok: true, ts }`

## POST /chat
Body:
```json
{
  "message": "What was last month's most sold product?",
  "context": {}
}
```

Response:
```json
{
  "ok": true,
  "answer": "....",
  "data": { },
  "toolsUsed": ["sales.top_products"],
  "router": { "tool": "sales.top_products", "args": { ... }, "reason": "..." }
}
```

Notes:
- `toolsUsed` is an array so you can extend to multi-tool later.
- `router.raw` (when present) helps debugging routing.
