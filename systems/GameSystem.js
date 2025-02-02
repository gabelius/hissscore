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
            // Use already loaded config
            this.state.config = GAME.assets.config;
            if (!this.state.config) {
                throw new Error('Config not loaded');
            }
            
            // Initialize sound system
            await SoundSystem.init().catch(err => {
                console.warn('Sound system failed to initialize:', err);
                // Continue without sound rather than failing completely
            });
            
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
        // Clear all event listeners first
        this.clearEventListeners();
        
        // Reset state
        Object.assign(this.state, {
            snake: [{x: 10, y: 10}],
            direction: {x: 1, y: 0},
            score: 0,
            hearts: 3,
            isGameOver: false,
            isAutoMode: false,  // Add this
            isPaused: false,    // Add this
            startTime: Date.now(),
            currentLevel: 1,
            updateInterval: this.state.baseInterval,
            currentSpeed: 1,
            currentSpeedIndex: 0  // Add this
        });

        // Reset UI elements
        this.resetUI();
        
        // Reattach event listeners
        this.setupEventListeners();
    },

    clearEventListeners() {
        document.removeEventListener('keydown', this.handleKeydown);
        document.removeEventListener('touchstart', this.handleTouch);
        document.removeEventListener('touchmove', this.handleTouch);
        document.removeEventListener('touchend', this.handleTouch);
        document.removeEventListener('mousemove', GameWorldSystem.handleInactivity);
    },

    resetUI() {
        // Reset all button states
        ['startBtn', 'autoBtn', 'speedBtn', 'muteBtn'].forEach(id => {
            document.getElementById(id)?.classList.remove('active-mode');
        });
        document.getElementById('speedBtn').setAttribute('data-speed', '1');
        document.getElementById('hearts').textContent = '❤'.repeat(this.state.hearts);
        document.getElementById('score').textContent = '0';
        document.getElementById('timer').textContent = '0';
    },

    startGame() {
        if (this.state.isGameStarted) return;
        
        // Reset all systems first
        this.resetGameState();
        GameWorldSystem.clearInactivityTimer();
        
        this.state.isGameStarted = true;
        this.state.isPaused = false;
        this.state.startTime = Date.now();
        this.state.lastUpdate = performance.now();
        
        // Update UI
        document.getElementById('startBtn').classList.add('active-mode');
        document.getElementById('autoBtn').classList.remove('active-mode');
        
        // Start game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    },

    gameLoop(timestamp) {
        if (!this.state.isGameStarted || this.state.isGameOver || this.state.isPaused) {
            requestAnimationFrame(this.gameLoop.bind(this));
            return;
        }

        if (timestamp - this.state.lastUpdate >= this.state.updateInterval) {
            // Add auto mode movement
            if (this.state.isAutoMode) {
                GameWorldSystem.autoMove();
            }

            const nextHead = GameWorldSystem.getNextHeadPosition();
            if (GameWorldSystem.checkCollision(nextHead)) {
                this.handleCollision();
            } else {
                GameWorldSystem.moveSnake(nextHead);
            }
            
            // Update level if needed
            this.checkLevelProgression();
            
            RenderSystem.draw();
            this.state.lastUpdate = timestamp;
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    },

    checkLevelProgression() {
        if (this.state.isAutoMode) return; // Don't progress levels in auto mode
        
        const currentLevel = this.state.config?.levels[this.state.currentLevel - 1];
        if (currentLevel && this.state.score >= currentLevel.scoreThreshold) {
            this.state.currentLevel = Math.min(this.state.currentLevel + 1, this.state.config.levels.length);
            this.updateLevel();
        }
    },

    updateGameState() {
        if (!this.state.isGameStarted || this.state.isGameOver) return;

        // Remove duplicate level check and combine with checkLevelProgression
        this.checkLevelProgression();

        const nextHead = GameWorldSystem.getNextHeadPosition();
        if (GameWorldSystem.checkCollision(nextHead)) {
            this.handleCollision();
            return;
        }

        GameWorldSystem.moveSnake(nextHead);
    },

    updateGameSpeed() {
        // Improve speed scaling
        const levelBonus = Math.min((this.state.currentLevel - 1) * 0.15, 1.0); // Increased scaling
        const baseSpeed = this.state.speedLevels[this.state.currentSpeedIndex];
        const finalSpeed = Math.min(baseSpeed + levelBonus, this.state.maxSpeed);
        
        this.state.currentSpeed = finalSpeed;
        this.state.updateInterval = this.state.baseInterval / finalSpeed;
        document.getElementById('speedBtn').setAttribute('data-speed', finalSpeed.toFixed(1));
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
        this.state.isAutoMode = false;
        
        // Clean up systems
        GameWorldSystem.handleGameOver();
        document.getElementById('autoBtn').classList.remove('active-mode');
        document.removeEventListener('mousemove', GameWorldSystem.handleInactivity);
        
        // Play sound
        SoundSystem.play('die');
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
        
        // Add proper state cleanup
        if (this.state.isAutoMode) {
            GameWorldSystem.clearInactivityTimer();
            document.getElementById('autoBtn').classList.remove('active-mode');
        } else {
            document.getElementById('autoBtn').classList.add('active-mode');
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
        const level = this.state.config?.levels[this.state.currentLevel - 1];
        if (level) {
            // Update UI
            document.getElementById('levelNumber').textContent = this.state.currentLevel;
            document.getElementById('levelName').textContent = level.name;
            document.body.style.backgroundImage = `url('assets/${level.background}')`;
            
            // Update game speed based on level
            this.state.currentSpeed = this.state.speedLevels[
                Math.min(this.state.currentLevel - 1, this.state.speedLevels.length - 1)
            ];
            this.state.updateInterval = this.state.baseInterval / this.state.currentSpeed;
            
            // Update speed button
            document.getElementById('speedBtn').setAttribute('data-speed', this.state.currentSpeed);
        }
    },

    // Event handlers
    handleKeydown(event) {
        // Allow space key in auto mode
        if (event.key === ' ') {
            this.togglePause();
            return;
        }

        if (!this.state.isGameStarted || this.state.isGameOver || 
            this.state.isPaused || (this.state.isAutoMode && event.key !== ' ')) return;

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
        if (!this.state.isGameStarted || this.state.isGameOver || 
            this.state.isPaused || this.state.isAutoMode) return;

        const touch = e.touches[0];
        const gameRect = GAME.canvas.getBoundingClientRect();
        const x = touch.clientX - gameRect.left;
        const y = touch.clientY - gameRect.top;

        // Convert to game coordinates
        const gameX = Math.floor(x / GAME.TILE_SIZE);
        const gameY = Math.floor(y / GAME.TILE_SIZE);

        // Calculate direction based on current snake head position
        const head = this.state.snake[0];
        const dx = gameX - head.x;
        const dy = gameY - head.y;

        // Add direction validation
        if (Math.abs(dx) > Math.abs(dy)) {
            const newDir = { x: Math.sign(dx), y: 0 };
            if (newDir.x !== -this.state.direction.x) {
                this.state.direction = newDir;
            }
        } else {
            const newDir = { x: 0, y: Math.sign(dy) };
            if (newDir.y !== -this.state.direction.y) {
                this.state.direction = newDir;
            }
        }
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

    destroy() {
        this.clearEventListeners();
        GameWorldSystem.clearInactivityTimer();
        SoundSystem.destroy();
        this.resetUI();
        this.state = null;
    }
};

// Only one export needed
export const GameState = GameSystem.state;
