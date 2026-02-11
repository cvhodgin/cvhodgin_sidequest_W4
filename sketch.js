/*
Week 4 - Side Quest
Course: GBDA302
Author: Chloe Victoria Hodgins
Student ID: 21073756 
Date: Feb. 10, 2026
*/

// ------- Tile Legend -------
// 0 = floor
// 1 = wall
// 2 = spikes (respawn)
// 3 = dash crystal (refills dash)
// 4 = goal (next level)

const LEVELS = [
  [
    [1,1,1,1,1,1,1],
    [1,0,0,0,0,3,1],
    [1,0,1,1,0,1,1],
    [1,0,0,1,0,0,1],
    [1,1,0,1,2,0,1],
    [1,0,0,0,0,4,1],
    [1,1,1,1,1,1,1],
  ],
  [
    [1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,3,1],
    [1,0,1,0,1,0,1,1],
    [1,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,0,1],
    [1,0,0,0,2,0,4,1],
    [1,1,1,1,1,1,1,1],
  ]
];

let tileSize = 90
;

let grid;
let levelIndex = 0;

let player;
let win = false;
let score = 0;

let hasMovedOnce = false;

let message = "";
let messageTimer = 0; // frames to show message

function setup() {
  loadLevel(0);
  textFont("monospace");
}

function loadLevel(idx) {
  levelIndex = idx;
  grid = structuredClone(LEVELS[levelIndex]); // copy so we can edit tiles (like consuming crystals)

  // Start position (simple): row 1, col 1
  player = { r: 1, c: 1, hasDash: true };

  win = false;

  createCanvas(grid[0].length * tileSize, grid.length * tileSize);
}

function showMessage(txt, seconds = 2.5) {
  message = txt;
  messageTimer = int(seconds * 60); // assuming ~60fps
}

function draw() {
  background(15);

  // draw tiles using loops (this is the core requirement)
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      drawTile(r, c, grid[r][c]);
    }
  }

  // draw player
  drawPlayer();

  // HUD
  fill(255);
  textSize(14);
  text(`𐔌՞ ܸ.ˬ.ܸ՞𐦯 Level ${levelIndex + 1}/${LEVELS.length} .ᐟ.ᐟ`, 12, 20);
  text(`To Move ~ ${player.hasDash ? "Use Arrow Keys .✦ ݁˖" : "USED"}`, 12, 40);
  text(`Score: ${score}`, width - 100, 40);

  if (messageTimer > 0) {
    messageTimer--;

    // dark bar behind the text for readability
    noStroke();
    fill(0, 160);
    rect(0, height - 44, width, 44);

    fill(255);
    textSize(14);
    textAlign(CENTER, CENTER);
    text(message, width / 2, height - 22);
    textAlign(LEFT, BASELINE);
  }
 
  if (win) {
    textSize(22);
    textAlign(CENTER, CENTER);
    text("YOU WIN!", width / 2, height / 2);
    textSize(14);
    text("Press R to restart", width / 2, height / 2 + 30);
    textAlign(LEFT, BASELINE);
  }
}

function drawTile(r, c, t) {
  const x = c * tileSize;
  const y = r * tileSize;

  // floor base
  noStroke();
  fill(30);
  rect(x, y, tileSize, tileSize);

  if (t === 1) {
    fill(50, 90, 140); // wall
    rect(x, y, tileSize, tileSize);
  } else if (t === 2) {
    fill(200, 60, 60); // spikes
    rect(x, y, tileSize, tileSize);
    // little triangle-ish look
    fill(255, 150, 150);
    triangle(x + 8, y + tileSize - 6, x + tileSize / 2, y + 10, x + tileSize - 8, y + tileSize - 6);
  } else if (t === 3) {
    fill(80, 220, 255); // dash crystal
    ellipse(x + tileSize / 2, y + tileSize / 2, tileSize * 0.55);
  } else if (t === 4) {
    fill(120, 240, 140); // goal
    rect(x, y, tileSize, tileSize);
    fill(10);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("EXIT", x + tileSize / 2, y + tileSize / 2);
    textAlign(LEFT, BASELINE);
  }
}

function drawPlayer() {
  const x = player.c * tileSize;
  const y = player.r * tileSize;

  fill(255, 110, 200);
  rect(x + 10, y + 10, tileSize - 20, tileSize - 20, 6);
}

function keyPressed() {
  if (win && (key === "r" || key === "R")) {
    loadLevel(0);
    return;
  }

  if (key === "r" || key === "R") {
    loadLevel(levelIndex);
    return;
  }

  let dr = 0, dc = 0;
  if (keyCode === UP_ARROW) dr = -1;
  if (keyCode === DOWN_ARROW) dr = 1;
  if (keyCode === LEFT_ARROW) dc = -1;
  if (keyCode === RIGHT_ARROW) dc = 1;

  if (dr === 0 && dc === 0) return;

  // dash: hold SHIFT to move 2 tiles if dash is available
  let steps = 1;
  if (keyIsDown(SHIFT) && player.hasDash) {
    steps = 2;
    player.hasDash = false;
  }

  tryMove(dr, dc, steps);
}

function tryMove(dr, dc, steps) {
  for (let i = 0; i < steps; i++) {
    const nr = player.r + dr;
    const nc = player.c + dc;

    const tile = grid[nr][nc];

    // wall blocks movement
    if (tile === 1) return;

    // move
    player.r = nr;
    player.c = nc;

    if (!hasMovedOnce) {
      hasMovedOnce = true;
      showMessage("Try to reach the blue circle to gain a point!");
    }

    // check tile effects
    if (tile === 2) {
      showMessage("Oh no! You hit the mountain and got catapulted back to the beginning!!");
      respawn();
      return;
    }

    if (tile === 3) {
      player.hasDash = true;
      score += 1;
      showMessage("Nice! +1 point!");
      grid[player.r][player.c] = 0; // consume crystal 
    }

    if (tile === 4) {
      advanceLevel();
      return;
    }

    // when player moves, after hitting mountain
    if (message.includes("mountain")) {
      message = "";
      messageTimer = 0;
    }
  }
}

function respawn() {
  player.r = 1;
  player.c = 1;
  player.hasDash = true;
}

function advanceLevel() {
  const next = levelIndex + 1;
  if (next < LEVELS.length) {
    loadLevel(next); // AUTO LOAD NEXT LEVEL
  } else {
    win = true;
  }
}
