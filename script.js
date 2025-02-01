import { initializeGame } from './coreGame.js';
import { autoMove, resetInactivityTimer } from './autoGame.js';

// Initialize GAME object
window.GAME = {
    canvas: document.getElementById('gameCanvas'),
    ctx: document.getElementById('gameCanvas').getContext('2d'),
    TILE_SIZE: 20,
    TILE_COUNT: 20
};

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    resetInactivityTimer();
});
