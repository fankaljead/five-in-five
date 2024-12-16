interface ControlsProps {
  canUndo: boolean
  onUndo: () => void
  onRestart: () => void
}

export function Controls({ canUndo, onUndo, onRestart }: ControlsProps) {
  return (
    <div className="flex gap-3 px-3">
      <button
        className="btn-primary flex-1"
        onClick={onRestart}
      >
        重新开始
      </button>
      <button
        className="btn-secondary flex-1"
        onClick={onUndo}
        disabled={!canUndo}
      >
        悔棋
      </button>
    </div>
  )
} 