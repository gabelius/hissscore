import { RenderSystem } from './RenderSystem.js';
import { GameWorldSystem } from './GameWorldSystem.js';
import { SoundSystem } from './SoundSystem.js';

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
        try {
            // Load config first
            const response = await fetch('config.yaml');
            const yamlText = await response.text();
            this.state.config = jsyaml.load(yamlText);
            
            // Initialize sound system
            SoundSystem.init();
            
            // Initialize state
            this.resetGameState();
            
            // Spawn initial food
            GameWorldSystem.spawnFood();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initial render
            RenderSystem.draw();
            
            console.log('Game initialized with state:', this.state);
        } catch (error) {
            console.error('Init failed:', error);
            throw error;
        }
    },

    setupEventListeners() {
        // Game controls
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Button controls
        const startBtn = document.getElementById('startBtn');
        const autoBtn = document.getElementById('autoBtn');
        
        startBtn?.addEventListener('click', () => {
            this.startGame();
            startBtn.classList.add('active-mode');
        });
        
        autoBtn?.addEventListener('click', () => {
            this.toggleAutoMode();
            autoBtn.classList.toggle('active-mode');
        });
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

    startGame() {
        console.log('Starting game');
        if (this.state.isGameStarted) return;
        
        // Clear any pending auto-start timers
        if (GameWorldSystem.inactivityTimer) {
            clearTimeout(GameWorldSystem.inactivityTimer);
        }
        
        this.state.isGameStarted = true;
        this.state.isPaused = false;
        this.state.startTime = Date.now();
        this.state.lastUpdate = performance.now();
        
        // Ensure initial state
        this.state.snake = [{x: 10, y: 10}];
        this.state.direction = {x: 1, y: 0};
        
        // Start game loop
        requestAnimationFrame(this.gameLoop.bind(this));
        console.log('Game started:', this.state);
    },

    gameLoop(timestamp) {
        if (!this.state.isGameStarted || this.state.isGameOver || this.state.isPaused) {
            requestAnimationFrame(this.gameLoop.bind(this));
            return;
        }

        if (timestamp - this.state.lastUpdate >= this.state.updateInterval) {
            console.log('Game tick', this.state.direction);
            
            // Update snake position
            const nextHead = GameWorldSystem.getNextHeadPosition();
            
            // Check collision with self
            if (GameWorldSystem.checkCollision(nextHead)) {
                this.handleCollision();
            } else {
                GameWorldSystem.moveSnake(nextHead);
            }
            
            // Draw updated state
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
        // Remove speedIndicator update
        document.getElementById('speedBtn').setAttribute('data-speed', this.state.currentSpeed);
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
        if (!this.state.isGameStarted || this.state.isGameOver || this.state.isAutoMode) return;
        
        const keyActions = {
            'ArrowLeft': {x: -1, y: 0},
            'ArrowRight': {x: 1, y: 0},
            'ArrowUp': {x: 0, y: -1},
            'ArrowDown': {x: 0, y: 1},
            'a': {x: -1, y: 0},
            'd': {x: 1, y: 0},
            'w': {x: 0, y: -1},
            's': {x: 0, y: 1}
        };

        const newDir = keyActions[event.key.toLowerCase()];
        if (newDir) {
            // Prevent moving in opposite direction
            const isOppositeDirection = 
                (newDir.x !== 0 && newDir.x === -this.state.direction.x) ||
                (newDir.y !== 0 && newDir.y === -this.state.direction.y);
            
            if (!isOppositeDirection) {
                this.state.direction = newDir;
                event.preventDefault();
            }
        }
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
    },

    toggleMute() {
        SoundSystem.toggleMute(); // Update to use SoundSystem's mute state
        document.getElementById('muteBtn')?.classList.toggle('active-mode');
        document.getElementById('muteBtn').textContent = SoundSystem.isMuted ? '🔇' : '🔊';
    },
};

// Export state for legacy compatibility
export const GameState = GameSystem.state;
