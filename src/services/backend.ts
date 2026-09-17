import type { GameBackend, Session } from '../types/game'
export class ApiError extends Error { constructor(message: string, public session?: Session, public status?: number) { super(message) } }
async function request(path: string, body?: unknown): Promise<Session> {
  const response = await fetch(`/api/${path}`, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
  const data = await response.json()
  if (!response.ok) throw new ApiError(data.error, data.session, response.status)
  return data
}
export const backend: GameBackend = {
  create: team => request('session', { team }), resume: () => request('session'),
  inspect: id => request('action', { type: 'inspect', id }),
  solve: (id, answer) => request('action', { type: 'solve', id, answer }),
  hint: () => request('action', { type: 'hint' }),
  submit: answers => request('action', { type: 'submit', answers }),
}
