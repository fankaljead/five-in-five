import { useCallback, useRef, useEffect } from 'react'
import { type Grid, type LastMove } from '@/types/game'

interface UseCanvasProps {
  grid: Grid
  lastMove: LastMove | null
  onMove: (row: number, col: number) => void
}

export function useCanvas({ grid, lastMove, onMove }: UseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const gridSizeRef = useRef(0)
  const paddingRef = useRef(0)

  const setupCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const minSize = Math.min(rect.width, rect.height)
    const padding = minSize * 0.05
    const availableSize = minSize - padding * 2
    const gridSize = availableSize / (grid.length - 1)

    canvasRef.current = canvas
    contextRef.current = ctx
    gridSizeRef.current = gridSize
    paddingRef.current = padding

    drawBoard()
  }, [grid.length])

  const drawBoard = useCallback(() => {
    const ctx = contextRef.current
    if (!ctx || !canvasRef.current) return

    const canvas = canvasRef.current
    const padding = paddingRef.current
    const gridSize = gridSizeRef.current

    // Clear canvas
    ctx.fillStyle = '#f8d49b'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.beginPath()
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1

    for (let i = 0; i < grid.length; i++) {
      const pos = padding + i * gridSize
      ctx.moveTo(padding, pos)
      ctx.lineTo(padding + gridSize * (grid.length - 1), pos)
      ctx.moveTo(pos, padding)
      ctx.lineTo(pos, padding + gridSize * (grid.length - 1))
    }
    ctx.stroke()

    // Draw stones
    grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell) {
          drawStone(i, j, cell)
        }
      })
    })

    // 绘制最后一步的标记
    if (lastMove) {
      const x = paddingRef.current + lastMove.col * gridSizeRef.current
      const y = paddingRef.current + lastMove.row * gridSizeRef.current
      
      ctx.beginPath()
      ctx.arc(x, y, gridSizeRef.current * 0.2, 0, Math.PI * 2)
      ctx.strokeStyle = lastMove.color === 'black' ? '#fff' : '#000'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }, [grid, lastMove])

  const drawStone = useCallback((row: number, col: number, color: 'black' | 'white') => {
    const ctx = contextRef.current
    if (!ctx) return

    const x = paddingRef.current + col * gridSizeRef.current
    const y = paddingRef.current + row * gridSizeRef.current
    const radius = gridSizeRef.current * 0.4

    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)

    const gradient = ctx.createRadialGradient(
      x - radius / 3,
      y - radius / 3,
      radius / 10,
      x,
      y,
      radius
    )

    if (color === 'black') {
      gradient.addColorStop(0, '#444')
      gradient.addColorStop(1, '#000')
    } else {
      gradient.addColorStop(0, '#fff')
      gradient.addColorStop(1, '#ddd')
    }

    ctx.fillStyle = gradient
    ctx.fill()

    ctx.strokeStyle = color === 'black' ? '#000' : '#ccc'
    ctx.lineWidth = 1
    ctx.stroke()
  }, [])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const gridSize = gridSizeRef.current
    const padding = paddingRef.current

    const row = Math.round((y - padding) / gridSize)
    const col = Math.round((x - padding) / gridSize)

    if (
      row >= 0 && row < grid.length &&
      col >= 0 && col < grid[0].length &&
      !grid[row][col]
    ) {
      onMove(row, col)
    }
  }, [grid, onMove])

  // 添加对 grid 变化的监听
  useEffect(() => {
    if (contextRef.current) {
      drawBoard()
    }
  }, [grid, drawBoard])

  return {
    setupCanvas,
    handleClick,
  }
} 