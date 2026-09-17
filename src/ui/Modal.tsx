import { useEffect, useRef, type ReactNode } from 'react'
import { useGame } from '../state/game'
export function Modal({ title, children }: { title: string; children: ReactNode }) {
  const setPanel = useGame(s => s.setPanel)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); setPanel(null) }
      if (e.key !== 'Tab') return
      const elements = ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select,textarea,a[href]')
      if (!elements?.length) return
      const first = elements[0], last = elements[elements.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && (document.activeElement === last || document.activeElement === ref.current)) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('keydown', key); previous?.focus() }
  }, [setPanel])
  return <div className="modal-backdrop"><div className="modal" role="dialog" aria-modal="true" aria-labelledby="panel-title" tabIndex={-1} ref={ref}><header className="panel-header"><div><span className="eyebrow">BLACKBOX / INCIDENT 047</span><h1 id="panel-title">{title}</h1></div><button onClick={() => setPanel(null)} aria-label="Close panel">Close <kbd>Esc</kbd></button></header><div className="panel-body">{children}</div></div></div>
}
