export class Controls {
  constructor(game) {
    this.game = game;
    this.init();
  }

  init() {
    const restartBtn = document.getElementById("restartBtn");
    const undoBtn = document.getElementById("undoBtn");

    restartBtn.addEventListener("click", () => {
      this.game.restart();
    });

    undoBtn.addEventListener("click", () => {
      this.game.undo();
    });
  }
}
