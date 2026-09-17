import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Euler, Raycaster, Vector2, Vector3 } from 'three'
import { canStand, objects } from '../../data/facility'
import { useGame } from '../../state/game'
export function Player() {
  const { camera, gl, scene } = useThree()
  const keys = useRef(new Set<string>())
  const ray = useMemo(() => new Raycaster(), [])
  const direction = useMemo(() => new Vector3(), [])
  const rotation = useMemo(() => new Euler(0, 0, 0, 'YXZ'), [])
  const elapsed = useRef(0)
  useEffect(() => {
    camera.position.set(0, 1.65, 4.1); camera.rotation.set(0, 0, 0)
    const down = (e: KeyboardEvent) => {
      if (document.pointerLockElement !== gl.domElement) return
      if (['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault()
      keys.current.add(e.code)
      if (e.repeat) return
      const s = useGame.getState()
      if (e.code === 'KeyE' && s.target) s.interact(s.target)
      if (e.code === 'Tab' || e.code === 'KeyI') { e.preventDefault(); s.setPanel('evidence') }
      if (e.code === 'KeyH') s.setPanel('hints')
    }
    const up = (e: KeyboardEvent) => keys.current.delete(e.code)
    const move = (e: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement || useGame.getState().panel) return
      rotation.setFromQuaternion(camera.quaternion)
      const speed = .0017 * useGame.getState().sensitivity
      rotation.y -= e.movementX * speed; rotation.x = Math.max(-1.4, Math.min(1.4, rotation.x - e.movementY * speed))
      camera.quaternion.setFromEuler(rotation)
    }
    const clear = () => keys.current.clear()
    const lock = () => { clear(); if (!document.pointerLockElement && !useGame.getState().panel && useGame.getState().session?.status === 'active') useGame.getState().setPanel('pause') }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('mousemove', move)
    window.addEventListener('blur', clear); document.addEventListener('pointerlockchange', lock)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('mousemove', move); window.removeEventListener('blur', clear); document.removeEventListener('pointerlockchange', lock) }
  }, [camera, gl, rotation])
  useFrame((_, dt) => {
    const s = useGame.getState()
    if (s.panel || s.session?.status !== 'active' || document.pointerLockElement !== gl.domElement) return
    const k = keys.current
    const forward = Number(k.has('KeyW') || k.has('ArrowUp')) - Number(k.has('KeyS') || k.has('ArrowDown'))
    const right = Number(k.has('KeyD') || k.has('ArrowRight')) - Number(k.has('KeyA') || k.has('ArrowLeft'))
    rotation.setFromQuaternion(camera.quaternion)
    direction.set(right, 0, -forward).normalize().applyAxisAngle(new Vector3(0, 1, 0), rotation.y).multiplyScalar(Math.min(dt, .05) * 2.5)
    if (canStand(camera.position.x + direction.x, camera.position.z)) camera.position.x += direction.x
    if (canStand(camera.position.x, camera.position.z + direction.z)) camera.position.z += direction.z
    elapsed.current += dt
    if (elapsed.current < .08) return
    elapsed.current = 0
    ray.setFromCamera(new Vector2(0, 0), camera); ray.far = 2.7
    const hit = ray.intersectObjects(scene.children, true).find(h => h.object.type === 'Mesh')
    const target = objects.find(o => o.id === hit?.object.userData.interaction) ?? null
    if (s.target?.id !== target?.id) useGame.setState({ target })
  })
  return null
}
