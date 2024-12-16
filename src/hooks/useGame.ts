import { useState, useCallback, useRef } from 'react'
import { type Player, type GameMode, type Grid, type Position } from '../types/game'
import { checkWin, getAIMove } from '../utils/board'

const BOARD_SIZE = 15
const createEmptyGrid = (): Grid => Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))

export function useGame() {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid)
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black')
  const [winner, setWinner] = useState<Player | null>(null)
  const [gameMode, setGameMode] = useState<GameMode>('pvp')
  const [history, setHistory] = useState<Position[]>([])
  const [isThinking, setIsThinking] = useState(false)
  
  // 使用 ref 来防止 AI 移动时的状态竞争
  const isAIMoving = useRef(false)

  const makeMove = useCallback((row: number, col: number) => {
    if (winner || grid[row][col] || isAIMoving.current) return

    const newGrid = grid.map(row => [...row])
    newGrid[row][col] = currentPlayer
    setGrid(newGrid)

    setHistory(prev => [...prev, { row, col }])

    if (checkWin(newGrid, row, col, currentPlayer)) {
      setWinner(currentPlayer)
      return
    }

    const nextPlayer = currentPlayer === 'black' ? 'white' : 'black'
    setCurrentPlayer(nextPlayer)

    // AI move
    if (gameMode === 'pve' && nextPlayer === 'white') {
      isAIMoving.current = true
      setIsThinking(true)

      // 使用 requestAnimationFrame 来确保状态更新和动画效果
      requestAnimationFrame(() => {
        setTimeout(() => {
          const [aiRow, aiCol] = getAIMove(newGrid)
          
          // AI 落子
          const aiGrid = newGrid.map(row => [...row])
          aiGrid[aiRow][aiCol] = 'white'
          setGrid(aiGrid)
          
          setHistory(prev => [...prev, { row: aiRow, col: aiCol }])

          if (checkWin(aiGrid, aiRow, aiCol, 'white')) {
            setWinner('white')
          } else {
            setCurrentPlayer('black')
          }
          
          isAIMoving.current = false
          setIsThinking(false)
        }, 800) // 增加思考时间以展示动画
      })
    }
  }, [currentPlayer, gameMode, grid, winner])

  const undo = useCallback(() => {
    if (history.length === 0 || isAIMoving.current) return

    // 在 PVE 模式下，需要撤销两步（玩家和 AI 的移动）
    const stepsToUndo = gameMode === 'pve' ? 2 : 1
    const newHistory = history.slice(0, -stepsToUndo)
    
    // 重建棋盘状态
    const newGrid = createEmptyGrid()
    newHistory.forEach(move => {
      const index = newHistory.indexOf(move)
      newGrid[move.row][move.col] = index % 2 === 0 ? 'black' : 'white'
    })

    setGrid(newGrid)
    setHistory(newHistory)
    setCurrentPlayer('black')
    setWinner(null)
  }, [history, gameMode])

  const restart = useCallback(() => {
    setGrid(createEmptyGrid())
    setCurrentPlayer('black')
    setWinner(null)
    setHistory([])
    isAIMoving.current = false
  }, [])

  const changeMode = useCallback((mode: GameMode) => {
    setGameMode(mode)
    restart()
  }, [restart])

  return {
    grid,
    currentPlayer,
    winner,
    gameMode,
    isThinking,
    canUndo: history.length > 0 && !winner && !isAIMoving.current,
    makeMove,
    undo,
    restart,
    changeMode,
  }
} 