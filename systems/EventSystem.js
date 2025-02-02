import { GameSystem } from './GameSystem.js';

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

    // Remove theme handlers as they're now in ThemeSystem
    document.getElementById('themeToggle').removeEventListener('click');
    document.getElementById('colorMode').removeEventListener('change');

    // Keyboard controls
    document.addEventListener('keydown', (event) => {
        if (!GameSystem.state.isGameStarted || GameSystem.state.isGameOver) return;
        
        const directions = {
            'ArrowUp': {x: 0, y: -1},
            'ArrowDown': {x: 0, y: 1},
            'ArrowLeft': {x: -1, y: 0},
            'ArrowRight': {x: 1, y: 0},
            'w': {x: 0, y: -1},
            's': {x: 0, y: 1},
            'a': {x: -1, y: 0},
            'd': {x: 1, y: 0}
        };

        const newDir = directions[event.key];
        if (newDir) {
            GameSystem.state.direction = newDir;
            GameSystem.state.isAutoMode = false;
        }

        if (event.key === ' ') {
            GameSystem.togglePause();
        }
    });

    // Add touch controls
    let touchStart = null;
    document.addEventListener('touchstart', (e) => {
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    document.addEventListener('touchmove', (e) => {
        if (!touchStart) return;
        e.preventDefault();
        
        const touchEnd = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        const dx = touchEnd.x - touchStart.x;
        const dy = touchEnd.y - touchStart.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            GameSystem.state.direction = { x: Math.sign(dx), y: 0 };
        } else {
            GameSystem.state.direction = { x: 0, y: Math.sign(dy) };
        }
        
        touchStart = null;
    });
}
