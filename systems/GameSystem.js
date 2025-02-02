import { RenderSystem } from './RenderSystem.js';
import { GameWorldSystem } from './GameWorldSystem.js';

// Combine GameState directly into GameSystem
export const GameSystem = {
    state: {
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
        baseInterval: 150,
        speedLevels: [1, 1.5, 2, 2.5, 3],
        currentSpeedIndex: 0,
    },

    async init() {
        const response = await fetch('config.yaml');
        const yamlText = await response.text();
        this.state.config = jsyaml.load(yamlText);
        this.setupGame();
        RenderSystem.setupThemes();
    },

    setupGame() {
        this.resetGameState();
        GameWorldSystem.spawnFood();  // Fix: Was using WorldSystem
        RenderSystem.draw();
    },

    resetGameState() {
        Object.assign(this.state, {
            snake: [{x: 10, y: 10}],
            direction: {x: 1, y: 0},
            score: 0,
            hearts: 3,
            isGameOver: false,
            startTime: Date.now(),
            currentLevel: 1,
            updateInterval: this.state.baseInterval,
            currentSpeed: 1
        });
    },

    gameLoop(timestamp) {
        if (this.state.isGameOver || this.state.isPaused) return;
        
        if (timestamp - this.state.lastUpdate > this.state.updateInterval) {
            if (this.state.isAutoMode && this.state.isGameStarted) {
                PhysicsSystem.autoMove();
            }
            this.updateGameState();
            RenderSystem.draw();
            this.state.lastUpdate = timestamp;
        }
        
        requestAnimationFrame(this.gameLoop.bind(this));
    },

    updateGameState() {
        if (!this.state.isGameStarted || this.state.isGameOver) return;

        const nextHead = GameWorldSystem.getNextHeadPosition();
        if (GameWorldSystem.checkCollision(nextHead)) {
            this.handleCollision();
            return;
        }

        GameWorldSystem.moveSnake(nextHead);
    },

    handleCollision() {
        this.state.hearts--;
        if (this.state.hearts <= 0) {
            this.handleGameOver();
            return;
        }
        GameWorldSystem.respawnSnake(); // Fix reference
    },

    handleGameOver() {
        this.state.isGameOver = true;
        GameWorldSystem.handleGameOver();  // Fix: Was using WorldSystem
    },

    startGame() {
        this.state.isGameStarted = true;
        this.state.isPaused = false;
        this.state.startTime = Date.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    },

    togglePause() {
        this.state.isPaused = !this.state.isPaused;
        if (!this.state.isPaused) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    },

    toggleAutoMode() {
        if (!this.state.isGameStarted) {
            this.startGame();
        }
        this.state.isAutoMode = !this.state.isAutoMode;
    },

    toggleSpeed() {
        this.state.currentSpeedIndex = (this.state.currentSpeedIndex + 1) % this.state.speedLevels.length;
        this.state.currentSpeed = this.state.speedLevels[this.state.currentSpeedIndex];
        this.state.updateInterval = this.state.baseInterval / this.state.currentSpeed;
        document.getElementById('speedIndicator').textContent = this.state.currentSpeed + 'x';
    },

    updateLevel() {
        document.getElementById('levelNumber').textContent = this.state.currentLevel;
        const level = this.state.config?.levels[this.state.currentLevel - 1];
        if (level) {
            document.getElementById('levelName').textContent = level.name;
            document.body.style.backgroundImage = `url('assets/${level.background}')`;
        }
    },

    // Event handlers
    handleKeydown(event) {
        // Move keyboard controls here from EventSystem
        if (!this.state.isGameStarted || this.state.isGameOver) return;
        // ...existing keyboard control code...
    },

    handleTouch(e) {
        // Move touch controls here from EventSystem
        // ...existing touch control code...
    },

    handleInput() {
        // ...keyboard and touch controls...
    },

    handleThemes() {
        // ...theme handling...
    },

    handleAutoMode() {
        // ...auto mode logic...
    }
};

// Export state for legacy compatibility
export const GameState = GameSystem.state;
