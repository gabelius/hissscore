// Module aliases
const { Engine, Render, World, Bodies, Body, Constraint, Events, Mouse, MouseConstraint } = Matter;

// Create engine and world
const engine = Engine.create();
const world = engine.world;

// Compute dynamic canvas dimensions based on viewport minus controls height
const controlsHeight = document.querySelector('.controls').offsetHeight || 0;
const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight - controlsHeight; // optimized height

// Set up renderer using the existing canvas
const canvas = document.getElementById("simulationCanvas");
canvas.width = canvasWidth;
canvas.height = canvasHeight;
const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: canvasWidth,
        height: canvasHeight,
        wireframes: false,
        background: "#000"
    }
});

// Update pivot to be center of canvas
const pivot = { x: canvasWidth / 2, y: canvasHeight / 2 };

// Create the stick with initial width relative to viewport (e.g. 30% of canvas width)
const initialStickWidth = Math.max(200, canvasWidth * 0.3);
let currentStickWidth = initialStickWidth;
const stick = Bodies.rectangle(pivot.x, pivot.y, initialStickWidth, 20, {
    render: { fillStyle: 'blue' }
});

// Constraint to fix the stick at the pivot (allowing rotation only)
const pivotConstraint = Constraint.create({
    pointA: pivot,
    bodyB: stick,
    pointB: { x: 0, y: 0 },
    length: 0,
    stiffness: 1
});

World.add(world, [stick, pivotConstraint]);

// Move initialization here to ensure they are available beforehand
function adjustStickSize() {
    let computedWidth = 50 * customText.length;
    if (customText.length > 7 && computedWidth < 300) {
        computedWidth = 300;
    }
    const newStickWidth = Math.min(computedWidth, canvas.width * 0.85);
    const factor = newStickWidth / currentStickWidth;
    Body.scale(stick, factor, 1);
    currentStickWidth = newStickWidth;
}

// Remove these lines to disable dragging:
// const mouse = Mouse.create(render.canvas);
// const mouseConstraint = MouseConstraint.create(engine, {
//     mouse: mouse,
//     constraint: { stiffness: 1, render: { visible: false } }
// });
// World.add(world, mouseConstraint);
// render.mouse = mouse;
// Instead, create the mouse only for pointer coordinate calculations if needed
const mouse = Mouse.create(render.canvas);

// Variables to control input rotation
let isInteracting = false;

// Global variable for custom text with default value "PALINDROMES"
let customText = "PALINDROMES";
// Array of 20 semordnilap words (all capitalised)
const semordnilaps = ["STRESSED", "DESSERTS", "DIAPER", "REPAID", "DRAWER", "REWARD", "PARTS", "STRAP", "REGAL", "LAGER", "GOD", "DOG", "EVIL", "LIVE", "STOP", "POTS", "STAR", "RATS", "LOOP", "POOL"];

// Last interaction timestamp
let lastInteractionTime = Date.now();

// Add new global variable to count auto rotations
let autoRotationCount = 0;

document.addEventListener('mousedown', () => { isInteracting = true; updateInteractionTime(); });
// Update mouseup to stop rotation immediately
document.addEventListener('mouseup', () => { 
    isInteracting = false; 
    Body.setAngularVelocity(stick, 0); // halt rotation before snapping
    snapStick();
    updateInteractionTime();
});
document.addEventListener('touchstart', () => { isInteracting = true; updateInteractionTime(); });
// Update touchend to stop rotation immediately
document.addEventListener('touchend', () => { 
    isInteracting = false; 
    Body.setAngularVelocity(stick, 0); // halt rotation before snapping
    snapStick();
    updateInteractionTime();
});

// Listen to changes in the input box to update customText (convert to uppercase)
document.getElementById('customText').addEventListener('input', function(e) {
    customText = (e.target.value || "PALINDROMES").toUpperCase();
    e.target.value = customText;
    adjustStickSize();
});

// Update stick rotation based on pointer position when interacting
document.addEventListener('mousemove', updateStickRotation);
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    updateStickRotation(e.touches[0]);
    updateInteractionTime();
}, { passive: false });

function updateStickRotation(pointer) {
    if (!isInteracting) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = pointer.clientX - rect.left;
    const mouseY = pointer.clientY - rect.top;
    let targetAngle = Math.atan2(mouseY - pivot.y, mouseX - pivot.x);
    
    // Normalize angles between -π and π
    let currentAngle = stick.angle;
    let diff = targetAngle - currentAngle;
    if (diff > Math.PI) { diff -= 2 * Math.PI; }
    else if (diff < -Math.PI) { diff += 2 * Math.PI; }
    
    // Apply angular velocity proportional to the difference (tweak factor for responsiveness)
    const angularSpeedFactor = 0.2;
    Body.setAngularVelocity(stick, diff * angularSpeedFactor);
}

// Lock the stick's position on every update, so only rotation is possible
Events.on(engine, 'beforeUpdate', function() {
    Body.setPosition(stick, pivot);
});

// Helper function to slowly snap stick angle to nearest horizontal (0 or ±π)
function snapStick() {
    const duration = 1500; // changed from 1000ms to 1500ms for 50% slower animation
    const currentAngle = stick.angle;
    // Normalize currentAngle to [-π, π)
    let normalized = ((currentAngle + Math.PI) % (2 * Math.PI)) - Math.PI;
    // Determine target normalized: if within ±π/2 snap to 0, else to π (or -π)
    const targetNormalized = (Math.abs(normalized) <= Math.PI/2) ? 0 : (normalized > 0 ? Math.PI : -Math.PI);
    // Compute candidate target in full angle space:
    const base = currentAngle - normalized; 
    const candidateTarget = base + targetNormalized; // difference is always < π/2
    const startTime = performance.now();
    // Simple ease-out function
    function easeOut(t) { return t * (2 - t); }
    
    function animate(time) {
        const t = Math.min((time - startTime) / duration, 1);
        const easedT = easeOut(t);
        const newAngle = currentAngle + (candidateTarget - currentAngle) * easedT;
        Body.setAngularVelocity(stick, 0);
        Body.setAngle(stick, newAngle);
        if (t < 1) {
            requestAnimationFrame(animate);
        }
    }
    requestAnimationFrame(animate);
}

// New function to rotate the stick by 180° (clockwise)
// Accepts an optional callback when animation completes.
function rotateStick180(callback) {
    const duration = 1500; // changed from 1000ms to 1500ms for 50% slower animation
    const currentAngle = stick.angle;
    const targetAngle = currentAngle + Math.PI; // add 180 deg
    const startTime = performance.now();
    function easeOut(t) { return t * (2 - t); }
    
    function animate(time) {
        const t = Math.min((time - startTime) / duration, 1);
        const easedT = easeOut(t);
        const newAngle = currentAngle + (targetAngle - currentAngle) * easedT;
        Body.setAngularVelocity(stick, 0);
        Body.setAngle(stick, newAngle);
        if(t < 1) {
            requestAnimationFrame(animate);
        } else if(callback) {
            callback();
        }
    }
    requestAnimationFrame(animate);
}

// Button event listeners
document.getElementById('rotateBtn').addEventListener('click', () => {
    rotateStick180();
});
document.getElementById('randomBtn').addEventListener('click', () => {
    const rand = Math.floor(Math.random() * semordnilaps.length);
    customText = semordnilaps[rand];
    document.getElementById('customText').value = customText;
    adjustStickSize();
    updateBackgroundPattern(); // NEW: change background pattern
});

// Add a flag to prevent overlapping auto rotations
let autoRotating = false;

function autoRotate() {
    if (autoRotating) return;
    if (Date.now() - lastInteractionTime >= 5000) {
        autoRotating = true;
        rotateStick180(() => {
            setTimeout(() => {
                lastInteractionTime = Date.now();
                autoRotating = false;
                autoRotationCount++;
                if (autoRotationCount >= 2) {
                    const rand = Math.floor(Math.random() * semordnilaps.length);
                    customText = semordnilaps[rand];
                    document.getElementById('customText').value = customText;
                    adjustStickSize();
                    autoRotationCount = 0;
                    updateBackgroundPattern(); // NEW: update background pattern here as well.
                }
            }, 5000);
        });
    }
}
setInterval(autoRotate, 1000);

// NEW: Define several background pattern functions.
function drawCheckerboard(ctx, width, height) {
  const tileSize = 40;
  for (let y = 0; y < height; y += tileSize) {
    for (let x = 0; x < width; x += tileSize) {
      const isEven = ((x / tileSize + y / tileSize) % 2 === 0);
      ctx.fillStyle = isEven ? "#333" : "#444";
      ctx.fillRect(x, y, tileSize, tileSize);
    }
  }
}

function drawStripes(ctx, width, height) {
  const stripeWidth = 20;
  for (let x = 0; x < width; x += stripeWidth) {
    ctx.fillStyle = (Math.floor(x / stripeWidth) % 2 === 0) ? "#555" : "#666";
    ctx.fillRect(x, 0, stripeWidth, height);
  }
}

function drawDots(ctx, width, height) {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#888";
  const spacing = 30;
  const radius = 3;
  for (let y = spacing; y < height; y += spacing) {
    for (let x = spacing; x < width; x += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}

// NEW: Store patterns in an array.
const backgroundPatterns = [drawCheckerboard, drawStripes, drawDots];
// NEW: Global variable for current background pattern.
let currentBackgroundPattern = backgroundPatterns[Math.floor(Math.random() * backgroundPatterns.length)];

// Helper: update the background pattern on new word
function updateBackgroundPattern() {
  currentBackgroundPattern = backgroundPatterns[Math.floor(Math.random() * backgroundPatterns.length)];
}

// NEW: Helper function to create a wood texture pattern.
function createWoodPattern() {
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = 100;
  patternCanvas.height = 100;
  const pctx = patternCanvas.getContext('2d');
  // Base wood color
  pctx.fillStyle = "#8B4513";
  pctx.fillRect(0, 0, 100, 100);
  // Draw wood-grain lines
  pctx.strokeStyle = "#CD853F";
  pctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    let x = Math.random() * 100;
    pctx.beginPath();
    pctx.moveTo(x, 0);
    pctx.lineTo(x, 100);
    pctx.stroke();
  }
  return render.context.createPattern(patternCanvas, 'repeat');
}
// NEW: Initialize global wood texture pattern.
const woodTexture = createWoodPattern();

// Replace the existing afterRender event:
Events.on(render, 'afterRender', function() {
    const context = render.context;
    // First, draw the current background pattern.
    context.save();
    // Reset any transform before drawing background.
    context.setTransform(1, 0, 0, 1, 0, 0);
    currentBackgroundPattern(context, canvasWidth, canvasHeight);
    context.restore();
    
    context.save();
    // Translate to stick's position and apply its rotation
    context.translate(stick.position.x, stick.position.y);
    context.rotate(stick.angle);
    
    // NEW: Draw wood-textured stick background using woodTexture pattern instead of gradient.
    context.save();
    const halfWidth = currentStickWidth / 2;
    context.fillStyle = woodTexture;
    context.fillRect(-halfWidth, -10, currentStickWidth, 20);
    context.restore();
    
    // Draw pivot as a small blue circle (unchanged)
    context.save();
    context.fillStyle = "blue";
    context.beginPath();
    context.arc(0, 0, 5, 0, Math.PI * 2);
    context.fill();
    context.restore();
    
    // Draw letter tiles as squares.
    const letters = (customText || "PALINDROMES").split('');
    const tileCount = letters.length;
    const tileMargin = (tileCount > 7) ? 2 : 4;
    // effectiveTileWidth is the available width divided evenly; use it for both dimensions.
    const effectiveTileWidth = (currentStickWidth - (tileCount + 1) * tileMargin) / tileCount;
    const tileSide = effectiveTileWidth; // Square tile
    
    let startX = -currentStickWidth / 2 + tileMargin;
    
    for (let i = 0; i < tileCount; i++) {
        context.save();
        // Center of current tile in stick-space
        const tileX = startX + i * (effectiveTileWidth + tileMargin) + effectiveTileWidth / 2;
        context.translate(tileX, 0);
        // Undo stick rotation to keep tile vertical
        context.rotate(-stick.angle);
        
        // Draw rounded square tile
        context.fillStyle = "#FFF";
        context.strokeStyle = "#444";
        context.lineWidth = 2;
        const radius = 4;
        const tileX0 = -tileSide / 2;
        const tileY0 = -tileSide / 2;
        context.beginPath();
        context.moveTo(tileX0 + radius, tileY0);
        context.lineTo(tileX0 + tileSide - radius, tileY0);
        context.quadraticCurveTo(tileX0 + tileSide, tileY0, tileX0 + tileSide, tileY0 + radius);
        context.lineTo(tileX0 + tileSide, tileY0 + tileSide - radius);
        context.quadraticCurveTo(tileX0 + tileSide, tileY0 + tileSide, tileX0 + tileSide - radius, tileY0 + tileSide);
        context.lineTo(tileX0 + radius, tileY0 + tileSide);
        context.quadraticCurveTo(tileX0, tileY0 + tileSide, tileX0, tileY0 + tileSide - radius);
        context.lineTo(tileX0, tileY0 + radius);
        context.quadraticCurveTo(tileX0, tileY0, tileX0 + radius, tileY0);
        context.closePath();
        context.fill();
        context.stroke();
        
        // Center the letter with equal padding.
        const fontSize = Math.max(20, 16 * (canvasWidth / 800));
        context.fillStyle = "#222";
        context.font = "bold " + fontSize + "px Roboto";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(letters[i], 0, 0);
        context.restore();
    }
    
    context.restore();
});

// Run the engine and renderer
const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);
Render.run(render);

// Update lastInteractionTime on user interaction events
function updateInteractionTime() {
    lastInteractionTime = Date.now();
}
