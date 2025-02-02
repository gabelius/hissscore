import { GameSystem } from './GameSystem.js';

export const GameWorldSystem = {
    // Physics methods
    getNextHeadPosition() {
        const head = GameSystem.state.snake[0];
        return {
            x: (head.x + GameSystem.state.direction.x + GAME.TILE_COUNT) % GAME.TILE_COUNT,
            y: (head.y + GameSystem.state.direction.y + GAME.TILE_COUNT) % GAME.TILE_COUNT
        };
    },

    moveSnake(head) {
        // ...existing snake code...
    },

    // World management
    spawnFood() {
        const spawnHeart = GameSystem.state.hearts < 3 && Math.random() < 0.3;
        do {
            GameSystem.state.food = {
                x: Math.floor(Math.random() * GAME.TILE_COUNT),
                y: Math.floor(Math.random() * GAME.TILE_COUNT),
                type: spawnHeart ? 'heart' : 'apple'
            };
        } while(GameSystem.state.snake.some(s => 
            s.x === GameSystem.state.food.x && s.y === GameSystem.state.food.y));
    },

    // Auto features
    setupAutoMode() {
        document.addEventListener('mousemove', this.handleInactivity.bind(this));
    },

    handleInactivity() {
        // Fixed inactivity timer (removed duplicate event listener)
        clearTimeout(this.inactivityTimer);
        if (!GameSystem.state.isGameStarted) {
            this.inactivityTimer = setTimeout(() => {
                GameSystem.toggleAutoMode();
            }, 5000);
        }
    },

    // Pathfinding for auto mode
    findPathToFood() {
        // ...existing pathfinding code...
    },

    // Add these missing methods
    handleGameOver() {
        const container = document.getElementById('gameContainer');
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        // ...overlay creation code from old WorldSystem...
    },

    checkCollision(position) {
        // Add proper collision detection
        return GameSystem.state.snake.some(segment => 
            segment.x === position.x && segment.y === position.y
        );
    },

    autoMove() {
        const path = this.findPathToFood(GameSystem.state.snake[0], GameSystem.state.food);
        if (path && path.length > 0) {
            const nextMove = path[0];
            GameSystem.state.direction = {
                x: Math.sign(nextMove.x - GameSystem.state.snake[0].x),
                y: Math.sign(nextMove.y - GameSystem.state.snake[0].y)
            };
        }
    },

    respawnSnake() {
        GameSystem.state.snake = [{x: 10, y: 10}];
        GameSystem.state.direction = {x: 1, y: 0};
    }
};
