const BLOCK_SIZE = 40;
const BLOCK_IMAGE_SIZE = 8;
const WIDTH = 10;
const HEIGHT = 20;
const TIMER_INTERVAL = 1000;

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
ctx.imageSmoothingEnabled = false;
ctx.fillStyle = "#000";
ctx.fillRect(0, 0, canvas.width, canvas.height);
const img = document.getElementById("minos")! as HTMLImageElement;

//prettier-ignore
const patterns = [
  // I
  {
    blocks: [
      [[0,1],[1,1],[2,1],[3,1]],
      [[2,0],[2,1],[2,2],[2,3]],
      [[0,1],[1,1],[2,1],[3,1]],
      [[1,0],[1,1],[1,2],[1,3]],
    ],
    color: 1,
  },
  // T
  {
    blocks: [
      [[0,1],[1,1],[2,1],[1,2]],
      [[1,0],[0,1],[1,1],[1,2]],
      [[1,1],[0,2],[1,2],[2,2]],
      [[1,0],[1,1],[2,1],[1,2]],
    ],
    color: 2,
  },
  // L
  {
    blocks: [
      [[0,1],[1,1],[2,1],[0,2]],
      [[0,0],[1,0],[1,1],[1,2]],
      [[2,1],[0,2],[1,2],[2,2]],
      [[1,0],[1,1],[1,2],[2,2]],
    ],
    color: 3,
  },
  // J
  {
    blocks: [
      [[0,1],[1,1],[2,1],[2,2]],
      [[1,0],[1,1],[0,2],[1,2]],
      [[0,1],[0,2],[1,2],[2,2]],
      [[1,0],[2,0],[1,1],[1,2]],
    ],
    color: 4,
  },
  // S
  {
    blocks: [
      [[1,1],[2,1],[0,2],[1,2]],
      [[0,0],[0,1],[1,1],[1,2]],
      [[1,1],[2,1],[0,2],[1,2]],
      [[0,0],[0,1],[1,1],[1,2]],
    ],
    color: 5,
  },
  // Z
  {
    blocks: [
      [[0,1],[1,1],[1,2],[2,2]],
      [[2,0],[1,1],[2,1],[1,2]],
      [[0,1],[1,1],[1,2],[2,2]],
      [[2,0],[1,1],[2,1],[1,2]],
    ],
    color: 6,
  },
  {
    blocks: [
      [[1,1],[1,2],[2,1],[2,2]],
      [[1,1],[1,2],[2,1],[2,2]],
      [[1,1],[1,2],[2,1],[2,2]],
      [[1,1],[1,2],[2,1],[2,2]],
    ],
    color: 7,
  },
];

let field: number[][] = initField();

function initField() {
  return Array.from({ length: HEIGHT }, () =>
    Array.from({ length: WIDTH }, () => 0)
  );
}

let activeMino = spawn();

let timerId: number;

function spawn() {
  const patternIndex = Math.floor(Math.random() * patterns.length);
  return {
    pattern: patterns[patternIndex],
    pos: [WIDTH / 2 - 2, -1],
    rotation: 0,
  };
}

function getAbsoluteBlocks() {
  return activeMino.pattern.blocks[activeMino.rotation].map(([x, y]) => [
    x + activeMino.pos[0],
    y + activeMino.pos[1],
  ]);
}

function main() {
  document.addEventListener("keydown", (ev) => {
    switch (ev.code) {
      case "ArrowRight":
        onArrowRight();
        break;
      case "ArrowLeft":
        onArrowLeft();
        break;
      case "ArrowUp":
        onArrowUp();
        break;
      case "ArrowDown":
        onArrowDown();
        break;
    }
  });
  resetTimer();
  draw();
}

function resetTimer() {
  if (timerId) clearInterval(timerId);
  timerId = setInterval(onTimer, TIMER_INTERVAL);
}

function onTimer() {
  onArrowDown();
}

function onArrowDown() {
  if (shouldFix()) {
    fix();
    clearLines();
    activeMino = spawn();
    if (isGameOver()) {
      alert("Game Over!");
      field = initField();
    }
  } else {
    activeMino.pos[1]++;
    draw();
    resetTimer();
  }
}

function onArrowUp() {
  if (canRotate(1)) {
    activeMino.rotation++;
    activeMino.rotation %= 4;
  }
  draw();
}

function onArrowRight() {
  if (!detectSides()[1]) activeMino.pos[0]++;
  draw();
}

function onArrowLeft() {
  if (!detectSides()[0]) activeMino.pos[0]--;
  draw();
}

function drawBlock(x: number, y: number, imgIndex: number) {
  const sx = imgIndex * BLOCK_IMAGE_SIZE;
  const sy = 0;
  const dx = x * BLOCK_SIZE;
  const dy = y * BLOCK_SIZE;
  ctx.drawImage(
    img,
    sx,
    sy,
    BLOCK_IMAGE_SIZE,
    BLOCK_IMAGE_SIZE,
    dx,
    dy,
    BLOCK_SIZE,
    BLOCK_SIZE
  );
}

function draw() {
  field.map((row, y) => {
    row.map((imgIndex, x) => {
      drawBlock(x, y, imgIndex);
    });
  });

  getAbsoluteBlocks().forEach(([x, y]) =>
    drawBlock(x, y, activeMino.pattern.color)
  );
}

function shouldFix() {
  return getAbsoluteBlocks().some(
    ([x, y]) => y >= HEIGHT - 1 || (isInGrid(x, y) && field[y + 1][x])
  );
}

function isInGrid(x: number, y: number) {
  return y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH;
}

function fix() {
  getAbsoluteBlocks().forEach(([x, y]) => {
    field[y][x] = activeMino.pattern.color;
  });
}

function detectSides() {
  const blocks = getAbsoluteBlocks();
  return [
    blocks.some(([x, _]) => x - 1 < 0),
    blocks.some(([x, _]) => x + 1 >= WIDTH),
  ];
}

function canRotate(direction: number) {
  const blocks = activeMino.pattern.blocks[
    (activeMino.rotation + direction) % 4
  ].map(([x, y]) => [x + activeMino.pos[0], y + activeMino.pos[1]]);
  return blocks.every(([x, y]) => isInGrid(x, y) && !field[y][x]);
}

function clearLines() {
  for (let y = 0; y < HEIGHT; y++)
    if (field[y].every((v) => v)) {
      for (let p = y; p > 0; p--) field[p] = field[p - 1];
      field[0] = Array.from({ length: WIDTH }, (_) => 0);
    }
}

function isGameOver() {
  return getAbsoluteBlocks().some(([x, y]) => isInGrid(x, y) && field[y][x]);
}

main();

export default {};