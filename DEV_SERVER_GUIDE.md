# Development Server - Simple & Reliable

## Overview

Simple, proven development setup:
- **Primary port**: 5173
- **Auto-fallback**: 5174, 5175, etc. if 5173 is busy
- **Reliable startup**: Just runs Vite (no complex automation)
- **Optional cleanup**: Simple script if needed

---

## Quick Start

### Normal Development (Recommended)
```bash
npm run dev
```
- Starts Vite on port 5173 (most common)
- If 5173 is busy, automatically uses 5174, 5175, etc.
- Simple, reliable, works every time

### Port Conflicts (If Needed)
```bash
npm run dev:kill
```
Kills any process on port 5173. Then start again:
```bash
npm run dev
```

### Combined: Kill & Start
```bash
npm run dev:clean
```
Kills port 5173, then starts Vite fresh.

---

## Workflow

### Typical Day
```bash
npm run dev
```
✅ Starts on 5173 or next available port

### If Port is Busy
```bash
npm run dev:kill
npm run dev
```
✅ Clean restart on 5173

### One Command
```bash
npm run dev:clean
```
✅ Kill + start in one go

---

## Configuration

### vite.config.ts
```typescript
server: {
  port: 5173,
  strictPort: false,  // Allow 5174, 5175 if 5173 busy
}
```

**This means:**
- ✅ Try 5173 first (stable default)
- ✅ If busy, use 5174, 5175, etc. (graceful fallback)
- ✅ Always starts (no blocking)
- ✅ Simple and predictable

---

## Scripts

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Start Vite on best available port |
| `npm run dev:kill` | Kill any process on port 5173 |
| `npm run dev:clean` | Kill 5173, then start Vite |

---

## Common Situations

### Situation 1: Fresh Start
```bash
npm run dev
```
Port 5173 is free, Vite starts immediately. ✓

### Situation 2: Restart After Edit
```bash
npm run dev
```
(from terminal shortcut r or restart Vite)
Same port continues working. ✓

### Situation 3: Stale Process Stuck on Port
```bash
npm run dev:kill
npm run dev
```
Clean restart on port 5173. ✓

### Situation 4: Want Guaranteed Fresh Port
```bash
npm run dev:clean
```
Explicit cleanup, guaranteed fresh. ✓

---

## Troubleshooting

### Issue: Vite says "port already in use"
**Solution:**
```bash
npm run dev:kill
npm run dev
```

### Issue: Vite won't start
**Solution 1:**
```bash
npm run dev:clean
```

**Solution 2 (Nuclear):**
```bash
# Kill ALL node processes
taskkill /F /IM node.exe
npm run dev
```

### Issue: Don't know which port Vite used
**Look at terminal output:**
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
```
Shows the actual port being used.

---

## Why This Approach?

✅ **Simple** - Just Vite, no complex automation
✅ **Reliable** - Proven port fallback logic  
✅ **Predictable** - Clear behavior (try 5173, fallback if busy)
✅ **Flexible** - Optional cleanup when needed
✅ **No Blocking** - Always starts, never fails on port
✅ **Windows Compatible** - No PowerShell tricks

---

## Best Practices

1. **Daily use:**
   ```bash
   npm run dev
   ```
   Just works.

2. **Port issues:**
   ```bash
   npm run dev:clean
   ```
   One command, fresh start.

3. **System restart before deploy:**
   ```bash
   npm run dev:clean
   npm run build
   npm run lint
   ```
   Clean verification.

---

## Keyboard Shortcuts (During Dev)

In Vite terminal, press `h` to see:
```
  r - restart the server
  u - show file update details
  c - clear console
  q - quit
```

---

## Environment

Vite auto-detects:
- `NODE_ENV=development` during `npm run dev`
- `NODE_ENV=production` during `npm run build`

No configuration needed.

---

**Approach**: Simple, proven, reliable
**Status**: Production Ready ✓
**Last Updated**: May 10, 2026


