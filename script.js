import { GameSystem } from './systems/GameSystem.js';
import { GameWorldSystem } from './systems/GameWorldSystem.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Create global game object
        window.GAME = {
            canvas: document.getElementById('gameCanvas'),
            ctx: null,
            TILE_SIZE: 20,
            TILE_COUNT: 20
        };

        // Ensure canvas exists before getting context
        if (!GAME.canvas) {
            throw new Error('Canvas element not found');
        }

        GAME.ctx = GAME.canvas.getContext('2d');
        GAME.canvas.width = GAME.canvas.height = GAME.TILE_COUNT * GAME.TILE_SIZE;

        // Initialize game systems
        await GameSystem.init();
        GameWorldSystem.setupAutoMode();
        
        // Set up UI controls
        const startBtn = document.getElementById('startBtn');
        const autoBtn = document.getElementById('autoBtn');
        startBtn?.addEventListener('click', () => GameSystem.startGame());
        autoBtn?.addEventListener('click', () => GameSystem.toggleAutoMode());
        
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
        
        console.log('Game initialized:', GameSystem.state);
        
    } catch (error) {
        console.error('Game initialization failed:', error);
    }
});
