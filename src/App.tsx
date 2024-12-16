import { Analytics } from "@vercel/analytics/react"

import { Board } from './components/Board'
import { Controls } from './components/Controls'
import { GameInfo } from './components/GameInfo'
import { useGame } from './hooks/useGame'

export default function App() {
  const game = useGame()
  
  return (
    <div className="min-h-screen p-3 flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col gap-4 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-xl">
        <GameInfo
          currentPlayer={game.currentPlayer}
          winner={game.winner}
          gameMode={game.gameMode}
          isThinking={game.isThinking}
          onModeChange={game.changeMode}
        />
        
        <Board
          grid={game.grid}
          currentPlayer={game.currentPlayer}
          winner={game.winner}
          onMove={game.makeMove}
        />
        
        <Controls
          canUndo={game.canUndo}
          onUndo={game.undo}
          onRestart={game.restart}
        />
      </div>

      <Analytics />
    </div>
  )
} 