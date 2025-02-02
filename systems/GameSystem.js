import { RenderSystem } from './RenderSystem.js';
import { PhysicsSystem } from './PhysicsSystem.js';
import { WorldSystem } from './WorldSystem.js';

export const GameState = {
    config: null,
    currentLevel: 1,
    snake: [{x: 10, y: 10}],
    food: null,
    direction: {x: 1, y: 0},
    score: 0,
    hearts: 3,
    isGameOver: false,
    isGameStarted: false,
    isAutoMode: false,
    isPaused: false,
    lastUpdate: 0,
    updateInterval: 150,
    startTime: null,
    currentSpeed: 1,
    maxSpeed: 3,
    baseInterval: 150
};

export const GameSystem = {
    async init() {
        const response = await fetch('config.yaml');
        const yamlText = await response.text();
        GameState.config = jsyaml.load(yamlText);
        this.setupGame();
    },

    setupGame() {
        this.resetGameState();
        RenderSystem.draw();
    },

    resetGameState() {
        Object.assign(GameState, {
            snake: [{x: 10, y: 10}],
            direction: {x: 1, y: 0},
            score: 0,
            hearts: 3,
            isGameOver: false,
            startTime: Date.now(),
            currentLevel: 1,
            updateInterval: GameState.baseInterval,
            currentSpeed: 1
        });
        WorldSystem.spawnFood();
    },

    gameLoop(timestamp) {
        if (GameState.isGameOver || GameState.isPaused) return;

        if (timestamp - GameState.lastUpdate > GameState.updateInterval) {
            if (GameState.isAutoMode && GameState.isGameStarted) {
                PhysicsSystem.autoMove();
            }
            this.updateGameState();
            RenderSystem.draw();
            GameState.lastUpdate = timestamp;
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    },

    updateGameState() {
        if (GameState.isGameOver || !GameState.isGameStarted) return;

        const nextHead = PhysicsSystem.getNextHeadPosition();
        if (PhysicsSystem.checkCollision(nextHead)) {
            this.handleCollision();
            return;
        }

        this.moveSnake(nextHead);
    },

    moveSnake(head) {
        GameState.snake.unshift(head);
        if (!WorldSystem.checkFoodCollision(head)) {
            GameState.snake.pop();
        }
    },

    handleCollision() {
        GameState.hearts--;
        if (GameState.hearts <= 0) {
            this.handleGameOver();
            return;
        }
        PhysicsSystem.respawnSnake();
    },

    handleGameOver() {
        GameState.isGameOver = true;
        document.dispatchEvent(new CustomEvent('gameOver', { 
            detail: { score: GameState.score } 
        }));
    }
};
