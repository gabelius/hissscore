// Module aliases
const { Engine, Render, World, Bodies, Body, Constraint, Events, Mouse, MouseConstraint } = Matter;

// Create engine and world
const engine = Engine.create();
const world = engine.world;

// Set up renderer using the existing canvas
const canvas = document.getElementById("simulationCanvas");
const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: "#222"
    }
});

// Create the stick: a blue rectangle with pivot at its center
const pivot = { x: 400, y: 300 };
const stick = Bodies.rectangle(pivot.x, pivot.y, 200, 20, {
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

// Add mouse control for interaction
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: { stiffness: 0.2, render: { visible: false } }
});
World.add(world, mouseConstraint);
render.mouse = mouse;

// Variables to control input rotation
let isInteracting = false;

document.addEventListener('mousedown', () => { isInteracting = true; });
// Update mouseup to stop rotation immediately
document.addEventListener('mouseup', () => { isInteracting = false; Body.setAngularVelocity(stick, 0); });
document.addEventListener('touchstart', () => { isInteracting = true; });
// Update touchend to stop rotation immediately
document.addEventListener('touchend', () => { isInteracting = false; Body.setAngularVelocity(stick, 0); });

// Update stick rotation based on pointer position when interacting
document.addEventListener('mousemove', updateStickRotation);
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    updateStickRotation(e.touches[0]);
}, { passive: false });

function updateStickRotation(pointer) {
    if (!isInteracting) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = pointer.clientX - rect.left;
    const mouseY = pointer.clientY - rect.top;
    const targetAngle = Math.atan2(mouseY - pivot.y, mouseX - pivot.x);
    const currentAngle = stick.angle;
    const angleDiff = targetAngle - currentAngle;
    // Apply torque proportional to angle difference for smooth rotation
    Body.setAngularVelocity(stick, angleDiff * 0.2);
}

// Replace the existing afterRender event with the following:
Events.on(render, 'afterRender', function() {
    const context = render.context;
    context.save();
    // Translate to the stick's position and apply stick rotation
    context.translate(stick.position.x, stick.position.y);
    context.rotate(stick.angle);
    // Define letters and calculate spacing
    const letters = "SNAKE".split('');
    const tileSpacing = 200 / letters.length; // stick length divided by number of letters
    const startX = -((letters.length - 1) * tileSpacing) / 2;
    
    for (let i = 0; i < letters.length; i++) {
        context.save();
        // Move to each letter's fixed position on the stick
        const offsetX = startX + i * tileSpacing;
        context.translate(offsetX, 0);
        // Reverse rotation so tile is always upright
        context.rotate(-stick.angle);
        // Draw the letter; using white text for contrast on the blue stick
        context.fillStyle = "white";
        context.font = "20px sans-serif";
        const text = letters[i];
        const textWidth = context.measureText(text).width;
        context.fillText(text, -textWidth/2, 7);
        context.restore();
    }
    context.restore();
});

// Run the engine and renderer
Engine.run(engine);
Render.run(render);
