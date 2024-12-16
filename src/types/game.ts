export type Player = 'black' | 'white'
export type GameMode = 'pvp' | 'pve'
export type Grid = (Player | null)[][]

export interface Position {
  row: number
  col: number
}

export interface LastMove extends Position {
  color: Player
}

export interface GameState {
  currentPlayer: Player
  winner: Player | null
  gameMode: GameMode
  grid: Grid
  history: LastMove[]
} 