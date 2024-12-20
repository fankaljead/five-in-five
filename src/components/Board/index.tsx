import { useRef, useEffect } from 'react'
import { type Grid, type Player, type LastMove } from '@/types/game'
import { useCanvas } from './useCanvas'

interface BoardProps {
  grid: Grid
  currentPlayer: Player
  winner: Player | null
  lastMove: LastMove | null
  onMove: (row: number, col: number) => void
}

export function Board({ grid, winner, lastMove, onMove }: BoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { setupCanvas, handleClick } = useCanvas({ grid, lastMove, onMove })

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (canvasRef.current) {
        setupCanvas(canvasRef.current)
      }
    })

    if (canvasRef.current) {
      setupCanvas(canvasRef.current)
      resizeObserver.observe(canvasRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [setupCanvas])

  return (
    <div className="w-full aspect-square relative bg-board rounded-lg overflow-hidden shadow-lg">
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        onClick={winner ? undefined : handleClick}
      />
    </div>
  )
} 