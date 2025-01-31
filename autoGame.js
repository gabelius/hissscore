
import {
    GameState,
    MovementSystem,
    startGame
} from './coreGame.js';

// Auto Move Function
export function autoMove() {
    const head = GameState.snake[0];
    if (!GameState.food) return;
    
    // Direct path to food
    const directPath = {
        x: GameState.food.x - head.x,
        y: GameState.food.y - head.y
    };
    
    // Choose the largest distance to move in that direction
    if (Math.abs(directPath.x) > Math.abs(directPath.y)) {
        // Try moving horizontally
        const horizontalMove = { x: Math.sign(directPath.x), y: 0 };
        if (MovementSystem.isSafeMove(head, horizontalMove)) {
            GameState.direction = horizontalMove;
            return;
        }
        // If horizontal isn't safe, try vertical
        const verticalMove = { x: 0, y: Math.sign(directPath.y) };
        if (MovementSystem.isSafeMove(head, verticalMove)) {
            GameState.direction = verticalMove;
        }
    } else {
        // Try moving vertically
        const verticalMove = { x: 0, y: Math.sign(directPath.y) };
        if (MovementSystem.isSafeMove(head, verticalMove)) {
            GameState.direction = verticalMove;
            return;
        }
        // If vertical isn't safe, try horizontal
        const horizontalMove = { x: Math.sign(directPath.x), y: 0 };
        if (MovementSystem.isSafeMove(head, horizontalMove)) {
            GameState.direction = horizontalMove;
        }
    }
}

// Reset Inactivity Timer Function
export function resetInactivityTimer() {
    clearTimeout(GameState.inactivityTimer);

    // If autoStartDelay is 0, start immediately if not started
    if (!GameState.isGameStarted && (GameState.config?.game.autoStartDelay === 0)) {
        GameState.isAutoMode = true;
        document.getElementById('autoBtn').classList.add('active-mode');
        startGame();
        return;
    }

    // Otherwise, wait the specified delay
    if (!GameState.isGameStarted) {
        const delay = GameState.config?.game.autoStartDelay || 5000;
        GameState.inactivityTimer = setTimeout(() => {
            GameState.isAutoMode = true;
            document.getElementById('autoBtn').classList.add('active-mode');
            startGame();
        }, delay);
    }
}