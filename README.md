# Snake Game

A modern implementation of the classic Snake game with enhanced features and progressive difficulty.

## Game Features

### Core Mechanics
- 10 unique levels with increasing difficulty
- Snake grows after collecting 2 food items
- 3 lives per game (no refills)
- Auto-play mode available
- Start/Pause functionality

### Level System
- Each level requires snake length of previous length + 10 segments
- Level 1: 10 segments required
- Level 2: 20 segments required
- And so on until Level 10

### Star Rating System
Per level rating based on:
- ⭐⭐⭐ - Complete level without losing lives
- ⭐⭐ - Complete level with 1 life lost
- ⭐ - Complete level with 2 lives lost and >100 seconds

### Visual Features
Level-specific snake designs:
1. Neon Snake - Glowing pulse effect
2. Cyber Snake - Circuit patterns
3. Crystal Snake - Shimmering effect
4. Energy Snake - Particle trails
5. Plasma Snake - Wave patterns
6. Digital Snake - Matrix segments
7. Laser Snake - Beam connections
8. Hologram Snake - Transparency
9. Quantum Snake - Phase shifting
10. Ultimate Snake - Combined effects

### Growth Mechanics
- Ghost segment appears after first food collection
- Segment solidifies after second food collection
- Particle effects on food collection

### Controls
- Keyboard: Arrow keys or WASD
- Touch: On-screen directional buttons
- Mouse: Click in desired direction
- Auto mode: AI-controlled navigation

### Themes
- Default theme
- Dark theme
- Forest theme
- Toggle with palette button

## Technical Features
- Pure HTML5 Canvas rendering
- Material Design UI
- Responsive layout
- Mobile-optimized viewport
- Efficient collision detection
- Smooth animations
- Progressive difficulty