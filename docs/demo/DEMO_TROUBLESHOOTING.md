# TrialOps Demo — Troubleshooting

## Port already in use

### Symptom
- `npm run dev` fails or one service does not start

### Likely cause
- another local process is already using `4311` or `5173`

### Fix
- stop the conflicting process
- or rerun with another port if needed for a local recovery check

## Runtime files missing

### Symptom
- API returns runtime initialization errors
- smoke says to run reset first

### Likely cause
- `data/runtime` files were not created yet

### Fix

```bash
npm run reset
```

## Smoke fails after state mutation

### Symptom
- counts no longer match the original seed
- audit log contains previous demo activity

### Likely cause
- status updates changed runtime JSON and the baseline was not restored

### Fix

```bash
npm run reset
npm run smoke
```

## Frontend cannot reach API

### Symptom
- UI loads, but list or detail data does not appear

### Likely cause
- API is not running
- Vite dev proxy is not active because the web server was not started through `npm run dev`

### Fix
- confirm API startup output in the terminal
- restart `npm run dev`
- verify `apps/web/vite.config.ts` proxy settings are intact

## Web build missing

### Symptom
- smoke fails with missing `apps/web/dist/index.html`

### Likely cause
- web build was not run after frontend changes

### Fix

```bash
npm run web:build
```

## Browser not opened / manual inspection unavailable

### Symptom
- services are running, but the presenter cannot visually confirm the UI

### Likely cause
- browser was not opened
- environment does not allow manual browser access

### Fix
- open `http://127.0.0.1:5173`
- if manual inspection is not possible, continue with:
  - baseline startup confirmation
  - HTTP checks
  - proof-pack artifacts

## Live AI / GLR step unavailable

### Symptom
- the presenter cannot rely on a live AI-assisted step

### Likely cause
- tool outage
- demo environment restriction
- choice to keep the demo deterministic

### Fix
- do not block the demo
- continue with the prepared proof-pack files and show script
- frame the demo as a pilot-style operating flow with prepared artifacts
