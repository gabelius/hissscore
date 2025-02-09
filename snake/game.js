// ...existing code...

function onGameOver() {
    // Removed any alert call (e.g., alert("Game Over"));
    showGameOverOverlay();
    // ...other game over logic if needed...
}

function showGameOverOverlay() {
    const overlay = document.getElementById("gameOverOverlay");
    if (!overlay) return;
    overlay.innerText = "Game Over";
    overlay.style.display = "flex"; // centering overlay text
    // Hide overlay after 5 seconds and resume auto mode:
    setTimeout(() => {
        overlay.style.display = "none";
        startAutoMode();
    }, 5000);
}

function startAutoMode() {
    // Reset or clear any necessary game state before auto mode
    // ...reset game variables, clear timers, etc...
    autoModeStart(); // Call the function that handles auto mode logic
}

// New function to start auto mode
function autoModeStart() {
    // ...existing code for auto mode...
    // Example: reinitialize game state and start game loop in auto mode:
    initGame();           // resets game state
    startGameLoop(true);  // start the game loop with auto mode enabled
}

// Example placeholder functions (replace with your actual implementations)
function initGame() {
    // ...existing code to initialize game state...
}

function startGameLoop(autoMode) {
    // ...existing code to start game loop...
    // Use the autoMode flag to differentiate control logic if needed
}

// ...existing code...