import { useState } from 'react'
import { useGame } from '../state/game'
import { backend } from '../services/backend'
import { Document } from './Evidence'
import type { Puzzle } from '../types/game'
function Review({ puzzle }: { puzzle: Puzzle }) {
  const { session, busy, action } = useGame(); const [answer, setAnswer] = useState('')
  if (!session) return null
  const complete = session.completedPuzzles.includes(puzzle.id)
  const ready = puzzle.requires.every(id => session.discoveredEvidence.some(e => e.id === id)) && (puzzle.id !== 'location' || session.completedPuzzles.includes('credential'))
  return <section className="review"><div className="eyebrow">{complete ? 'RECONSTRUCTION VERIFIED' : 'INVESTIGATOR WORKSHEET'}</div><h3>{puzzle.title}</h3><p>{puzzle.question}</p>{complete ? <p className="verified">✓ Supporting evidence accepted.</p> : !ready ? <p className="muted">Review unavailable. Preserve the relevant records in the facility{puzzle.id === 'location' ? ' and complete the credential review' : ''}.</p> : <form onSubmit={e => { e.preventDefault(); void action(() => backend.solve(puzzle.id, answer), 'Reconstruction accepted. Case file updated.') }}><label>{puzzle.label}<input value={answer} onChange={e => setAnswer(e.target.value)} required maxLength={100} autoComplete="off" /></label><button disabled={busy} type="submit">Verify reconstruction →</button></form>}</section>
}
export function Terminal() {
  const [tab, setTab] = useState('status')
  const { session, action, busy } = useGame()
  if (!session) return null
  const record = (id: string) => session.discoveredEvidence.find(e => e.id === id)
  return <div className="terminal"><div className="terminal-status">B-07 / AUDIT MIRROR <span>NETWORK ISOLATED · MASTER TIME</span></div><nav className="tabs" aria-label="Terminal sections">{[['status','System status'], ['access','Access logs'], ['directory','User directory'], ['review','Case review'], ['archive','Archive']].map(([id, title]) => <button key={id} onClick={() => setTab(id)} className={tab === id ? 'selected' : ''}>{title}{id === 'archive' && !record('archive') ? ' / LOCKED' : ''}</button>)}</nav>
  {tab === 'status' && <section className="terminal-copy"><h2>Incident preservation mode</h2><p>Live controls are disabled. The write-once journal and personnel directory remain available to investigators.</p><dl><dt>23:17:04</dt><dd>Unauthorized access detected</dd><dt>23:18:51</dt><dd>Internal credential accepted</dd><dt>23:21:33</dt><dd>BLACKBOX archive accessed</dd><dt>23:28:09</dt><dd>Emergency lockdown initiated</dd></dl><p>The handover is on the central desk. Camera records remain at the security station. Facilities keep the conduit drawing on the server rack.</p><p>Use Case review to record evidence-backed conclusions. The cabinet release depends on identifying the physical service bay.</p></section>}
  {(tab === 'access' || tab === 'directory') && (record(tab) ? <Document item={record(tab)} /> : <section className="terminal-copy"><h2>{tab === 'access' ? 'Authentication journal' : 'Personnel register'}</h2><p>Preserve this read-only record in the investigation file.</p><button disabled={busy} onClick={() => void action(() => backend.inspect(tab), 'Record preserved in your case file.')}>Read & preserve record</button></section>)}
  {tab === 'review' && <div className="reviews">{session.puzzles.filter(p => p.id !== 'custody').map(p => <Review key={p.id} puzzle={p} />)}</div>}
  {tab === 'archive' && (record('archive') ? <Document item={record('archive')} /> : <Review puzzle={session.puzzles.find(p => p.id === 'custody')!} />)}
  </div>
}
export function Cabinet() {
  const { session, busy, action } = useGame()
  if (!session?.unlockedObjects.includes('cabinet')) return <section className="terminal-copy"><div className="eyebrow">CONTROLLED ACCESS / LOCKED</div><h2>Physical evidence cabinet</h2><p>The sealed conduit inspection packet is restricted to the incident location. Identify the correct service bay in the terminal’s Case review to authorize release.</p></section>
  const item = session.discoveredEvidence.find(e => e.id === 'custody')
  return item ? <Document item={item} /> : <section className="terminal-copy"><div className="eyebrow">RELEASE AUTHORIZED</div><h2>Sealed inspection packet</h2><p>Your physical correlation matches the recovered equipment location. Preserve the packet before accessing its adapter buffer.</p><button disabled={busy} onClick={() => void action(() => backend.inspect('custody'), 'Inspection packet preserved.')}>Open & preserve packet</button></section>
}
