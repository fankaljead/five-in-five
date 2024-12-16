export class Board {
  constructor() {
    this.size = 15; // 15x15的棋盘
    this.reset();
  }

  reset() {
    this.grid = Array(this.size)
      .fill()
      .map(() => Array(this.size).fill(null));
    this.history = [];
  }

  isValidMove(row, col) {
    return (
      row >= 0 &&
      row < this.size &&
      col >= 0 &&
      col < this.size &&
      this.grid[row][col] === null
    );
  }

  placeStone(row, col, color) {
    if (this.isValidMove(row, col)) {
      this.grid[row][col] = color;
      this.history.push({ row, col, color });
      return true;
    }
    return false;
  }

  undo() {
    if (this.history.length > 0) {
      const lastMove = this.history.pop();
      this.grid[lastMove.row][lastMove.col] = null;
      return true;
    }
    return false;
  }

  checkWin(row, col, color) {
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

    return directions.some((dir) => {
      const count =
        1 +
        this.countDirection(row, col, dir[0][0], dir[0][1], color) +
        this.countDirection(row, col, dir[1][0], dir[1][1], color);
      return count >= 5;
    });
  }

  countDirection(row, col, dRow, dCol, color) {
    let count = 0;
    let r = row + dRow;
    let c = col + dCol;

    while (
      r >= 0 &&
      r < this.size &&
      c >= 0 &&
      c < this.size &&
      this.grid[r][c] === color
    ) {
      count++;
      r += dRow;
      c += dCol;
    }

    return count;
  }
}
