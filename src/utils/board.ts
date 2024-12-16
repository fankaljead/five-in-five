import { type Grid, type Player } from '../types/game'

const DIRECTIONS = [
  [[0, 1], [0, -1]], // 水平
  [[1, 0], [-1, 0]], // 垂直
  [[1, 1], [-1, -1]], // 对角线
  [[1, -1], [-1, 1]], // 反对角线
]

// 棋型评分
const PATTERNS = {
  FIVE: 100000,    // 五连
  OPEN_FOUR: 50000,   // 活四
  DOUBLE_THREE: 10000, // 双活三
  BLOCKED_FOUR: 5000, // 冲四
  OPEN_THREE: 3000,   // 活三
  BLOCKED_THREE: 1000, // 眠三
  OPEN_TWO: 500,      // 活二
  BLOCKED_TWO: 100,   // 眠二
}

export function getAIMove(grid: Grid): [number, number] {
  return minimax(grid, 3, -Infinity, Infinity, true)[1]
}

// 极大极小算法 + Alpha-Beta 剪枝
function minimax(
  grid: Grid,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): [number, [number, number]] {
  if (depth === 0) {
    return [evaluateBoard(grid), [-1, -1]]
  }

  const moves = getValidMoves(grid)
  if (moves.length === 0) {
    return [evaluateBoard(grid), [-1, -1]]
  }

  let bestMove: [number, number] = moves[0]
  
  if (isMaximizing) {
    let maxEval = -Infinity
    for (const [row, col] of moves) {
      grid[row][col] = 'white'
      const evalScore = minimax(grid, depth - 1, alpha, beta, false)[0]
      grid[row][col] = null

      if (evalScore > maxEval) {
        maxEval = evalScore
        bestMove = [row, col]
      }
      alpha = Math.max(alpha, evalScore)
      if (beta <= alpha) break
    }
    return [maxEval, bestMove]
  } else {
    let minEval = Infinity
    for (const [row, col] of moves) {
      grid[row][col] = 'black'
      const evalScore = minimax(grid, depth - 1, alpha, beta, true)[0]
      grid[row][col] = null

      if (evalScore < minEval) {
        minEval = evalScore
        bestMove = [row, col]
      }
      beta = Math.min(beta, evalScore)
      if (beta <= alpha) break
    }
    return [minEval, bestMove]
  }
}

// 获取所有可能的移动
function getValidMoves(grid: Grid): [number, number][] {
  const moves: [number, number][] = []
  const visited = new Set<string>()

  // 只考虑已有棋子周围的空位
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j]) {
        // 检查周围8个方向
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            const ni = i + di
            const nj = j + dj
            const key = `${ni},${nj}`
            
            if (
              ni >= 0 && ni < grid.length &&
              nj >= 0 && nj < grid[0].length &&
              grid[ni][nj] === null &&
              !visited.has(key)
            ) {
              moves.push([ni, nj])
              visited.add(key)
            }
          }
        }
      }
    }
  }

  // 如果是空棋盘，返回中心点
  if (moves.length === 0) {
    const center = Math.floor(grid.length / 2)
    return [[center, center]]
  }

  return moves
}

// 评估整个棋盘局势
function evaluateBoard(grid: Grid): number {
  let score = 0
  
  // 评估白子（AI）
  const whiteScore = evaluateForPlayer(grid, 'white')
  // 评估黑子（玩家）
  const blackScore = evaluateForPlayer(grid, 'black')
  
  // AI 得分减去玩家得分
  score = whiteScore - blackScore * 1.1 // 稍微偏向防守

  return score
}

// 评估某个玩家的局势
function evaluateForPlayer(grid: Grid, player: Player): number {
  let score = 0
  const patterns = findPatterns(grid, player)
  
  // 根据不同棋型计算分数
  score += patterns.five * PATTERNS.FIVE
  score += patterns.openFour * PATTERNS.OPEN_FOUR
  score += patterns.blockedFour * PATTERNS.BLOCKED_FOUR
  score += patterns.doubleThree * PATTERNS.DOUBLE_THREE
  score += patterns.openThree * PATTERNS.OPEN_THREE
  score += patterns.blockedThree * PATTERNS.BLOCKED_THREE
  score += patterns.openTwo * PATTERNS.OPEN_TWO
  score += patterns.blockedTwo * PATTERNS.BLOCKED_TWO

  return score
}

// 查找所有棋型
function findPatterns(grid: Grid, player: Player) {
  const patterns = {
    five: 0,
    openFour: 0,
    blockedFour: 0,
    doubleThree: 0,
    openThree: 0,
    blockedThree: 0,
    openTwo: 0,
    blockedTwo: 0,
  }

  // 遍历每个方向
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] !== player) continue

      DIRECTIONS.forEach(dir => {
        const line = getLine(grid, i, j, dir, player)
        updatePatterns(patterns, line)
      })
    }
  }

  return patterns
}

// 获取某个方向的连续棋子
function getLine(
  grid: Grid,
  row: number,
  col: number,
  dir: number[][],
  player: Player
): string {
  let line = ''
  const [dr1, dc1] = dir[0]
  const [dr2, dc2] = dir[1]

  // 向一个方向延伸
  for (let step = -4; step <= 4; step++) {
    const r = row + dr1 * step
    const c = col + dc1 * step
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) {
      line += 'x' // 超出边界
    } else {
      line += grid[r][c] === player ? '1' : grid[r][c] === null ? '0' : 'x'
    }
  }

  return line
}

// 更新棋型统计
function updatePatterns(patterns: any, line: string) {
  // 五连
  if (line.includes('11111')) patterns.five++
  
  // 活四
  if (line.includes('011110')) patterns.openFour++
  
  // 冲四
  if (
    line.includes('01111') || line.includes('11110') ||
    line.includes('11011') || line.includes('10111') ||
    line.includes('11101')
  ) patterns.blockedFour++
  
  // 活三
  if (line.includes('01110')) patterns.openThree++
  if (countPattern(line, '01110') >= 2) patterns.doubleThree++
  
  // 眠三
  if (
    line.includes('11100') || line.includes('00111') ||
    line.includes('11010') || line.includes('01011')
  ) patterns.blockedThree++
  
  // 活二
  if (line.includes('01100') || line.includes('00110')) patterns.openTwo++
  
  // 眠二
  if (
    line.includes('11000') || line.includes('00011') ||
    line.includes('10100') || line.includes('00101')
  ) patterns.blockedTwo++
}

function countPattern(str: string, pattern: string): number {
  let count = 0
  let pos = 0
  while ((pos = str.indexOf(pattern, pos)) !== -1) {
    count++
    pos += 1
  }
  return count
}

export function checkWin(grid: Grid, row: number, col: number, player: Player): boolean {
  return DIRECTIONS.some(dir => {
    const count = 1 +
      countDirection(grid, row, col, dir[0][0], dir[0][1], player) +
      countDirection(grid, row, col, dir[1][0], dir[1][1], player)
    return count >= 5
  })
}

function countDirection(
  grid: Grid,
  row: number,
  col: number,
  dRow: number,
  dCol: number,
  player: Player
): number {
  let count = 0
  let r = row + dRow
  let c = col + dCol

  while (
    r >= 0 && r < grid.length &&
    c >= 0 && c < grid[0].length &&
    grid[r][c] === player
  ) {
    count++
    r += dRow
    c += dCol
  }

  return count
} 