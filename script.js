import { initializeGame } from './coreGame.js';
import { resetInactivityTimer } from './autoGame.js';
import { ThemeEngine } from './themeEngine.js';

// Wait for document load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // First initialize GAME object
        window.GAME = {
            canvas: document.getElementById('gameCanvas'),
            ctx: document.getElementById('gameCanvas').getContext('2d'),
            TILE_SIZE: 20,
            TILE_COUNT: 20
        };

        // Then initialize systems in order
        await ThemeEngine.init();
        await initializeGame();
        resetInactivityTimer();

        // Setup global interaction handlers
        document.addEventListener('click', resetInactivityTimer);
        document.addEventListener('keydown', resetInactivityTimer);
        document.addEventListener('touchstart', resetInactivityTimer);

        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});
