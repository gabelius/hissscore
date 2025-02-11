// Matter.js Setup
const { Engine, Render, World, Bodies, Mouse, MouseConstraint, Composite, Body } = Matter;

const engine = Engine.create();
const world = engine.world;
const canvasWidth = 800;
const canvasHeight = 600;

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: canvasWidth,
    height: canvasHeight,
    wireframes: false,
  },
});

// Add a ground, a wall, and a rotating stick
const ground = Bodies.rectangle(canvasWidth / 2, canvasHeight - 50, canvasWidth, 100, { isStatic: true });
const wall = Bodies.rectangle(200, 400, 20, 200, { isStatic: true }); // Wall on the left side
const stick = Bodies.rectangle(400, 300, 400, 20, { angle: Math.PI / 4, friction: 0.05, inertia: Infinity });

// Create a composite to group the letters with the stick
let letterComposite = Composite.create();

// Add mouse control
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.1,
    render: {
      visible: false,
    },
  },
});

World.add(world, [ground, wall, stick, mouseConstraint]);

// Create letters based on input
function createLetters(word, x, y) {
  let letters = [];
  for (let i = 0; i < word.length; i++) {
    // Position each letter relative to the initial stick's position
    let letter = Bodies.rectangle(x + i * 30, y, 30, 30, { isStatic: true });
    letters.push(letter);
    Composite.add(letterComposite, letter);
  }
  return letters;
}

// Add letter update logic
function updateLetters() {
  let word = "diva"; // Your word here

  // Remove previous letters and add the new ones to the composite
  Composite.clear(letterComposite, false);
  let letters = createLetters(word, stick.position.x - 60, stick.position.y - 20);
  letters.forEach((letter, index) => {
    // Keep letters stationary, they don't move with the stick
    Matter.Body.setPosition(letter, {
      x: stick.position.x + index * 30 - 60,
      y: stick.position.y - 20,
    });
    // Don't change the letter's rotation, so they stay aligned
    Matter.Body.setAngle(letter, 0);
    Composite.add(letterComposite, letter);
  });
}

// Mouse interaction states
let isMousePressed = false;
let lastMouseX = 0;
let lastMouseY = 0;
let dampingFactor = 0.05;

// Mouse down event
render.canvas.addEventListener('mousedown', (e) => {
  isMousePressed = true;
});

// Mouse up event
render.canvas.addEventListener('mouseup', (e) => {
  isMousePressed = false;
});

// Mouse move event
render.canvas.addEventListener('mousemove', (e) => {
  if (!isMousePressed) return; // Only rotate the stick if mouse is pressed

  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // Update stick rotation based on mouse position
  let deltaX = mouseX - stick.position.x;
  let deltaY = mouseY - stick.position.y;
  let angle = Math.atan2(deltaY, deltaX);

  // Apply damping to slow down rotation
  if (Math.abs(mouseX - lastMouseX) > 0 || Math.abs(mouseY - lastMouseY) > 0) {
    // Set the stick's angle based on mouse position
    Matter.Body.setAngle(stick, angle);
  } else {
    // Apply damping
    let currentAngle = stick.angle;
    let diff = angle - currentAngle;

    // Normalize the angle difference
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;

    // Apply damping to gradually stop the rotation
    Matter.Body.setAngle(stick, currentAngle + diff * dampingFactor);
  }

  lastMouseX = mouseX;
  lastMouseY = mouseY;
  updateLetters();
});

// Run the engine and renderer
Engine.run(engine);
Render.run(render);

// Initially add letters
updateLetters();