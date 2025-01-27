let config;
let currentLevel = 1;
let gameAnimationFrame;

// Load YAML configuration
fetch('config.yaml')
    .then(response => response.text())
    .then(yamlText => {
        config = jsyaml.load(yamlText);
        initGame();
        setupEventListeners();
    })
    .catch(error => console.error('Error loading config:', error));

// Game Constants
let TILE_SIZE, TILE_COUNT, BASE_UPDATE_INTERVAL;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let snake = [], food, direction;
let score = 0, hearts = 3, gameOver = false, gameStarted = false;
let currentColorMode = 'rainbow';
let lastUpdate = 0, startTime;
let isAuto = false, inactivityTimer;

function setupEventListeners() {
    // Touch/Mouse controls
    let touchStartX = 0, touchStartY = 0;
    
    canvas.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchmove', handleSwipe, { passive: false });
    canvas.addEventListener('mousedown', e => {
        touchStartX = e.clientX;
        touchStartY = e.clientY;
    });
    canvas.addEventListener('mouseup', handleSwipe);

    // Button controls
    document.getElementById('startBtn').addEventListener('click', () => {
        if (!gameStarted) {
            gameStarted = true;
            initGame();
            gameLoop(performance.now());
        }
    });

    document.getElementById('autoBtn').addEventListener('click', function() {
        isAuto = !isAuto;
        this.classList.toggle('active-mode');
    });

    document.getElementById('speedBtn').addEventListener('click', () => {
        BASE_UPDATE_INTERVAL = Math.max(50, BASE_UPDATE_INTERVAL * 0.7);
    });

    document.getElementById('colorMode').addEventListener('change', (e) => {
        currentColorMode = e.target.value;
    });

    // Keyboard controls
    window.addEventListener('keydown', e => {
        switch(e.key) {
            case 'ArrowUp': if(direction.y !== 1) direction = {x: 0, y: -1}; break;
            case 'ArrowDown': if(direction.y !== -1) direction = {x: 0, y: 1}; break;
            case 'ArrowLeft': if(direction.x !== 1) direction = {x: -1, y: 0}; break;
            case 'ArrowRight': if(direction.x !== -1) direction = {x: 1, y: 0}; break;
        }
    });
}

function initGame() {
    TILE_SIZE = config.game.tileSize;
    TILE_COUNT = config.game.tileCount;
    BASE_UPDATE_INTERVAL = config.game.updateInterval;
    
    canvas.width = canvas.height = TILE_SIZE * TILE_COUNT;
    snake = [{x: 10, y: 10}];
    direction = {x: 1, y: 0};
    score = 0;
    hearts = 3;
    currentLevel = 1;
    gameOver = false;
    startTime = Date.now();
    
    placeFood();
    updateHearts();
    startRiddles();
    updateLevelBackground();
    document.getElementById('levelName').textContent = `Level 1: ${config.levels[0].name}`;
    draw();
    
    if(gameAnimationFrame) cancelAnimationFrame(gameAnimationFrame);
    gameAnimationFrame = requestAnimationFrame(gameLoop);
}

function updateHearts() {
    document.getElementById('hearts').textContent = '❤'.repeat(hearts);
}

function updateLevelBackground() {
    document.body.style.backgroundImage = `url(img/${currentLevel}.webp)`;
    document.body.classList.add('level-background');
}

function placeFood() {
    const spawnHeart = hearts < 3 && Math.random() < 0.3;
    do {
        food = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT),
            type: spawnHeart ? 'heart' : 'apple'
        };
    } while(snake.some(s => s.x === food.x && s.y === food.y));
}

function draw() {
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-bg');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snake.forEach((seg, i) => {
        ctx.fillStyle = getColor(i);
        ctx.beginPath();
        ctx.roundRect(seg.x*TILE_SIZE, seg.y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, 5);
        ctx.fill();
    });

    ctx.font = '24px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = food.type === 'apple' ? '#ff4757' : '#e91e63';
    ctx.fillText(food.type === 'apple' ? '🍎' : '❤️', 
        food.x*TILE_SIZE + TILE_SIZE/2, 
        food.y*TILE_SIZE + TILE_SIZE/2);
}

function gameLoop(timestamp) {
    if(gameOver) return;
    if(timestamp - lastUpdate > BASE_UPDATE_INTERVAL) {
        if(isAuto) autoMove();
        const head = {
            x: (snake[0].x + direction.x + TILE_COUNT) % TILE_COUNT,
            y: (snake[0].y + direction.y + TILE_COUNT) % TILE_COUNT
        };

        if(snake.some(s => s.x === head.x && s.y === head.y)) {
            handleCollision();
            return;
        }

        snake.unshift(head);
        if(head.x === food.x && head.y === food.y) {
            score += 10;
            checkLevel();
            if(food.type === 'heart') {
                hearts = Math.min(3, hearts + 1);
                updateHearts();
            }
            placeFood();
        } else {
            snake.pop();
        }

        document.getElementById('score').textContent = score;
        document.getElementById('timer').textContent = Math.floor((Date.now() - startTime)/1000);
        lastUpdate = timestamp;
        draw();
    }
    gameAnimationFrame = requestAnimationFrame(gameLoop);
}

function checkLevel() {
    const thresholds = [0, 100, 300, 700, 1500, 3100, 6300, 12700, 25500, 51100];
    const newLevel = thresholds.findIndex(t => score < t) - 1;
    
    if (newLevel !== currentLevel && newLevel >= 1 && newLevel <= 10) {
        currentLevel = newLevel;
        updateLevelBackground();
        document.getElementById('levelName').textContent = 
            `Level ${currentLevel}: ${config.levels[currentLevel-1].name}`;
        BASE_UPDATE_INTERVAL = Math.max(50, config.game.updateInterval * (0.5 ** (currentLevel-1)));
    }
}

function autoMove() {
    const head = snake[0];
    const body = new Set(snake.slice(1).map(s => `${s.x},${s.y}`));
    
    const dirs = [
        {x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}
    ].filter(d => !(d.x === -direction.x && d.y === -direction.y));

    const safeDirs = dirs.filter(d => {
        const nx = (head.x + d.x + TILE_COUNT) % TILE_COUNT;
        const ny = (head.y + d.y + TILE_COUNT) % TILE_COUNT;
        return !body.has(`${nx},${ny}`);
    });

    const candidates = safeDirs.length ? safeDirs : dirs;
    const foodDir = {x: food.x - head.x, y: food.y - head.y};
    
    direction = candidates.reduce((a, b) => {
        const aScore = (Math.sign(foodDir.x) === a.x) + (Math.sign(foodDir.y) === a.y);
        const bScore = (Math.sign(foodDir.x) === b.x) + (Math.sign(foodDir.y) === b.y);
        return bScore > aScore ? b : a;
    }, candidates[0]);
}

function handleCollision() {
    if(--hearts <= 0) {
        gameOver = true;
        alert(`Game Over! Score: ${score}`);
        initGame();
    } else {
        updateHearts();
        snake = [snake[0]];
    }
}

// Riddle System
let riddleIndex = 0, riddleInterval;
function startRiddles() {
    showRiddle();
    riddleInterval = setInterval(() => {
        document.getElementById('riddleCountdown').textContent = 
            (15 - Math.floor((Date.now() - startTime)/1000 % 15)) || 15;
    }, 1000);
}

function showRiddle() {
    const riddle = config.riddles[riddleIndex % config.riddles.length];
    document.getElementById('riddleText').innerHTML = 
        `${riddle.question}<br><span style="color: var(--primary-accent)">${riddle.answer}</span>`;
    riddleIndex++;
    setTimeout(showRiddle, 15000);
}

function handleSwipe(e) {
    if (!gameStarted || gameOver) return;

    const touchEndX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const touchEndY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    
    if (Math.abs(dx) > config.game.minSwipeDistance || Math.abs(dy) > config.game.minSwipeDistance) {
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal swipe
            if (dx > 0 && direction.x !== -1) direction = {x: 1, y: 0};
            else if (dx < 0 && direction.x !== 1) direction = {x: -1, y: 0};
        } else {
            // Vertical swipe
            if (dy > 0 && direction.y !== -1) direction = {x: 0, y: 1};
            else if (dy < 0 && direction.y !== 1) direction = {x: 0, y: -1};
        }
    }
}

function getColor(index) {
    const scheme = config.colorSchemes[currentColorMode];
    return scheme[index % scheme.length];
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(showAutoStart, config.game.autoStartDelay * 1000);
}