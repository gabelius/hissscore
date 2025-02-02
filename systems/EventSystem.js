import { GameSystem } from './GameSystem.js';
import { GameWorldSystem } from './GameWorldSystem.js';

export function setupEventListeners() {
    // Game controls
    document.getElementById('startBtn').addEventListener('click', () => {
        if (!GameSystem.state.isGameStarted) {
            GameSystem.startGame();
        } else {
            GameSystem.togglePause();
        }
    });

    document.getElementById('autoBtn').addEventListener('click', (e) => {
        e.target.classList.toggle('active-mode');
        GameSystem.toggleAutoMode();
    });

    document.getElementById('speedBtn').addEventListener('click', (e) => {
        GameSystem.toggleSpeed();
        e.target.setAttribute('data-speed', GameSystem.state.currentSpeed);
    });

    document.getElementById('muteBtn').addEventListener('click', (e) => {
        GameSystem.toggleMute();
        e.target.textContent = GameSystem.state.isMuted ? '🔇' : '🔊';
    });

    // Remove theme handlers as they're now in ThemeSystem
    document.getElementById('themeToggle').removeEventListener('click');
    document.getElementById('colorMode').removeEventListener('change');

    // Remove duplicate keyboard controls, now handled in GameSystem
    document.addEventListener('keydown', (event) => {
        if (event.key === ' ') {
            GameSystem.togglePause();
        }
    });

    // Improved touch controls
    let touchStart = null;
    let minSwipeDistance = 30; // Minimum distance for a swipe

    document.addEventListener('touchstart', (e) => {
        if (!GameSystem.state.isGameStarted || GameSystem.state.isGameOver || GameSystem.state.isPaused) return;
        e.preventDefault();
        touchStart = { 
            x: e.touches[0].clientX, 
            y: e.touches[0].clientY 
        };
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (!touchStart || GameSystem.state.isAutoMode) return;
        e.preventDefault();
        
        const touchEnd = { 
            x: e.touches[0].clientX, 
            y: e.touches[0].clientY 
        };
        
        const dx = touchEnd.x - touchStart.x;
        const dy = touchEnd.y - touchStart.y;
        
        // Only change direction if swipe is long enough
        if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) return;

        // Determine swipe direction
        if (Math.abs(dx) > Math.abs(dy)) {
            const newDir = { x: Math.sign(dx), y: 0 };
            // Prevent opposite direction
            if (newDir.x !== -GameSystem.state.direction.x) {
                GameSystem.state.direction = newDir;
                GameSystem.state.isAutoMode = false;
            }
        } else {
            const newDir = { x: 0, y: Math.sign(dy) };
            // Prevent opposite direction
            if (newDir.y !== -GameSystem.state.direction.y) {
                GameSystem.state.direction = newDir;
                GameSystem.state.isAutoMode = false;
            }
        }
        
        touchStart = null;
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        touchStart = null;
    });

    // Add cleanup for game over
    document.addEventListener('gameOver', () => {
        GameWorldSystem.clearInactivityTimer();
    });
}
