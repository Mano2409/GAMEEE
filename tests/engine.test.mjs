import test from 'node:test'
import assert from 'node:assert/strict'
import { createSession, applyAction, view, status } from '../server/engine.mjs'
const answers = { operator: 'Meera Rao', credential: 'ARJUN.K', location: 'B04-07', archive: 'ORCHID' }
function harness() {
  let now = 100000; const s = createSession('QA Team', now)
  return { s, act: action => applyAction(s, action, now += 1000) }
}
function prepare(h) {
  for (const id of ['access','directory','memo','camera','maintenance','routing']) h.act({ type: 'inspect', id })
  for (const [id, answer] of [['credential','ARJUN.K'], ['timeline','23:19:42'], ['location','B04-07']]) h.act({ type: 'solve', id, answer })
  h.act({ type: 'inspect', id: 'custody' }); h.act({ type: 'solve', id: 'custody', answer: 'C-0331' })
}
test('complete evidence-backed investigation and normalization', () => {
  const h = harness(); prepare(h)
  const result = h.act({ type: 'submit', answers: { ...answers, operator: '  MEERA   RAO ' } })
  assert.equal(result.completed, true); assert.equal(result.accessCode, 'B04-07'); assert.equal(result.discoveredEvidence.length, 9)
  assert.equal(result.completedPuzzles.length, 4); assert.equal(result.attempts, 1)
  assert.throws(() => h.act({ type: 'submit', answers }), /no longer active/)
})
test('restricted records and sequence skipping rejected without consuming final attempt', () => {
  const h = harness()
  assert.throws(() => h.act({ type: 'inspect', id: 'archive' }), /restricted/)
  assert.throws(() => h.act({ type: 'inspect', id: 'custody' }), /restricted/)
  assert.throws(() => h.act({ type: 'solve', id: 'credential', answer: 'ARJUN.K' }), /missing/)
  assert.throws(() => h.act({ type: 'submit', answers }), /corroboration/)
  assert.equal(h.s.attempts, 0)
})
test('five incorrect reports lock investigation and reveal no individual correctness', () => {
  const h = harness(); prepare(h)
  for (let i = 0; i < 5; i++) assert.throws(() => h.act({ type: 'submit', answers: { ...answers, archive: 'wrong' } }), /no individual answer is confirmed/)
  assert.equal(status(h.s, 150000), 'locked'); assert.throws(() => h.act({ type: 'submit', answers }), /no longer active/)
})
test('server deadline and serialization survive reload', () => {
  const h = harness(); h.act({ type: 'inspect', id: 'memo' })
  const restored = JSON.parse(JSON.stringify(h.s))
  assert.equal(restored.deadline, h.s.deadline); assert.equal(view(restored, 102000).discoveredEvidence[0].id, 'memo')
  assert.throws(() => applyAction(restored, { type: 'hint' }, restored.deadline), /no longer active/)
  assert.equal(status(restored, restored.deadline), 'expired')
})
test('hints contextual and limited; repeated requests rate limited and logged', () => {
  const h = harness(); h.act({ type: 'hint' }); h.act({ type: 'hint' }); h.act({ type: 'hint' })
  assert.equal(h.s.hints.length, 3); assert.match(h.s.hints[2], /ARJUN.K/)
  assert.throws(() => h.act({ type: 'hint' }), /three/)
  assert.throws(() => applyAction(h.s, { type: 'hint' }, h.s.lastAction + 1), /wait/)
  assert.equal(h.s.log.at(-1).type, 'rate-limit')
})
test('public state excludes answer keys and restricted content', () => {
  const h = harness(); const publicState = view(h.s, 100000)
  assert.equal(publicState.accessCode, undefined); assert.equal(publicState.discoveredEvidence.length, 0)
  assert.ok(publicState.puzzles.every(p => !('answer' in p) && !('reward' in p)))
})
test('evidence collection idempotent; unique session IDs; team input validation', () => {
  const h = harness(); h.act({ type: 'inspect', id: 'memo' }); h.act({ type: 'inspect', id: 'memo' })
  assert.equal(h.s.evidence.length, 1); assert.notEqual(h.s.id, harness().s.id)
  assert.throws(() => createSession('<invalid>'), /team name/)
})
