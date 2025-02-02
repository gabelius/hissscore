import { RenderSystem } from './RenderSystem.js';
import { GameWorldSystem } from './GameWorldSystem.js';
import { SoundSystem } from './SoundSystem.js';

// Combine GameState directly into GameSystem
export const GameSystem = {
    // Default configuration for fallback
    defaultConfig: {
        levels: [{
            name: "Default Level",
            background: null,
            snakeColors: ["#4CAF50"],
            scoreThreshold: 100
        }]
    },

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
            // Use already loaded config or fallback to defaults
            this.state.config = GAME.assets.config || this.defaultConfig;
            if (!this.state.config?.levels?.length) {
                console.warn('Invalid config, using defaults');
                this.state.config = this.defaultConfig;
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
        document.addEventListener('click', SoundSystem.handleUserInteraction.bind(SoundSystem));
        document.addEventListener('touchstart', SoundSystem.handleUserInteraction.bind(SoundSystem));
        
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
        // Clear all timers first
        this.clearAllTimers();
        
        // Reset state with complete cleanup
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
            currentSpeedIndex: 0,  // Add this
            food: null,  // Reset food state
            lastUpdate: 0,
            _pausedHeartTime: null,  // Clear paused heart time
            _lastStateUpdate: Date.now(),  // Add state update tracking
            _totalPauseTime: 0,  // Add pause time tracking
            _pauseStartTime: null
        });

        // Reset UI elements
        this.resetUI();
        
        // Reattach event listeners
        this.setupEventListeners();
    },

    clearAllTimers() {
        // Clear existing event listeners
        this.clearEventListeners();
        
        // Clear heart timers
        GameWorldSystem.clearHeartTimers();
        
        // Clear any game timers
        if (this._gameLoopId) {
            cancelAnimationFrame(this._gameLoopId);
            this._gameLoopId = null;
        }
        
        // Clear any stored timeouts
        if (this._stateTimeouts) {
            this._stateTimeouts.forEach(clearTimeout);
            this._stateTimeouts = [];
        }
    },

    clearEventListeners() {
        document.removeEventListener('keydown', this.handleKeydown);
        document.removeEventListener('touchstart', this.handleTouch);
        document.removeEventListener('touchmove', this.handleTouch);
        document.removeEventListener('touchend', this.handleTouch);
        document.removeEventListener('mousemove', GameWorldSystem.handleInactivity);
        document.removeEventListener('click', SoundSystem.handleUserInteraction);
        document.removeEventListener('touchstart', SoundSystem.handleUserInteraction);
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
        document.getElementById('levelNumber').textContent = this.state.currentLevel;
        document.getElementById('levelName').textContent = this.state.config.levels[this.state.currentLevel - 1].name;
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
        // Force immediate UI update for hearts
        this.updateHUD();  // This will now work
        
        if (this.state.hearts <= 0) {
            this.handleGameOver();
            return;
        }
        
        // Clear any existing heart timers and food
        GameWorldSystem.clearHeartTimers();
        this.state.food = null;
        
        SoundSystem.play('hit');
        GameWorldSystem.respawnSnake();
        // Spawn new food after respawn
        GameWorldSystem.spawnFood();
    },

    handleGameOver() {
        // Ensure state is valid
        if (!this.validateGameState()) return;
        
        this.state.isGameOver = true;
        this.state.isAutoMode = false;
        
        // Clear all timers and states
        this.clearAllTimers();
        
        // Clear food state
        this.state.food = null;
        
        // Clean up systems
        GameWorldSystem.handleGameOver();
        document.getElementById('autoBtn').classList.remove('active-mode');
        
        // Play sound
        SoundSystem.play('die');
        
        // Force final render
        RenderSystem.lastDrawnState = null;
        RenderSystem.draw();
    },

    validateGameState() {
        // Basic state validation
        if (!this.state) return false;
        
        // Ensure critical properties exist
        const requiredProps = ['snake', 'hearts', 'score', 'currentLevel'];
        if (!requiredProps.every(prop => prop in this.state)) {
            console.error('Invalid game state');
            return false;
        }
        
        // Validate current level
        const currentLevel = this.state.config?.levels?.[this.state.currentLevel - 1];
        if (!currentLevel) {
            console.error('Invalid level configuration');
            return false;
        }
        
        // Validate level configuration and thresholds
        if (!currentLevel.name || !currentLevel.background || !currentLevel.snakeColors || 
            typeof currentLevel.scoreThreshold !== 'number') {
            console.error('Incomplete level configuration');
            return false;
        }
        
        // Validate score thresholds are in ascending order
        const thresholds = this.state.config.levels.map(l => l.scoreThreshold);
        if (!thresholds.every((t, i) => i === 0 || t > thresholds[i - 1])) {
            console.error('Invalid level score thresholds');
            return false;
        }
        
        return true;
    },

    togglePause() {
        this.state.isPaused = !this.state.isPaused;
        
        if (this.state.isPaused) {
            // Store pause state
            this.state._pauseStartTime = Date.now();
            this._heartVisibilityState = this.state.food?.isVisible;
            // Clear timers when paused
            GameWorldSystem.clearHeartTimers();
            if (this.state.food?.type === 'heart') {
                this._pausedHeartTime = Date.now() - this.state.food.createTime;
                this._heartBlinkPhase = Date.now() - (this.state.food.createTime + 5000) > 0;
            }
        } else {
            // Calculate total pause duration
            const pauseDuration = Date.now() - this.state._pauseStartTime;
            this.state._totalPauseTime += pauseDuration;
            
            // Restore heart state
            if (this.state.food?.type === 'heart') {
                this.state.food.createTime = Date.now() - this._pausedHeartTime;
                this.state.food.isVisible = this._heartVisibilityState;
                if (this._heartBlinkPhase) {
                    GameWorldSystem.startHeartBlink(this._pausedHeartTime);
                }
                delete this._pausedHeartTime;
                delete this._heartBlinkPhase;
                delete this._heartVisibilityState;
            }
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
            
            // Remove the body background image
            document.body.style.backgroundImage = 'none';
            
            // Update game speed based on level
            this.state.currentSpeed = this.state.speedLevels[
                Math.min(this.state.currentLevel - 1, this.state.speedLevels.length - 1)
            ];
            this.state.updateInterval = this.state.baseInterval / this.state.currentSpeed;
            
            // Update speed button
            document.getElementById('speedBtn').setAttribute('data-speed', this.state.currentSpeed);
            
            // Force a redraw
            RenderSystem.lastDrawnState = null;
            RenderSystem.draw();
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
            'ArrowDown': {x: 0, y: 1},  // Fixed: was incorrectly set to y: 1
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

    updateHUD() {
        document.getElementById('score').textContent = this.state.score;
        document.getElementById('hearts').textContent = '❤'.repeat(this.state.hearts);
        
        // Calculate actual game time excluding pauses
        const currentTime = Date.now();
        const totalPauseTime = this.state._totalPauseTime || 0;
        const activeTime = this.state.startTime ? 
            Math.floor((currentTime - this.state.startTime - totalPauseTime) / 1000) : 0;
        
        document.getElementById('timer').textContent = activeTime;
        
        // Force redraw to ensure food visibility is correct
        RenderSystem.lastDrawnState = null;
        RenderSystem.draw();
    },

    destroy() {
        this.clearAllTimers();
        GameWorldSystem.clearInactivityTimer();
        GameWorldSystem.clearHeartTimers();  // Added heart timer cleanup
        SoundSystem.destroy();
        this.resetUI();
        this.state = null;
    }
};

// Only one export needed
export const GameState = GameSystem.state;
