import { backend } from '../services/backend'
import { useGame } from '../state/game'
import type { Session } from '../types/game'
export function EndScreen({ session: s }: { session: Session }) {
  return <div className="end-screen"><p className="eyebrow">BLACKBOX / INCIDENT 047</p><h1>{s.completed ? 'Investigation accepted.' : s.status === 'locked' ? 'Report limit reached.' : 'Investigation window closed.'}</h1><p>{s.completed ? 'Evidence sufficient. Credential owner ≠ actual operator.' : 'Your evidence and attempts have been preserved. Contact the Game Master for review.'}</p>{s.completed && <><div className="completion-mark">STAGE 01 COMPLETE</div><p>ACCESS CODE</p><strong className="access-code">{s.accessCode}</strong><p>Keep this code for the event coordinator. This chapter ends here.</p><p>{s.discoveredEvidence.length} records · {s.hints.length} hints · {s.attempts} final submission(s)</p></>}<button onClick={() => { if (window.confirm('Start a new practice session? The old result remains on the server.')) void useGame.getState().action(() => backend.create(s.team)).then(ok => { if (ok) window.location.reload() }) }}>New practice investigation</button></div>
}
