let config;

// Load YAML configuration
fetch('config.yaml')
    .then(response => response.text())
    .then(yamlText => {
        config = jsyaml.load(yamlText); // Parse YAML
        initGame(); // Start the game after loading config
    })
    .catch(error => console.error('Error loading config:', error));

// Game Constants
let TILE_SIZE, TILE_COUNT, updateInterval;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let snake = [], food, direction;
let score = 0, hearts = 3, gameOver = false, gameStarted = false;
let colorCycle = 0, currentColorMode = 'rainbow';
let lastUpdate = 0, startTime;
let isAuto = false, inactivityTimer;
let currentLevel = 0;

// Initialize Game
function initGame() {
    TILE_SIZE = config.game.tileSize;
    TILE_COUNT = config.game.tileCount;
    updateInterval = config.game.updateInterval;

    canvas.width = canvas.height = TILE_SIZE * TILE_COUNT;
    snake = [{x: 10, y: 10}];
    direction = {x: 1, y: 0};
    score = 0;
    hearts = 3;
    gameOver = false;
    gameStarted = false;
    startTime = Date.now();
    placeFood();
    updateHearts();
    startRiddles();
    draw();
    resetInactivityTimer();
    loadLevel(currentLevel);
    loadNightMode();

    // Add event listeners
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('autoBtn').addEventListener('click', toggleAutoMode);
    document.getElementById('speedBtn').addEventListener('click', increaseSpeed);
    document.getElementById('themeToggle').addEventListener('click', toggleNightMode);
    document.getElementById('colorMode').addEventListener('change', changeColorMode);
}

// Load Night Mode
function loadNightMode() {
    const nightMode = localStorage.getItem('nightMode');
    if (nightMode === 'enabled') {
        document.body.classList.add('night-mode');
    }
}

// Load Level
function loadLevel(levelIndex) {
    const level = config.levels[levelIndex];
    document.body.style.backgroundImage = `url('img/${level.backgroundImage}')`;
    document.getElementById('gameCanvas').style.backgroundColor = level.snakeColor;
    document.getElementById('levelName').innerText = level.name;
}

// Start Game
function startGame() {
    gameStarted = true;
    gameOver = false;
    resetInactivityTimer();
    requestAnimationFrame(gameLoop);
}

// Game Loop
function gameLoop(timestamp) {
    if (gameOver) return;
    if (timestamp - lastUpdate >= updateInterval) {
        updateGame();
        lastUpdate = timestamp;
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Update Game
function updateGame() {
    // Update snake position
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check for collisions
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver = true;
        return;
    }

    // Check for food
    if (head.x === food.x && head.y === food.y) {
        score++;
        placeFood();
    } else {
        snake.pop();
    }

    snake.unshift(head);

    // Update hearts and check for game over
    if (score % 10 === 0 && score !== 0) {
        hearts++;
        currentLevel = (currentLevel + 1) % config.levels.length;
        loadLevel(currentLevel);
    }
    if (hearts <= 0) {
        gameOver = true;
    }
}

// Place Food
function placeFood() {
    food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
    };
}

// Update Hearts
function updateHearts() {
    const heartsContainer = document.getElementById('hearts');
    heartsContainer.innerHTML = '❤'.repeat(hearts);
}

// Start Riddles
function startRiddles() {
    const riddleText = document.getElementById('riddleText');
    const riddleCountdown = document.getElementById('riddleCountdown');
    let riddleIndex = 0;

    function showRiddle() {
        const riddle = config.riddles[riddleIndex];
        riddleText.innerHTML = riddle.question;
        riddleCountdown.innerHTML = config.game.riddleCycleTime;
        riddleIndex = (riddleIndex + 1) % config.riddles.length;
    }

    showRiddle();
    setInterval(showRiddle, config.game.riddleCycleTime * 1000);
}

// Draw Game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = config.colorSchemes[currentColorMode][colorCycle % config.colorSchemes[currentColorMode].length];
    snake.forEach(segment => {
        ctx.fillRect(segment.x * TILE_SIZE, segment.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });

    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * TILE_SIZE, food.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

// Reset Inactivity Timer
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (!gameStarted) {
            startGame();
        }
    }, config.game.autoStartDelay * 1000);
}

// Toggle Auto Mode
function toggleAutoMode() {
    isAuto = !isAuto;
}

// Increase Speed
function increaseSpeed() {
    updateInterval = Math.max(50, updateInterval - 10);
}

// Toggle Night Mode
function toggleNightMode() {
    document.body.classList.toggle('night-mode');
    if (document.body.classList.contains('night-mode')) {
        localStorage.setItem('nightMode', 'enabled');
    } else {
        localStorage.setItem('nightMode', 'disabled');
    }
}

// Change Color Mode
function changeColorMode(event) {
    currentColorMode = event.target.value;
    document.body.className = `${currentColorMode}-mode`;
}