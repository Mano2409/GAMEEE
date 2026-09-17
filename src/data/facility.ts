import type { Interaction } from '../types/game'
// Positions are shared by scene geometry, collision and interaction targeting.
export const objects: Interaction[] = [
  { id: 'terminal', type: 'terminal', interactionText: 'Access terminal B-07', requirements: [], panel: 'terminal', position: [-3.6, 1.3, -4.5], size: [1.1, .7, .25] },
  { id: 'memo', type: 'inspect', interactionText: 'Read handover', requirements: [], evidenceId: 'memo', position: [0, .94, 0], size: [.7, .035, .9] },
  { id: 'cctv', type: 'terminal', interactionText: 'Review Camera 07', requirements: [], evidenceId: 'camera', panel: 'cctv', position: [-5.8, 1.45, -.8], size: [.3, .9, 1.3] },
  { id: 'maintenance', type: 'inspect', interactionText: 'Read maintenance sheet', requirements: [], evidenceId: 'maintenance', position: [-5.72, 1.4, 2], size: [.08, .8, .65] },
  { id: 'routing', type: 'inspect', interactionText: 'Inspect conduit schedule', requirements: [], evidenceId: 'routing', position: [3.9, 1.45, -3.65], size: [.75, .75, .04] },
  { id: 'cabinet', type: 'open', interactionText: 'Open evidence cabinet', requirements: ['location'], panel: 'cabinet', position: [5.4, 1.1, 1.5], size: [1, 2.2, 1.6] },
  { id: 'report', type: 'submit', interactionText: 'File investigation', requirements: [], panel: 'report', position: [2.2, 1.25, 4.95], size: [1.1, .85, .15] },
]
export type Collider = { x: number; z: number; w: number; d: number }
export const colliders: Collider[] = [
  { x: -3.6, z: -4.7, w: 2.7, d: 1.3 }, { x: 0, z: 0, w: 2.8, d: 1.5 },
  { x: -5.65, z: -.8, w: .7, d: 2 }, { x: 3.9, z: -4.35, w: 2.6, d: 1.4 },
  { x: 5.4, z: 1.5, w: 1, d: 1.6 },
]
export function canStand(x: number, z: number) {
  const radius = .24
  return Math.abs(x) < 5.7 && Math.abs(z) < 5.2 && !colliders.some(c => Math.abs(x - c.x) < c.w / 2 + radius && Math.abs(z - c.z) < c.d / 2 + radius)
}
