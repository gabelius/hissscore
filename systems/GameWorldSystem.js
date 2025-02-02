import { GameSystem } from './GameSystem.js';
import { SoundSystem } from './SoundSystem.js';

export const GameWorldSystem = {
    // Physics methods
    getNextHeadPosition() {
        const head = GameSystem.state.snake[0];
        const nextHead = {
            x: head.x + GameSystem.state.direction.x,
            y: head.y + GameSystem.state.direction.y
        };

        // Handle wrapping around screen edges
        nextHead.x = (nextHead.x + GAME.TILE_COUNT) % GAME.TILE_COUNT;
        nextHead.y = (nextHead.y + GAME.TILE_COUNT) % GAME.TILE_COUNT;

        return nextHead;
    },

    moveSnake(nextHead) {
        // Add new head to front of snake
        GameSystem.state.snake.unshift({...nextHead});
        
        // Check if snake ate food
        if (this.checkFoodCollision(nextHead)) {
            GameSystem.state.score += 10;
            SoundSystem.play('eat');
            this.spawnFood();
        } else {
            // Remove tail if no food eaten
            GameSystem.state.snake.pop();
        }
    },

    checkFoodCollision(position) {
        const food = GameSystem.state.food;
        if (!food) return false;
        return position.x === food.x && position.y === food.y;
    },

    // World management
    spawnFood() {
        if (!window.GAME) {
            console.error('GAME object not initialized');
            return;
        }

        const spawnHeart = GameSystem.state.hearts < 3 && Math.random() < 0.3;
        let x, y;
        do {
            x = Math.floor(Math.random() * GAME.TILE_COUNT);
            y = Math.floor(Math.random() * GAME.TILE_COUNT);
        } while(GameSystem.state.snake.some(s => s.x === x && s.y === y));

        GameSystem.state.food = {
            x, y,
            type: spawnHeart ? 'heart' : 'apple'
        };
    },

    // Auto features
    setupAutoMode() {
        this.clearInactivityTimer();
        document.addEventListener('mousemove', this.handleInactivity.bind(this));
    },

    clearInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
    },

    handleInactivity() {
        this.clearInactivityTimer();
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
        SoundSystem.play('die');
        const container = document.getElementById('gameContainer');
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        // ...overlay creation code from old WorldSystem...
    },

    checkCollision(position) {
        // Add proper collision detection
        const hasCollision = GameSystem.state.snake.some(segment => 
            segment.x === position.x && segment.y === position.y
        );
        if (hasCollision) {
            SoundSystem.play('hit');
        }
        return hasCollision;
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

    getSnakeColor() {
        const currentLevel = GameSystem.state.config?.levels[GameSystem.state.currentLevel - 1];
        return currentLevel?.snakeColors?.[0] || '#4CAF50';
    },

    respawnSnake() {
        GameSystem.state.snake = [{x: 10, y: 10}];
        GameSystem.state.direction = {x: 1, y: 0};
        // Clear any pending inactivity timer
        this.clearInactivityTimer();
    }
};
