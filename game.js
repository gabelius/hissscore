import { Systems } from './systems.js';

// Initialize global game object
window.GAME = {
    canvas: null,
    ctx: null,
    TILE_SIZE: 20,
    TILE_COUNT: 20,
    isLoading: true,
    assets: {
        images: new Map(),
        sounds: new Map(),
        config: null
    }
};

// Game initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const container = document.getElementById('gameContainer');
        container.classList.add('loading');
        
        await Promise.all([
            loadConfig(),
            initializeCanvas(),
            preloadImages()
        ]);

        await Systems.init();
        startGameLoop();
        setupAutoStart();

        container.classList.remove('loading');
        GAME.isLoading = false;

    } catch (error) {
        handleInitError(error);
    }
});

function startGameLoop() {
    function gameLoop(timestamp) {
        if (Systems.GameSystem.state.isGameStarted) {
            Systems.GameSystem.update(timestamp);
            Systems.RenderSystem.draw();
        }
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}

function setupAutoStart() {
    const autoStartTimer = setTimeout(() => {
        if (!Systems.GameSystem.state.isGameStarted) {
            Systems.GameSystem.toggleAutoMode();
            Systems.GameSystem.startGame();
        }
    }, 5000);

    document.getElementById('startBtn').addEventListener('click', () => {
        clearTimeout(autoStartTimer);
    });
}

// Helper functions
async function initializeCanvas() {
    // ...existing initializeCanvas code...
}

async function loadConfig() {
    // ...existing loadConfig code...
}

async function preloadImages() {
    // ...existing preloadImages code...
}

function handleInitError(error) {
    // ...existing handleInitError code...
}

export { GAME };
