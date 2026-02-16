# API

Base URL: `http://localhost:8080`

## GET /health
Returns `{ ok: true, ts }`

## POST /chat
Body:
```json
{
  "message": "What was last month's most sold product?",
  "context": { "factory_id": 1 },
  "history": [
    { "role": "user", "text": "..." },
    { "role": "assistant", "text": "..." }
  ]
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
- The server injects current time context (Asia/Kolkata) into prompts so phrases like "this year" resolve correctly.

### Tool categories

**Analytics tools (DB-backed):**
- `sales.top_products`
- `sales.top_products_by_revenue`
- `revenue.summary`
- `revenue.by_day`
- `revenue.by_week`
- `revenue.compare_periods`
- `clients.top_by_revenue`
- `materials.top_used`
- `materials.usage_by_day`
- `orders.history`
- `seasonal.sales_by_month`
- `market.pricing_trend`
- `customers.repeat_stats`
- `customers.product_affinity`
- `external.holiday_impact` (fixed-date holidays demo)

**Assistant (non-DB):**
- If no tool matches, the model replies directly (draft emails, reminders, messages, etc.).
