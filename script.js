// Create global game object first, before any imports
window.GAME = {
    canvas: null,
    ctx: null,
    TILE_SIZE: 20,
    TILE_COUNT: 20,
    isLoading: true,  // Add loading state
    assets: {         // Track asset loading
        images: new Map(),
        sounds: new Map(),
        config: null
    }
};

import { GameSystem } from './systems/GameSystem.js';
import { GameWorldSystem } from './systems/GameWorldSystem.js';
import { RenderSystem } from './systems/RenderSystem.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Setup loading indicator
        const container = document.getElementById('gameContainer');
        container.classList.add('loading');
        
        // Initialize canvas with error boundary
        await initializeCanvas();
        
        // Load and initialize systems
        await Promise.all([
            loadConfig(),
            preloadImages(),
            GameSystem.init()
        ]).then(() => {
            // Setup auto mode with proper cleanup
            GameWorldSystem.setupAutoMode();
            window.addEventListener('beforeunload', () => {
                GameWorldSystem.clearInactivityTimer();
            });
            
            // Start auto timer only if not started manually
            let autoStartTimer = setTimeout(() => {
                if (!GameSystem.state.isGameStarted) {
                    GameSystem.toggleAutoMode();
                    GameSystem.startGame();
                }
            }, 5000);
    
            // Clear auto timer if game starts manually
            document.getElementById('startBtn').addEventListener('click', () => {
                clearTimeout(autoStartTimer);
            });
    
            // Initial render and remove loading state
            RenderSystem.draw();
            container.classList.remove('loading');
            GAME.isLoading = false;
        });

    } catch (error) {
        handleInitError(error);
    }
});

// Helper functions (moved out of main scope)
async function initializeCanvas() {
    GAME.canvas = document.getElementById('gameCanvas');
    if (!GAME.canvas) throw new Error('Canvas element not found');
    
    GAME.ctx = GAME.canvas.getContext('2d');
    if (!GAME.ctx) throw new Error('Could not get canvas context');

    GAME.canvas.width = GAME.TILE_COUNT * GAME.TILE_SIZE;
    GAME.canvas.height = GAME.TILE_COUNT * GAME.TILE_SIZE;
}

async function loadConfig() {
    const response = await fetch('config.yaml');
    const yamlText = await response.text();
    GAME.assets.config = jsyaml.load(yamlText);
}

async function preloadImages() {
    const loadPromises = GameSystem.state.config.levels.map(level => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = level.background;
            img.onload = () => {
                GAME.assets.images.set(level.background, img);
                resolve();
            };
            img.onerror = reject;
        });
    });
    
    return Promise.all(loadPromises).catch(err => {
        console.warn('Some images failed to load:', err);
    });
}

function handleInitError(error) {
    const container = document.getElementById('gameContainer');
    container.classList.remove('loading');
    container.classList.add('error');
    container.innerHTML = `
        <div class="error-message">
            Failed to initialize game: ${error.message}<br>
            <button onclick="location.reload()">Retry</button>
        </div>
    `;
}
