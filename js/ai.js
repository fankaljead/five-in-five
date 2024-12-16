export class AI {
  constructor(board) {
    this.board = board;
  }

  // 评估某个位置的分数
  evaluatePosition(row, col, color) {
    const directions = [
      [
        [0, 1],
        [0, -1],
      ], // 水平
      [
        [1, 0],
        [-1, 0],
      ], // 垂直
      [
        [1, 1],
        [-1, -1],
      ], // 对角线
      [
        [1, -1],
        [-1, 1],
      ], // 反对角线
    ];

    let score = 0;
    directions.forEach((dir) => {
      score += this.evaluateDirection(row, col, dir[0], dir[1], color);
    });

    return score;
  }

  evaluateDirection(row, col, dir1, dir2, color) {
    const counts = {
      continuous: 1, // 连续棋子数
      empty: 0, // 空位数
      blocked: 0, // 被封堵数
    };

    // 向两个方向统计
    [dir1, dir2].forEach(([dRow, dCol]) => {
      let r = row + dRow;
      let c = col + dCol;
      let empty = false;

      while (r >= 0 && r < this.board.size && c >= 0 && c < this.board.size) {
        if (this.board.grid[r][c] === null) {
          if (!empty) {
            counts.empty++;
            empty = true;
          }
          break;
        } else if (this.board.grid[r][c] === color) {
          if (!empty) counts.continuous++;
        } else {
          counts.blocked++;
          break;
        }
        r += dRow;
        c += dCol;
      }
    });

    // 评分规则
    if (counts.continuous >= 5) return 100000;
    if (counts.continuous === 4) {
      if (counts.blocked === 0) return 10000;
      if (counts.blocked === 1) return 1000;
    }
    if (counts.continuous === 3) {
      if (counts.blocked === 0) return 1000;
      if (counts.blocked === 1) return 100;
    }
    if (counts.continuous === 2) {
      if (counts.blocked === 0) return 100;
      if (counts.blocked === 1) return 10;
    }

    return counts.continuous;
  }

  // 获取最佳落子位置
  getBestMove() {
    let bestScore = -Infinity;
    let bestMove = null;

    // 遍历所有可能的位置
    for (let i = 0; i < this.board.size; i++) {
      for (let j = 0; j < this.board.size; j++) {
        if (this.board.grid[i][j] === null) {
          // 评估AI（白子）的得分
          const aiScore = this.evaluatePosition(i, j, "white");
          // 评估玩家（黑子）的得分
          const playerScore = this.evaluatePosition(i, j, "black");
          // 取较大的分数，优先防守高分位置
          const score = Math.max(aiScore, playerScore * 1.1);

          if (score > bestScore) {
            bestScore = score;
            bestMove = [i, j];
          }
        }
      }
    }

    return bestMove;
  }
}
