// ...existing code...

// Ensure renderer is instantiated
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const renderer = new Renderer(canvas, ctx);

// Update score function with debug logging
function updateScore(newScore) {
    console.log("updateScore called with:", newScore);
    renderer.checkScoreThreshold(newScore);
    // ...existing score update logic...
}

// Debug: simulate score updates for testing the flash
setTimeout(() => {
    updateScore(10);
}, 1000);

setTimeout(() => {
    updateScore(20);
}, 3000);

setTimeout(() => {
    updateScore(50);
}, 5000);

// ...existing code...