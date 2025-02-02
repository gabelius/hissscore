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
            const newDir = { x: Math.sign(dx), y: 0 };
            // Prevent opposite direction
            if (newDir.x !== -GameSystem.state.direction.x) {
                GameSystem.state.direction = newDir;
            }
        } else {
            const newDir = { x: 0, y: Math.sign(dy) };
            // Prevent opposite direction
            if (newDir.y !== -GameSystem.state.direction.y) {
                GameSystem.state.direction = newDir;
            }
        }
        
        touchStart = null;
    });
}
