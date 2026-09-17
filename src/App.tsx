import { lazy, Suspense, useEffect, useState } from 'react'
import { useGame } from './state/game'
import { backend } from './services/backend'
import { Modal } from './ui/Modal'
import { Document, EvidencePanel } from './ui/Evidence'
import { Terminal, Cabinet } from './ui/Terminal'
import { Report, Hints, Settings } from './ui/Investigation'
import { Admin } from './ui/Admin'
import { Briefing } from './ui/Briefing'
import { EndScreen } from './ui/EndScreen'
import { Ambience } from './game/audio/Ambience'
const World = lazy(() => import('./scene/World'))
export default function App() {
  const game = useGame()
  const [now, setNow] = useState(Date.now()), [locked, setLocked] = useState(false), [hash, setHash] = useState(location.hash)
  useEffect(() => {
    void useGame.getState().initialize()
    const tick = setInterval(() => setNow(Date.now()), 500)
    const hashChange = () => setHash(location.hash)
    const lock = () => setLocked(!!document.pointerLockElement)
    window.addEventListener('hashchange', hashChange); document.addEventListener('pointerlockchange', lock)
    return () => { clearInterval(tick); window.removeEventListener('hashchange', hashChange); document.removeEventListener('pointerlockchange', lock) }
  }, [])
  useEffect(() => {
    if (!game.session) return
    const poll = setInterval(() => {
      if (!useGame.getState().busy) void backend.resume().then(useGame.getState().sync).catch(() => useGame.setState({ error: 'Connection interrupted. The server clock continues; reconnect before submitting.' }))
    }, 15000)
    return () => clearInterval(poll)
  }, [game.session?.id])
  const resume = () => {
    game.setPanel(null)
    const canvas = document.querySelector('canvas')
    if (canvas) void canvas.requestPointerLock()?.catch(() => useGame.setState({ error: 'Mouse capture denied. Click Enter exploration again, or check browser permissions.' }))
  }
  if (hash === '#/admin') return <Admin />
  const s = game.session
  const remaining = s ? Math.max(0, Math.ceil((s.deadline - (s.completedAt ?? (now + game.clockOffset))) / 1000)) : 2700
  const time = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`
  const ended = s && (s.status !== 'active' || remaining === 0)
  const titles = { evidence: 'Case file', terminal: 'Investigation terminal', cctv: 'Camera 07 / preserved record', cabinet: 'Physical evidence', report: 'Final investigation', hints: 'Supervisor assistance', pause: 'Field settings', inspect: 'Evidence inspection' }
  return <><Ambience />{!s ? <Briefing /> : <>
    <div className="world"><Suspense fallback={<div className="loading">Preparing preserved scene…</div>}><World /></Suspense></div>
    <header className="hud"><div><span className="wordmark">BLACKBOX</span><span className="hud-case">CASE 047 / {s.team}</span></div><div className="hud-right"><span className={remaining < 300 ? 'timer urgent' : 'timer'} aria-label={`${time} remaining`}>{time}</span><button onClick={() => game.setPanel('evidence')}>Case file <span>{s.discoveredEvidence.length}</span></button><button onClick={() => game.setPanel('hints')}>Hints {s.hints.length}/3</button><button aria-label="Settings" onClick={() => game.setPanel('pause')}>Ⅱ</button></div></header>
    {!game.panel && !ended && <>{locked ? <><div className="crosshair" aria-hidden="true" />{game.target && <div className="interaction"><kbd>E</kbd> {game.target.interactionText}{!game.target.requirements.every(p => s.completedPuzzles.includes(p)) && <small>LOCKED / REVIEW REQUIRED</small>}</div>}<div className="floor-hud">WASD move / E inspect / I case file / Esc settings</div></> : <div className="enter-overlay"><p className="eyebrow">FACILITY ACCESS GRANTED</p><h2>Follow the evidence.</h2><p>WASD to move · Mouse to look · E to inspect<br />Start with the handover on the central desk.<br />The server timer continues while you read.</p><button className="primary" onClick={resume}>Enter exploration →</button></div>}</>}
    {game.panel && !ended && <Modal title={titles[game.panel]}>{game.panel === 'evidence' && <EvidencePanel />}{game.panel === 'terminal' && <Terminal />}{(game.panel === 'inspect' || game.panel === 'cctv') && <Document item={s.discoveredEvidence.find(e => e.id === game.selected)} />}{game.panel === 'cabinet' && <Cabinet />}{game.panel === 'report' && <Report />}{game.panel === 'hints' && <Hints />}{game.panel === 'pause' && <Settings resume={resume} />}</Modal>}
    {ended && <EndScreen session={s} />}
  </>}{(game.error || game.notice || game.busy) && <div className={`toast ${game.error ? 'error' : ''}`} role={game.error ? 'alert' : 'status'}>{game.error || (game.busy ? 'Preserving record…' : game.notice)}<button aria-label="Dismiss message" onClick={() => useGame.setState({ error: '', notice: '' })}>×</button></div>}</>
}
