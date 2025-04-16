let grid;
let cols, rows;
let w = 30;
let totalMines;
let difficulty = "easy";
let gameStarted = false;
let gameOverState = false;

let buttonEasy, buttonMedium, buttonHard;

function setup() {
  createCanvas(600, 600);
  showStartScreen();
}

function showStartScreen() {
  background(220);
  textAlign(CENTER);
  textSize(32);
  fill(0);
  text("Minesweeper", width / 2, height / 3 - 40);

  textSize(20);
  text("Press E for Easy", width / 2, height / 2);
  text("Press M for Medium", width / 2, height / 2 + 30);
  text("Press H for Hard", width / 2, height / 2 + 60);
}

function keyPressed() {
  if (gameStarted) return;

  if (key === "e" || key === "E") {
    startGame("easy");
  } else if (key === "m" || key === "M") {
    startGame("medium");
  } else if (key === "h" || key === "H") {
    startGame("hard");
  }
}

function startGame(mode) {
  difficulty = mode;
  if (mode === "easy") {
    cols = 10;
    rows = 10;
    totalMines = 10;
  } else if (mode === "medium") {
    cols = 15;
    rows = 15;
    totalMines = 20;
  } else if (mode === "hard") {
    cols = 20;
    rows = 20;
    totalMines = 45;
  }

  resizeCanvas(cols * w, rows * w);
  gameStarted = true;
  gameOverState = false;

  if (buttonEasy) buttonEasy.remove();
  if (buttonMedium) buttonMedium.remove();
  if (buttonHard) buttonHard.remove();

  initGrid();
}

function initGrid() {
  grid = make2DArray(cols, rows);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = new Cell(i, j, w);
    }
  }

  let options = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      options.push([i, j]);
    }
  }

  for (let n = 0; n < totalMines; n++) {
    let index = floor(random(options.length));
    let choice = options.splice(index, 1)[0];
    let i = choice[0];
    let j = choice[1];
    grid[i][j].mine = true;
    grid[i][j].mineColor = color(random(100, 255), random(0, 100), random(0, 100));
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].countMines();
    }
  }
}

function draw() {
  if (!gameStarted) {
    return;
  }

  background(255);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].show();
    }
  }
}

function mousePressed() {
  if (!gameStarted || gameOverState) return;

  let i = floor(mouseX / w);
  let j = floor(mouseY / w);
  if (i >= 0 && i < cols && j >= 0 && j < rows) {
    let cell = grid[i][j];
    if (mouseButton === RIGHT) {
      cell.toggleFlag();
    } else {
      if (!cell.flagged) {
        cell.reveal();
        if (cell.mine) {
          revealMines();
          gameOverState = true;
          alert("💥 Game Over! You clicked on a mine.");
        }
      }
    }
  }
  return false;
}

function revealMines() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let cell = grid[i][j];
      if (cell.mine) {
        cell.revealed = true;
      }
    }
  }
}

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < cols; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

class Cell {
  constructor(i, j, w) {
    this.i = i;
    this.j = j;
    this.x = i * w;
    this.y = j * w;
    this.w = w;
    this.mine = false;
    this.revealed = false;
    this.flagged = false;
    this.neighborCount = 0;
    this.mineColor = null;
  }

  show() {
    noStroke();
    if (this.revealed) {
      if (this.mine) {
        fill(this.mineColor || color(127));
        rect(this.x, this.y, this.w, this.w);
        fill(0);
        ellipse(this.x + this.w * 0.5, this.y + this.w * 0.5, this.w * 0.5);
      } else {
        if ((this.i + this.j) % 2 === 0) {
          fill(222, 184, 135);
        } else {
          fill(152,118,84);
        }
        rect(this.x, this.y, this.w, this.w);

        if (this.neighborCount > 0) {
          textAlign(CENTER);
          textSize(20);
          switch (this.neighborCount) {
            case 1:
              fill(0, 0, 255);
              break;
            case 2:
              fill(0, 128, 0);
              break;
            case 3:
              fill(255, 0, 0);
              break;
            case 4:
              fill(128, 0, 128);
              break;
            case 5:
              fill(255, 140, 0);
              break;
            case 6:
              fill(0, 100, 0);
              break;
            case 7:
              fill(0);
              break;
            case 8:
              fill(64);
              break;
            default:
              fill(255);
              break;
          }
          text(this.neighborCount, this.x + this.w * 0.5, this.y + this.w - 10);
        }
      }
    } else {
      if ((this.i + this.j) % 2 === 0) {
        fill(32,212,32);
      } else {
        fill(19,127,19);
      }
      rect(this.x, this.y, this.w, this.w);

      if (this.flagged) {
        textAlign(CENTER);
        textSize(20);
        fill(255, 0, 0);
        text("🚩", this.x + this.w * 0.5, this.y + this.w - 10);
      }
    }
  }

  countMines() {
    if (this.mine) {
      this.neighborCount = -1;
      return;
    }

    let total = 0;
    for (let xoff = -1; xoff <= 1; xoff++) {
      for (let yoff = -1; yoff <= 1; yoff++) {
        let i = this.i + xoff;
        let j = this.j + yoff;
        if (i > -1 && i < cols && j > -1 && j < rows) {
          let neighbor = grid[i][j];
          if (neighbor.mine) {
            total++;
          }
        }
      }
    }
    this.neighborCount = total;
  }

  reveal() {
    if (this.revealed || this.flagged) return;
    this.revealed = true;

    if (this.neighborCount === 0 && !this.mine) {
      for (let xoff = -1; xoff <= 1; xoff++) {
        for (let yoff = -1; yoff <= 1; yoff++) {
          let i = this.i + xoff;
          let j = this.j + yoff;
          if (i > -1 && i < cols && j > -1 && j < rows) {
            let neighbor = grid[i][j];
            if (!neighbor.revealed) {
              neighbor.reveal();
            }
          }
        }
      }
    }
  }

  toggleFlag() {
    if (!this.revealed) {
      this.flagged = !this.flagged;
    }
  }
}
