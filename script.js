import { initializeGame } from './coreGame.js';
import { resetInactivityTimer } from './autoGame.js';
import { ThemeEngine } from './themeEngine.js';

// Initialize GAME object
window.GAME = {
    canvas: document.getElementById('gameCanvas'),
    ctx: document.getElementById('gameCanvas').getContext('2d'),
    TILE_SIZE: 20,
    TILE_COUNT: 20
};

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    ThemeEngine.init();
    initializeGame();
    resetInactivityTimer();

    // Reset inactivity timer on any user interaction
    document.addEventListener('click', resetInactivityTimer);
    document.addEventListener('keydown', resetInactivityTimer);
    document.addEventListener('touchstart', resetInactivityTimer);
});
