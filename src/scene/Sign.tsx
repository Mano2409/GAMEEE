import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
type Props = { text: string; position: [number, number, number]; rotation?: [number, number, number]; width?: number; height?: number; dark?: boolean }
export function Sign({ text, position, rotation = [0, 0, 0], width = 1.8, height = .45, dark = false }: Props) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = Math.round(1024 * height / width)
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = dark ? '#202c30' : '#d9d7c9'; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = dark ? '#e1dbc6' : '#283439'; ctx.font = 'bold 48px monospace'; ctx.textBaseline = 'middle'
    const lines = text.split('\n'); lines.forEach((line, i) => ctx.fillText(line, 38, canvas.height / 2 + (i - (lines.length - 1) / 2) * 65, 948))
    const t = new CanvasTexture(canvas); t.colorSpace = SRGBColorSpace; return t
  }, [text, dark, width, height])
  useEffect(() => () => texture.dispose(), [texture])
  return <mesh raycast={() => {}} position={position} rotation={rotation}><planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} /></mesh>
}
