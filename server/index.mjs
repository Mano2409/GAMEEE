import http from 'node:http'
import { readFileSync, writeFileSync, mkdirSync, renameSync, existsSync } from 'node:fs'
import { resolve, extname, sep } from 'node:path'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createSession, applyAction, view, GameError } from './engine.mjs'
const root = fileURLToPath(new URL('../', import.meta.url))
const data = resolve(root, '.sessions'); mkdirSync(data, { recursive: true })
const file = resolve(data, 'sessions.json')
const sessions = new Map(existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [])
const save = () => { writeFileSync(file + '.tmp', JSON.stringify([...sessions])); renameSync(file + '.tmp', file) }
const limits = new Map()
function equal(a, b) { return typeof a === 'string' && typeof b === 'string' && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b)) }
const server = http.createServer(async (req, res) => {
  const send = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.end(JSON.stringify(body)) }
  try {
    const url = new URL(req.url, 'http://localhost')
    if (!url.pathname.startsWith('/api/')) {
      if (req.method !== 'GET') return send(405, { error: 'Method not allowed' })
      const dist = resolve(root, 'dist'); const target = resolve(dist, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname))
      if (!target.startsWith(dist + sep) || !existsSync(target)) return send(404, { error: 'Not found. Run npm run build first.' })
      const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml' }
      res.writeHead(200, { 'Content-Type': mime[extname(target)] ?? 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' }); res.end(readFileSync(target)); return
    }
    if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) return send(403, { error: 'Cross-origin request rejected.' })
    const ip = req.socket.remoteAddress; const now = Date.now()
    let bucket = limits.get(ip)
    if (!bucket || now - bucket.at > 60000) { bucket = { at: now, count: 0, creates: 0 }; limits.set(ip, bucket) }
    if (++bucket.count > 240) return send(429, { error: 'Request limit reached. Wait one minute.' })
    if (url.pathname === '/api/admin' && req.method === 'GET') {
      if (!process.env.ADMIN_TOKEN || !equal(req.headers.authorization, `Bearer ${process.env.ADMIN_TOKEN}`)) return send(401, { error: 'Game Master authorization required.' })
      return send(200, [...sessions.values()].map(s => ({ ...view(s), log: s.log })))
    }
    let body = {}
    if (req.method === 'POST') {
      let raw = ''; for await (const chunk of req) { raw += chunk; if (raw.length > 8192) throw new GameError('Request too large.', 413) }
      try { body = JSON.parse(raw || '{}') } catch { throw new GameError('Invalid JSON.') }
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new GameError('Invalid request.')
    }
    if (url.pathname === '/api/session' && req.method === 'POST') {
      if (++bucket.creates > 12) return send(429, { error: 'Session creation limit reached.' })
      const token = randomBytes(32).toString('hex'); const s = createSession(body.team)
      sessions.set(token, s); save()
      res.setHeader('Set-Cookie', `blackbox=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${process.env.SECURE_COOKIE === '1' ? '; Secure' : ''}`)
      return send(201, view(s))
    }
    const token = req.headers.cookie?.split(';').map(x => x.trim()).find(x => x.startsWith('blackbox='))?.slice(9)
    const s = sessions.get(token)
    if (!s) return send(401, { error: 'No investigation session. Enter a team name to begin.' })
    if (url.pathname === '/api/session' && req.method === 'GET') return send(200, view(s))
    if (url.pathname === '/api/action' && req.method === 'POST') {
      try { const result = applyAction(s, body); save(); return send(200, result) }
      catch (error) { save(); return send(error.status ?? 500, { error: error.message, session: view(s) }) }
    }
    send(404, { error: 'Unknown endpoint.' })
  } catch (error) { send(error.status ?? 500, { error: error.status ? error.message : 'Server error. Contact the Game Master.' }); console.error(error) }
})
server.listen(Number(process.env.PORT ?? 3001), '127.0.0.1', () => console.log('BLACKBOX available at http://127.0.0.1:' + (process.env.PORT ?? 3001)))
setInterval(() => { for (const [ip, b] of limits) if (Date.now() - b.at > 120000) limits.delete(ip) }, 60000).unref()
