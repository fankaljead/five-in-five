export class Renderer {
  constructor(canvas, board) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.board = board;
    this.paddingRatio = 0.05; // 边距比例，相对于画布大小
  }

  updateGridSize() {
    // 获取画布的实际尺寸
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    
    // 使用较小的尺寸计算padding
    const minSize = Math.min(canvasWidth, canvasHeight);
    this.padding = minSize * this.paddingRatio;
    
    // 计算实际可用空间
    const availableSize = minSize - this.padding * 2;
    // 计算格子大小
    this.gridSize = availableSize / (this.board.size - 1);
    
    // 计算棋盘的总宽度和高度
    this.boardSize = this.gridSize * (this.board.size - 1);
    
    // 计算居中偏移
    this.offsetX = (canvasWidth - this.boardSize) / 2;
    this.offsetY = (canvasHeight - this.boardSize) / 2;
  }

  render() {
    this.clear();
    this.drawBoard();
    this.drawStones();
  }

  clear() {
    this.ctx.fillStyle = "#f8d49b";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawBoard() {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#000000";
    this.ctx.lineWidth = 1.5;

    // 画横线
    for (let i = 0; i < this.board.size; i++) {
      const y = this.offsetY + i * this.gridSize;
      this.ctx.moveTo(this.offsetX, y);
      this.ctx.lineTo(this.offsetX + this.boardSize, y);
    }

    // 画竖线
    for (let i = 0; i < this.board.size; i++) {
      const x = this.offsetX + i * this.gridSize;
      this.ctx.moveTo(x, this.offsetY);
      this.ctx.lineTo(x, this.offsetY + this.boardSize);
    }

    this.ctx.stroke();

    // 画天元和星位
    const points = [
      [3, 3],
      [3, 11],
      [11, 3],
      [11, 11],
      [7, 7],
      [3, 7],
      [11, 7],
      [7, 3],
      [7, 11],
    ];

    this.ctx.fillStyle = "#000";
    points.forEach(([x, y]) => {
      this.ctx.beginPath();
      this.ctx.arc(
        this.offsetX + x * this.gridSize,
        this.offsetY + y * this.gridSize,
        4,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    });
  }

  drawStones() {
    for (let i = 0; i < this.board.size; i++) {
      for (let j = 0; j < this.board.size; j++) {
        const stone = this.board.grid[i][j];
        if (stone) {
          this.drawStone(i, j, stone);
        }
      }
    }
  }

  drawStone(row, col, color) {
    const x = this.offsetX + col * this.gridSize;
    const y = this.offsetY + row * this.gridSize;
    const radius = this.gridSize * 0.4;

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);

    // 渐变效果
    const gradient = this.ctx.createRadialGradient(
      x - radius / 3,
      y - radius / 3,
      radius / 10,
      x,
      y,
      radius
    );

    if (color === "black") {
      gradient.addColorStop(0, "#444");
      gradient.addColorStop(1, "#000");
    } else {
      gradient.addColorStop(0, "#fff");
      gradient.addColorStop(1, "#ddd");
    }

    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // 添加棋子边缘
    this.ctx.strokeStyle = color === "black" ? "#000" : "#ccc";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  getGridPosition(x, y) {
    const row = Math.round((y - this.offsetY) / this.gridSize);
    const col = Math.round((x - this.offsetX) / this.gridSize);
    return [row, col];
  }
}
