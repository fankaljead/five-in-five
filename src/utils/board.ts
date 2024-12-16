import { type Grid, type Player } from '../types/game'

const DIRECTIONS = [
  [[0, 1], [0, -1]], // 水平
  [[1, 0], [-1, 0]], // 垂直
  [[1, 1], [-1, -1]], // 对角线
  [[1, -1], [-1, 1]], // 反对角线
]

// 更细致的棋型评分
const PATTERNS = {
  FIVE: 1000000,        // 五连
  OPEN_FOUR: 100000,    // 活四
  DOUBLE_FOUR: 50000,   // 双四
  BLOCKED_FOUR: 10000,  // 冲四
  DOUBLE_THREE: 8000,   // 双活三
  OPEN_THREE: 5000,     // 活三
  BLOCKED_THREE: 1000,  // 眠三
  DOUBLE_TWO: 500,      // 双活二
  OPEN_TWO: 200,       // 活二
  BLOCKED_TWO: 50,     // 眠二
}

// 位置权重矩阵，中心位置权重更高
const POSITION_WEIGHTS = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
  [0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0],
  [0, 1, 2, 3, 4, 4, 4, 4, 4, 4, 4, 3, 2, 1, 0],
  [0, 1, 2, 3, 4, 5, 5, 5, 5, 5, 4, 3, 2, 1, 0],
  [0, 1, 2, 3, 4, 5, 6, 6, 6, 5, 4, 3, 2, 1, 0],
  [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0],
  [0, 1, 2, 3, 4, 5, 6, 6, 6, 5, 4, 3, 2, 1, 0],
  [0, 1, 2, 3, 4, 5, 5, 5, 5, 5, 4, 3, 2, 1, 0],
  [0, 1, 2, 3, 4, 4, 4, 4, 4, 4, 4, 3, 2, 1, 0],
  [0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0],
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

export function getAIMove(grid: Grid): [number, number] {
  // 第一步下在中心位置
  if (isEmptyBoard(grid)) {
    const center = Math.floor(grid.length / 2)
    return [center, center]
  }

  // 使用迭代加深搜索
  const depth = grid.length * grid.length - countPieces(grid) > 10 ? 4 : 6
  return minimax(grid, depth, -Infinity, Infinity, true)[1]
}

function isEmptyBoard(grid: Grid): boolean {
  return grid.every(row => row.every(cell => cell === null))
}

function countPieces(grid: Grid): number {
  return grid.reduce((count, row) => 
    count + row.reduce((rowCount, cell) => 
      rowCount + (cell !== null ? 1 : 0), 0), 0)
}

// 优化的极大极小算法
function minimax(
  grid: Grid,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): [number, [number, number]] {
  // 快速胜负判断
  const quickEval = quickWinCheck(grid)
  if (quickEval !== null) {
    return [quickEval * (isMaximizing ? -1 : 1), [-1, -1]]
  }

  if (depth === 0) {
    return [evaluateBoard(grid), [-1, -1]]
  }

  const moves = getOrderedMoves(grid)
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

// 快速胜负检查
function quickWinCheck(grid: Grid): number | null {
  // 检查是否有五连
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (!grid[i][j]) continue
      if (checkWin(grid, i, j, grid[i][j])) {
        return grid[i][j] === 'white' ? Infinity : -Infinity
      }
    }
  }
  return null
}

// 获取排序后的可能移动
function getOrderedMoves(grid: Grid): [number, number][] {
  const moves: Array<[number, number, number]> = [] // [row, col, score]
  const visited = new Set<string>()

  // 只考虑已有棋子周围的空位
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j]) {
        // 检查周围两格内的位置
        for (let di = -2; di <= 2; di++) {
          for (let dj = -2; dj <= 2; dj++) {
            const ni = i + di
            const nj = j + dj
            const key = `${ni},${nj}`
            
            if (
              ni >= 0 && ni < grid.length &&
              nj >= 0 && nj < grid[0].length &&
              grid[ni][nj] === null &&
              !visited.has(key)
            ) {
              // 计算位置分数
              const score = evaluatePosition(grid, ni, nj)
              moves.push([ni, nj, score])
              visited.add(key)
            }
          }
        }
      }
    }
  }

  // 按分数排序
  return moves
    .sort((a, b) => b[2] - a[2])
    .map(([row, col]) => [row, col])
}

// 评估单个位置的价值
function evaluatePosition(grid: Grid, row: number, col: number): number {
  let score = POSITION_WEIGHTS[row][col] * 10

  // 模拟白棋落子
  grid[row][col] = 'white'
  score += evaluatePatterns(grid, row, col, 'white')
  
  // 模拟黑棋落子
  grid[row][col] = 'black'
  score += evaluatePatterns(grid, row, col, 'black') * 0.9
  
  grid[row][col] = null
  return score
}

// 评估整个棋盘局势
function evaluateBoard(grid: Grid): number {
  let score = 0
  
  // 评估每个位置
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] === 'white') {
        score += evaluatePatterns(grid, i, j, 'white')
        score += POSITION_WEIGHTS[i][j] * 10
      } else if (grid[i][j] === 'black') {
        score -= evaluatePatterns(grid, i, j, 'black') * 0.9
        score -= POSITION_WEIGHTS[i][j] * 8
      }
    }
  }

  return score
}

// 评估某个位置的棋型
function evaluatePatterns(grid: Grid, row: number, col: number, player: Player): number {
  let score = 0
  
  DIRECTIONS.forEach(dir => {
    const line = getLine(grid, row, col, dir, player)
    const patterns = findPatterns(line)
    
    score += patterns.five * PATTERNS.FIVE
    score += patterns.openFour * PATTERNS.OPEN_FOUR
    score += patterns.doubleFour * PATTERNS.DOUBLE_FOUR
    score += patterns.blockedFour * PATTERNS.BLOCKED_FOUR
    score += patterns.doubleThree * PATTERNS.DOUBLE_THREE
    score += patterns.openThree * PATTERNS.OPEN_THREE
    score += patterns.blockedThree * PATTERNS.BLOCKED_THREE
    score += patterns.doubleTwo * PATTERNS.DOUBLE_TWO
    score += patterns.openTwo * PATTERNS.OPEN_TWO
    score += patterns.blockedTwo * PATTERNS.BLOCKED_TWO
  })

  return score
}

// 修改棋型识别函数，增加更多进攻性棋型
function updatePatterns(patterns: any, line: string) {
  // 五连
  if (line.includes('11111')) patterns.five++
  
  // 活四
  if (line.includes('011110')) patterns.openFour++
  
  // 双四
  if (
    (line.includes('011110') && line.includes('11110')) ||
    (line.includes('011110') && line.includes('01111')) ||
    (countPattern(line, '11110') >= 2) ||
    (countPattern(line, '01111') >= 2)
  ) patterns.doubleFour++
  
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
    line.includes('11010') || line.includes('01011') ||
    line.includes('10110') || line.includes('01101')
  ) patterns.blockedThree++
  
  // 活二
  if (
    line.includes('01100') || line.includes('00110') ||
    line.includes('011010') || line.includes('010110')
  ) patterns.openTwo++
  
  // 眠二
  if (
    line.includes('11000') || line.includes('00011') ||
    line.includes('10100') || line.includes('00101') ||
    line.includes('10010')
  ) patterns.blockedTwo++
}

// 修改评分计算
function evaluateForPlayer(grid: Grid, player: Player): number {
  let score = 0
  const patterns = findPatterns(grid, player)
  
  // 调整评分权重
  score += patterns.five * PATTERNS.FIVE
  score += patterns.openFour * PATTERNS.OPEN_FOUR
  score += patterns.doubleFour * PATTERNS.DOUBLE_FOUR
  score += patterns.doubleThree * PATTERNS.DOUBLE_THREE
  score += patterns.blockedFour * PATTERNS.BLOCKED_FOUR
  score += patterns.openThree * PATTERNS.OPEN_THREE
  score += patterns.blockedThree * PATTERNS.BLOCKED_THREE
  score += patterns.openTwo * PATTERNS.OPEN_TWO
  score += patterns.blockedTwo * PATTERNS.BLOCKED_TWO

  // 连续棋型加分
  if (patterns.openFour > 0 && patterns.openThree > 0) score *= 1.5
  if (patterns.openThree >= 2) score *= 1.5
  if (patterns.blockedFour >= 2) score *= 1.3

  return score
}

// 查找所有棋型
function findPatterns(grid: Grid, player: Player) {
  const patterns = {
    five: 0,
    openFour: 0,
    blockedFour: 0,
    doubleFour: 0,
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
  // const [dr2, dc2] = dir[1]

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