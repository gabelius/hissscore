// Remove this line since systems are defined in this file
// import { Systems } from './systems.js';

// Initialize global game object
window.GAME = {
    canvas: null,
    ctx: null,
    TILE_SIZE: 20,
    TILE_COUNT: 20,
    isLoading: true,
    assets: {
        images: new Map(),
        sounds: new Map(),
        config: null
    }
};

// === Sound System ===
const SoundSystem = {
    sounds: {},

    async init() {
        const audioFiles = {
            crunch: 'assets/audio/crunch.wav',
            powerup: 'assets/audio/powerup.wav',
            die: 'assets/audio/die.wav',
            hit: 'assets/audio/hit.wav',
            gameover: 'assets/audio/gameover.wav'
        };

        for (const [key, path] of Object.entries(audioFiles)) {
            try {
                const audio = new Audio();
                audio.src = path;
                await new Promise((resolve, reject) => {
                    audio.addEventListener('canplaythrough', resolve, { once: true });
                    audio.addEventListener('error', reject, { once: true });
                    // Add timeout to avoid hanging
                    setTimeout(resolve, 2000);
                });
                this.sounds[key] = audio;
            } catch (err) {
                console.warn(`Failed to load sound: ${path}`, err);
                // Create silent audio as fallback
                this.sounds[key] = { play: () => Promise.resolve() };
            }
        }
    },

    playSound(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0; // Reset sound to start
            sound.play().catch(err => console.warn('Sound play failed:', err));
        }
    }
};

// === Render System ===
const RenderSystem = {
    lastDrawnState: null,
    
    draw(state = GameSystem.state) {
        const ctx = GAME.ctx;
        
        // Clear canvas
        ctx.clearRect(0, 0, GAME.canvas.width, GAME.canvas.height);
        
        // Draw snake
        state.snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? '#4CAF50' : '#81C784';
            ctx.fillRect(
                segment.x * GAME.TILE_SIZE,
                segment.y * GAME.TILE_SIZE,
                GAME.TILE_SIZE - 2,
                GAME.TILE_SIZE - 2
            );
        });
        
        // Draw food
        if (state.food) {
            ctx.fillStyle = '#FF5252';
            ctx.fillRect(
                state.food.x * GAME.TILE_SIZE,
                state.food.y * GAME.TILE_SIZE,
                GAME.TILE_SIZE - 2,
                GAME.TILE_SIZE - 2
            );
        }
        
        this.lastDrawnState = {...state};
    }
};

// === Game World System ===
const GameWorldSystem = {
    heartTimer: null,
    heartBlinkTimer: null,
    heartBlinkState: true,
    // ...existing GameWorldSystem code from GameWorldSystem.js...
};

// === Game System ===
const GameSystem = {
    defaultConfig: {
        // ...existing defaultConfig...
    },
    state: {
        isGameStarted: false,
        isPaused: false,
        isAutoMode: false,
        score: 0,
        level: 1,
        lives: 3,
        snake: [],
        food: null,
        direction: 'right',
        nextDirection: 'right'
    },

    GAME_SPEED: 150, // Base game speed in ms
    lastUpdate: 0,   // Track last update time
    isResetting: false, // Add flag to prevent multiple resets

    init() {
        this.reset();
        return Promise.resolve();
    },

    reset() {
        this.GAME_SPEED = 150; // Reset speed to base value
        Object.assign(this.state, {
            isGameStarted: false,
            isPaused: false,
            isAutoMode: false,
            score: 0,
            level: 1,
            snake: [{x: 10, y: 10}],
            food: this.generateFood(),
            direction: 'right',
            nextDirection: 'right'
        });
        // Don't reset lives here, they're managed in handleDeath
    },

    showGameOverOverlay() {
        const container = document.getElementById('gameContainer');
        document.body.classList.add('game-over');
        
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-message">Game Over!</div>
            <div class="game-over-score">Score: ${this.state.score}</div>
            <div class="game-over-controls">
                <button id="restartBtn" title="Restart Game">▶️</button>
            </div>
        `;
        
        container.appendChild(overlay);
        
        // Setup restart button with direct binding
        const restartBtn = overlay.querySelector('#restartBtn');
        restartBtn.addEventListener('click', () => this.restartGame());
        
        requestAnimationFrame(() => overlay.classList.add('visible'));
    },

    restartGame() {
        // Complete reset of game state
        this.state.lives = 3;
        this.isResetting = false;
        this.lastUpdate = 0;
        this.GAME_SPEED = 150;
        
        // Reset game state
        Object.assign(this.state, {
            isGameStarted: false,
            isPaused: false,
            isAutoMode: false,
            score: 0,
            level: 1,
            snake: [{x: 10, y: 10}],
            food: this.generateFood(),
            direction: 'right',
            nextDirection: 'right'
        });

        // Clean up UI
        document.body.classList.remove('game-over');
        this.hideGameOverOverlay();
        
        // Show controls and header
        const controls = document.querySelector('.controls');
        const header = document.querySelector('.game-header');
        controls.classList.add('visible');
        header.classList.add('visible');
        
        // Start new game
        this.state.isGameStarted = true;
        this.gameLoop();
    },

    hideGameOverOverlay() {
        const overlay = document.querySelector('.game-over-overlay');
        if (overlay) {
            overlay.classList.remove('visible');
            setTimeout(() => overlay.remove(), 500);
        }
    },

    showWelcomeScreen() {
        const container = document.getElementById('gameContainer');
        if (!container) {
            console.error("Error: 'gameContainer' element not found.");
            return;
        }
        const controls = document.querySelector('.controls');
        const header = document.querySelector('.game-header');
        const startBtn = document.getElementById('startBtn');
        
        const welcome = document.createElement('div');
        welcome.className = 'welcome-screen';
        welcome.innerHTML = `
            <div class="welcome-logo-container">
                <img src="assets/img/logo.webp" alt="Smart Snake" class="welcome-logo">
                <button id="welcomeStartBtn" title="Start Game"></button>
            </div>
        `;
        
        // Move start button to welcome screen
        const welcomeControls = welcome.querySelector('.welcome-controls');
        welcomeControls.appendChild(startBtn.cloneNode(true));
        
        container.appendChild(welcome);
        
        // Setup new start button listener
        const newStartBtn = welcome.querySelector('#welcomeStartBtn');
        newStartBtn.addEventListener('click', () => {
            if (!GAME.isLoading) {
                this.hideWelcomeScreen();
                this.startGame();
            }
        });
    },

    hideWelcomeScreen() {
        const welcome = document.querySelector('.welcome-screen');
        const controls = document.querySelector('.controls');
        const header = document.querySelector('.game-header');
        
        if (welcome) {
            welcome.classList.add('hidden');
            setTimeout(() => welcome.remove(), 500);
        }
        
        // Show game UI
        controls.classList.add('visible');
        header.classList.add('visible');
    },

    startGame() {
        if (this.state.isGameStarted) return;
        
        this.hideGameOverOverlay();
        this.reset();
        this.state.isGameStarted = true;
        this.gameLoop();
    },

    update() {
        if (!this.state.isGameStarted || this.state.isPaused || this.isResetting) return;

        const now = Date.now();
        if (now - this.lastUpdate < this.GAME_SPEED) return;
        this.lastUpdate = now;

        // Update snake position based on direction
        const head = {...this.state.snake[0]};
        
        switch(this.state.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check collisions
        if (this.checkCollision(head)) {
            SoundSystem.playSound('hit');
            this.handleDeath();
            return;
        }

        // Check food collection
        if (head.x === this.state.food.x && head.y === this.state.food.y) {
            this.state.score += 10;
            this.state.food = this.generateFood();
            SoundSystem.playSound('crunch');
        } else {
            this.state.snake.pop();
        }

        // Update snake
        this.state.snake.unshift(head);
        this.state.direction = this.state.nextDirection;
    },

    checkCollision(head) {
        // Wall collision
        if (head.x < 0 || head.x >= GAME.TILE_COUNT || 
            head.y < 0 || head.y >= GAME.TILE_COUNT) {
            return true;
        }
        
        // Self collision
        return this.state.snake.some(segment => 
            segment.x === head.x && segment.y === head.y);
    },

    handleDeath() {
        if (this.isResetting) return; // Prevent multiple deaths
        this.isResetting = true;
        
        this.state.lives--;
        SoundSystem.playSound('die');
        this.state.isGameStarted = false;
        
        if (this.state.lives <= 0) {
            this.gameOver();
        } else {
            // Add delay before reset
            setTimeout(() => {
                this.reset();
                this.lastUpdate = 0; // Reset timing
                this.state.isGameStarted = true;
                this.isResetting = false;
                this.gameLoop();
            }, 1000);
        }
    },

    gameOver() {
        this.state.isGameStarted = false;
        this.state.isPaused = true;
        SoundSystem.playSound('gameover'); // Add gameover sound
        this.showGameOverOverlay();
    },

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * GAME.TILE_COUNT),
                y: Math.floor(Math.random() * GAME.TILE_COUNT)
            };
        } while (this.state.snake.some(segment => 
            segment.x === food.x && segment.y === food.y));
        return food;
    },

    gameLoop() {
        if (!this.state.isGameStarted || this.state.isPaused) return;
        
        this.update();
        RenderSystem.draw(this.state);
        
        if (this.state.isGameStarted) { // Only continue if game is still running
            requestAnimationFrame(() => this.gameLoop());
        }
    }
};

// Make systems available globally first, before using them
window.Systems = {
    SoundSystem,
    RenderSystem,
    GameWorldSystem,
    GameSystem
};

// === Event System ===
function setupEventListeners() {
    const startBtn = document.getElementById('startBtn');
    const autoBtn = document.getElementById('autoBtn');

    startBtn.addEventListener('click', () => {
        if (!GAME.isLoading) {
            if (!GameSystem.state.isGameStarted) {
                GameSystem.startGame();
            } else {
                GameSystem.state.isPaused = !GameSystem.state.isPaused;
                if (!GameSystem.state.isPaused) {
                    GameSystem.gameLoop();
                }
            }
        }
    });

    autoBtn.addEventListener('click', () => {
        if (!GAME.isLoading && !GameSystem.state.isGameStarted) {
            GameSystem.state.isAutoMode = true;
            GameSystem.startGame();
        }
    });

    // Add keyboard controls
    document.addEventListener('keydown', (event) => {
        if (!GameSystem.state.isGameStarted || GameSystem.state.isAutoMode) return;

        switch(event.key) {
            case 'ArrowUp':
            case 'w':
                if (GameSystem.state.direction !== 'down') 
                    GameSystem.state.nextDirection = 'up';
                break;
            case 'ArrowDown':
            case 's':
                if (GameSystem.state.direction !== 'up') 
                    GameSystem.state.nextDirection = 'down';
                break;
            case 'ArrowLeft':
            case 'a':
                if (GameSystem.state.direction !== 'right') 
                    GameSystem.state.nextDirection = 'left';
                break;
            case 'ArrowRight':
            case 'd':
                if (GameSystem.state.direction !== 'left') 
                    GameSystem.state.nextDirection = 'right';
                break;
        }
    });

    // ...existing EventSystem code from EventSystem.js...
}

// === Main Initialization ===
async function initializeGame() {
    try {
        // Wait a moment to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const container = document.getElementById('gameContainer');
        if (!container) {
            throw new Error('Game container not found');
        }
        
        container.classList.add('loading');
        
        // Initialize systems in sequence
        await initializeCanvas();
        await SoundSystem.init(); // Add this line
        await Promise.all([
            loadConfig(),
            preloadImages()
        ]);
        
        await GameSystem.init();
        setupEventListeners();
        
        container.classList.remove('loading');
        GAME.isLoading = false;
        
        // Show welcome screen
        GameSystem.showWelcomeScreen();
        
    } catch (error) {
        console.error('Game initialization failed:', error);
        handleInitError(error);
    }
}

// Update the DOMContentLoaded handler
document.addEventListener('DOMContentLoaded', () => {
    // Start initialization after a short delay
    setTimeout(initializeGame, 100);
});

// Core helper functions
async function initializeCanvas() {
    GAME.canvas = document.getElementById('gameCanvas');
    GAME.ctx = GAME.canvas.getContext('2d');
    
    // Set canvas size based on tile count and size
    GAME.canvas.width = GAME.TILE_SIZE * GAME.TILE_COUNT;
    GAME.canvas.height = GAME.TILE_SIZE * GAME.TILE_COUNT;
    
    // Enable crisp pixel rendering
    GAME.ctx.imageSmoothingEnabled = false;
    
    return Promise.resolve();
}

async function loadConfig() {
    try {
        const response = await fetch('config.yaml');
        const yamlText = await response.text();
        GAME.assets.config = jsyaml.load(yamlText);
        return Promise.resolve();
    } catch (error) {
        console.error('Failed to load config:', error);
        return Promise.reject(error);
    }
}

async function preloadImages() {
    const backgrounds = Array.from({length: 10}, (_, i) => `assets/img/${i + 1}.webp`);
    
    const loadPromises = backgrounds.map(src => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                GAME.assets.images.set(src, img);
                resolve();
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                resolve(); // Resolve anyway to continue loading
            };
            img.src = src;
        });
    });

    return Promise.all(loadPromises);
}

function handleInitError(error) {
    console.error('Initialization error:', error);
    const container = document.getElementById('gameContainer');
    container.classList.remove('loading');
    container.innerHTML = `
        <div class="error-message" style="color: red; padding: 20px; text-align: center;">
            Failed to initialize game. Please refresh the page or check console for details.
        </div>
    `;
}
