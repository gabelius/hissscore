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
            // Handle different food types
            if (GameSystem.state.food.type === 'heart') {
                GameSystem.state.hearts = Math.min(GameSystem.state.hearts + 1, 3);  // Max 3 hearts
                SoundSystem.play('heart');  // Play heart collection sound
            } else {
                GameSystem.state.score += 10;
                SoundSystem.play('eat');    // Play regular food sound
            }
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
        const snake = GameSystem.state.snake[0];
        const food = GameSystem.state.food;
        if (!snake || !food) return null;
        
        // Generate all possible moves
        const possibleMoves = [
            { x: snake.x + 1, y: snake.y },
            { x: snake.x - 1, y: snake.y },
            { x: snake.x, y: snake.y + 1 },
            { x: snake.x, y: snake.y - 1 }
        ];
        
        // Filter safe moves
        const safeMoves = possibleMoves.filter(move => {
            // Wrap coordinates
            const wrappedMove = {
                x: (move.x + GAME.TILE_COUNT) % GAME.TILE_COUNT,
                y: (move.y + GAME.TILE_COUNT) % GAME.TILE_COUNT
            };
            
            // Check if move is safe (no collision with snake)
            return !this.checkCollision(wrappedMove);
        });

        // If no safe moves, try to find any move that doesn't kill immediately
        if (safeMoves.length === 0) {
            return possibleMoves.find(move => {
                const wrappedMove = {
                    x: (move.x + GAME.TILE_COUNT) % GAME.TILE_COUNT,
                    y: (move.y + GAME.TILE_COUNT) % GAME.TILE_COUNT
                };
                return !this.checkImmediateCollision(wrappedMove);
            });
        }

        // Find best move (closest to food)
        return safeMoves.reduce((best, move) => {
            const currentDist = Math.abs(move.x - food.x) + Math.abs(move.y - food.y);
            const bestDist = best ? Math.abs(best.x - food.x) + Math.abs(best.y - food.y) : Infinity;
            return currentDist < bestDist ? move : best;
        });
    },

    checkImmediateCollision(position) {
        // Only check head collision, not full snake
        return position.x === GameSystem.state.snake[0].x && 
               position.y === GameSystem.state.snake[0].y;
    },

    // Add these missing methods
    handleGameOver() {
        SoundSystem.play('die');
        this.clearInactivityTimer();
        // Remove mousemove listener to prevent auto-start after game over
        document.removeEventListener('mousemove', this.handleInactivity);
        
        const container = document.getElementById('gameContainer');
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        // ...overlay creation code from old WorldSystem...
    },

    checkCollision(position) {
        // Add proper collision detection without sound
        return GameSystem.state.snake.some(segment => 
            segment.x === position.x && segment.y === position.y
        );
    },

    handleCollision() {
        SoundSystem.play('hit');  // Only play hit sound when actually colliding
        this.clearInactivityTimer();
        // Remove mousemove listener to prevent auto-start after game over
        document.removeEventListener('mousemove', this.handleInactivity);
    },

    autoMove() {
        if (!GameSystem.state.isAutoMode) return;
        
        const nextMove = this.findPathToFood();
        if (nextMove) {
            const newDir = {
                x: Math.sign(nextMove.x - GameSystem.state.snake[0].x),
                y: Math.sign(nextMove.y - GameSystem.state.snake[0].y)
            };
            
            // Prevent opposite direction
            if ((newDir.x !== 0 && newDir.x !== -GameSystem.state.direction.x) ||
                (newDir.y !== 0 && newDir.y !== -GameSystem.state.direction.y)) {
                GameSystem.state.direction = newDir;
            }
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
