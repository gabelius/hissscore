// Create global game object first, before any imports
window.GAME = {
    canvas: null,
    ctx: null,
    TILE_SIZE: 20,
    TILE_COUNT: 20
};

import { GameSystem } from './systems/GameSystem.js';
import { GameWorldSystem } from './systems/GameWorldSystem.js';
import { RenderSystem } from './systems/RenderSystem.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize GAME object properties
        GAME.canvas = document.getElementById('gameCanvas');
        if (!GAME.canvas) throw new Error('Canvas element not found');
        
        GAME.ctx = GAME.canvas.getContext('2d');
        if (!GAME.ctx) throw new Error('Could not get canvas context');

        GAME.canvas.width = GAME.TILE_COUNT * GAME.TILE_SIZE;
        GAME.canvas.height = GAME.TILE_COUNT * GAME.TILE_SIZE;

        // Now initialize systems
        await GameSystem.init();
        GameWorldSystem.setupAutoMode();
        
        // Preload images with correct path
        const images = GameSystem.state.config.levels.map(level => {
            const img = new Image();
            img.src = level.background;
            return new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => {
                    console.error(`Failed to load image: ${level.background}`);
                    resolve(); // Continue even if image fails
                };
            });
        });
        
        await Promise.all(images);

        // Set up UI controls
        const startBtn = document.getElementById('startBtn');
        const autoBtn = document.getElementById('autoBtn');
        startBtn?.addEventListener('click', () => GameSystem.startGame());
        autoBtn?.addEventListener('click', () => GameSystem.toggleAutoMode());
        
        // Add speed button handler
        document.getElementById('speedBtn')?.addEventListener('click', () => {
            GameSystem.toggleSpeed();
        });

        // Set up game controls
        document.addEventListener('keydown', (e) => GameSystem.handleKeydown(e));
        GAME.canvas.addEventListener('touchstart', (e) => GameSystem.handleTouch(e));
        GAME.canvas.addEventListener('touchmove', (e) => GameSystem.handleTouch(e));

        // Start auto mode timer
        setTimeout(() => {
            if (!GameSystem.state.isGameStarted) {
                GameSystem.toggleAutoMode();
                GameSystem.startGame();
            }
        }, 5000);

        // Initial render
        GameSystem.state.snake = [{x: 10, y: 10}];
        GameWorldSystem.spawnFood();
        GameSystem.updateLevel();
        
        // Draw initial state
        RenderSystem.draw();

        console.log('Initial game state:', GameSystem.state);
        
    } catch (error) {
        console.error('Game initialization failed:', error);
    }
});
