---
title: "API Surface"
tags: ["api", "endpoints", "http", "contracts"]
summary: "Five HTTP endpoints served by Fastify on port 4311: health, CRUD-light trial requests, and audit log"
---

## Base URL

Development: `http://127.0.0.1:4311`

All API routes are under `/api/`. The same Fastify server also serves the compiled web frontend as static files.

## Endpoints

### `GET /health`

Health check. No auth.

**Response:**
```json
{
  "status": "ok",
  "service": "trialops-api",
  "phase": "2",
  "dataStore": "file-backed-json"
}
```

---

### `GET /api/trial-requests`

List all trial requests with status counts.

**Response:**
```json
{
  "items": [TrialRequest, ...],
  "meta": {
    "total": 5,
    "statusCounts": {
      "new": 2,
      "qualified": 1,
      "approved": 1,
      "rejected": 1
    }
  }
}
```

---

### `GET /api/trial-requests/:id`

Get a single trial request by ID.

**Response:** `{ "item": TrialRequest }`

**Errors:** `404` if not found.

---

### `PATCH /api/trial-requests/:id/status`

Update the status of a trial request. Records an audit event.

**Request body:**
```json
{
  "status": "approved",     // required — one of: new, qualified, approved, rejected
  "actor": "alice",         // required — non-empty string
  "reason": "Good fit"      // optional — non-empty string if provided
}
```

**Response:**
```json
{
  "item": TrialRequest,
  "auditEvent": AuditEvent
}
```

**Errors:**
- `400` — invalid/missing `status` (code: `invalid_status`)
- `400` — missing/empty `actor` (code: `invalid_actor`)
- `400` — empty `reason` when provided (code: `invalid_reason`)
- `404` — request not found

---

### `GET /api/audit-log`

Get all audit events. Optionally filter by request ID.

**Query params:**
- `requestId` (optional) — filter to events for a specific trial request

**Response:** `{ "items": [AuditEvent, ...] }`

---

## Error Response Shape

```json
{
  "error": "Human-readable message",
  "code": "machine_code"
}
```

HTTP status codes: `400` for validation errors, `404` for not found, `500` for runtime data errors.

## Static File Routes (non-API)

| Route | Behavior |
|---|---|
| `GET /` | Serves `apps/web/dist/index.html` |
| `GET /assets/*` | Serves compiled frontend assets |
| `GET /*` | Tries static file, falls back to `index.html` (SPA) |
