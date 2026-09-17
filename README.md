# BLACKBOX // INCIDENT 047

Round 1 development slice. React 18 + TypeScript + Vite + Three.js/R3F; Node 24 server, no external services. Rounds 2 and 3 are not implemented.

## Run

From `C:\Users\saiba\NEWWWWW`:

```powershell
npm ci
npm run build
npm start
```

Open http://127.0.0.1:3001. The server serves `dist` and `/api` together. For development, keep `npm run server` running and run `npm run dev` in another terminal; Vite proxies `/api` to port 3001. `npm run preview` alone does NOT provide the backend.

Node >=22.12 required by Vite 7; validated here on Node 24.20.0. Rollup and esbuild use official WASM package aliases through npm overrides because this Windows machine blocks native tool binaries. Keep the lockfile; `npm ci` is reproducible. No CDN, web fonts, or external runtime assets are required.

## Controls and gameplay

Enter a team name, then click **Enter exploration** to capture the mouse. WASD/arrows move, mouse looks, E inspects the targeted object within reach. I/Tab opens the case file; H opens hints; Esc releases the mouse. Closing a panel requires clicking Enter exploration to recapture the mouse. No jumping. Furniture and walls have AABB collision.

Start at the central handover desk. Read terminal journals and directory; collect camera and maintenance records; compare evidence; enter supported conclusions under terminal Case review. Correlate the routing drawing to release physical evidence. Read its packet and use the custody reference to retrieve the archive. File the final investigation at the wall station beside the exit.

Nine records, four interconnected reviews, and a final four-part deduction. Three contextual hint requests and five final submission attempts. The 45-minute clock continues through menus, refresh, browser closure, and server restart. Incorrect reconstruction requests are rate limited; final attempts are separately capped. Completion reveals the bridge code; no further chapter is present.

## Tests

```powershell
npm test
npm run build
# With npm start running and Microsoft Edge installed:
node scripts/integration.mjs
node scripts/spatial.mjs
```

Engine tests cover complete progression, normalization, restricted evidence, sequence enforcement, final attempt lockout, deadlines, serialization, hint limits, rate limiting, unique sessions, and omission of answer keys from public state. Browser integration covers entry, WebGL canvas, refresh persistence, case-file dialog, server hints, and settings. Spatial check exercises the real controller and evidence interaction. These are not substitutes for blind playtests, full browser compatibility testing, or event rehearsal.

## Server and admin

Session identifiers are random; authentication uses a separate 256-bit HttpOnly SameSite cookie. State persists atomically in `.sessions/sessions.json` (gitignored). The server owns timing, validation, progression, attempts, and hints. Answer keys and undiscovered archive contents are never bundled into the client.

To enable the read-only Game Master page, set `ADMIN_TOKEN` before starting the server, then open http://127.0.0.1:3001/#/admin and enter that token. Do not expose it in frontend environment variables. The admin API includes bounded action telemetry; the table refreshes every five seconds. Set `SECURE_COOKIE=1` when deployed behind HTTPS. Default binding is loopback: use a same-origin reverse proxy for remote access.

## Important limits — not event-certified

- This is a local practice/playtest edition, not a competitive production deployment. Team names are self-selected; new practice sessions are allowed. Real enrollment, one-session-per-team enforcement, staff reset tools, database transactions, backups, and authentication are required for an event.
- The server enforces evidence dependencies but does not simulate player position. A modified client can request public evidence remotely. Production spatial authority is a separate task; do not market this version as cheat-proof.
- Per-IP limits are local and may affect teams sharing a NAT. Session rate limiting is authoritative; deployment needs shared rate-limit storage and proxy configuration.
- JSON-file persistence is single-process only. No horizontal scaling, leaderboard, scoring policy, or random parameter variants are implemented.
- The compact room is procedural geometry, not a licensed prebuilt GLB environment. The scene/data boundary allows replacement, but GLTF asset integration is still pending. CCTV is a readable transcript, not rendered footage.
- The content is a small vertical slice. A 45-minute timer is implemented; a 45–60 minute blind-solve duration has NOT been established and may require narrative/puzzle expansion after testing.
- Cross-device/browser performance, assistive-technology audits, blind playtesting, multi-team load tests, and full rehearsal remain outstanding. Desktop keyboard/mouse required.

See `docs/DEVELOPMENT.md` for ownership and extension contracts.
