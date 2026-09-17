import { Canvas } from '@react-three/fiber'
import { objects } from '../data/facility'
import { useGame } from '../state/game'
import { Player } from '../game/player/Player'
import { Sign } from './Sign'
type Vec = [number, number, number]
function Box({ p, s, color, id }: { p: Vec; s: Vec; color: string; id?: string }) {
  return <mesh position={p} userData={{ interaction: id }} castShadow receiveShadow><boxGeometry args={s} /><meshStandardMaterial color={color} roughness={.83} /></mesh>
}
function Desk({ x, z, w = 2.7 }: { x: number; z: number; w?: number }) {
  return <group><Box p={[x, .85, z]} s={[w, .12, 1.3]} color="#aaa28c" />{[-1, 1].flatMap(a => [-1, 1].map(b => <Box key={`${a}${b}`} p={[x + a * (w / 2 - .12), .4, z + b * .48]} s={[.08, .8, .08]} color="#424d50" />))}</group>
}
function Facility() {
  const solved = useGame(s => s.session?.completedPuzzles.includes('location'))
  return <>
    <color attach="background" args={['#171f23']} /><fog attach="fog" args={['#263338', 12, 28]} />
    <ambientLight intensity={.75} /><hemisphereLight args={['#c9dce3', '#797363', 1.5]} />
    <directionalLight position={[2, 7, 3]} intensity={1.8} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
    <pointLight position={[-3.6, 2.5, -3.8]} color="#f2dcc0" intensity={8} distance={6} />
    <Box p={[0, -.12, 0]} s={[12, .2, 11]} color="#616c6c" />
    <Box p={[0, 1.8, -5.5]} s={[12, 3.6, .2]} color="#bec2b7" />
    <Box p={[0, 1.8, 5.5]} s={[12, 3.6, .2]} color="#a8b2aa" />
    <Box p={[-6, 1.8, 0]} s={[.2, 3.6, 11]} color="#a4b0ac" />
    <Box p={[6, 1.8, 0]} s={[.2, 3.6, 11]} color="#afb8b0" />
    <Box p={[0, 3.65, 0]} s={[12, .15, 11]} color="#727e7c" />
    {Array.from({ length: 12 }, (_, i) => <Box key={`x${i}`} p={[-5.5 + i, .002, 0]} s={[.012, .008, 11]} color="#78817e" />)}
    {Array.from({ length: 11 }, (_, i) => <Box key={`z${i}`} p={[0, .002, -5 + i]} s={[12, .008, .012]} color="#78817e" />)}
    {[-3, 0, 3].map(x => <group key={x}><Box p={[x, 3.48, -.5]} s={[.5, .08, 3]} color="#e4e0ce" /><Box p={[x, .035, -3]} s={[.045, .02, 4]} color="#c4ac68" /></group>)}
    <Box p={[0, .45, -5.36]} s={[11.8, .12, .08]} color="#556c6c" />
    <Desk x={-3.6} z={-4.7} /><Desk x={0} z={0} w={2.8} />
    <Box p={[-3.6, .98, -4.5]} s={[.15, .3, .15]} color="#313d40" />
    <Box p={[-3.6, .94, -4]} s={[.8, .05, .26]} color="#434d4d" />
    <Box p={[.7, .98, .1]} s={[.35, .12, .4]} color="#786c50" />
    <Sign text={'NIGHT SHIFT / HANDOVER'} position={[0, .966, 0]} rotation={[-Math.PI / 2, 0, 0]} width={.65} height={.5} />
    <Box p={[-5.65, .55, -.8]} s={[.65, 1.1, 2]} color="#5f6f70" />
    <Box p={[-5.78, 2.75, -2]} s={[.3, .22, .5]} color="#ddd9c9" />
    {[3.25, 4.55].map(x => <group key={x}><Box p={[x, 1.35, -4.35]} s={[1.15, 2.7, 1.4]} color="#303e43" />{Array.from({ length: 9 }, (_, i) => <group key={i}><Box p={[x, .3 + i * .25, -3.635]} s={[1, .17, .03]} color="#566269" /><Box p={[x + .38, .3 + i * .25, -3.61]} s={[.04, .03, .02]} color="#b7c6a0" /></group>)}</group>)}
    {objects.map(o => <Box key={o.id} p={o.position} s={o.size} id={o.id} color={o.id === 'memo' || o.id === 'maintenance' || o.id === 'routing' ? '#ddd9c5' : o.id === 'cabinet' ? (solved ? '#788980' : '#687778') : '#283c44'} />)}
    <Sign text={'B-07\nINCIDENT REVIEW / READ ONLY'} position={[-3.6, 1.3, -4.36]} width={1} height={.6} dark />
    <Sign text={'07 / RETAINED FRAMES'} position={[-5.63, 1.45, -.8]} rotation={[0, Math.PI / 2, 0]} width={1.15} height={.7} dark />
    <Sign text={'WO-219\nRECORDER SERVICE'} position={[-5.67, 1.4, 2]} rotation={[0, Math.PI / 2, 0]} width={.6} height={.65} />
    <Sign text={'FACILITIES / 12C\nCONDUIT SCHEDULE'} position={[3.9, 1.45, -3.62]} width={.7} height={.6} />
    <Sign text={solved ? 'EVIDENCE\nRELEASE AUTHORIZED' : 'EVIDENCE\nCONTROLLED ACCESS'} position={[4.89, 1.5, 1.5]} rotation={[0, -Math.PI / 2, 0]} width={1.3} height={.5} />
    <Sign text={'CASE 047\nFILE INVESTIGATION'} position={[2.2, 1.25, 4.86]} rotation={[0, Math.PI, 0]} width={1} height={.7} dark />
    <Sign text={'RESEARCH ANNEX / B\nSECURITY & SYSTEMS'} position={[0, 2.55, -5.38]} width={3.8} height={.65} />
    <Sign text={'MASTER CLOCK\n23:28:09 / LOCKDOWN'} position={[-3.6, 2.5, -5.38]} width={1.8} height={.6} dark />
    <Box p={[-.8, 1.35, 5.34]} s={[1.7, 2.7, .1]} color="#566b6c" />
    <Sign text={'EXIT / SEALED\nINVESTIGATION IN PROGRESS'} position={[-.8, 1.8, 5.27]} rotation={[0, Math.PI, 0]} width={1.5} height={.5} />
    <Player />
  </>
}
export default function World() {
  const quality = useGame(s => s.quality)
  return <Canvas shadows={quality} dpr={quality ? [1, 1.5] : 1} camera={{ fov: 72, near: .08, far: 35 }} gl={{ antialias: quality, powerPreference: 'high-performance' }}><Facility /></Canvas>
}
