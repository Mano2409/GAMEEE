import { randomUUID } from 'node:crypto'
import { evidence, puzzles, hints, finalAnswers } from './content.mjs'
export const normalize = value => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
export class GameError extends Error { constructor(message, status = 400) { super(message); this.status = status } }
export function createSession(team, now = Date.now()) {
  if (typeof team !== 'string' || !/^[\w -]{2,32}$/.test(team.trim())) throw new GameError('Use 2–32 letters, digits, spaces or hyphens for a team name.')
  return { id: randomUUID(), team: team.trim(), round: 1, startTime: now, deadline: now + 45 * 60000,
    evidence: [], completedPuzzles: [], unlockedObjects: [], attempts: 0, puzzleAttempts: 0,
    hints: [], completed: false, completedAt: null, log: [], lastAction: 0 }
}
export function status(s, now = Date.now()) { return s.completed ? 'complete' : s.attempts >= 5 ? 'locked' : now >= s.deadline ? 'expired' : 'active' }
export function view(s, now = Date.now()) {
  return { id: s.id, team: s.team, round: s.round, startTime: s.startTime, deadline: s.deadline,
    discoveredEvidence: s.evidence.map(id => evidence[id]), completedPuzzles: s.completedPuzzles,
    unlockedObjects: s.unlockedObjects, attempts: s.attempts, puzzleAttempts: s.puzzleAttempts,
    hints: s.hints, completed: s.completed, completedAt: s.completedAt, status: status(s, now), serverNow: now,
    puzzles: puzzles.map(({ answer, reward, ...publicPuzzle }) => publicPuzzle),
    ...(s.completed ? { accessCode: 'B04-07' } : {}) }
}
function collect(s, id) { if (!s.evidence.includes(id)) s.evidence.push(id) }
function requireEvidence(s, ids) { if (!ids.every(id => s.evidence.includes(id))) throw new GameError('Supporting evidence is missing. Continue the investigation.', 403) }
export function applyAction(s, action, now = Date.now()) {
  if (status(s, now) !== 'active') throw new GameError('This investigation is no longer active.', 409)
  if (now - s.lastAction < 700) { s.log.push({ at: now, type: 'rate-limit' }); throw new GameError('Please wait a moment before the next request.', 429) }
  s.lastAction = now
  const log = { at: now, type: action.type, target: action.id ?? null, accepted: false }
  s.log.push(log)
  // Bound telemetry in the local prototype. Production should stream it to an audit store.
  if (s.log.length > 500) s.log.shift()
  if (action.type === 'inspect') {
    const allowed = ['access', 'directory', 'memo', 'camera', 'maintenance', 'routing']
    if (action.id === 'custody' && s.completedPuzzles.includes('location')) allowed.push('custody')
    if (!allowed.includes(action.id)) throw new GameError('Record unavailable or restricted.', 403)
    collect(s, action.id)
  } else if (action.type === 'solve') {
    const puzzle = puzzles.find(p => p.id === action.id)
    if (!puzzle) throw new GameError('Unknown review.')
    requireEvidence(s, puzzle.requires)
    if (puzzle.id === 'location' && !s.completedPuzzles.includes('credential')) throw new GameError('Complete the credential review first.', 403)
    if (s.completedPuzzles.includes(puzzle.id)) return view(s, now)
    s.puzzleAttempts++
    if (!puzzle.answer.includes(normalize(action.answer))) throw new GameError('That reconstruction is not supported by the preserved evidence.', 422)
    s.completedPuzzles.push(puzzle.id)
    if (puzzle.reward) collect(s, puzzle.reward)
    if (puzzle.id === 'location') s.unlockedObjects.push('cabinet')
    if (puzzle.id === 'custody') s.unlockedObjects.push('archive')
  } else if (action.type === 'hint') {
    if (s.hints.length >= 3) throw new GameError('All three assistance requests have been used.', 409)
    const stage = puzzles.find(p => !s.completedPuzzles.includes(p.id))?.id ?? 'final'
    s.hints.push(hints[stage][s.hints.length])
  } else if (action.type === 'submit') {
    if (s.completedPuzzles.length !== puzzles.length) throw new GameError('The investigation lacks corroboration. Complete the terminal reviews before filing.', 403)
    s.attempts++
    if (!Object.entries(finalAnswers).every(([key, options]) => options.includes(normalize(action.answers?.[key])))) throw new GameError('Investigation not accepted. Recheck the evidence; no individual answer is confirmed.', 422)
    s.completed = true; s.completedAt = now
  } else throw new GameError('Unknown action.')
  log.accepted = true
  return view(s, now)
}
