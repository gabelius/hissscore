# Smart Snake Game

A modern implementation of the classic Snake game with additional features.

## Core Systems
- GameSystem: State & logic
- RenderSystem: Graphics
- PhysicsSystem: Movement & collisions 
- WorldSystem: Environment
- EventSystem: Input handling

## Features
- 🎮 Manual and Auto play modes
- ❤️ Three lives system
- 🎨 Multiple color themes (Rainbow, Pastel, Neon, Grayscale)
- 🌓 Light/Dark mode toggle
- 🔊 Sound effects with mute option
- ⚡ Three speed levels
- 📱 Touch controls for mobile
- 🏆 Score tracking

## Setup
1. Ensure all assets are present:
```
/assets
├── audio/*.wav
└── img/*.webp
```

## Debug
Check console for:
- GameState.isGameStarted
- MovementSystem paths
- Sound loading errors

## Testing
- Movement: arrows/WASD
- Collisions
- Sound effects
- Mobile support
- Performance

## Known Issues
- Sound loading errors: Handle with Web Audio API
- Performance: Optimize render cycle
- Mobile: Touch controls need work

## Architecture
- Modular systems
- Event-driven updates
- YAML config
- Canvas rendering

## Code Guidelines
1. File Optimization:
   - Minimize variable names while keeping readability
   - Use shorthand syntax where clear
   - Remove redundant declarations
   - Group related code
   - Use early returns
   - Chain operations where logical
   - Remove unused features

2. Function Name Mapping:
   ```
   Systems:
   S = SoundSystem
   R = RenderSystem
   G = GameSystem

   Methods:
   b = buffers
   ia = initAudio
   um = updateMute
   f = files
   k = key
   p = path
   r = retries
   t = tileSize
   m = margin
   c = context/crunch
   h = head/hit
   d = die
   g = gameover
   s = state/source
   n = now/next

   Game Properties:
   ts = tileSize
   tc = tileCount
   ac = audioContext
   gn = gainNode
   
   GameSystem (G):
   s = state
   r = running
   p = paused
   a = autoMode
   o = score
   l = level
   v = lives
   n = snake
   f = food
   d = direction
   x = nextDirection
   e = reset
   t = start
   u = update
   c = collision
   i = die
   j = gameOver
   k = showOverlay
   q = gameLoop
   ```
3. State Values:
   - 0 = false
   - 1 = true
   - localStorage 'mute' = isMuted state


## Code Review Guidelines
1. pcr: perform code review
2. rsma: review same module again within the current file
3. ur: update readme file while maintaining minimum file size
4. mf: minify current file while keeping the same filename and basic readability
5. nm: pcr of next module or file

## Development Process
1. All code changes must follow visible step-by-step thinking:
   - State the problem clearly
   - Break down the solution into steps
   - Show reasoning for each change
   - Document unexpected side effects
   - Maintain change history in chat

2. Change Documentation:
   - Keep all intermediate steps visible
   - Show failed attempts and learnings
   - Track dependencies between changes
   - Reference related changes in other files
   - Maintain error handling evolution

3. Chat Output Guidelines:
   - Each change starts with problem statement
   - Steps are numbered and logical
   - Code blocks show exact changes
   - Filepaths are clearly marked
   - Results and errors are documented
   - Solutions build on previous attempts
   - Reasoning is explicit and clear
