import { GameState } from './systems/GameState.js';
import { setupEventListeners } from './systems/EventSystem.js';
import { ThemeEngine } from './themeEngine.js';
import { resetInactivityTimer } from './autoGame.js';

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize GAME object
        window.GAME = {
            canvas: document.getElementById('gameCanvas'),
            ctx: document.getElementById('gameCanvas').getContext('2d'),
            TILE_SIZE: 20,
            TILE_COUNT: 20
        };

        // Load config
        const response = await fetch('config.yaml');
        const yamlText = await response.text();
        GameState.config = jsyaml.load(yamlText);

        // Initialize systems
        ThemeEngine.init();
        setupEventListeners();
        resetInactivityTimer();

        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});
