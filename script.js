import { GameSystem } from './systems/GameSystem.js';
import { GameWorldSystem } from './systems/GameWorldSystem.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.GAME = {
            canvas: document.getElementById('gameCanvas'),
            ctx: document.getElementById('gameCanvas').getContext('2d'),
            TILE_SIZE: 20,
            TILE_COUNT: 20
        };
        
        GAME.canvas.width = GAME.canvas.height = 400;
        await GameSystem.init();
        GameWorldSystem.setupAutoMode();
        
        // Add event handlers
        document.addEventListener('keydown', GameSystem.handleKeydown.bind(GameSystem));
        document.addEventListener('touchstart', GameSystem.handleTouch.bind(GameSystem));
        document.addEventListener('touchmove', GameSystem.handleTouch.bind(GameSystem));
        
        // Preload images
        const images = GameSystem.state.config.levels.map(level => {
            const img = new Image();
            img.src = level.background;
            return img;
        });
        
        await Promise.all(images.map(img => 
            new Promise(resolve => img.onload = resolve)
        ));
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});
