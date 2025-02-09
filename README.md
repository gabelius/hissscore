Snake Game Specs

----------------------------------------
Core Mechanics:
----------------------------------------
- Levels: 10 total; each level requires snake length = previous level's length + 10 (Level 1 = 10, Level 2 = 20, … Level 10 = 100).
- Growth: Snake grows after every 2 food items.
- Lives: 3 lives per game. After level 5, hearts spawn with a 20% chance as extra food for 10 seconds to refill a life.
- Auto-play: Toggle between manual and AI-controlled navigation.
- Start/Pause: Standard controls.
- Idle Auto-Start: If no control button is pressed for 5 seconds, the game will auto start in auto mode. This behavior also occurs after a game ends.

----------------------------------------
Star Rating (Per Level):
----------------------------------------
- 3 Stars: Complete level without losing any lives.
- 2 Stars: Complete level with 1 life lost.
- 1 Star: Complete level with 2 lives lost and if the level takes >100 seconds.

----------------------------------------
Visual Features:
----------------------------------------
- Level-Specific Snake Designs:
  1. Neon: Glowing pulse effect.
  2. Cyber: Circuit pattern.
  3. Crystal: Shimmer effect.
  4. Energy: Particle trails.
  5. Plasma: Wave patterns.
  6. Digital: Matrix segments.
  7. Laser: Beam connections.
  8. Hologram: Transparency.
  9. Quantum: Phase shifting.
  10. Ultimate: Combined visual effects.
- Growth Effects: A ghost segment appears after the first food collection and solidifies after the second; particle effects occur on food collection.

----------------------------------------
Controls:
----------------------------------------
- Keyboard: Arrow keys or WASD.
- Touch: On-screen directional buttons.
- Mouse: Click in desired direction.
- Auto-Mode: AI-controlled navigation when toggled.

----------------------------------------
Themes:
----------------------------------------
- Available Themes: Default, Dark, Forest (toggle via palette button).

----------------------------------------
Technical Details:
----------------------------------------
- Rendering: Pure HTML5 Canvas.
- UI: Material Design.
- Layout: Responsive and mobile-optimized.
- Performance: Efficient collision detection and smooth animations.
- Code Structure: Modular design with separate files for key components:
    • engine.js – Core game loop and level progression.
    • snake.js – Snake behavior (movement, growth, collision).
    • food.js – Food generation (including hearts/power-ups).
    • level.js – Level requirements and management.
    • ui.js – UI interactions (start/pause, theme toggle, star rating display).
    • input.js – Unified input handling (keyboard, touch, mouse, auto-mode).
    • renderer.js – Canvas drawing routines and animations.
all js files should be as independent as possible to allow for individual files to be debugged and developed independently. this is very important.

----------------------------------------
UI Updates (Latest):
----------------------------------------
- Modern futuristic design with glassmorphism effects
- Neon color scheme with gradient accents
- Hexagonal button design
- Orbitron font for cyber aesthetic
- Responsive grid layout
- Animated glow effects
- HUD-style overlay
- Added mute toggle button

----------------------------------------
Notes:
----------------------------------------
I stream on YouTube at https://youtube.com/@HissScore
Please send a pull request if you are interested in collaborating.