# Engineering handoff

## Ownership / parallel workstreams

| Workstream | People | Owned boundary |
|---|---:|---|
| Game design | 2 | `server/content.mjs`, puzzle specification, hints |
| Environment | 2 | `src/scene`, approved assets, lighting |
| Gameplay | 2–3 | `src/game`, `src/data/facility.ts` |
| UI/UX | 1–2 | `src/ui`, styles, accessibility |
| Backend | 1–2 | `server/engine.mjs`, `server/index.mjs`, `src/services` |
| QA | 1–2 | `tests`, `scripts`, playtest reports |

Paths in this document are relative to `C:\Users\saiba\NEWWWWW`. People can overlap roles. Changes to shared types, service contracts, and scene coordinates require review from both affected owners. Do not have all contributors edit the application shell.

## Conventions / workflow

TypeScript strict mode in browser; Node ESM server. PascalCase React components, camelCase functions, stable lowercase record/puzzle IDs. Keep answers in server-only modules. Feature branches `feat/<area>-<task>`, fixes `fix/<issue>`. Small PRs: explanation, screenshot where visual, test evidence, performance/asset impact. Require one owner review and passing build/tests before merge. Never commit session files or real admin tokens. Shared changes should land before dependent branches.

## Dependency graph (staff only)

- Access journal + personnel directory + handover → credential review.
- Camera transcript + measured clock drift → timeline review → corrected chronology.
- Corrected chronology + conduit drawing + credential review → location review → cabinet release.
- Cabinet inspection → custody packet → archive custody check → signed archive record.
- Four reviews complete → final deduction (operator, credential, bay, archive).

The investigation must distinguish authentication identity, physical activity, and operator corroboration. The failed visitor login is a supported false lead, not an arbitrary red herring. The signed bridge audit establishes operation; motive is deliberately not claimed.

## Contracts

`src/types/game.ts`: public evidence, session, panel, puzzle, interaction and `GameBackend` contracts. `src/services/backend.ts` is the HTTP adapter. `src/state/game.ts` owns UI state and server snapshots, not answer truth. The server returns authoritative serverNow/deadline; the HUD interpolates and polls. A client-clock edit may misdisplay time but cannot extend the server deadline.

Interactions define ID, type, prompt, requirements, physical dimensions and evidence/panel actions. `useGame.interact` dispatches them. Scene signs ignore raycasts so they cannot obscure inspectable meshes. The nearest actual mesh blocks interaction; range is 2.7 m. Furniture shares coordinate definitions with collision. Pause clears movement keys. Timers do not pause.

`server/engine.mjs` is deterministic when passed an explicit time. `view` removes answer keys and unreleased content. Every action checks status and rate limits before mutation. Errors return the updated snapshot so failed attempts appear immediately. Future rounds should use a round-definition registry selected by session.round; do not add Round 2 content to this chapter.

## Asset pipeline

Current geometry is authored in code with generated, disposable sign textures; no downloaded third-party model licenses are implied. Replacement process: choose a licensed research/office GLB, record author/license/source in an asset manifest, normalize to meters, name meshes, separate colliders from visuals, retain current interaction IDs, simplify invisible geometry. Prefer <100k visible triangles and <30 MB transfer, 1k textures, limited materials and baked light. Test loading offline. Do not add arbitrary downloads or mandatory external fonts. No post-processing or dynamic particles in the current slice. Low mode uses DPR 1, no shadows or antialiasing; enhanced mode caps DPR at 1.5 with one shadow light.

## Required playtest gates

1. Internal end-to-end route, all objects reachable, wrong-answer behavior, reload at every review.
2. Blind testers: log elapsed time, clue order, incorrect submissions, hints, uncertainty, bottlenecks. Never coach. Distinguish puzzle difficulty from UI confusion.
3. Concurrent teams: test shared-NAT limits, independent cookies, persistence, tab concurrency and restart.
4. Authorized state-boundary checks: rejected premature actions, duplicate final submissions, expired sessions, unknown IDs, oversized input. Record outcomes without assuming a client can be trusted.
5. Browser/performance checks on representative student laptops; capture p50/p95 frame time, first-load latency, readability at 1366×768, low settings, audio muted.
6. Full event rehearsal with staff, recovery procedures and enrollment. Only then set competitive scoring and declare event readiness.
