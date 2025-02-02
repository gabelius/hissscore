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
        const container = document.getElementById('gameContainer');
        container.classList.add('loading');
        
        // First load config
        await loadConfig();
        
        // Then initialize canvas and preload images
        await initializeCanvas();
        await preloadImages();
        
        // Finally initialize game system
        await GameSystem.init();
        
        // Setup auto mode and cleanup
        GameWorldSystem.setupAutoMode();
        
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

    } catch (error) {
        console.error('Game initialization failed:', error);
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
    const config = jsyaml.load(yamlText);
    if (!config || !config.levels) {
        throw new Error('Invalid config file: missing levels');
    }
    GAME.assets.config = config;
    return config;
}

async function preloadImages() {
    if (!GAME.assets.config || !GAME.assets.config.levels) {
        throw new Error('Config must be loaded before preloading images');
    }
    
    const loadPromises = GAME.assets.config.levels.map(level => {
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
    
    // More detailed error message
    const errorDetails = error.message.includes('404') ? 
        'Missing required files. Please check assets directory structure.' : 
        error.message;
    
    container.innerHTML = `
        <div class="error-message">
            <p>Failed to initialize game:</p>
            <p>${errorDetails}</p>
            <button onclick="location.reload()">Retry</button>
        </div>
    `;
    console.error('Initialization error:', error);
}
