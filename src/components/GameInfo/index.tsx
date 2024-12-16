import { type Player, type GameMode } from '@/types/game'
import { useTimer } from './useTimer'
import { ThinkingDots } from './ThinkingDots'

interface GameInfoProps {
  currentPlayer: Player
  winner: Player | null
  gameMode: GameMode
  isThinking: boolean
  onModeChange: (mode: GameMode) => void
}

export function GameInfo({ 
  currentPlayer, 
  winner, 
  gameMode, 
  isThinking,
  onModeChange 
}: GameInfoProps) {
  const time = useTimer({ isRunning: !winner })

  return (
    <div className="text-center space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">五子棋</h1>
      
      <div className="inline-flex p-1 bg-black/5 rounded-xl">
        <button
          className={`px-4 py-2 text-sm rounded-lg transition-all ${
            gameMode === 'pvp'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
              : 'text-gray-700 hover:bg-black/5'
          }`}
          onClick={() => onModeChange('pvp')}
        >
          双人对战
        </button>
        <button
          className={`px-4 py-2 text-sm rounded-lg transition-all ${
            gameMode === 'pve'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
              : 'text-gray-700 hover:bg-black/5'
          }`}
          onClick={() => onModeChange('pve')}
        >
          人机对战
        </button>
      </div>

      <div className="space-y-2">
        <div className="text-4xl font-light tabular-nums tracking-wider">
          {time}
        </div>
        <div className="text-sm text-gray-500 h-5 flex items-center justify-center">
          {winner ? (
            `游戏结束，${winner === 'black' ? '黑' : '白'}子胜！`
          ) : isThinking ? (
            <div className="flex items-center gap-1">
              AI思考中<ThinkingDots />
            </div>
          ) : (
            `轮到${currentPlayer === 'black' ? '黑' : '白'}子下`
          )}
        </div>
      </div>
    </div>
  )
} 