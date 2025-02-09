let hero, enemies = [], gameOver = false, message = "";
let canvasW = 600, canvasH = 400, ovalMargin = 20;

// Add preload() to load the wall impact sound and a font.
let wallSound, font;
function preload() {
  wallSound = loadSound("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
  font = loadFont("https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap");
}

function setup() {
  // Change canvas to use WEBGL mode.
  createCanvas(canvasW, canvasH, WEBGL);
  textFont(font);
  // Randomize base size for enemy ball and set hero accordingly
  let base = random(15, 25);
  hero = {
    x: canvasW/2,
    y: canvasH/2,
    r: base * 1.4,
    // Hero planet “Earth”: original color used as reference; now rendered as glass
    col: [50, 150, 255],
    vx: 0,
    vy: 0
  };
}

function draw() {
  background(220);
  // In WEBGL mode, adjust coordinate system to use previous top-left origin.
  push();
  translate(-canvasW/2, -canvasH/2);
  
  // Draw oval playing area border in 2D
  noFill();
  stroke(0);
  ellipse(canvasW/2, canvasH/2, canvasW - ovalMargin, canvasH - ovalMargin);

  if (!gameOver) {
    // Removed handleInput(); now movement is handled via keyPressed events.
    // Spawn enemy balls continuously: 4 per second (approx every 15 frames)
    if (frameCount % 15 === 0) {
      spawnEnemy();
    }
    updateGravity();
    checkCollisions();
    checkVictory();
    // New boundary check for all balls
    checkBoundaries();
  }
  
  // Draw hero as a glass sphere using WEBGL
  drawHeroPlanet(hero.x, hero.y, hero.r);
  // Draw enemy planets (still rendered as 2D ellipses)
  enemies.forEach(e => {
    drawEnemyPlanet(e.x, e.y, e.r, e.col);
  });

  // Display message if game over
  if (gameOver) {
    textSize(32);
    fill(0);
    textAlign(CENTER, CENTER);
    text(message, canvasW/2, canvasH/2);
  }
  pop();
}

// Remove handleInput() entirely.
// New event handler for arrow keys to emit mass.
function keyPressed() {
  let dx = 0, dy = 0;
  if (keyCode === LEFT_ARROW)  { dx = -1; }
  if (keyCode === RIGHT_ARROW) { dx = 1; }
  if (keyCode === UP_ARROW)    { dy = -1; }
  if (keyCode === DOWN_ARROW)  { dy = 1; }
  if (dx !== 0 || dy !== 0) {
    let strength = 4;  // constant impulse strength (can be adjusted)
    emitMass(dx, dy, strength);
  }
}

// New function to emit mass from hero ball.
function emitMass(dirX, dirY, strength) {
  // Use 'delta' as the area to be emitted.
  let delta = strength; // area unit deducted (adjust this constant as needed)
  let heroArea = sq(hero.r);
  // Prevent hero from shrinking below a minimal area (e.g., 100 units)
  if (heroArea - delta < 100) return;
  // Subtract area from hero and update radius accordingly.
  hero.r = sqrt(heroArea - delta);
  // Apply impulse to hero in direction of the arrow key.
  hero.vx += strength * dirX;
  hero.vy += strength * dirY;
  // Create an emitted particle with area equal to delta.
  let particle = {
    x: hero.x,
    y: hero.y,
    r: sqrt(delta),
    // Choose a color from the enemy palette (or randomize further)
    col: random([[200,100,50], [255,204,0], [150,50,50]]),
    // Particle moves in the opposite direction to hero's impulse.
    vx: -strength * dirX,
    vy: -strength * dirY
  };
  enemies.push(particle);
}

function spawnEnemy() {
  // Spawn enemy ball at a random position inside the oval using polar coordinates
  let rx = (canvasW - ovalMargin) / 2;
  let ry = (canvasH - ovalMargin) / 2;
  let angle = random(0, TWO_PI);
  let rFactor = sqrt(random());
  let x = canvasW/2 + rFactor * rx * cos(angle);
  let y = canvasH/2 + rFactor * ry * sin(angle);
  // Randomize enemy size between 15 and 25
  let r = random(15, 25);
  // Choose a random color from a preset palette
  let colors = [
    [200,100,50],
    [255,204,0],
    [150,50,50]
  ];
  let col = random(colors);
  enemies.push({
    x, y, 
    r, 
    col,
    vx: random(-0.5, 0.5),
    vy: random(-0.5, 0.5)
  });
}

function updateGravity() {
  let G = 0.1;
  let allBalls = [hero, ...enemies];
  for (let i = 0; i < allBalls.length; i++) {
    let ball = allBalls[i];
    let ax = 0, ay = 0;
    for (let j = 0; j < allBalls.length; j++) {
      if (i === j) continue;
      let other = allBalls[j];
      let dx = other.x - ball.x;
      let dy = other.y - ball.y;
      let d = sqrt(dx*dx + dy*dy);
      if (d < 1) d = 1;
      let massOther = sq(other.r);
      let a = G * massOther / (d*d);
      ax += a * dx/d;
      ay += a * dy/d;
    }
    ball.vx += ax;
    ball.vy += ay;
  }
  for (let ball of allBalls) {
    ball.x += ball.vx;
    ball.y += ball.vy;
  }
}

// Updated drawing function for hero planet (rendered as a glass sphere)
function drawHeroPlanet(x, y, r) {
  push();
  // Translate to hero position (positions are in canvas coordinates)
  translate(x, y, 0);
  // Set up lighting for a glassy appearance
  ambientLight(100);
  directionalLight(255, 255, 255, 0.25, 0.25, 0);
  pointLight(255, 255, 255, 0, 0, 200);
  noStroke();
  // Use specularMaterial to simulate a glass sphere look
  specularMaterial(200, 200, 255);
  shininess(100);
  // Render sphere using hero's radius
  sphere(r);
  pop();
}

// New drawing function for enemy planets
function drawEnemyPlanet(x, y, r, col) {
  push();
  translate(x, y, 0);
  noStroke();
  fill(col);
  ellipse(0, 0, r*2);
  // Add a subtle shine effect
  fill(255, 200);
  ellipse(-r*0.4, -r*0.4, r*0.4);
  pop();
}

function checkCollisions() {
  // Check hero with enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (collideCircles(hero, enemies[i])) {
      if (hero.r >= enemies[i].r) {
        // Absorb enemy: treat area as πr^2; new radius = sqrt(r1^2 + r2^2)
        hero.r = sqrt(sq(hero.r) + sq(enemies[i].r));
        enemies.splice(i,1);
      } else {
        gameOver = true;
        message = "World Wins!";
      }
    }
  }
  // Check enemy collisions with each other
  for (let i = enemies.length - 1; i >= 0; i--) {
    for (let j = i-1; j >= 0; j--) {
      if (collideCircles(enemies[i], enemies[j])) {
        if (enemies[i].r >= enemies[j].r) {
          enemies[i].r = sqrt(sq(enemies[i].r) + sq(enemies[j].r));
          enemies.splice(j,1);
          i--; break;
        } else {
          enemies[j].r = sqrt(sq(enemies[j].r) + sq(enemies[i].r));
          enemies.splice(i,1);
          break;
        }
      }
    }
  }
}

function checkVictory() {
  // If hero is biggest among all balls, player wins.
  let biggest = hero.r;
  enemies.forEach(e => {
    if(e.r > biggest) biggest = e.r;
  });
  if (hero.r === biggest && enemies.length > 0 && frameCount > 300) {
    gameOver = true;
    message = "Player Wins!";
  }
}

function collideCircles(a, b) {
  return dist(a.x, a.y, b.x, b.y) < (a.r + b.r);
}

// New function: Check if ball touches the oval wall.
// Uses ellipse equation: ((x-cx)^2)/(rx^2)+((y-cy)^2)/(ry^2) >= 1
function checkBoundaries() {
  let cx = canvasW/2, cy = canvasH/2;
  let rx = (canvasW - ovalMargin)/2, ry = (canvasH - ovalMargin)/2;
  
  // Check hero (do not duplicate hero)
  let dx = hero.x - cx, dy = hero.y - cy;
  if ((dx*dx)/(rx*rx) + (dy*dy)/(ry*ry) >= 1) {
    if (wallSound.isLoaded()) wallSound.play();
    hero.vx *= 2;
    hero.vy *= 2;
  }
  
  // Check enemy balls
  for (let i = enemies.length - 1; i >= 0; i--) {
    let b = enemies[i];
    let dx2 = b.x - cx, dy2 = b.y - cy;
    if ((dx2*dx2)/(rx*rx) + (dy2*dy2)/(ry*ry) >= 1) {
      if (wallSound.isLoaded()) wallSound.play();
      b.vx *= 2;
      b.vy *= 2;
      // Duplicate the ball – add a shallow copy to enemies.
      let duplicate = Object.assign({}, b);
      enemies.push(duplicate);
    }
  }
}
