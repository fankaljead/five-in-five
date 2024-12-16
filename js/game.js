import { Board } from "./board.js";
import { Renderer } from "./renderer.js";
import { Controls } from "./controls.js";
import { AI } from "./ai.js";

class Game {
  constructor() {
    this.board = new Board();
    this.canvas = document.getElementById("gameBoard");
    this.renderer = new Renderer(this.canvas, this.board);
    this.controls = new Controls(this);
    this.ai = new AI(this.board);

    this.currentPlayer = "black"; // 'black' 或 'white'
    this.gameStatus = document.querySelector(".game-status");
    this.gameMode = "pvp"; // 'pvp' 或 'pve'

    this.timer = document.querySelector(".timer");
    this.startTime = null;
    this.timerInterval = null;

    // 添加 ResizeObserver 来监听容器大小变化
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        this.setupCanvas();
        this.renderer.render();
      }
    });

    this.init();
  }

  init() {
    this.setupCanvas();
    this.bindEvents();
    this.renderer.render();
    this.updateStatus();
    this.setupModeButtons();
    this.startTimer();
    
    // 开始观察容器大小变化
    const container = this.canvas.parentElement;
    this.resizeObserver.observe(container);
  }

  setupCanvas() {
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    // 使用容器的最小边长作为画布大小，确保棋盘始终是正方形
    const size = Math.min(containerWidth, containerHeight);
    
    this.canvas.width = size;
    this.canvas.height = size;
    
    // 通知渲染器更新网格大小
    this.renderer.updateGridSize();
  }

  bindEvents() {
    this.canvas.addEventListener("click", (e) => this.handleClick(e));
    window.addEventListener("resize", () => {
      this.setupCanvas();
      this.renderer.render();
    });
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const [row, col] = this.renderer.getGridPosition(x, y);

    if (this.board.isValidMove(row, col)) {
      this.makeMove(row, col);
    }
  }

  makeMove(row, col) {
    if (this.board.placeStone(row, col, this.currentPlayer)) {
      this.renderer.render();

      if (this.board.checkWin(row, col, this.currentPlayer)) {
        this.gameOver();
        return;
      }

      this.currentPlayer = this.currentPlayer === "black" ? "white" : "black";
      this.updateStatus();

      if (this.gameMode === "pve" && this.currentPlayer === "white") {
        setTimeout(() => {
          const [aiRow, aiCol] = this.ai.getBestMove();
          this.makeMove(aiRow, aiCol);
        }, 500);
      }
    }
  }

  updateStatus() {
    this.gameStatus.textContent = `轮到${this.currentPlayer === "black" ? "黑" : "白"}子下`;
  }

  gameOver() {
    const winner = this.currentPlayer === "black" ? "黑" : "白";
    this.gameStatus.textContent = `游戏结束，${winner}子胜！`;
    this.canvas.style.pointerEvents = "none";
    this.stopTimer();
  }

  restart() {
    this.board.reset();
    this.currentPlayer = "black";
    this.canvas.style.pointerEvents = "auto";
    this.renderer.render();
    this.updateStatus();
    this.startTimer();
  }

  undo() {
    if (this.board.undo()) {
      this.currentPlayer = this.currentPlayer === "black" ? "white" : "black";
      this.renderer.render();
      this.updateStatus();
    }
  }

  setupModeButtons() {
    const modeButtons = document.querySelectorAll(".mode-btn");
    modeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        modeButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.gameMode = btn.dataset.mode;
        this.restart();
      });
    });
  }

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.startTime = Date.now();
    this.updateTimer();
    
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 1000);
  }

  updateTimer() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    this.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // 在组件销毁时清理 ResizeObserver
  destroy() {
    this.resizeObserver.disconnect();
    this.stopTimer();
  }
}

// 启动游戏
new Game();
