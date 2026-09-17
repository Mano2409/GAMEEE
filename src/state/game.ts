import { create } from 'zustand'
import { backend, ApiError } from '../services/backend'
import type { Panel, Session, Interaction } from '../types/game'
function preferences() { try { return JSON.parse(localStorage.getItem('blackbox-preferences') || '{}') } catch { return {} } }
const prefs = preferences()
type Store = {
  session: Session | null; panel: Panel; selected: string; target: Interaction | null;
  busy: boolean; error: string; notice: string; clockOffset: number; ready: boolean;
  volume: number; sensitivity: number; quality: boolean; notes: string;
  setPanel: (panel: Panel) => void; select: (id: string) => void;
  sync: (s: Session) => void; initialize: () => Promise<void>;
  action: (fn: () => Promise<Session>, notice?: string) => Promise<boolean>;
  interact: (object: Interaction) => void;
  settings: (values: Partial<Pick<Store, 'volume' | 'sensitivity' | 'quality' | 'notes'>>) => void;
}
export const useGame = create<Store>((set, get) => ({
  session: null, panel: null, selected: '', target: null, busy: false, error: '', notice: '', clockOffset: 0, ready: false,
  volume: prefs.volume ?? .18, sensitivity: prefs.sensitivity ?? 1, quality: prefs.quality ?? false, notes: prefs.notes ?? '',
  settings: values => { set(values); const { volume, sensitivity, quality, notes } = get(); localStorage.setItem('blackbox-preferences', JSON.stringify({ volume, sensitivity, quality, notes })) },
  setPanel: panel => { if (document.pointerLockElement) document.exitPointerLock(); set({ panel, error: '' }) },
  select: selected => set({ selected }),
  sync: session => set({ session, clockOffset: session.serverNow - Date.now() }),
  initialize: async () => { try { get().sync(await backend.resume()) } catch (e) { if (!(e instanceof ApiError && e.status === 401)) set({ error: 'Cannot reach the investigation server. Check your connection and reload.' }) } finally { set({ ready: true }) } },
  action: async (fn, notice = '') => {
    if (get().busy) return false
    set({ busy: true, error: '', notice: '' })
    try { get().sync(await fn()); set({ notice }); return true }
    catch (e) { if (e instanceof ApiError && e.session) get().sync(e.session); set({ error: e instanceof Error ? e.message : 'Request failed. Try again.' }); return false }
    finally { set({ busy: false }) }
  },
  interact: object => {
    if (get().busy) return
    get().setPanel(object.panel ?? 'inspect')
    if (object.evidenceId) {
      const id = object.evidenceId
      get().select(id)
      if (!get().session?.discoveredEvidence.some(e => e.id === id)) void get().action(() => backend.inspect(id), 'Evidence preserved in your case file.')
    }
  },
}))
