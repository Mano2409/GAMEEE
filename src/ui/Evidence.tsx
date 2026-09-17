import { useState } from 'react'
import { useGame } from '../state/game'
import type { Evidence } from '../types/game'
export function Document({ item }: { item?: Evidence }) {
  if (!item) return <p className="empty">No record selected. Inspect evidence in the facility to preserve a copy here.</p>
  return <article className="document"><div className="eyebrow">PRESERVED RECORD / {item.id.toUpperCase()}</div><h2>{item.title}</h2><dl><dt>Source</dt><dd>{item.source}</dd><dt>Location</dt><dd>{item.location}</dd>{item.timestamp && <><dt>Recorded</dt><dd>{item.timestamp}</dd></>}</dl><div className="document-body">{item.content}</div><footer>{Object.entries(item.metadata).map(([key, value]) => <p key={key}><b>{key}</b> / {value}</p>)}</footer></article>
}
export function EvidencePanel() {
  const { session, selected, select, notes, settings } = useGame()
  const [compare, setCompare] = useState('')
  const records = session?.discoveredEvidence ?? []
  return <><div className="dossier"><nav aria-label="Collected evidence">{records.length === 0 && <p>No preserved records yet.</p>}{records.map((e, i) => <button className={selected === e.id ? 'selected' : ''} key={e.id} onClick={() => select(e.id)}><span className="index">{String(i + 1).padStart(2, '0')}</span>{e.title}</button>)}</nav><div><Document item={records.find(e => e.id === selected) ?? records[0]} />{records.length > 1 && <><label className="compare-label">Compare with<select value={compare} onChange={e => setCompare(e.target.value)}><option value="">Choose another record</option>{records.filter(e => e.id !== selected).map(e => <option key={e.id} value={e.id}>{e.title}</option>)}</select></label>{compare && <Document item={records.find(e => e.id === compare)} />}</>}</div></div><label className="notes">Investigator notes <small>Saved on this laptop · not submitted</small><textarea value={notes} onChange={e => settings({ notes: e.target.value })} rows={4} maxLength={10000} placeholder="Separate what the record proves from what you suspect." /></label></>
}
