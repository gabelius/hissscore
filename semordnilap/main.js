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

// Add this line to fetch the Nunito font
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

// Update pivot to be center of canvas
const pivot = { x: canvasWidth / 2, y: canvasHeight / 2 };

// Create the stick with initial width relative to viewport (e.g. 30% of canvas width)
const initialStickWidth = Math.max(200, canvasWidth * 0.3);
let currentStickWidth = initialStickWidth;
const stick = Bodies.rectangle(pivot.x, pivot.y, initialStickWidth, 40, { // increased height from 20 to 40
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
    if(customText.length > 7 && computedWidth < 300) {
        computedWidth = 300;
    }
    // If more than 5 letters, force stick width to be at least 90% of the canvas width.
    let newStickWidth;
    if(customText.length > 5) {
        newStickWidth = Math.max(computedWidth, canvas.width * 0.9);
    } else {
        newStickWidth = Math.min(computedWidth, canvas.width * 0.85);
    }
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
let customText = "avid";
// Array of 20 semordnilap words (all capitalised)
const semordnilaps = ["AIBOHPHOBIA", "RACECAR", "KAYAK", "PALINDROMES", "LEVELER", "STRESSED", "DESSERTS", "DIAPER", "REPAID", "DRAWER", "REWARD", "PARTS", "STRAP", "REGAL", "LAGER", "GOD", "DOG", "EVIL", "LIVE", "STOP", "POTS", "STAR", "RATS", "LOOP", "POOL"];

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

// Listen to changes in the input box to update customText (convert to lowercase)
document.getElementById('customText').addEventListener('input', function(e) {
    customText = (e.target.value || "palindromes").toLowerCase();
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

// NEW: Define new lively background pattern functions.
function drawFlowers(ctx, width, height) {
    // Fill with a bright gradient and draw simple flower shapes.
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#ff9a9e");
    grad.addColorStop(1, "#fad0c4");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    // Draw simple flowers.
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillStyle = "#ff6363";
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "#ffe66d";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function drawAnimals(ctx, width, height) {
    // Bright sky-blue background and playful animal shapes (circles as eyeballs)
    ctx.fillStyle = "#a1c4fd";
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillStyle = "#ffc107";
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "#6c757d";
        ctx.beginPath();
        ctx.arc(x - 5, y - 5, 3, 0, 2 * Math.PI);
        ctx.arc(x + 5, y - 5, 3, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function drawForest(ctx, width, height) {
    // Lively greens and browns.
    ctx.fillStyle = "#dcedc8";
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillStyle = "#8bc34a";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 15, y + 30);
        ctx.lineTo(x + 15, y + 30);
        ctx.closePath();
        ctx.fill();
    }
}

function drawCity(ctx, width, height) {
    // Vibrant cityscape with colorful rectangles.
    ctx.fillStyle = "#ffcc80";
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const h = Math.random() * (height / 2) + 20;
        ctx.fillStyle = ["#ef5350", "#ab47bc", "#42a5f5", "#66bb6a"][Math.floor(Math.random() * 4)];
        ctx.fillRect(x, height - h, 30, h);
    }
}

function drawNight(ctx, width, height) {
    // Deep blues with a glowing moon.
    ctx.fillStyle = "#283593";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#fff176";
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.2, 40, 0, 2 * Math.PI);
    ctx.fill();
}

// NEW: Store patterns in an array.
const backgroundPatterns = [drawCheckerboard, drawStripes, drawDots];
// NEW: Create new background options, each with an associated UI theme.
const backgroundOptions = [
    { 
        pattern: drawFlowers, 
        theme: { inputBg: "#ffb3ba", buttonBg: "#ffdfba", controlBg: "#ffb347", textColor: "#222" } 
    },
    { 
        pattern: drawAnimals, 
        theme: { inputBg: "#bae1ff", buttonBg: "#baffc9", controlBg: "#ffffba", textColor: "#222" } 
    },
    { 
        pattern: drawForest, 
        theme: { inputBg: "#d4f4dd", buttonBg: "#a2d5c6", controlBg: "#70a1d7", textColor: "#fff" } 
    },
    { 
        pattern: drawCity, 
        theme: { inputBg: "#ffe6e6", buttonBg: "#ffadad", controlBg: "#ff6b6b", textColor: "#222" } 
    },
    { 
        pattern: drawNight, 
        theme: { inputBg: "#d1c4e9", buttonBg: "#b39ddb", controlBg: "#9575cd", textColor: "#fff" } 
    }
];
let currentBackgroundOption = backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)];

// NEW: Global variable for current background pattern.
let currentBackgroundPattern = backgroundPatterns[Math.floor(Math.random() * backgroundPatterns.length)];

// NEW: Global variable for static background image.
let currentBackgroundImage = null;

// NEW: Helper function to create a static background image.
function createStaticBackground(patternFn, width, height) {
    const offScreen = document.createElement('canvas');
    offScreen.width = width;
    offScreen.height = height;
    const ctx = offScreen.getContext('2d');
    patternFn(ctx, width, height);
    return offScreen;
}

// Helper: update the background pattern on new word
function updateBackgroundPattern() {
    const option = backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)];
    currentBackgroundOption = option;
    updateUITheme(option.theme);
    // NEW: Generate static background image.
    currentBackgroundImage = createStaticBackground(option.pattern, canvasWidth, canvasHeight);
}

// NEW: Helper to update UI theme based on the selected background option.
function updateUITheme(theme) {
    document.getElementById('customText').style.background = theme.inputBg;
    document.getElementById('rotateBtn').style.background = theme.buttonBg;
    document.getElementById('randomBtn').style.background = theme.buttonBg;
    document.querySelector('.controls').style.background = theme.controlBg;
    const contrastColor = getContrastingColor(theme.inputBg);
    document.querySelectorAll('.controls input, .controls button').forEach(el => {
        el.style.color = contrastColor;
    });
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

// NEW: Helper function to compute a contrasting colour based on hex luminance.
function getContrastingColor(hex) {
    // Remove leading '#' if present.
    hex = hex.replace('#', '');
    if(hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substr(0,2), 16);
    const g = parseInt(hex.substr(2,2), 16);
    const b = parseInt(hex.substr(4,2), 16);
    // Calculate luminance.
    const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
    return (luminance > 0.7) ? "#000" : "#fff";
}

// NEW: Helper function to draw gear patterns on the stick.
function drawGearPattern(ctx, width, height) {
    const teethCount = 10;
    const toothWidth = width / teethCount;
    const toothHeight = height / 2;
    ctx.fillStyle = "#999";
    // Top gear teeth.
    for (let i = 0; i < teethCount; i++) {
        const x = -width / 2 + i * toothWidth;
        ctx.beginPath();
        ctx.moveTo(x, -height/2);
        ctx.lineTo(x + toothWidth / 2, -height/2 - toothHeight);
        ctx.lineTo(x + toothWidth, -height/2);
        ctx.closePath();
        ctx.fill();
    }
    // Bottom gear teeth.
    for (let i = 0; i < teethCount; i++) {
        const x = -width / 2 + i * toothWidth;
        ctx.beginPath();
        ctx.moveTo(x, height/2);
        ctx.lineTo(x + toothWidth / 2, height/2 + toothHeight);
        ctx.lineTo(x + toothWidth, height/2);
        ctx.closePath();
        ctx.fill();
    }
}

// Modified afterRender event to reintroduce background and draw gear-patterned stick.
Events.on(render, 'afterRender', function() {
    const ctx = render.context;
    // --- Draw background ---
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    if(currentBackgroundImage) {
        ctx.drawImage(currentBackgroundImage, 0, 0, canvasWidth, canvasHeight);
    }
    ctx.restore();
    
    ctx.save();
    // Translate to stick's position and apply its rotation.
    ctx.translate(stick.position.x, stick.position.y);
    ctx.rotate(stick.angle);
    
    // --- Draw stick with wood texture ---
    ctx.fillStyle = woodTexture ? woodTexture : "#555";
    ctx.fillRect(-currentStickWidth/2, -20, currentStickWidth, 40); // increased height from 20 to 40
    
    // --- Draw gear pattern overlay ---
    drawGearPattern(ctx, currentStickWidth, 40);
    
    // Draw pivot as a small blue circle.
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // --- Draw letters directly on the stick ---
    const letters = (customText || "avid").split('');
    const tileCount = letters.length;
    const totalGap = currentStickWidth * 0.1;
    const tileWidth = (currentStickWidth - totalGap) / tileCount;
    const gap = totalGap / (tileCount + 1);
    let startX = -currentStickWidth / 2 + gap;
    
    const colors = ["#ffeb3b", "#ff5722", "#ff9800"]; // bright pastel colors
    
    for (let i = 0; i < tileCount; i++) {
        ctx.save();
        const tileCenterX = startX + i * (tileWidth + gap) + tileWidth / 2;
        ctx.translate(tileCenterX, 0);
        ctx.rotate(-stick.angle);
        
        const fontSize = Math.floor(tileWidth / 2);
        ctx.fillStyle = colors[i % colors.length];
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold " + fontSize + "px Nunito"; // changed font to Nunito
        ctx.fillText(letters[i], 0, 0);
        
        // Add stroke to the letters
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.strokeText(letters[i], 0, 0);
        
        ctx.restore();
    }
    ctx.restore();
});

// Run the engine and renderer
const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);
Render.run(render);

// Update lastInteractionTime on user interaction events
function updateInteractionTime() {
    lastInteractionTime = Date.now();
}

window.addEventListener('DOMContentLoaded', () => {
    adjustStickSize();
    updateBackgroundPattern();
});
